import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const STAFF_ID = "a1b2c3d4-0002-4000-8000-000000000001";
const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

// PATCH — update an incident (resolve, change status, add resolution details)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: incidentId } = await params;
    const body = await request.json();

    const {
      status,
      resolution_notes,
      resolution_cost,
      operational_impact,
      outcome,
    } = body;

    const supabase = createAdminClient();

    // Build update payload
    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) update.status = status;
    if (resolution_notes !== undefined) update.resolution_notes = resolution_notes;
    if (resolution_cost !== undefined) update.resolution_cost = resolution_cost;
    if (operational_impact !== undefined) update.operational_impact = operational_impact;
    if (outcome !== undefined) update.outcome = outcome;

    // If resolving, set resolved_by and resolved_at
    if (status === "resolved" || status === "closed") {
      update.resolved_by = STAFF_ID;
      update.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("incidents")
      .update(update)
      .eq("id", incidentId)
      .eq("venue_id", VENUE_ID)
      .select("*")
      .single();

    if (error) {
      console.error("Incident PATCH error:", error);
      return NextResponse.json({ error: "Failed to update incident" }, { status: 500 });
    }

    return NextResponse.json({ success: true, incident: data });
  } catch (err) {
    console.error("Incident PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
