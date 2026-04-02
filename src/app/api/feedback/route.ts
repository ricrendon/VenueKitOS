import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVenueId } from "@/lib/utils/venue";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const venueId = await getVenueId();
    const body = await request.json();
    const {
      bookingCode,
      npsScore,
      starRating,
      comment,
      submitterName,
      submitterEmail,
    } = body;

    if (npsScore === undefined || npsScore === null || starRating === undefined || starRating === null) {
      return NextResponse.json({ error: "npsScore and starRating are required" }, { status: 400 });
    }
    if (npsScore < 0 || npsScore > 10) {
      return NextResponse.json({ error: "npsScore must be 0–10" }, { status: 400 });
    }
    if (starRating < 1 || starRating > 5) {
      return NextResponse.json({ error: "starRating must be 1–5" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Optionally resolve booking_id from booking_code
    let bookingId: string | null = null;
    if (bookingCode) {
      const { data: booking } = await supabase
        .from("bookings")
        .select("id, parent_id")
        .eq("confirmation_code", bookingCode.toUpperCase())
        .eq("venue_id", venueId)
        .single();

      if (booking) {
        bookingId = booking.id;
      }
    }

    const { data: feedback, error } = await supabase
      .from("guest_feedback")
      .insert({
        venue_id: venueId,
        booking_id: bookingId,
        booking_code: bookingCode ? bookingCode.toUpperCase() : null,
        nps_score: npsScore,
        star_rating: starRating,
        comment: comment || null,
        submitter_name: submitterName || null,
        submitter_email: submitterEmail || null,
        submitted_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Feedback insert error:", error);
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: feedback.id });
  } catch (err) {
    console.error("Feedback POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
