import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVenueId } from "@/lib/utils/venue";

export const dynamic = "force-dynamic";

// PATCH — update membership status (pause, resume, cancel)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = await getVenueId();
    const body = await request.json();
    const { status } = body;

    const VALID_STATUSES = ["active", "paused", "cancelled", "past_due"];
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("memberships")
      .update({ status })
      .eq("id", params.id)
      .eq("venue_id", venueId);

    if (error) {
      console.error("Membership PATCH error:", error);
      return NextResponse.json({ error: "Failed to update membership" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Membership PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
