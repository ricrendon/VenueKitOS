import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStaffPermissions } from "@/lib/auth/get-staff-permissions";
import { ALL_PAGE_KEYS, isFullAccessRole } from "@/lib/permissions";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockPermissions } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

export async function GET() {
  if (isDemoMode()) return NextResponse.json(mockPermissions);
  try {
    // Resolve the authenticated user from session cookies
    const serverSupabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ allowedPages: [] }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Look up staff record by auth_user_id
    const { data: staff } = await supabase
      .from("staff_users")
      .select("id, role")
      .eq("auth_user_id", user.id)
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
