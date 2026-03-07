import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "WP-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// POST — create a new booking (public, no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      date,
      startTime,
      endTime,
      childCount,
      adultCount = 0,
      sessionType = "open_play",
      pricePerChild,
    } = body;

    // Validate required fields
    if (!firstName || !email || !date || !startTime || !childCount || !pricePerChild) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Find or create parent account
    const { data: existingParent } = await supabase
      .from("parent_accounts")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    let parentId: string;

    if (existingParent) {
      parentId = existingParent.id;
      // Update phone if provided
      if (phone) {
        await supabase
          .from("parent_accounts")
          .update({ phone })
          .eq("id", parentId);
      }
    } else {
      const { data: newParent, error: parentError } = await supabase
        .from("parent_accounts")
        .insert({
          venue_id: VENUE_ID,
          first_name: firstName,
          last_name: lastName,
          email: email.toLowerCase(),
          phone: phone || "",
        })
        .select("id")
        .single();

      if (parentError || !newParent) {
        console.error("Create parent error:", parentError);
        return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
      }
      parentId = newParent.id;
    }

    // Calculate pricing
    const subtotal = childCount * pricePerChild;
    const taxRate = 0.08;
    const tax = Number((subtotal * taxRate).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));
    const confirmationCode = generateCode();

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        venue_id: VENUE_ID,
        parent_id: parentId,
        type: sessionType,
        status: "confirmed",
        payment_status: "unpaid",
        date,
        start_time: startTime,
        end_time: endTime || null,
        child_count: childCount,
        adult_count: adultCount,
        subtotal,
        tax,
        total,
        confirmation_code: confirmationCode,
        notes: "Pay at venue",
      })
      .select("id, confirmation_code, date, start_time, end_time, child_count, total, status")
      .single();

    if (bookingError || !booking) {
      console.error("Create booking error:", bookingError);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        confirmationCode: booking.confirmation_code,
        date: booking.date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        childCount: booking.child_count,
        total: booking.total,
        status: booking.status,
        paymentNote: "Pay at venue on arrival",
      },
    });
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET — fetch bookings for a parent by email (used by portal)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");

    if (!parentId) {
      return NextResponse.json({ error: "Missing parentId" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("id, type, status, payment_status, date, start_time, end_time, child_count, adult_count, total, confirmation_code, notes, created_at")
      .eq("parent_id", parentId)
      .eq("venue_id", VENUE_ID)
      .order("date", { ascending: false });

    if (error) {
      console.error("Fetch bookings error:", error);
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }

    return NextResponse.json({ bookings: bookings || [] });
  } catch (err) {
    console.error("Bookings GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
