import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Get membership plans
    const { data: plans } = await supabase
      .from("membership_plans")
      .select("id, name, description, monthly_price, annual_price, max_children, includes_open_play, party_discount, guest_passes, features")
      .eq("venue_id", VENUE_ID)
      .order("monthly_price");

    // Get active memberships with parent info
    const { data: memberships } = await supabase
      .from("memberships")
      .select(`
        id, status, start_date, next_billing_date,
        parent_accounts(id, first_name, last_name, email, phone),
        membership_plans(id, name, monthly_price)
      `)
      .eq("status", "active")
      .order("start_date", { ascending: false });

    // Get all memberships for KPIs
    const { data: allMemberships } = await supabase
      .from("memberships")
      .select("id, status, next_billing_date, membership_plans(monthly_price)");

    const activeCount = (allMemberships || []).filter((m) => m.status === "active").length;
    const pausedCount = (allMemberships || []).filter((m) => m.status === "paused").length;
    const totalMRR = (allMemberships || [])
      .filter((m) => m.status === "active")
      .reduce((sum, m) => {
        const plan = Array.isArray(m.membership_plans) ? m.membership_plans[0] : m.membership_plans;
        return sum + (plan?.monthly_price || 0);
      }, 0);

    return NextResponse.json({
      plans: plans || [],
      memberships: (memberships || []).map((m) => {
        const parent = Array.isArray(m.parent_accounts) ? m.parent_accounts[0] : m.parent_accounts;
        const plan = Array.isArray(m.membership_plans) ? m.membership_plans[0] : m.membership_plans;
        return {
          id: m.id,
          status: m.status,
          startDate: m.start_date,
          nextBillingDate: m.next_billing_date,
          parentName: parent ? `${parent.first_name} ${parent.last_name}` : "Unknown",
          parentEmail: parent?.email || "",
          planName: plan?.name || "Unknown",
          monthlyPrice: plan?.monthly_price || 0,
        };
      }),
      kpis: {
        activeMembers: activeCount,
        pausedMembers: pausedCount,
        monthlyRecurringRevenue: totalMRR,
        totalPlans: (plans || []).length,
      },
    });
  } catch (err) {
    console.error("Memberships GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
