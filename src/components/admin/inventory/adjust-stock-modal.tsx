"use client";

import { useState } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { useToast } from "@/components/ui";
import { Loader2 } from "lucide-react";

interface AdjustStockModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId: string;
  productName: string;
  currentQuantity: number;
  unit: string;
}

type TransactionType = "received" | "adjustment" | "return" | "damaged";

const TX_TYPES: { value: TransactionType; label: string; activeClass: string; direction: "add" | "remove" | "both" }[] = [
  { value: "received", label: "Received", activeClass: "bg-sage text-white", direction: "add" },
  { value: "adjustment", label: "Adjustment", activeClass: "bg-dusty-blue text-white", direction: "both" },
  { value: "return", label: "Return", activeClass: "bg-mustard text-white", direction: "add" },
  { value: "damaged", label: "Damaged", activeClass: "bg-terracotta text-white", direction: "remove" },
];

export function AdjustStockModal({
  open,
  onClose,
  onSuccess,
  productId,
  productName,
  currentQuantity,
  unit,
}: AdjustStockModalProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [txType, setTxType] = useState<TransactionType>("received");
  const [quantity, setQuantity] = useState("");
  const [direction, setDirection] = useState<"add" | "remove">("add");
  const [notes, setNotes] = useState("");

  const numQty = Number(quantity) || 0;
  const activeTx = TX_TYPES.find((t) => t.value === txType)!;

  // Calculate signed change
  const isRemoving =
    activeTx.direction === "remove" || (activeTx.direction === "both" && direction === "remove");
  const signedChange = isRemoving ? -numQty : numQty;
  const newQuantity = currentQuantity + signedChange;

  const handleSubmit = async () => {
    if (numQty <= 0) {
      toast("error", "Please enter a valid quantity");
      return;
    }

    if (newQuantity < 0) {
      toast("error", "Cannot reduce stock below 0");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/inventory/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjust_stock",
          type: txType,
          quantityChange: signedChange,
          notes: notes || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to adjust stock");

      toast("success", `Stock updated for ${productName}`);
      setQuantity("");
      setNotes("");
      setTxType("received");
      setDirection("add");
      onSuccess();
      onClose();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to adjust stock");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Adjust Stock" description={productName} size="sm">
      <div className="space-y-4">
        {/* Current Stock */}
        <div className="bg-cream-200 rounded-sm px-4 py-3 text-center">
          <p className="text-caption text-ink-secondary">Current Stock</p>
          <p className="font-display text-h3 text-ink">
            {currentQuantity} <span className="text-body-s text-ink-secondary">{unit}</span>
          </p>
        </div>

        {/* Transaction Type */}
        <div className="grid grid-cols-2 gap-2">
          {TX_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setTxType(t.value);
                if (t.direction === "add") setDirection("add");
                else if (t.direction === "remove") setDirection("remove");
              }}
              className={`py-2.5 rounded-sm text-body-s font-medium transition-colors ${
                txType === t.value ? t.activeClass : "bg-cream-200 text-ink hover:bg-cream-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Direction toggle (only for adjustment type) */}
        {activeTx.direction === "both" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDirection("add")}
              className={`flex-1 py-2 rounded-sm text-body-s font-medium transition-colors ${
                direction === "add" ? "bg-sage text-white" : "bg-cream-200 text-ink hover:bg-cream-300"
              }`}
            >
              + Add
            </button>
            <button
              type="button"
              onClick={() => setDirection("remove")}
              className={`flex-1 py-2 rounded-sm text-body-s font-medium transition-colors ${
                direction === "remove" ? "bg-terracotta text-white" : "bg-cream-200 text-ink hover:bg-cream-300"
              }`}
            >
              - Remove
            </button>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="text-label text-ink-secondary font-medium mb-1 block">Quantity</label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            min={1}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-label text-ink-secondary font-medium mb-1 block">Notes</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reason for adjustment..."
          />
        </div>

        {/* Preview */}
        {numQty > 0 && (
          <div className={`rounded-sm px-4 py-3 text-center ${newQuantity < 0 ? "bg-error/10" : "bg-sage/10"}`}>
            <p className="text-body-s text-ink">
              Stock will be{" "}
              <span className="font-display font-semibold text-h4">
                {newQuantity}
              </span>{" "}
              {unit} after this change
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || numQty <= 0 || newQuantity < 0} className="flex-1">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
