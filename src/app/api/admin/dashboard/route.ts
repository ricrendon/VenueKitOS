import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const today = new Date().toISOString().split("T")[0];

    // Run all queries in parallel
    const [
      bookingsResult,
      partiesResult,
      checkInsResult,
      membershipsResult,
      waiversResult,
      revenueResult,
    ] = await Promise.all([
      // Today's bookings with parent info
      supabase
        .from("bookings")
        .select("*, parent:parent_accounts(first_name, last_name)")
        .eq("venue_id", VENUE_ID)
        .eq("date", today)
        .order("start_time", { ascending: true }),

      // Today's parties with parent + package info
      supabase
        .from("party_reservations")
        .select("*, parent:parent_accounts(first_name, last_name), package:party_packages(name)")
        .eq("venue_id", VENUE_ID)
        .eq("date", today)
        .order("start_time", { ascending: true }),

      // Today's check-ins
      supabase
        .from("check_ins")
        .select("*")
        .eq("venue_id", VENUE_ID)
        .gte("checked_in_at", `${today}T00:00:00`)
        .lte("checked_in_at", `${today}T23:59:59`),

      // Active memberships count
      supabase
        .from("memberships")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", VENUE_ID)
        .eq("status", "active"),

      // Unsigned waivers count (children with no active waiver at this venue)
      supabase
        .from("waivers")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", VENUE_ID)
        .eq("status", "signed"),

      // Today's revenue
      supabase
        .from("bookings")
        .select("total")
        .eq("venue_id", VENUE_ID)
        .eq("date", today)
        .eq("payment_status", "paid"),
    ]);

    // Calculate KPIs
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

    // Build alerts
    const alerts = [];

    // Check for bookings without check-in
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

    // Parties with partial payment
    const partialParties = todayParties.filter((p) => p.payment_status === "partial");
    if (partialParties.length > 0) {
      alerts.push({
        type: "info",
        message: `${partialParties.length} party reservation(s) with outstanding balance`,
        action: "View parties",
      });
    }

    // Past-due memberships
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

    // Format bookings for the table
    const formattedBookings = todayBookings.map((b) => {
      const parent = b.parent as { first_name: string; last_name: string } | null;
      const time = b.start_time
        ? new Date(b.start_time).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "";
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

    // Format parties
    const formattedParties = todayParties.map((p) => {
      const parent = p.parent as { first_name: string; last_name: string } | null;
      const pkg = p.package as { name: string } | null;
      const time = p.start_time
        ? new Date(p.start_time).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "";
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
