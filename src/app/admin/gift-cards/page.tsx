"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, Badge, MetricCard, Button } from "@/components/ui";
import { Gift, DollarSign, CheckCircle, TrendingUp, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { IssueGiftCardModal } from "@/components/admin/gift-cards/issue-gift-card-modal";
import { GiftCardFilters } from "@/components/admin/gift-cards/gift-card-filters";

interface GiftCardItem {
  id: string;
  code: string;
  initialValue: number;
  currentBalance: number;
  status: string;
  purchaserName: string | null;
  purchaserEmail: string | null;
  recipientName: string | null;
  recipientEmail: string | null;
  paymentMethod: string;
  purchasedAt: string;
  expiresAt: string | null;
  createdAt: string;
}

interface KPIs {
  totalActive: number;
  activeBalance: number;
  totalRedeemed: number;
  totalIssued: number;
}

const STATUS_VARIANT: Record<string, "success" | "default" | "warning" | "error"> = {
  active: "success",
  redeemed: "default",
  expired: "warning",
  disabled: "error",
};

export default function GiftCardsPage() {
  const [giftCards, setGiftCards] = useState<GiftCardItem[]>([]);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showIssueModal, setShowIssueModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);

      const res = await fetch(`/api/admin/gift-cards?${params}`);
      const json = await res.json();
      setGiftCards(json.giftCards || []);
      setKpis(json.kpis || null);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(fetchData, search ? 300 : 0); // debounce search
    return () => clearTimeout(timeout);
  }, [fetchData, search]);

  if (loading && !giftCards.length) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-h1 text-ink">Gift Cards</h1>
          <p className="text-body-m text-ink-secondary">Issue, track, and manage gift cards.</p>
        </div>
        <Button onClick={() => setShowIssueModal(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Issue Gift Card
        </Button>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Cards"
            value={String(kpis.totalActive)}
            change="Currently active"
            changeType="positive"
            icon={<Gift className="h-5 w-5" />}
          />
          <MetricCard
            title="Active Balance"
            value={`$${kpis.activeBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            change="Outstanding"
            changeType="neutral"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <MetricCard
            title="Redeemed"
            value={String(kpis.totalRedeemed)}
            change="Fully used"
            changeType="positive"
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <MetricCard
            title="Total Issued"
            value={String(kpis.totalIssued)}
            change="All time"
            changeType="neutral"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Filters */}
      <GiftCardFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      {/* Table */}
      {giftCards.length > 0 ? (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-300">
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Code</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Recipient</th>
                    <th className="text-right text-label text-ink-secondary py-3 font-medium">Initial</th>
                    <th className="text-right text-label text-ink-secondary py-3 font-medium">Balance</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Status</th>
                    <th className="text-right text-label text-ink-secondary py-3 font-medium">Purchased</th>
                  </tr>
                </thead>
                <tbody>
                  {giftCards.map((gc) => (
                    <tr key={gc.id} className="border-b border-cream-200 hover:bg-cream-50 transition-colors">
                      <td className="py-3">
                        <Link
                          href={`/admin/gift-cards/${gc.id}`}
                          className="font-mono text-body-s text-terracotta font-medium hover:underline"
                        >
                          {gc.code}
                        </Link>
                      </td>
                      <td className="py-3">
                        <p className="text-body-s text-ink">
                          {gc.recipientName || gc.purchaserName || "—"}
                        </p>
                        {gc.recipientEmail && (
                          <p className="text-caption text-ink-secondary">{gc.recipientEmail}</p>
                        )}
                      </td>
                      <td className="py-3 text-body-s text-ink-secondary text-right">
                        ${gc.initialValue.toFixed(2)}
                      </td>
                      <td className="py-3 text-body-s text-ink text-right font-medium">
                        ${gc.currentBalance.toFixed(2)}
                      </td>
                      <td className="py-3">
                        <Badge variant={STATUS_VARIANT[gc.status] || "default"} className="text-[11px] capitalize">
                          {gc.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-body-s text-ink-secondary text-right">
                        {gc.purchasedAt
                          ? format(new Date(gc.purchasedAt), "MMM d, yyyy")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Gift className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
            <h3 className="font-display text-h4 text-ink mb-2">No gift cards yet</h3>
            <p className="text-body-s text-ink-secondary mb-4">
              Issue your first gift card to get started.
            </p>
            <Button onClick={() => setShowIssueModal(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Issue Gift Card
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Issue Modal */}
      <IssueGiftCardModal
        open={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
