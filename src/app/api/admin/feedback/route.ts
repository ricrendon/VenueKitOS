import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVenueId } from "@/lib/utils/venue";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const venueId = await getVenueId();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "100", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const supabase = createAdminClient();

    const { data: rows, error } = await supabase
      .from("guest_feedback")
      .select("id, booking_code, submitter_name, submitter_email, nps_score, star_rating, comment, submitted_at, created_at")
      .eq("venue_id", venueId)
      .order("submitted_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Feedback fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
    }

    const feedback = rows ?? [];

    // Compute aggregate stats
    const totalCount = feedback.length;
    const avgStars = totalCount > 0
      ? Number((feedback.reduce((s, f) => s + f.star_rating, 0) / totalCount).toFixed(1))
      : 0;

    const promoters = feedback.filter((f) => f.nps_score >= 9).length;
    const detractors = feedback.filter((f) => f.nps_score <= 6).length;
    const npsScore = totalCount > 0
      ? Math.round(((promoters - detractors) / totalCount) * 100)
      : 0;

    const starDistribution = [1, 2, 3, 4, 5].map((s) => ({
      stars: s,
      count: feedback.filter((f) => f.star_rating === s).length,
    }));

    return NextResponse.json({
      feedback,
      stats: {
        totalCount,
        avgStars,
        npsScore,
        promoters,
        detractors,
        passives: totalCount - promoters - detractors,
        starDistribution,
      },
    });
  } catch (err) {
    console.error("Admin feedback GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
