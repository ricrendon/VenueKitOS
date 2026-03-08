/**
 * Timezone-aware date helpers for venue-local date calculations.
 *
 * Vercel edge/serverless functions run in UTC. When a venue is in
 * America/Chicago, calling `new Date().toISOString().split("T")[0]`
 * after midnight UTC gives the NEXT day — mismatching the bookings
 * table which stores venue-local dates. These helpers solve that.
 */

const DEFAULT_TIMEZONE = "America/Chicago";

/**
 * Returns today's date string (YYYY-MM-DD) in the given timezone.
 * Uses `en-CA` locale which natively formats as YYYY-MM-DD.
 */
export function getLocalToday(timezone: string = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(
    new Date()
  );
}

/**
 * Formats a timestamp string to a human-readable time (e.g., "10:00 AM")
 * in the given timezone.
 */
export function formatTimeInZone(
  isoString: string,
  timezone: string = DEFAULT_TIMEZONE
): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
