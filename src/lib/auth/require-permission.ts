import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStaffPermissions } from "./get-staff-permissions";
import type { PageKey } from "@/lib/types";

/**
 * Check if the current user has permission to access a given page.
 * Returns a 403 NextResponse if not authorized, or null if authorized.
 *
 * Usage in API routes:
 *   const denied = await requirePermission(request, "reports");
 *   if (denied) return denied;
 */
export async function requirePermission(
  _request: Request,
  pageKey: PageKey
): Promise<NextResponse | null> {
  try {
    const supabase = createAdminClient();

    // For now, we use the hardcoded staff ID (Marcus).
    // In a full implementation, extract user from auth headers.
    const STAFF_ID = "a1b2c3d4-0002-4000-8000-000000000001";

    const allowed = await getStaffPermissions(STAFF_ID);

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
