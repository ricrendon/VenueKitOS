import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Resolves the venue UUID from the NEXT_PUBLIC_VENUE_SLUG env var.
 * Result is cached after first lookup to avoid repeated DB queries.
 */

let _venueId: string | null = null;
let _venueTz: string | null = null;

const FALLBACK_VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";
const FALLBACK_TZ = "America/Chicago";

export async function getVenueId(): Promise<string> {
  if (_venueId) return _venueId;

  const slug = process.env.NEXT_PUBLIC_VENUE_SLUG;
  if (!slug) return FALLBACK_VENUE_ID;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("venues")
      .select("id, timezone")
      .eq("slug", slug)
      .single();

    if (data) {
      _venueId = data.id as string;
      _venueTz = (data.timezone as string) || FALLBACK_TZ;
      return _venueId;
    }
  } catch {
    // Silently fall back to demo venue
  }

  return FALLBACK_VENUE_ID;
}

export async function getVenueTz(): Promise<string> {
  if (_venueTz) return _venueTz;

  // getVenueId populates _venueTz as a side effect
  await getVenueId();
  return _venueTz || FALLBACK_TZ;
}
