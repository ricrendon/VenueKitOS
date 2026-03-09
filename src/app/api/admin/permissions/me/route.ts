import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStaffPermissions } from "@/lib/auth/get-staff-permissions";
import { ALL_PAGE_KEYS, isFullAccessRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const STAFF_ID = "a1b2c3d4-0002-4000-8000-000000000001";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Get staff role
    const { data: staff } = await supabase
      .from("staff_users")
      .select("id, role")
      .eq("id", STAFF_ID)
      .single();

    if (!staff) {
      return NextResponse.json({ allowedPages: ALL_PAGE_KEYS });
    }

    // Full access roles get everything
    if (isFullAccessRole(staff.role)) {
      return NextResponse.json({ allowedPages: ALL_PAGE_KEYS });
    }

    // Resolve permissions for restricted roles
    const allowed = await getStaffPermissions(staff.id);
    const allowedPages = Array.from(allowed);

    return NextResponse.json({ allowedPages });
  } catch (err) {
    console.error("Permissions /me error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
