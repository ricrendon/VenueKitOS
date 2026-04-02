import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVenueId } from "@/lib/utils/venue";

export const dynamic = "force-dynamic";

// PATCH — activate or deactivate a pass
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = await getVenueId();
    const body = await request.json();
    const { active } = body;

    if (typeof active !== "boolean") {
      return NextResponse.json({ error: "active (boolean) is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("member_passes")
      .update({ active })
      .eq("id", params.id)
      .eq("venue_id", venueId);

    if (error) {
      console.error("Pass PATCH error:", error);
      return NextResponse.json({ error: "Failed to update pass" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Pass PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
