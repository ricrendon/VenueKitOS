import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVenueId } from "@/lib/utils/venue";

export const dynamic = "force-dynamic";

// POST — create a new membership plan
export async function POST(request: NextRequest) {
  try {
    const venueId = await getVenueId();
    const body = await request.json();
    const {
      name,
      description,
      monthlyPrice,
      annualPrice,
      maxChildren,
      includesOpenPlay,
      partyDiscount,
      guestPasses,
      features,
    } = body;

    if (!name || !monthlyPrice) {
      return NextResponse.json({ error: "name and monthlyPrice are required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: plan, error } = await supabase
      .from("membership_plans")
      .insert({
        venue_id: venueId,
        name: name.trim(),
        description: description?.trim() || null,
        monthly_price: Number(monthlyPrice),
        annual_price: annualPrice ? Number(annualPrice) : null,
        max_children: Number(maxChildren) || 3,
        includes_open_play: includesOpenPlay ?? true,
        party_discount: Number(partyDiscount) || 0,
        guest_passes: Number(guestPasses) || 0,
        features: features || [],
        active: true,
      })
      .select("id, name, monthly_price")
      .single();

    if (error || !plan) {
      console.error("Create plan error:", error);
      return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
    }

    return NextResponse.json({ success: true, plan });
  } catch (err) {
    console.error("Plans POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
