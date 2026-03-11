import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLocalToday } from "@/lib/utils/timezone";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockSocialMetrics } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";
const VENUE_TZ = "America/Chicago";

export async function GET() {
  if (isDemoMode()) return NextResponse.json(mockSocialMetrics);
  try {
    const supabase = createAdminClient();

    // Get active social accounts
    const { data: accounts } = await supabase
      .from("social_accounts")
      .select("id, platform, account_name, followers_count, profile_picture_url, last_synced_at")
      .eq("venue_id", VENUE_ID)
      .eq("status", "active");

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({
        hasAccounts: false,
        kpis: { totalFollowers: 0, engagementRate: 0, messagesThisWeek: 0, profileViewsThisWeek: 0 },
        accounts: [],
        dailyMetrics: [],
      });
    }

    // Get last 7 days of metrics
    const todayStr = getLocalToday(VENUE_TZ);
    const sevenDaysAgo = new Date(todayStr + "T00:00:00");
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split("T")[0];

    const accountIds = accounts.map((a) => a.id);

    const { data: metrics } = await supabase
      .from("social_metrics")
      .select("*")
      .in("social_account_id", accountIds)
      .gte("date", dateStr)
      .order("date", { ascending: false });

    // Aggregate KPIs
    const totalFollowers = accounts.reduce((sum, a) => sum + (a.followers_count || 0), 0);

    const weekMetrics = metrics || [];
    const messagesThisWeek = weekMetrics.reduce((sum, m) => sum + (m.messages_received || 0), 0);
    const profileViewsThisWeek = weekMetrics.reduce((sum, m) => sum + (m.profile_views || 0), 0);
    const avgEngagement =
      weekMetrics.length > 0
        ? weekMetrics.reduce((sum, m) => sum + Number(m.engagement_rate || 0), 0) / weekMetrics.length
        : 0;

    // Group daily metrics by date
    const dailyMap = new Map<string, {
      date: string;
      impressions: number;
      reach: number;
      engagement_rate: number;
      messages: number;
    }>();

    for (const m of weekMetrics) {
      const existing = dailyMap.get(m.date) || {
        date: m.date,
        impressions: 0,
        reach: 0,
        engagement_rate: 0,
        messages: 0,
      };
      existing.impressions += m.impressions || 0;
      existing.reach += m.reach || 0;
      existing.engagement_rate = Math.max(existing.engagement_rate, Number(m.engagement_rate || 0));
      existing.messages += m.messages_received || 0;
      dailyMap.set(m.date, existing);
    }

    const dailyMetrics = Array.from(dailyMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({
      hasAccounts: true,
      kpis: {
        totalFollowers,
        engagementRate: Number(avgEngagement.toFixed(2)),
        messagesThisWeek,
        profileViewsThisWeek,
      },
      accounts: accounts.map((a) => ({
        id: a.id,
        platform: a.platform,
        accountName: a.account_name,
        followers: a.followers_count,
        profilePicture: a.profile_picture_url,
        lastSynced: a.last_synced_at,
      })),
      dailyMetrics,
    });
  } catch (err) {
    console.error("Social metrics error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
