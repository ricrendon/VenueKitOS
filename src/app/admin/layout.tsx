import { AdminShell } from "@/components/layout/admin-shell";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { DEMO_VENUE_NAME } from "@/lib/mock/data";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Demo mode: skip all Supabase lookups
  if (isDemoMode()) {
    return (
      <AdminShell venueName={DEMO_VENUE_NAME} logoUrl={null}>
        {children}
      </AdminShell>
    );
  }

  let venueName: string | null = null;
  let logoUrl: string | null = null;

  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const admin = createAdminClient();

      const { data: staffUser } = await admin
        .from("staff_users")
        .select("venue_id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (staffUser?.venue_id) {
        const { data: venue } = await admin
          .from("venues")
          .select("name, logo_url")
          .eq("id", staffUser.venue_id)
          .maybeSingle();

        venueName = venue?.name ?? null;
        logoUrl = venue?.logo_url ?? null;
      }
    }
  } catch {
    // Silently fall back to default "VenueKit OS" branding
  }

  return (
    <AdminShell venueName={venueName} logoUrl={logoUrl}>
      {children}
    </AdminShell>
  );
}
