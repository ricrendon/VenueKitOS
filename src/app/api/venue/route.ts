import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

/** GET — public read-only venue data for public-facing pages */
export async function GET() {
  try {
    const supabase = createAdminClient();

    const [venueResult, packagesResult, plansResult] = await Promise.all([
      supabase
        .from("venues")
        .select(
          "name, slug, address, city, state, zip, phone, email, timezone, logo_url, hero_image_url, settings, website_content, operating_hours"
        )
        .eq("id", VENUE_ID)
        .single(),
      supabase
        .from("party_packages")
        .select("*")
        .eq("venue_id", VENUE_ID)
        .order("price", { ascending: true }),
      supabase
        .from("membership_plans")
        .select("*")
        .eq("venue_id", VENUE_ID)
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
