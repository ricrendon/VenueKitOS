import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStaffPermissions, getStaffIdFromAuth } from "./get-staff-permissions";
import type { PageKey } from "@/lib/types";

/**
 * Check if the current user has permission to access a given page.
 * Resolves the logged-in user from the session cookie, looks up their
 * staff_users record, and checks role-based permissions.
 *
 * Returns a 401/403 NextResponse if not authorized, or null if authorized.
 */
export async function requirePermission(
  _request: Request,
  pageKey: PageKey
): Promise<NextResponse | null> {
  try {
    // Resolve session user from cookies
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized — please log in." },
        { status: 401 }
      );
    }

    // Resolve the staff record linked to this auth user
    const staffId = await getStaffIdFromAuth(user.id);

    if (!staffId) {
      return NextResponse.json(
        { error: "Access denied — staff account required." },
        { status: 403 }
      );
    }

    const allowed = await getStaffPermissions(staffId);

    if (!allowed.has(pageKey)) {
      return NextResponse.json(
        { error: "You do not have permission to access this resource." },
        { status: 403 }
      );
    }

    return null; // authorized
  } catch {
    return NextResponse.json(
      { error: "Authorization check failed" },
      { status: 500 }
    );
  }
}
