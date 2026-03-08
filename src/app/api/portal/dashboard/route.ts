import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLocalToday } from "@/lib/utils/timezone";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";
const VENUE_TZ = "America/Chicago";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authUserId = searchParams.get("authUserId");

    if (!authUserId) {
      return NextResponse.json({ error: "Missing authUserId" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Find parent account from auth user
    const { data: parent } = await supabase
      .from("parent_accounts")
      .select("id, first_name, last_name, email, phone")
      .eq("auth_user_id", authUserId)
      .single();

    if (!parent) {
      // Try without auth_user_id — match by just returning empty
      return NextResponse.json({
        parent: null,
        upcomingBookings: [],
        children: [],
        membership: null,
        waiverStats: { signed: 0, unsigned: 0, expired: 0 },
      });
    }

    // Parallel queries
    const today = getLocalToday(VENUE_TZ);

    const [bookingsRes, childrenRes, waiversRes, membershipRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("id, type, status, payment_status, date, start_time, end_time, child_count, adult_count, total, confirmation_code")
        .eq("parent_id", parent.id)
        .eq("venue_id", VENUE_ID)
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(5),
      supabase
        .from("children")
        .select("id, first_name, last_name, date_of_birth, allergies, special_needs")
        .eq("parent_id", parent.id),
      supabase
        .from("waivers")
        .select("id, child_id, child_name, status, signed_at, expires_at")
        .eq("parent_id", parent.id)
        .eq("venue_id", VENUE_ID),
      supabase
        .from("memberships")
        .select("id, status, start_date, next_billing_date, membership_plans(id, name, monthly_price, max_children, includes_open_play, party_discount, guest_passes)")
        .eq("parent_id", parent.id)
        .eq("status", "active")
        .single(),
    ]);

    const children = (childrenRes.data || []).map((c) => {
      const dob = new Date(c.date_of_birth);
      const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      // Find waiver for this child
      const waiver = (waiversRes.data || []).find((w) => w.child_id === c.id);
      return {
        ...c,
        age,
        waiverStatus: waiver?.status || "unsigned",
      };
    });

    const waiverStats = {
      signed: (waiversRes.data || []).filter((w) => w.status === "signed").length,
      unsigned: children.filter((c) => c.waiverStatus === "unsigned").length,
      expired: (waiversRes.data || []).filter((w) => w.status === "expired").length,
    };

    // Format membership
    let membership = null;
    if (membershipRes.data) {
      const m = membershipRes.data;
      const plan = Array.isArray(m.membership_plans) ? m.membership_plans[0] : m.membership_plans;
      membership = {
        id: m.id,
        status: m.status,
        startDate: m.start_date,
        nextBillingDate: m.next_billing_date,
        plan: plan
          ? {
              name: plan.name,
              monthlyPrice: plan.monthly_price,
              maxChildren: plan.max_children,
              includesOpenPlay: plan.includes_open_play,
              partyDiscount: plan.party_discount,
              guestPasses: plan.guest_passes,
            }
          : null,
      };
    }

    return NextResponse.json({
      parent: {
        id: parent.id,
        firstName: parent.first_name,
        lastName: parent.last_name,
        email: parent.email,
      },
      upcomingBookings: bookingsRes.data || [],
      children,
      membership,
      waiverStats,
    });
  } catch (err) {
    console.error("Portal dashboard error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
