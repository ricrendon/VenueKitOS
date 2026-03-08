"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  CardContent,
  Badge,
  MetricCard,
  useToast,
} from "@/components/ui";
import {
  Megaphone,
  Users,
  TrendingUp,
  MessageSquare,
  Eye,
  Instagram,
  Facebook,
  RefreshCw,
  Loader2,
  Unplug,
  Plus,
} from "lucide-react";
import { ConnectAccountModal } from "@/components/admin/marketing/connect-account-modal";

/* ---------- types ---------- */

interface KPIs {
  totalFollowers: number;
  engagementRate: number;
  messagesThisWeek: number;
  profileViewsThisWeek: number;
}

interface MetricsAccount {
  id: string;
  platform: string;
  accountName: string;
  followers: number;
  profilePicture: string | null;
  lastSynced: string | null;
}

interface DailyMetric {
  date: string;
  impressions: number;
  reach: number;
  engagement_rate: number;
  messages: number;
}

interface AccountRow {
  id: string;
  platform: string;
  account_name: string;
  account_id: string;
  profile_picture_url: string | null;
  followers_count: number;
  connected_at: string;
  last_synced_at: string | null;
  status: string;
}

/* ---------- component ---------- */

export default function MarketingPage() {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [kpis, setKpis] = useState<KPIs>({
    totalFollowers: 0,
    engagementRate: 0,
    messagesThisWeek: 0,
    profileViewsThisWeek: 0,
  });
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [hasAccounts, setHasAccounts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const { toast } = useToast();

  /* ----- data fetching ----- */

  const fetchData = useCallback(async () => {
    try {
      const [acctRes, metricsRes] = await Promise.all([
        fetch("/api/admin/social/accounts"),
        fetch("/api/admin/social/metrics"),
      ]);

      const acctJson = await acctRes.json();
      const metricsJson = await metricsRes.json();

      setAccounts(acctJson.accounts || []);
      setKpis(
        metricsJson.kpis || {
          totalFollowers: 0,
          engagementRate: 0,
          messagesThisWeek: 0,
          profileViewsThisWeek: 0,
        }
      );
      setDailyMetrics(metricsJson.dailyMetrics || []);
      setHasAccounts(metricsJson.hasAccounts || false);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ----- actions ----- */

  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      const res = await fetch("/api/admin/social/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        toast("success", "All accounts synced");
        await fetchData();
      } else {
        const json = await res.json();
        toast("error", json.error || "Failed to sync");
      }
    } catch {
      toast("error", "Network error");
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncOne = async (accountId: string) => {
    setSyncingId(accountId);
    try {
      const res = await fetch("/api/admin/social/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      if (res.ok) {
        toast("success", "Account synced");
        await fetchData();
      } else {
        const json = await res.json();
        toast("error", json.error || "Failed to sync");
      }
    } catch {
      toast("error", "Network error");
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    setDisconnectingId(accountId);
    try {
      const res = await fetch(`/api/admin/social/accounts?id=${accountId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast("success", "Account disconnected");
        await fetchData();
      } else {
        const json = await res.json();
        toast("error", json.error || "Failed to disconnect");
      }
    } catch {
      toast("error", "Network error");
    } finally {
      setDisconnectingId(null);
    }
  };

  /* ----- helpers ----- */

  const PlatformIcon = ({ platform }: { platform: string }) =>
    platform === "instagram" ? (
      <Instagram className="h-5 w-5" />
    ) : (
      <Facebook className="h-5 w-5" />
    );

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  const formatTimeAgo = (iso: string | null) => {
    if (!iso) return "Never";
    const ms = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const activeAccounts = accounts.filter((a) => a.status === "active");

  /* ----- loading state ----- */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-h1 text-ink">Marketing</h1>
          <p className="text-body-m text-ink-secondary">
            Social media performance and engagement
          </p>
        </div>
        <div className="flex gap-2">
          {hasAccounts && (
            <Button
              variant="secondary"
              onClick={handleSyncAll}
              disabled={syncingAll}
            >
              {syncingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sync All
            </Button>
          )}
          <Button onClick={() => setConnectModalOpen(true)}>
            <Plus className="h-4 w-4" /> Connect Account
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {!hasAccounts && activeAccounts.length === 0 && (
        <Card>
          <CardContent>
            <div className="py-12 text-center">
              <Megaphone className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
              <h3 className="font-display text-h3 text-ink mb-2">
                No accounts connected
              </h3>
              <p className="text-body-m text-ink-secondary mb-6 max-w-md mx-auto">
                Connect your Instagram or Facebook account to start tracking
                social media performance and engagement metrics.
              </p>
              <Button onClick={() => setConnectModalOpen(true)}>
                <Plus className="h-4 w-4" /> Connect Your First Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards — only show when accounts exist */}
      {hasAccounts && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Followers"
            value={formatNumber(kpis.totalFollowers)}
            icon={<Users className="h-5 w-5" />}
          />
          <MetricCard
            title="Engagement Rate"
            value={`${kpis.engagementRate}%`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <MetricCard
            title="Messages This Week"
            value={kpis.messagesThisWeek}
            icon={<MessageSquare className="h-5 w-5" />}
          />
          <MetricCard
            title="Profile Views"
            value={formatNumber(kpis.profileViewsThisWeek)}
            icon={<Eye className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Connected Accounts */}
      {activeAccounts.length > 0 && (
        <div>
          <h2 className="font-display text-h3 text-ink mb-3">
            Connected Accounts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAccounts.map((account) => (
              <Card key={account.id}>
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Profile picture or platform icon */}
                      {account.profile_picture_url ? (
                        <img
                          src={account.profile_picture_url}
                          alt={account.account_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-cream-200 flex items-center justify-center text-ink-secondary">
                          <PlatformIcon platform={account.platform} />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-body-m font-medium text-ink">
                            {account.account_name}
                          </span>
                          <Badge variant="info">
                            {account.platform === "instagram"
                              ? "Instagram"
                              : "Facebook"}
                          </Badge>
                        </div>
                        <p className="text-caption text-ink-secondary">
                          {formatNumber(account.followers_count)} followers
                          {" · "}
                          Synced {formatTimeAgo(account.last_synced_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSyncOne(account.id)}
                      disabled={syncingId === account.id}
                    >
                      {syncingId === account.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      Sync
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDisconnect(account.id)}
                      disabled={disconnectingId === account.id}
                    >
                      {disconnectingId === account.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Unplug className="h-3.5 w-3.5" />
                      )}
                      Disconnect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Overview Table */}
      {hasAccounts && dailyMetrics.length > 0 && (
        <Card>
          <CardContent>
            <h2 className="font-display text-h3 text-ink mb-4">
              Engagement Overview
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-300">
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">
                      Date
                    </th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">
                      Impressions
                    </th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">
                      Reach
                    </th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">
                      Engagement Rate
                    </th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">
                      Messages
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dailyMetrics.map((row) => (
                    <tr
                      key={row.date}
                      className="border-b border-cream-200 hover:bg-cream-200/50 transition-colors"
                    >
                      <td className="py-3 text-body-s text-ink font-medium">
                        {formatDate(row.date)}
                      </td>
                      <td className="py-3 text-body-s text-ink">
                        {formatNumber(row.impressions)}
                      </td>
                      <td className="py-3 text-body-s text-ink">
                        {formatNumber(row.reach)}
                      </td>
                      <td className="py-3 text-body-s text-ink">
                        {row.engagement_rate}%
                      </td>
                      <td className="py-3 text-body-s text-ink">
                        {row.messages}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connect Account Modal */}
      <ConnectAccountModal
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
