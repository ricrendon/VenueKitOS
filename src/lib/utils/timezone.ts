/**
 * Timezone-aware date helpers for venue-local date calculations.
 *
 * Vercel edge/serverless functions run in UTC. When a venue is in
 * America/Chicago, calling `new Date().toISOString().split("T")[0]`
 * after midnight UTC gives the NEXT day — mismatching the bookings
 * table which stores venue-local dates. These helpers solve that.
 *
 * NOTE: Booking timestamps are stored as local venue time with a
 * UTC offset (+00:00). For example, a 10:00 AM booking is stored as
 * 2026-03-07T10:00:00+00:00. This means times should NOT be
 * timezone-converted when displaying — only "today" calculations
 * need the real timezone.
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
 * Formats a stored timestamp to human-readable time (e.g., "10:00 AM").
 * Since our bookings store local venue time with a +00:00 offset,
 * we format in UTC to display the intended local time as-is.
 */
export function formatStoredTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
