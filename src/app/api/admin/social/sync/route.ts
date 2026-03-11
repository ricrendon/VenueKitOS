import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLocalToday } from "@/lib/utils/timezone";
import { isDemoMode } from "@/lib/mock/demo-mode";
import {
  getInstagramProfile,
  getInstagramInsights,
  getFacebookPage,
  getFacebookPageInsights,
} from "@/lib/social/meta";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";
const VENUE_TZ = "America/Chicago";

export async function POST(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json({ success: true, message: "Demo mode: sync simulated" });
  try {
    const body = await request.json();
    const { accountId } = body;

    const supabase = createAdminClient();

    // Get the account with its token
    let query = supabase
      .from("social_accounts")
      .select("*")
      .eq("venue_id", VENUE_ID)
      .eq("status", "active");

    if (accountId) {
      query = query.eq("id", accountId);
    }

    const { data: accounts, error } = await query;

    if (error || !accounts?.length) {
      return NextResponse.json({ error: "No active accounts found" }, { status: 404 });
    }

    const results = [];
    const today = getLocalToday(VENUE_TZ);

    for (const account of accounts) {
      if (!account.access_token) continue;

      let followers = 0;
      let impressions = 0;
      let reach = 0;
      let profileViews = 0;
      let engagementRate = 0;

      try {
        if (account.platform === "instagram") {
          // Fetch Instagram data
          const profile = await getInstagramProfile(account.access_token, account.account_id);
          if (profile) {
            followers = profile.followers_count;

            // Update account followers
            await supabase
              .from("social_accounts")
              .update({
                followers_count: followers,
                last_synced_at: new Date().toISOString(),
              })
              .eq("id", account.id);
          }

          const insights = await getInstagramInsights(account.access_token, account.account_id);
          impressions = insights.impressions;
          reach = insights.reach;
          profileViews = insights.profile_views;

          // Rough engagement rate calc
          if (followers > 0 && reach > 0) {
            engagementRate = Number(((reach / followers) * 100).toFixed(2));
          }
        } else if (account.platform === "facebook") {
          // Fetch Facebook data
          const page = await getFacebookPage(account.access_token, account.account_id);
          if (page) {
            followers = page.followers_count || page.fan_count;

            await supabase
              .from("social_accounts")
              .update({
                followers_count: followers,
                last_synced_at: new Date().toISOString(),
              })
              .eq("id", account.id);
          }

          const insights = await getFacebookPageInsights(account.access_token, account.account_id);
          impressions = insights.impressions;
          reach = insights.reach;
          profileViews = insights.profile_views;

          if (followers > 0 && impressions > 0) {
            engagementRate = Number(((reach / followers) * 100).toFixed(2));
          }
        }
      } catch (apiErr) {
        console.error(`Sync error for ${account.platform}:`, apiErr);
        // Continue with other accounts
      }

      // Upsert daily metric
      const { error: metricsError } = await supabase
        .from("social_metrics")
        .upsert(
          {
            social_account_id: account.id,
            venue_id: VENUE_ID,
            date: today,
            followers,
            impressions,
            reach,
            engagement_rate: engagementRate,
            profile_views: profileViews,
            messages_received: 0, // DM access requires additional permissions
          },
          { onConflict: "social_account_id,date" }
        );

      results.push({
        accountId: account.id,
        platform: account.platform,
        synced: !metricsError,
        followers,
        impressions,
        reach,
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("Social sync error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
