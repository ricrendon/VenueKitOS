"use client";

import { useState } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { useToast } from "@/components/ui";
import { Loader2 } from "lucide-react";

interface AdjustBalanceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  giftCardId: string;
  currentBalance: number;
  code: string;
}

export function AdjustBalanceModal({
  open,
  onClose,
  onSuccess,
  giftCardId,
  currentBalance,
  code,
}: AdjustBalanceModalProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [adjustType, setAdjustType] = useState<"add" | "deduct">("add");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const numAmount = Number(amount) || 0;

  const handleSubmit = async () => {
    if (numAmount <= 0) {
      toast("error", "Please enter a valid amount");
      return;
    }

    if (adjustType === "deduct" && numAmount > currentBalance) {
      toast("error", "Cannot deduct more than current balance");
      return;
    }

    setSubmitting(true);
    try {
      const adjustedAmount = adjustType === "add" ? numAmount : -numAmount;

      const res = await fetch(`/api/admin/gift-cards/${giftCardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjust",
          amount: adjustedAmount,
          notes: notes || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to adjust");

      toast("success", `Balance ${adjustType === "add" ? "added" : "deducted"} on ${code}`);
      setAmount("");
      setNotes("");
      onSuccess();
      onClose();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to adjust balance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Adjust Balance" description={`Gift card: ${code}`} size="sm">
      <div className="space-y-4">
        {/* Current Balance */}
        <div className="bg-cream-200 rounded-sm px-4 py-3 text-center">
          <p className="text-caption text-ink-secondary">Current Balance</p>
          <p className="font-display text-h3 text-ink">${currentBalance.toFixed(2)}</p>
        </div>

        {/* Type Toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAdjustType("add")}
            className={`flex-1 py-2.5 rounded-sm text-body-s font-medium transition-colors ${
              adjustType === "add"
                ? "bg-sage text-white"
                : "bg-cream-200 text-ink hover:bg-cream-300"
            }`}
          >
            + Add
          </button>
          <button
            type="button"
            onClick={() => setAdjustType("deduct")}
            className={`flex-1 py-2.5 rounded-sm text-body-s font-medium transition-colors ${
              adjustType === "deduct"
                ? "bg-terracotta text-white"
                : "bg-cream-200 text-ink hover:bg-cream-300"
            }`}
          >
            - Deduct
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="text-label text-ink-secondary font-medium mb-1 block">Amount</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min={0.01}
            step={0.01}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-label text-ink-secondary font-medium mb-1 block">Reason</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reason for adjustment..."
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || numAmount <= 0} className="flex-1">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
