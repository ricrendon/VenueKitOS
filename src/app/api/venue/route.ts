import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVenueId } from "@/lib/utils/venue";

export const dynamic = "force-dynamic";


/** GET — public read-only venue data for public-facing pages */
export async function GET() {
  try {
      const venueId = await getVenueId();
    const supabase = createAdminClient();

    const [venueResult, packagesResult, plansResult] = await Promise.all([
      supabase
        .from("venues")
        .select(
          "name, slug, address, city, state, zip, phone, email, timezone, logo_url, hero_image_url, settings, website_content, operating_hours"
        )
        .eq("id", venueId)
        .single(),
      supabase
        .from("party_packages")
        .select("*")
        .eq("venue_id", venueId)
        .order("price", { ascending: true }),
      supabase
        .from("membership_plans")
        .select("*")
        .eq("venue_id", venueId)
        .order("monthly_price", { ascending: true }),
    ]);

    if (venueResult.error) {
      console.error("Public venue GET error:", venueResult.error);
      return NextResponse.json({ error: "Failed to fetch venue" }, { status: 500 });
    }

    return NextResponse.json({
      venue: venueResult.data,
      partyPackages: packagesResult.data || [],
      membershipPlans: plansResult.data || [],
    });
  } catch (err) {
    console.error("Public venue GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
