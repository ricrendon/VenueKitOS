import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockVenue } from "@/lib/mock/data";
import { getVenueId } from "@/lib/utils/venue";

export const dynamic = "force-dynamic";

/** GET — return full venue record */
export async function GET() {
  if (isDemoMode()) return NextResponse.json(mockVenue);
  try {
    const venueId = await getVenueId();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("id", venueId)
      .single();

    if (error) {
      console.error("Venue GET error:", error);
      return NextResponse.json({ error: "Failed to fetch venue" }, { status: 500 });
    }

    return NextResponse.json({ venue: data });
  } catch (err) {
    console.error("Venue GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** PATCH — partial update of venue fields (merges JSONB columns) */
export async function PATCH(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json(mockVenue);
  try {
    const venueId = await getVenueId();
    const body = await request.json();
    const supabase = createAdminClient();

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};

    // Direct columns (flat fields)
    const directFields = [
      "name", "slug", "address", "city", "state", "zip",
      "phone", "email", "timezone", "logo_url", "hero_image_url",
    ];
    for (const field of directFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    // JSONB: settings — deep merge with existing
    if (body.settings) {
      const { data: current } = await supabase
        .from("venues")
        .select("settings")
        .eq("id", venueId)
        .single();
      updateData.settings = { ...(current?.settings || {}), ...body.settings };
    }

    // JSONB: website_content — deep merge with existing
    if (body.website_content) {
      const { data: current } = await supabase
        .from("venues")
        .select("website_content")
        .eq("id", venueId)
        .single();
      updateData.website_content = { ...(current?.website_content || {}), ...body.website_content };
    }

    // JSONB: operating_hours — full replace (it's an array)
    if (body.operating_hours) {
      updateData.operating_hours = body.operating_hours;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("venues")
      .update(updateData)
      .eq("id", venueId)
      .select("*")
      .single();

    if (error) {
      console.error("Venue PATCH error:", error);
      return NextResponse.json({ error: "Failed to update venue" }, { status: 500 });
    }

    return NextResponse.json({ venue: data });
  } catch (err) {
    console.error("Venue PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
