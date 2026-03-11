import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/mock/demo-mode";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

const VALID_ROLES = [
  "super_admin",
  "venue_owner",
  "venue_manager",
  "front_desk_staff",
  "party_host",
];

// PATCH — update staff member (edit details, terminate, reactivate)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (isDemoMode()) return NextResponse.json({ success: true });
  try {
    const { id: staffId } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    // Build update payload from provided fields
    const update: Record<string, unknown> = {};

    if (body.first_name !== undefined) update.first_name = body.first_name;
    if (body.last_name !== undefined) update.last_name = body.last_name;
    if (body.phone !== undefined) update.phone = body.phone || null;
    if (body.role !== undefined) {
      if (!VALID_ROLES.includes(body.role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      update.role = body.role;
    }
    if (body.active !== undefined) update.active = body.active;

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("staff_users")
      .update(update)
      .eq("id", staffId)
      .eq("venue_id", VENUE_ID)
      .select("*")
      .single();

    if (error) {
      console.error("Staff PATCH error:", error);
      return NextResponse.json(
        { error: "Failed to update staff member" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, staff: data });
  } catch (err) {
    console.error("Staff PATCH error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
