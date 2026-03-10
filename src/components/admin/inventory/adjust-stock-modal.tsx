"use client";

import { useState, useEffect } from "react";
import { Button, Input, Modal, Select } from "@/components/ui";
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

interface LocationOption {
  id: string;
  name: string;
}

type EventTypeOption = {
  value: string;
  label: string;
  direction: "add" | "remove" | "both";
  activeClass: string;
  group: string;
};

const EVENT_TYPES: EventTypeOption[] = [
  { value: "receive", label: "Received", direction: "add", activeClass: "bg-sage text-white", group: "In" },
  { value: "transfer_in", label: "Transfer In", direction: "add", activeClass: "bg-sage text-white", group: "In" },
  { value: "adjustment", label: "Adjustment", direction: "both", activeClass: "bg-dusty-blue text-white", group: "Adjust" },
  { value: "count_reconciliation", label: "Count Reconciliation", direction: "both", activeClass: "bg-dusty-blue text-white", group: "Adjust" },
  { value: "waste", label: "Waste", direction: "remove", activeClass: "bg-terracotta text-white", group: "Out" },
  { value: "spoilage", label: "Spoilage", direction: "remove", activeClass: "bg-terracotta text-white", group: "Out" },
  { value: "usage", label: "Usage", direction: "remove", activeClass: "bg-mustard text-white", group: "Out" },
  { value: "return_to_vendor", label: "Return to Vendor", direction: "remove", activeClass: "bg-mustard text-white", group: "Out" },
  { value: "transfer_out", label: "Transfer Out", direction: "remove", activeClass: "bg-mustard text-white", group: "Out" },
];

const REASON_OPTIONS = [
  { value: "", label: "Select reason (optional)" },
  { value: "Breakage", label: "Breakage" },
  { value: "Spoilage/Expired", label: "Spoilage / Expired" },
  { value: "Damaged in transit", label: "Damaged in transit" },
  { value: "Theft/Shrinkage", label: "Theft / Shrinkage" },
  { value: "Miscount correction", label: "Miscount correction" },
  { value: "Unrecorded usage", label: "Unrecorded usage" },
  { value: "Transfer error", label: "Transfer error" },
  { value: "Vendor return", label: "Vendor return" },
  { value: "Other", label: "Other" },
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
  const [eventType, setEventType] = useState("receive");
  const [quantity, setQuantity] = useState("");
  const [direction, setDirection] = useState<"add" | "remove">("add");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [locationId, setLocationId] = useState("");
  const [locations, setLocations] = useState<LocationOption[]>([]);

  // Load locations
  useEffect(() => {
    if (!open) return;
    fetch("/api/admin/inventory/locations")
      .then((r) => r.json())
      .then((json) => {
        const locs = (json.locations || []).filter((l: { active: boolean }) => l.active);
        setLocations(locs);
      })
      .catch(() => setLocations([]));
  }, [open]);

  const numQty = Number(quantity) || 0;
  const activeEvent = EVENT_TYPES.find((t) => t.value === eventType)!;

  // Calculate signed change
  const isRemoving =
    activeEvent.direction === "remove" || (activeEvent.direction === "both" && direction === "remove");
  const signedChange = isRemoving ? -numQty : numQty;
  const newQuantity = currentQuantity + signedChange;

  const handleReset = () => {
    setQuantity("");
    setNotes("");
    setReason("");
    setUnitCost("");
    setLocationId("");
    setEventType("receive");
    setDirection("add");
  };

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
      const res = await fetch("/api/admin/inventory/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: productId,
          eventType,
          quantity: numQty,
          direction: activeEvent.direction === "both" ? direction : undefined,
          locationId: locationId || undefined,
          unitCost: unitCost ? Number(unitCost) : undefined,
          notes: notes || undefined,
          reason: reason || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to adjust stock");

      toast("success", `Stock updated for ${productName}`);
      handleReset();
      onSuccess();
      onClose();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to adjust stock");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Adjust Stock" description={productName} size="md">
      <div className="space-y-4">
        {/* Current Stock */}
        <div className="bg-cream-200 rounded-sm px-4 py-3 text-center">
          <p className="text-caption text-ink-secondary">Current Stock</p>
          <p className="font-display text-h3 text-ink">
            {currentQuantity} <span className="text-body-s text-ink-secondary">{unit}</span>
          </p>
        </div>

        {/* Event Type — grouped */}
        <div>
          <label className="text-label text-ink-secondary font-medium mb-2 block">Type</label>
          <div className="grid grid-cols-3 gap-1.5">
            {EVENT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setEventType(t.value);
                  if (t.direction === "add") setDirection("add");
                  else if (t.direction === "remove") setDirection("remove");
                }}
                className={`py-2 rounded-sm text-caption font-medium transition-colors ${
                  eventType === t.value ? t.activeClass : "bg-cream-200 text-ink hover:bg-cream-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Direction toggle (only for adjustment/count_reconciliation types) */}
        {activeEvent.direction === "both" && (
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

        <div className="grid grid-cols-2 gap-3">
          {/* Quantity */}
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Quantity *</label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              min={1}
            />
          </div>

          {/* Unit Cost (for receives) */}
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Unit Cost</label>
            <Input
              type="number"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              placeholder="$0.00"
              min={0}
              step="0.01"
            />
          </div>
        </div>

        {/* Location */}
        {locations.length > 0 && (
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Location</label>
            <Select
              options={[{ value: "", label: "All Locations (Default)" }, ...locations.map((l) => ({ value: l.id, label: l.name }))]}
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
            />
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="text-label text-ink-secondary font-medium mb-1 block">Reason</label>
          <Select
            options={REASON_OPTIONS}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-label text-ink-secondary font-medium mb-1 block">Notes</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional details..."
          />
        </div>

        {/* Preview */}
        {numQty > 0 && (
          <div className={`rounded-sm px-4 py-3 text-center ${newQuantity < 0 ? "bg-error/10" : isRemoving ? "bg-terracotta/10" : "bg-sage/10"}`}>
            <p className="text-body-s text-ink">
              <span className={`font-medium ${isRemoving ? "text-terracotta" : "text-sage"}`}>
                {isRemoving ? "-" : "+"}{numQty}
              </span>
              {" "}→ Stock will be{" "}
              <span className="font-display font-semibold text-h4">
                {newQuantity}
              </span>{" "}
              {unit}
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || numQty <= 0 || newQuantity < 0} className="flex-1">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply Adjustment"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
