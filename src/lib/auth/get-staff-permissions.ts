import { createAdminClient } from "@/lib/supabase/admin";
import { getDefaultPages } from "@/lib/permissions";
import type { PageKey } from "@/lib/types";

/**
 * Resolve the effective page permissions for a staff member.
 * Combines role defaults with any per-employee overrides stored in staff_permissions.
 */
export async function getStaffPermissions(staffId: string): Promise<Set<PageKey>> {
  const supabase = createAdminClient();

  // 1. Get the staff member's role
  const { data: staff } = await supabase
    .from("staff_users")
    .select("role")
    .eq("id", staffId)
    .single();

  if (!staff) return new Set<PageKey>();

  // 2. Start with role defaults
  const allowed = getDefaultPages(staff.role);

  // 3. Apply per-employee overrides
  const { data: overrides } = await supabase
    .from("staff_permissions")
    .select("page_key, granted")
    .eq("staff_id", staffId);

  if (overrides) {
    for (const o of overrides) {
      if (o.granted) {
        allowed.add(o.page_key as PageKey);
      } else {
        allowed.delete(o.page_key as PageKey);
      }
    }
  }

  return allowed;
}

/**
 * Get staff_users.id from an auth user id.
 */
export async function getStaffIdFromAuth(authUserId: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("staff_users")
    .select("id")
    .eq("auth_user_id", authUserId)
    .single();
  return data?.id ?? null;
}
