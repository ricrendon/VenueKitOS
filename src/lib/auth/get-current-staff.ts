import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CurrentStaff {
  id: string;
  role: string;
  venue_id: string;
}

/**
 * Resolve the current staff user from the authenticated session cookies.
 * Returns null if no session exists or the user isn't a staff member.
 *
 * Use this in API route POST handlers that need the acting staff id
 * (e.g. checked_in_by, reported_by, created_by).
 */
export async function getCurrentStaff(): Promise<CurrentStaff | null> {
  try {
    const serverSupabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await serverSupabase.auth.getUser();
    if (!user) return null;

    const supabase = createAdminClient();
    const { data: staff } = await supabase
      .from("staff_users")
      .select("id, role, venue_id")
      .eq("auth_user_id", user.id)
      .single();

    return staff;
  } catch {
    return null;
  }
}
