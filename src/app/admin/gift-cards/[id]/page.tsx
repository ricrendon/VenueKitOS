"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { useToast } from "@/components/ui";
import {
  Loader2, ArrowLeft, DollarSign, ShoppingCart,
  Settings, RotateCcw, Ban, CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { AdjustBalanceModal } from "@/components/admin/gift-cards/adjust-balance-modal";

interface GiftCardDetail {
  id: string;
  code: string;
  initialValue: number;
  currentBalance: number;
  status: string;
  purchaserName: string | null;
  purchaserEmail: string | null;
  recipientName: string | null;
  recipientEmail: string | null;
  message: string | null;
  paymentMethod: string;
  purchasedAt: string;
  expiresAt: string | null;
  createdAt: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  createdAt: string;
}

const STATUS_VARIANT: Record<string, "success" | "default" | "warning" | "error"> = {
  active: "success",
  redeemed: "default",
  expired: "warning",
  disabled: "error",
};

const TX_ICONS: Record<string, { icon: typeof DollarSign; color: string }> = {
  purchase: { icon: DollarSign, color: "text-sage bg-sage/10" },
  redemption: { icon: ShoppingCart, color: "text-terracotta bg-terracotta/10" },
  adjustment: { icon: Settings, color: "text-dusty-blue bg-dusty-blue/10" },
  refund: { icon: RotateCcw, color: "text-mustard bg-mustard/10" },
};

export default function GiftCardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [giftCard, setGiftCard] = useState<GiftCardDetail | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/gift-cards/${params.id}`);
      if (!res.ok) throw new Error("Not found");
      const json = await res.json();
      setGiftCard(json.giftCard);
      setTransactions(json.transactions || []);
    } catch {
      setGiftCard(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleStatus = async () => {
    if (!giftCard) return;
    setToggling(true);
    try {
      const action = giftCard.status === "disabled" ? "enable" : "disable";
      const res = await fetch(`/api/admin/gift-cards/${giftCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast("success", `Gift card ${action}d`);
      fetchData();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (!giftCard) {
    return (
      <div className="text-center py-20">
        <h2 className="font-display text-h3 text-ink mb-2">Gift Card Not Found</h2>
        <Button variant="ghost" onClick={() => router.push("/admin/gift-cards")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Gift Cards
        </Button>
      </div>
    );
  }

  const spentPercent = giftCard.initialValue > 0
    ? ((giftCard.initialValue - giftCard.currentBalance) / giftCard.initialValue) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/gift-cards")}
            className="p-2 rounded-sm hover:bg-cream-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-ink-secondary" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-h2 text-ink font-mono">{giftCard.code}</h1>
              <Badge variant={STATUS_VARIANT[giftCard.status] || "default"} className="capitalize">
                {giftCard.status}
              </Badge>
            </div>
            <p className="text-body-s text-ink-secondary mt-0.5">
              Issued {format(new Date(giftCard.purchasedAt), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowAdjustModal(true)}>
            <DollarSign className="h-4 w-4 mr-1.5" />
            Adjust Balance
          </Button>
          <Button
            variant="ghost"
            onClick={handleToggleStatus}
            disabled={toggling}
          >
            {giftCard.status === "disabled" ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Enable
              </>
            ) : (
              <>
                <Ban className="h-4 w-4 mr-1.5" />
                Disable
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <InfoField label="Initial Value" value={`$${giftCard.initialValue.toFixed(2)}`} />
            <InfoField
              label="Current Balance"
              value={`$${giftCard.currentBalance.toFixed(2)}`}
              highlight
            />
            <InfoField label="Payment Method" value={giftCard.paymentMethod.replace(/_/g, " ")} />
            <InfoField
              label="Expires"
              value={giftCard.expiresAt ? format(new Date(giftCard.expiresAt), "MMM d, yyyy") : "No expiration"}
            />
            <InfoField label="Purchaser" value={giftCard.purchaserName || "—"} sub={giftCard.purchaserEmail || undefined} />
            <InfoField label="Recipient" value={giftCard.recipientName || "—"} sub={giftCard.recipientEmail || undefined} />
            {giftCard.message && (
              <div className="col-span-2">
                <p className="text-label text-ink-secondary font-medium mb-1">Message</p>
                <p className="text-body-s text-ink italic">&ldquo;{giftCard.message}&rdquo;</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Balance Bar */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <p className="text-body-s text-ink-secondary">Balance Usage</p>
            <p className="text-body-s text-ink font-medium">
              ${(giftCard.initialValue - giftCard.currentBalance).toFixed(2)} spent of ${giftCard.initialValue.toFixed(2)}
            </p>
          </div>
          <div className="h-3 bg-cream-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta rounded-full transition-all duration-500"
              style={{ width: `${Math.min(spentPercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-caption text-ink-secondary">{spentPercent.toFixed(0)}% used</p>
            <p className="text-caption text-sage font-medium">${giftCard.currentBalance.toFixed(2)} remaining</p>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardContent>
          <h3 className="text-body-m font-medium text-ink mb-4">Transaction History</h3>
          {transactions.length === 0 ? (
            <p className="text-body-s text-ink-secondary text-center py-6">No transactions yet</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => {
                const cfg = TX_ICONS[tx.type] || TX_ICONS.adjustment;
                const Icon = cfg.icon;
                const isCredit = tx.type === "purchase" || (tx.type === "adjustment" && tx.notes?.toLowerCase().includes("added"));
                return (
                  <div key={tx.id} className="flex items-start gap-3">
                    <div className={`flex items-center justify-center h-9 w-9 rounded-full shrink-0 ${cfg.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-body-s text-ink font-medium capitalize">{tx.type}</p>
                        <p className={`text-body-s font-medium ${isCredit ? "text-sage" : "text-terracotta"}`}>
                          {isCredit ? "+" : "-"}${tx.amount.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-caption text-ink-secondary">
                          {tx.notes || (tx.referenceType ? `via ${tx.referenceType}` : "")}
                        </p>
                        <p className="text-caption text-ink-secondary">
                          Balance: ${tx.balanceAfter.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-caption text-ink-secondary/60 mt-0.5">
                        {format(new Date(tx.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adjust Modal */}
      <AdjustBalanceModal
        open={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        onSuccess={fetchData}
        giftCardId={giftCard.id}
        currentBalance={giftCard.currentBalance}
        code={giftCard.code}
      />
    </div>
  );
}

function InfoField({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-label text-ink-secondary font-medium mb-1">{label}</p>
      <p className={`text-body-s ${highlight ? "text-terracotta font-display text-h4" : "text-ink font-medium"}`}>
        {value}
      </p>
      {sub && <p className="text-caption text-ink-secondary">{sub}</p>}
    </div>
  );
}
