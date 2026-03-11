import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLocalToday, formatStoredTime } from "@/lib/utils/timezone";
import { subDays, format } from "date-fns";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockDashboard } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";
const VENUE_TZ = "America/Chicago";

/** Return an ISO date string N days before `today`. */
function daysAgo(today: string, n: number): string {
  return format(subDays(new Date(today + "T12:00:00"), n), "yyyy-MM-dd");
}

/** Safe percent-change: returns 0 when previous value is 0. */
function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const period = new URL(request.url).searchParams.get("period") || "30d";
    return NextResponse.json(mockDashboard(period));
  }
  try {
    const supabase = createAdminClient();
    const today = getLocalToday(VENUE_TZ);

    // Period for trend charts (default 30 days)
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";
    const trendDays = period === "today" ? 1 : period === "7d" ? 7 : 30;
    const trendStart = daysAgo(today, trendDays - 1);
    const yesterday = daysAgo(today, 1);

    // ── Run all queries in parallel ─────────────────────────────────
    const [
      bookingsResult,
      partiesResult,
      checkInsResult,
      membershipsResult,
      waiversResult,
      revenueResult,
      // Trend queries
      trendRevenueResult,
      trendPartiesResult,
      trendVisitorsResult,
      yesterdayBookingsResult,
      yesterdayRevenueResult,
    ] = await Promise.all([
      // ── TODAY's data (unchanged) ──────────────────────────────────
      supabase
        .from("bookings")
        .select("*, parent:parent_accounts(first_name, last_name)")
        .eq("venue_id", VENUE_ID)
        .eq("date", today)
        .order("start_time", { ascending: true }),

      supabase
        .from("party_reservations")
        .select("*, parent:parent_accounts(first_name, last_name), package:party_packages(name)")
        .eq("venue_id", VENUE_ID)
        .eq("date", today)
        .order("start_time", { ascending: true }),

      supabase
        .from("check_ins")
        .select("*")
        .eq("venue_id", VENUE_ID)
        .gte("checked_in_at", `${today}T00:00:00`)
        .lte("checked_in_at", `${today}T23:59:59`),

      supabase
        .from("memberships")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", VENUE_ID)
        .eq("status", "active"),

      supabase
        .from("waivers")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", VENUE_ID)
        .eq("status", "signed"),

      supabase
        .from("bookings")
        .select("total")
        .eq("venue_id", VENUE_ID)
        .eq("date", today)
        .eq("payment_status", "paid"),

      // ── TREND: revenue per day for the selected period ────────────
      supabase
        .from("bookings")
        .select("date, total, type")
        .eq("venue_id", VENUE_ID)
        .gte("date", trendStart)
        .lte("date", today)
        .eq("payment_status", "paid"),

      // ── TREND: parties in the period ──────────────────────────────
      supabase
        .from("party_reservations")
        .select("date, total")
        .eq("venue_id", VENUE_ID)
        .gte("date", trendStart)
        .lte("date", today),

      // ── TREND: visitors per day (last 14 days for bar chart) ──────
      supabase
        .from("bookings")
        .select("date, child_count, adult_count")
        .eq("venue_id", VENUE_ID)
        .gte("date", daysAgo(today, 13))
        .lte("date", today),

      // ── COMPARISON: yesterday's bookings (guest count) ────────────
      supabase
        .from("bookings")
        .select("child_count, adult_count")
        .eq("venue_id", VENUE_ID)
        .eq("date", yesterday),

      // ── COMPARISON: yesterday's revenue ───────────────────────────
      supabase
        .from("bookings")
        .select("total")
        .eq("venue_id", VENUE_ID)
        .eq("date", yesterday)
        .eq("payment_status", "paid"),
    ]);

    // ── Calculate KPIs (unchanged) ──────────────────────────────────
    const todayBookings = bookingsResult.data || [];
    const todayParties = partiesResult.data || [];
    const todayCheckIns = checkInsResult.data || [];

    const guestsToday = todayBookings.reduce(
      (sum, b) => sum + (b.child_count || 0) + (b.adult_count || 0),
      0
    );
    const checkedIn = todayCheckIns.reduce(
      (sum, c) => sum + (c.child_count || 0),
      0
    );
    const revenueToday = (revenueResult.data || []).reduce(
      (sum, b) => sum + (b.total || 0),
      0
    );
    const activeMemberships = membershipsResult.count || 0;
    const signedWaivers = waiversResult.count || 0;

    // ── KPI comparisons ─────────────────────────────────────────────
    const yesterdayGuests = (yesterdayBookingsResult.data || []).reduce(
      (sum, b) => sum + (b.child_count || 0) + (b.adult_count || 0),
      0
    );
    const yesterdayRevenue = (yesterdayRevenueResult.data || []).reduce(
      (sum, b) => sum + (b.total || 0),
      0
    );

    // ── Build trend data ────────────────────────────────────────────
    // Revenue per day
    const revenueByDay = new Map<string, number>();
    for (const b of trendRevenueResult.data || []) {
      revenueByDay.set(b.date, (revenueByDay.get(b.date) || 0) + (b.total || 0));
    }
    // Add party revenue
    for (const p of trendPartiesResult.data || []) {
      revenueByDay.set(p.date, (revenueByDay.get(p.date) || 0) + (p.total || 0));
    }

    // Fill in all dates in the range so the chart has no gaps
    const revenueLast30: { date: string; revenue: number }[] = [];
    for (let i = trendDays - 1; i >= 0; i--) {
      const d = daysAgo(today, i);
      revenueLast30.push({ date: d, revenue: Math.round((revenueByDay.get(d) || 0) * 100) / 100 });
    }

    // Revenue breakdown by source
    const breakdown = { openPlay: 0, parties: 0, cafe: 0, memberships: 0 };
    for (const b of trendRevenueResult.data || []) {
      if (b.type === "party") breakdown.parties += b.total || 0;
      else breakdown.openPlay += b.total || 0;
    }
    for (const p of trendPartiesResult.data || []) {
      breakdown.parties += p.total || 0;
    }

    // Visitors per day (last 14 days)
    const visitorsByDay = new Map<string, number>();
    for (const b of trendVisitorsResult.data || []) {
      visitorsByDay.set(b.date, (visitorsByDay.get(b.date) || 0) + (b.child_count || 0) + (b.adult_count || 0));
    }
    const visitorsLast14: { date: string; visitors: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = daysAgo(today, i);
      visitorsLast14.push({ date: d, visitors: visitorsByDay.get(d) || 0 });
    }

    // ── Build alerts (unchanged) ────────────────────────────────────
    const alerts: { type: string; message: string; action: string }[] = [];

    const checkedInBookingIds = new Set(todayCheckIns.map((c) => c.booking_id));
    const uncheckedBookings = todayBookings.filter(
      (b) =>
        b.status === "confirmed" &&
        !checkedInBookingIds.has(b.id) &&
        new Date(`${today}T${b.start_time.split("T")[1] || b.start_time}`) <= new Date()
    );
    if (uncheckedBookings.length > 0) {
      alerts.push({
        type: "warning",
        message: `${uncheckedBookings.length} confirmed booking(s) not yet checked in`,
        action: "View check-in",
      });
    }

    const partialParties = todayParties.filter((p) => p.payment_status === "partial");
    if (partialParties.length > 0) {
      alerts.push({
        type: "info",
        message: `${partialParties.length} party reservation(s) with outstanding balance`,
        action: "View parties",
      });
    }

    const { count: pastDue } = await supabase
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("venue_id", VENUE_ID)
      .eq("status", "past_due");

    if (pastDue && pastDue > 0) {
      alerts.push({
        type: "error",
        message: `${pastDue} membership(s) with past-due payments`,
        action: "View details",
      });
    }

    // ── Format bookings (unchanged) ─────────────────────────────────
    const formattedBookings = todayBookings.map((b) => {
      const parent = b.parent as { first_name: string; last_name: string } | null;
      const time = b.start_time ? formatStoredTime(b.start_time) : "";
      return {
        id: b.id,
        name: parent ? `${parent.first_name} ${parent.last_name}` : "Unknown",
        time,
        children: b.child_count || 0,
        type: b.type === "party" ? "Party" : "Open Play",
        status: b.status,
        paymentStatus: b.payment_status,
        confirmationCode: b.confirmation_code,
        checkedIn: checkedInBookingIds.has(b.id),
      };
    });

    // ── Format parties (unchanged) ──────────────────────────────────
    const formattedParties = todayParties.map((p) => {
      const parent = p.parent as { first_name: string; last_name: string } | null;
      const pkg = p.package as { name: string } | null;
      const time = p.start_time ? formatStoredTime(p.start_time) : "";
      return {
        id: p.id,
        name: p.child_name ? `${p.child_name}'s Birthday` : "Party",
        time,
        package: pkg?.name || "Unknown",
        guests: p.estimated_guest_count || 0,
        room: p.room || "TBD",
        status: p.status,
        balanceRemaining: p.balance_remaining || 0,
      };
    });

    return NextResponse.json({
      kpis: {
        guestsToday,
        checkedIn,
        revenueToday,
        partiesToday: todayParties.length,
        activeMemberships,
        signedWaivers,
        guestsTrend: pctChange(guestsToday, yesterdayGuests),
        revenueTrend: pctChange(revenueToday, yesterdayRevenue),
      },
      trends: {
        revenueLast30,
        revenueBreakdown: breakdown,
        visitorsLast14,
      },
      bookings: formattedBookings,
      parties: formattedParties,
      alerts,
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
