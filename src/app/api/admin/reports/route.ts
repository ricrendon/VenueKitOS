import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLocalToday } from "@/lib/utils/timezone";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockReports } from "@/lib/mock/data";
import { getVenueId, getVenueTz } from "@/lib/utils/venue";

export const dynamic = "force-dynamic";

type Period = "7d" | "30d" | "90d" | "12m";
type Tab = "overview" | "revenue" | "occupancy" | "customers";

function getPeriodDays(period: Period): number {
  switch (period) {
    case "7d": return 7;
    case "30d": return 30;
    case "90d": return 90;
    case "12m": return 365;
  }
}

function getDateRange(period: Period, tz: string): { start: string; end: string; prevStart: string; prevEnd: string } {
  const today = getLocalToday(tz);
  const days = getPeriodDays(period);

  const endDate = new Date(today + "T23:59:59");
  const startDate = new Date(today + "T00:00:00");
  startDate.setDate(startDate.getDate() - days + 1);

  const prevEndDate = new Date(startDate);
  prevEndDate.setDate(prevEndDate.getDate() - 1);
  const prevStartDate = new Date(prevEndDate);
  prevStartDate.setDate(prevStartDate.getDate() - days + 1);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  return {
    start: fmt(startDate),
    end: fmt(endDate),
    prevStart: fmt(prevStartDate),
    prevEnd: fmt(prevEndDate),
  };
}

function changePercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/* eslint-disable @typescript-eslint/no-explicit-any */

async function getOverviewData(supabase: any, range: ReturnType<typeof getDateRange>, venueId: string) {
  const { start, end, prevStart, prevEnd } = range;

  const [
    bookingsRes,
    prevBookingsRes,
    ordersRes,
    prevOrdersRes,
    partyRes,
    prevPartyRes,
    membershipRes,
    checkInsRes,
    prevCheckInsRes,
  ] = await Promise.all([
    // Current period bookings
    supabase
      .from("bookings")
      .select("date, total, type, child_count, adult_count, status, payment_status")
      .eq("venue_id", venueId)
      .gte("date", start)
      .lte("date", end)
      .in("status", ["confirmed", "completed"]),
    // Previous period bookings
    supabase
      .from("bookings")
      .select("date, total, child_count, adult_count, status, payment_status")
      .eq("venue_id", venueId)
      .gte("date", prevStart)
      .lte("date", prevEnd)
      .in("status", ["confirmed", "completed"]),
    // Current POS orders
    supabase
      .from("orders")
      .select("total, created_at, status")
      .eq("venue_id", venueId)
      .gte("created_at", start + "T00:00:00")
      .lte("created_at", end + "T23:59:59")
      .eq("status", "completed"),
    // Previous POS orders
    supabase
      .from("orders")
      .select("total, status")
      .eq("venue_id", venueId)
      .gte("created_at", prevStart + "T00:00:00")
      .lte("created_at", prevEnd + "T23:59:59")
      .eq("status", "completed"),
    // Current party reservations
    supabase
      .from("party_reservations")
      .select("date, total_due, status")
      .eq("venue_id", venueId)
      .gte("date", start)
      .lte("date", end)
      .in("status", ["confirmed", "completed"]),
    // Previous party reservations
    supabase
      .from("party_reservations")
      .select("total_due, status")
      .eq("venue_id", venueId)
      .gte("date", prevStart)
      .lte("date", prevEnd)
      .in("status", ["confirmed", "completed"]),
    // Active memberships with plan prices
    supabase
      .from("memberships")
      .select("id, plan_id, status, membership_plans(monthly_price)")
      .eq("venue_id", venueId)
      .eq("status", "active"),
    // Current check-ins
    supabase
      .from("check_ins")
      .select("checked_in_at, child_count")
      .eq("venue_id", venueId)
      .gte("checked_in_at", start + "T00:00:00")
      .lte("checked_in_at", end + "T23:59:59"),
    // Previous check-ins
    supabase
      .from("check_ins")
      .select("child_count")
      .eq("venue_id", venueId)
      .gte("checked_in_at", prevStart + "T00:00:00")
      .lte("checked_in_at", prevEnd + "T23:59:59"),
  ]);

  const bookings = bookingsRes.data || [];
  const prevBookings = prevBookingsRes.data || [];
  const orders = ordersRes.data || [];
  const prevOrders = prevOrdersRes.data || [];
  const parties = partyRes.data || [];
  const prevParties = prevPartyRes.data || [];
  const memberships = membershipRes.data || [];
  const checkIns = checkInsRes.data || [];
  const prevCheckIns = prevCheckInsRes.data || [];

  // KPIs
  const openPlayRevenue = bookings
    .filter((b: any) => b.type === "open_play" && b.payment_status === "paid")
    .reduce((s: number, b: any) => s + Number(b.total || 0), 0);
  const partyRevenue = parties.reduce((s: number, p: any) => s + Number(p.total_due || 0), 0);
  const cafeRevenue = orders.reduce((s: number, o: any) => s + Number(o.total || 0), 0);
  const membershipMRR = memberships.reduce((s: number, m: any) => {
    const plan = m.membership_plans as any;
    return s + Number(plan?.monthly_price || 0);
  }, 0);
  const totalRevenue = openPlayRevenue + partyRevenue + cafeRevenue + membershipMRR;

  const prevOpenPlay = prevBookings
    .filter((b: any) => b.type === "open_play" && b.payment_status === "paid")
    .reduce((s: number, b: any) => s + Number(b.total || 0), 0);
  const prevPartyRev = prevParties.reduce((s: number, p: any) => s + Number(p.total_due || 0), 0);
  const prevCafeRev = prevOrders.reduce((s: number, o: any) => s + Number(o.total || 0), 0);
  const prevTotalRevenue = prevOpenPlay + prevPartyRev + prevCafeRev + membershipMRR;

  const totalVisitors = bookings.reduce(
    (s: number, b: any) => s + (b.child_count || 0) + (b.adult_count || 0),
    0
  ) + checkIns.reduce((s: number, c: any) => s + (c.child_count || 0), 0);

  const prevTotalVisitors = prevBookings.reduce(
    (s: number, b: any) => s + (b.child_count || 0) + (b.adult_count || 0),
    0
  ) + prevCheckIns.reduce((s: number, c: any) => s + (c.child_count || 0), 0);

  const avgRevenuePerVisitor = totalVisitors > 0 ? totalRevenue / totalVisitors : 0;
  const prevAvgRevenue = prevTotalVisitors > 0 ? prevTotalRevenue / prevTotalVisitors : 0;

  // Revenue trend — group bookings by date
  const revenueByDate: Record<string, number> = {};
  bookings.filter((b: any) => b.payment_status === "paid").forEach((b: any) => {
    revenueByDate[b.date] = (revenueByDate[b.date] || 0) + Number(b.total || 0);
  });
  parties.forEach((p: any) => {
    revenueByDate[p.date] = (revenueByDate[p.date] || 0) + Number(p.total_due || 0);
  });
  orders.forEach((o: any) => {
    const date = o.created_at?.split("T")[0];
    if (date) revenueByDate[date] = (revenueByDate[date] || 0) + Number(o.total || 0);
  });

  const revenueTrend = Object.entries(revenueByDate)
    .map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Daily visitors
  const visitorsByDate: Record<string, number> = {};
  bookings.forEach((b: any) => {
    visitorsByDate[b.date] = (visitorsByDate[b.date] || 0) + (b.child_count || 0) + (b.adult_count || 0);
  });

  const dailyVisitors = Object.entries(visitorsByDate)
    .map(([date, visitors]) => ({ date, visitors }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    kpis: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      revenueChange: changePercent(totalRevenue, prevTotalRevenue),
      totalVisitors,
      visitorsChange: changePercent(totalVisitors, prevTotalVisitors),
      avgRevenuePerVisitor: Math.round(avgRevenuePerVisitor * 100) / 100,
      avgRevenueChange: changePercent(avgRevenuePerVisitor, prevAvgRevenue),
      bookingsCount: bookings.length,
      bookingsChange: changePercent(bookings.length, prevBookings.length),
    },
    revenueTrend,
    revenueBreakdown: {
      openPlay: Math.round(openPlayRevenue * 100) / 100,
      parties: Math.round(partyRevenue * 100) / 100,
      cafe: Math.round(cafeRevenue * 100) / 100,
      memberships: Math.round(membershipMRR * 100) / 100,
    },
    dailyVisitors,
  };
}

async function getRevenueData(supabase: any, range: ReturnType<typeof getDateRange>, venueId: string) {
  const { start, end, prevStart, prevEnd } = range;

  const [bookingsRes, prevBookingsRes, ordersRes, prevOrdersRes, partyRes, prevPartyRes] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("date, total, type, payment_status")
        .eq("venue_id", venueId)
        .gte("date", start)
        .lte("date", end)
        .in("status", ["confirmed", "completed"]),
      supabase
        .from("bookings")
        .select("total, type, payment_status")
        .eq("venue_id", venueId)
        .gte("date", prevStart)
        .lte("date", prevEnd)
        .in("status", ["confirmed", "completed"]),
      supabase
        .from("orders")
        .select("total, created_at")
        .eq("venue_id", venueId)
        .gte("created_at", start + "T00:00:00")
        .lte("created_at", end + "T23:59:59")
        .eq("status", "completed"),
      supabase
        .from("orders")
        .select("total")
        .eq("venue_id", venueId)
        .gte("created_at", prevStart + "T00:00:00")
        .lte("created_at", prevEnd + "T23:59:59")
        .eq("status", "completed"),
      supabase
        .from("party_reservations")
        .select("date, total_due")
        .eq("venue_id", venueId)
        .gte("date", start)
        .lte("date", end)
        .in("status", ["confirmed", "completed"]),
      supabase
        .from("party_reservations")
        .select("total_due")
        .eq("venue_id", venueId)
        .gte("date", prevStart)
        .lte("date", prevEnd)
        .in("status", ["confirmed", "completed"]),
    ]);

  const bookings = bookingsRes.data || [];
  const prevBookings = prevBookingsRes.data || [];
  const orders = ordersRes.data || [];
  const prevOrders = prevOrdersRes.data || [];
  const parties = partyRes.data || [];
  const prevParties = prevPartyRes.data || [];

  // Daily by source
  const dailyMap: Record<string, { openPlay: number; parties: number; cafe: number; memberships: number }> = {};
  const ensureDate = (date: string) => {
    if (!dailyMap[date]) dailyMap[date] = { openPlay: 0, parties: 0, cafe: 0, memberships: 0 };
  };

  bookings.filter((b: any) => b.payment_status === "paid").forEach((b: any) => {
    ensureDate(b.date);
    if (b.type === "open_play") dailyMap[b.date].openPlay += Number(b.total || 0);
  });
  parties.forEach((p: any) => {
    ensureDate(p.date);
    dailyMap[p.date].parties += Number(p.total_due || 0);
  });
  orders.forEach((o: any) => {
    const date = o.created_at?.split("T")[0];
    if (date) {
      ensureDate(date);
      dailyMap[date].cafe += Number(o.total || 0);
    }
  });

  const dailyBySource = Object.entries(dailyMap)
    .map(([date, values]) => ({
      date,
      openPlay: Math.round(values.openPlay * 100) / 100,
      parties: Math.round(values.parties * 100) / 100,
      cafe: Math.round(values.cafe * 100) / 100,
      memberships: 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Comparison
  const currentTotal = bookings.filter((b: any) => b.payment_status === "paid").reduce((s: number, b: any) => s + Number(b.total || 0), 0)
    + parties.reduce((s: number, p: any) => s + Number(p.total_due || 0), 0)
    + orders.reduce((s: number, o: any) => s + Number(o.total || 0), 0);

  const previousTotal = prevBookings.filter((b: any) => b.payment_status === "paid").reduce((s: number, b: any) => s + Number(b.total || 0), 0)
    + prevParties.reduce((s: number, p: any) => s + Number(p.total_due || 0), 0)
    + prevOrders.reduce((s: number, o: any) => s + Number(o.total || 0), 0);

  // Top 5 days
  const dayTotals: Record<string, { revenue: number; bookings: number }> = {};
  bookings.filter((b: any) => b.payment_status === "paid").forEach((b: any) => {
    if (!dayTotals[b.date]) dayTotals[b.date] = { revenue: 0, bookings: 0 };
    dayTotals[b.date].revenue += Number(b.total || 0);
    dayTotals[b.date].bookings += 1;
  });
  parties.forEach((p: any) => {
    if (!dayTotals[p.date]) dayTotals[p.date] = { revenue: 0, bookings: 0 };
    dayTotals[p.date].revenue += Number(p.total_due || 0);
    dayTotals[p.date].bookings += 1;
  });

  const topDays = Object.entries(dayTotals)
    .map(([date, { revenue, bookings }]) => ({ date, revenue: Math.round(revenue * 100) / 100, bookings }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Avg transaction trend
  const txByDate: Record<string, { total: number; count: number }> = {};
  bookings.filter((b: any) => b.payment_status === "paid").forEach((b: any) => {
    if (!txByDate[b.date]) txByDate[b.date] = { total: 0, count: 0 };
    txByDate[b.date].total += Number(b.total || 0);
    txByDate[b.date].count += 1;
  });

  const avgTransactionTrend = Object.entries(txByDate)
    .map(([date, { total, count }]) => ({
      date,
      avgValue: Math.round((total / count) * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    dailyBySource,
    comparison: {
      current: Math.round(currentTotal * 100) / 100,
      previous: Math.round(previousTotal * 100) / 100,
      changePercent: changePercent(currentTotal, previousTotal),
    },
    topDays,
    avgTransactionTrend,
  };
}

async function getOccupancyData(supabase: any, range: ReturnType<typeof getDateRange>, venueId: string) {
  const { start, end } = range;

  const [bookingsRes, venueRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("date, start_time, child_count, adult_count")
      .eq("venue_id", venueId)
      .gte("date", start)
      .lte("date", end)
      .in("status", ["confirmed", "completed"]),
    supabase
      .from("venues")
      .select("settings")
      .eq("id", venueId)
      .single(),
  ]);

  const bookings = bookingsRes.data || [];
  const maxCapacity = (venueRes.data?.settings as any)?.maxCapacity || 200;

  // Heatmap: dayOfWeek × hour
  const heatmap: Record<string, number> = {};
  bookings.forEach((b: any) => {
    const dateObj = new Date(b.date + "T12:00:00");
    const dayOfWeek = dateObj.getUTCDay(); // 0=Sun
    // Extract hour from start_time (stored as local time with UTC offset)
    const hour = new Date(b.start_time).getUTCHours();
    const key = `${dayOfWeek}-${hour}`;
    const guests = (b.child_count || 0) + (b.adult_count || 0);
    heatmap[key] = (heatmap[key] || 0) + guests;
  });

  // Normalize by number of weeks in period
  const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const weeks = Math.max(1, Math.floor(days / 7));

  const heatmapData = Object.entries(heatmap).map(([key, total]) => {
    const [dow, h] = key.split("-").map(Number);
    return {
      dayOfWeek: dow,
      hour: h,
      utilization: Math.min(100, Math.round((total / weeks / maxCapacity) * 100)),
    };
  });

  // Fill rate by time slot
  const slotGuests: Record<string, { total: number; count: number }> = {};
  bookings.forEach((b: any) => {
    const hour = new Date(b.start_time).getUTCHours();
    const slot = `${hour}:00`;
    if (!slotGuests[slot]) slotGuests[slot] = { total: 0, count: 0 };
    slotGuests[slot].total += (b.child_count || 0) + (b.adult_count || 0);
    slotGuests[slot].count += 1;
  });

  const fillRate = Object.entries(slotGuests)
    .map(([timeSlot, { total, count }]) => ({
      timeSlot,
      fillPercent: Math.min(100, Math.round((total / count / maxCapacity) * 100)),
    }))
    .sort((a, b) => parseInt(a.timeSlot) - parseInt(b.timeSlot));

  // Capacity trend by date
  const dailyGuests: Record<string, number> = {};
  bookings.forEach((b: any) => {
    dailyGuests[b.date] = (dailyGuests[b.date] || 0) + (b.child_count || 0) + (b.adult_count || 0);
  });

  const capacityTrend = Object.entries(dailyGuests)
    .map(([date, guests]) => ({
      date,
      utilization: Math.min(100, Math.round((guests / maxCapacity) * 100)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Busiest days
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const busiestDays = Object.entries(dailyGuests)
    .map(([date, guests]) => ({
      date,
      dayName: dayNames[new Date(date + "T12:00:00").getUTCDay()],
      guests,
    }))
    .sort((a, b) => b.guests - a.guests)
    .slice(0, 5);

  return { heatmap: heatmapData, fillRate, capacityTrend, busiestDays };
}

async function getCustomersData(supabase: any, range: ReturnType<typeof getDateRange>, venueId: string) {
  const { start, end } = range;

  const [bookingsRes, membershipsRes, plansRes, allBookingsRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("date, parent_id, child_count, adult_count")
      .eq("venue_id", venueId)
      .gte("date", start)
      .lte("date", end)
      .in("status", ["confirmed", "completed"]),
    supabase
      .from("memberships")
      .select("id, plan_id, status, start_date")
      .eq("venue_id", venueId),
    supabase
      .from("membership_plans")
      .select("id, name, monthly_price")
      .eq("venue_id", venueId)
      .eq("active", true),
    // All-time bookings to determine first visit
    supabase
      .from("bookings")
      .select("parent_id, date")
      .eq("venue_id", venueId)
      .in("status", ["confirmed", "completed"])
      .order("date", { ascending: true }),
  ]);

  const bookings = bookingsRes.data || [];
  const memberships = membershipsRes.data || [];
  const plans = plansRes.data || [];
  const allBookings = allBookingsRes.data || [];

  // Determine first visit per parent
  const firstVisit: Record<string, string> = {};
  allBookings.forEach((b: any) => {
    if (b.parent_id && (!firstVisit[b.parent_id] || b.date < firstVisit[b.parent_id])) {
      firstVisit[b.parent_id] = b.date;
    }
  });

  // New vs returning by date
  const newRetByDate: Record<string, { new: number; returning: number }> = {};
  bookings.forEach((b: any) => {
    if (!newRetByDate[b.date]) newRetByDate[b.date] = { new: 0, returning: 0 };
    if (b.parent_id && firstVisit[b.parent_id] === b.date) {
      newRetByDate[b.date].new += 1;
    } else {
      newRetByDate[b.date].returning += 1;
    }
  });

  const newVsReturning = Object.entries(newRetByDate)
    .map(([date, vals]) => ({ date, new: vals.new, returning: vals.returning }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Member vs non-member
  const activeMemberParentIds = new Set(
    memberships.filter((m: any) => m.status === "active").map((m: any) => m.parent_id)
  );
  const memberBookings = bookings.filter((b: any) => activeMemberParentIds.has(b.parent_id)).length;
  const nonMemberBookings = bookings.length - memberBookings;

  // Members by tier
  const activeMemberships = memberships.filter((m: any) => m.status === "active");
  const tierCounts: Record<string, number> = {};
  activeMemberships.forEach((m: any) => {
    const plan = plans.find((p: any) => p.id === m.plan_id);
    const tierName = plan?.name || "Unknown";
    tierCounts[tierName] = (tierCounts[tierName] || 0) + 1;
  });
  const membersByTier = Object.entries(tierCounts).map(([tier, count]) => ({ tier, count }));

  // MRR trend — group by start month
  const mrrByMonth: Record<string, number> = {};
  activeMemberships.forEach((m: any) => {
    const plan = plans.find((p: any) => p.id === m.plan_id);
    const price = Number(plan?.monthly_price || 0);
    const startMonth = m.start_date?.substring(0, 7) || "unknown";
    // Accumulate MRR from start month onward
    mrrByMonth[startMonth] = (mrrByMonth[startMonth] || 0) + price;
  });

  // Build cumulative MRR
  const sortedMonths = Object.keys(mrrByMonth).sort();
  let cumulativeMRR = 0;
  const mrrTrend = sortedMonths.map((month) => {
    cumulativeMRR += mrrByMonth[month];
    return { month, mrr: Math.round(cumulativeMRR * 100) / 100 };
  });

  // Churn rate
  const cancelledCount = memberships.filter((m: any) => m.status === "cancelled").length;
  const totalEver = memberships.length;
  const churnRate = totalEver > 0 ? Math.round((cancelledCount / totalEver) * 100) : 0;

  return {
    newVsReturning,
    memberSplit: { members: memberBookings, nonMembers: nonMemberBookings },
    membersByTier,
    mrrTrend,
    churnRate,
  };
}

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const { searchParams } = new URL(request.url);
    return NextResponse.json(mockReports(searchParams.get("tab") || "overview", searchParams.get("period") || "30d"));
  }
  try {
    const venueId = await getVenueId();
    const venueTz = await getVenueTz();
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const tab = (searchParams.get("tab") || "overview") as Tab;
    const validPeriods: Period[] = ["7d", "30d", "90d", "12m"];
    const rawPeriod = searchParams.get("period") || "30d";
    const period: Period = validPeriods.includes(rawPeriod as Period) ? (rawPeriod as Period) : "30d";

    const range = getDateRange(period, venueTz);

    let data;
    switch (tab) {
      case "overview":
        data = await getOverviewData(supabase, range, venueId);
        break;
      case "revenue":
        data = await getRevenueData(supabase, range, venueId);
        break;
      case "occupancy":
        data = await getOccupancyData(supabase, range, venueId);
        break;
      case "customers":
        data = await getCustomersData(supabase, range, venueId);
        break;
      default:
        data = await getOverviewData(supabase, range, venueId);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Reports API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
