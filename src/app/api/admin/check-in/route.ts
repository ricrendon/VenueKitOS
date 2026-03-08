import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLocalToday, formatStoredTime } from "@/lib/utils/timezone";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";
const VENUE_TZ = "America/Chicago";
const STAFF_ID = "a1b2c3d4-0002-4000-8000-000000000001"; // Marcus (default)

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const today = getLocalToday(VENUE_TZ);

    // Fetch today's bookings
    let query = supabase
      .from("bookings")
      .select("*, parent:parent_accounts(first_name, last_name, email, phone)")
      .eq("venue_id", VENUE_ID)
      .eq("date", today)
      .order("start_time", { ascending: true });

    const { data: bookings, error: bookingsError } = await query;

    if (bookingsError) {
      console.error("Check-in GET error:", bookingsError);
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }

    // Fetch today's check-ins
    const { data: checkIns } = await supabase
      .from("check_ins")
      .select("booking_id, checked_in_at, child_count")
      .eq("venue_id", VENUE_ID)
      .gte("checked_in_at", `${today}T00:00:00`)
      .lte("checked_in_at", `${today}T23:59:59`);

    const checkedInMap = new Map(
      (checkIns || []).map((c) => [c.booking_id, c])
    );

    // Format and optionally filter by search
    let results = (bookings || []).map((b) => {
      const parent = b.parent as { first_name: string; last_name: string; email: string; phone: string } | null;
      const checkIn = checkedInMap.get(b.id);
      const time = b.start_time
        ? formatStoredTime(b.start_time)
        : "";

      return {
        id: b.id,
        parentName: parent ? `${parent.first_name} ${parent.last_name}` : "Unknown",
        parentEmail: parent?.email || "",
        parentPhone: parent?.phone || "",
        time,
        childCount: b.child_count || 0,
        adultCount: b.adult_count || 0,
        type: b.type === "party" ? "Party" : "Open Play",
        status: b.status,
        confirmationCode: b.confirmation_code || "",
        checkedIn: !!checkIn,
        checkedInAt: checkIn?.checked_in_at || null,
      };
    });

    // Filter by search term
    if (search) {
      const s = search.toLowerCase();
      results = results.filter(
        (r) =>
          r.parentName.toLowerCase().includes(s) ||
          r.confirmationCode.toLowerCase().includes(s) ||
          r.parentEmail.toLowerCase().includes(s)
      );
    }

    // Capacity
    const totalCheckedIn = (checkIns || []).reduce((sum, c) => sum + (c.child_count || 0), 0);

    return NextResponse.json({
      bookings: results,
      capacity: {
        current: totalCheckedIn,
        max: 200,
      },
    });
  } catch (err) {
    console.error("Check-in GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    // Get the booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, parent_id, child_count, venue_id")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check for existing check-in
    const { data: existing } = await supabase
      .from("check_ins")
      .select("id")
      .eq("booking_id", bookingId)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already checked in" }, { status: 409 });
    }

    // Create check-in
    const { data: checkIn, error: checkInError } = await supabase
      .from("check_ins")
      .insert({
        booking_id: bookingId,
        venue_id: booking.venue_id,
        parent_id: booking.parent_id,
        checked_in_at: new Date().toISOString(),
        checked_in_by: STAFF_ID,
        child_count: booking.child_count || 1,
      })
      .select("id")
      .single();

    if (checkInError) {
      console.error("Check-in POST error:", checkInError);
      return NextResponse.json({ error: "Failed to check in" }, { status: 500 });
    }

    return NextResponse.json({ success: true, checkInId: checkIn?.id });
  } catch (err) {
    console.error("Check-in POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
