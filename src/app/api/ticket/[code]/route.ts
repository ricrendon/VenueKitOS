import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatStoredTime } from "@/lib/utils/timezone";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch booking by confirmation code with parent name
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("*, parent:parent_accounts(first_name, last_name)")
      .eq("confirmation_code", code.toUpperCase())
      .eq("venue_id", VENUE_ID)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Fetch venue info
    const { data: venue } = await supabase
      .from("venues")
      .select("name, address, city, state, zip, phone")
      .eq("id", VENUE_ID)
      .single();

    // Check if already checked in
    const { data: checkIn } = await supabase
      .from("check_ins")
      .select("checked_in_at")
      .eq("booking_id", booking.id)
      .single();

    const parent = booking.parent as {
      first_name: string;
      last_name: string;
    } | null;

    return NextResponse.json({
      booking: {
        confirmationCode: booking.confirmation_code,
        type: booking.type === "party" ? "Party" : "Open Play",
        status: booking.status,
        paymentStatus: booking.payment_status,
        date: booking.date,
        startTime: booking.start_time ? formatStoredTime(booking.start_time) : "",
        endTime: booking.end_time ? formatStoredTime(booking.end_time) : "",
        childCount: booking.child_count || 0,
        adultCount: booking.adult_count || 0,
        total: Number(booking.total) || 0,
        parentName: parent
          ? `${parent.first_name} ${parent.last_name}`
          : "Guest",
        checkedIn: !!checkIn,
        checkedInAt: checkIn?.checked_in_at || null,
      },
      venue: venue
        ? {
            name: venue.name,
            address: venue.address || "",
            city: venue.city || "",
            state: venue.state || "",
            zip: venue.zip || "",
            phone: venue.phone || "",
          }
        : null,
    });
  } catch (err) {
    console.error("Ticket GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
