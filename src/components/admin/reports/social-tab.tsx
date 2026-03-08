"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button, Card, CardContent, Badge, MetricCard } from "@/components/ui";
import {
  BarChart3, Users, Eye, MessageCircle, TrendingUp,
  Instagram, Facebook, RefreshCw, Loader2, Link2,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";

interface SocialKPIs {
  totalFollowers: number;
  engagementRate: number;
  messagesThisWeek: number;
  profileViewsThisWeek: number;
}

interface AccountSummary {
  id: string;
  platform: string;
  accountName: string;
  followers: number;
  profilePicture: string;
  lastSynced: string | null;
}

interface DailyMetric {
  date: string;
  impressions: number;
  reach: number;
  engagement_rate: number;
  messages: number;
}

interface MetricsData {
  hasAccounts: boolean;
  kpis: SocialKPIs;
  accounts: AccountSummary[];
  dailyMetrics: DailyMetric[];
}

export function SocialTab() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchData = useCallback(() => {
    fetch("/api/admin/social/metrics")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch("/api/admin/social/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      fetchData();
    } catch {
      // Silently handle
    } finally {
      setSyncing(false);
    }
  };

  const PlatformIcon = ({ platform }: { platform: string }) => {
    if (platform === "instagram") return <Instagram className="h-5 w-5" />;
    if (platform === "facebook") return <Facebook className="h-5 w-5" />;
    return <BarChart3 className="h-5 w-5" />;
  };

  const platformColor = (platform: string) => {
    if (platform === "instagram") return "from-purple-500 to-pink-500";
    if (platform === "facebook") return "from-blue-600 to-blue-500";
    return "from-gray-600 to-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (!data?.hasAccounts) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-cream-200 flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-ink-secondary" />
            </div>
            <h2 className="font-display text-h3 text-ink mb-2">Connect your social accounts</h2>
            <p className="text-body-m text-ink-secondary max-w-md mx-auto mb-6">
              Link your Instagram and Facebook accounts to see follower trends, engagement metrics, and incoming inquiries.
            </p>
            <Link href="/admin/settings">
              <Button>
                <Link2 className="h-4 w-4" /> Go to Settings <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sync button */}
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={handleSync} disabled={syncing}>
          {syncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {syncing ? "Syncing…" : "Sync Now"}
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Followers"
          value={data.kpis.totalFollowers.toLocaleString()}
          change="Across all platforms"
          changeType="positive"
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Engagement Rate"
          value={`${data.kpis.engagementRate}%`}
          change="7-day average"
          changeType={data.kpis.engagementRate > 3 ? "positive" : "neutral"}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          title="Messages This Week"
          value={String(data.kpis.messagesThisWeek)}
          change="DMs + inquiries"
          changeType="neutral"
          icon={<MessageCircle className="h-5 w-5" />}
        />
        <MetricCard
          title="Profile Views"
          value={data.kpis.profileViewsThisWeek.toLocaleString()}
          change="This week"
          changeType="positive"
          icon={<Eye className="h-5 w-5" />}
        />
      </div>

      {/* Connected Accounts */}
      <div>
        <h2 className="font-display text-h3 text-ink mb-4">Connected Accounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.accounts.map((account) => (
            <Card key={account.id} className="hover:shadow-card-hover transition-shadow">
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${platformColor(account.platform)} flex items-center justify-center text-white`}>
                    <PlatformIcon platform={account.platform} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-body-m font-medium text-ink">@{account.accountName}</h3>
                      <Badge variant="success" className="text-[11px]">
                        {account.platform}
                      </Badge>
                    </div>
                    <p className="text-body-s text-ink-secondary">
                      {account.followers.toLocaleString()} followers
                      {account.lastSynced && (
                        <> · Synced {format(new Date(account.lastSynced), "MMM d, h:mm a")}</>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Engagement Overview */}
      <Card>
        <CardContent>
          <h2 className="font-display text-h3 text-ink mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-terracotta" /> Engagement Overview
          </h2>

          {data.dailyMetrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-300">
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Date</th>
                    <th className="text-right text-label text-ink-secondary py-3 font-medium">Impressions</th>
                    <th className="text-right text-label text-ink-secondary py-3 font-medium">Reach</th>
                    <th className="text-right text-label text-ink-secondary py-3 font-medium">Engagement</th>
                    <th className="text-right text-label text-ink-secondary py-3 font-medium">Messages</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dailyMetrics.map((day) => (
                    <tr key={day.date} className="border-b border-cream-200">
                      <td className="py-3 text-body-s text-ink font-medium">
                        {format(new Date(day.date + "T12:00:00"), "EEE, MMM d")}
                      </td>
                      <td className="py-3 text-body-s text-ink text-right">
                        {day.impressions.toLocaleString()}
                      </td>
                      <td className="py-3 text-body-s text-ink text-right">
                        {day.reach.toLocaleString()}
                      </td>
                      <td className="py-3 text-body-s text-right">
                        <Badge
                          variant={day.engagement_rate > 3 ? "success" : "default"}
                          className="text-[11px]"
                        >
                          {day.engagement_rate}%
                        </Badge>
                      </td>
                      <td className="py-3 text-body-s text-ink text-right">
                        {day.messages}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-body-m text-ink-secondary">
                No engagement data yet. Click &quot;Sync Now&quot; to pull the latest metrics.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manage link */}
      <div className="text-center">
        <Link href="/admin/settings" className="text-body-s text-terracotta hover:underline">
          Manage connected accounts in Settings →
        </Link>
      </div>
    </div>
  );
}
