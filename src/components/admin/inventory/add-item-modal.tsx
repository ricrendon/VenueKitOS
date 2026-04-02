"use client";

import { useState, useEffect } from "react";
import { Button, Input, Select, Modal } from "@/components/ui";
import { useToast } from "@/components/ui";
import { Loader2 } from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "Socks", label: "Socks" },
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Merchandise", label: "Merchandise" },
  { value: "Party Supplies", label: "Party Supplies" },
  { value: "Operational", label: "Operational" },
];

const UNIT_OPTIONS = [
  { value: "each", label: "Each" },
  { value: "pair", label: "Pair" },
  { value: "pack", label: "Pack" },
  { value: "case", label: "Case" },
  { value: "box", label: "Box" },
  { value: "bag", label: "Bag" },
  { value: "bottle", label: "Bottle" },
];

interface EditItem {
  id: string;
  name: string;
  sku?: string;
  category: string;
  description?: string;
  price: number;
  cost?: number | null;
  reorderLevel: number;
  unit: string;
  supplier?: string;
}

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editItem?: EditItem | null;
}

export function AddItemModal({ open, onClose, onSuccess, editItem }: AddItemModalProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Socks");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [initialQty, setInitialQty] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");
  const [unit, setUnit] = useState("each");
  const [supplier, setSupplier] = useState("");

  const isEditing = !!editItem;

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setSku(editItem.sku || "");
      setCategory(editItem.category);
      setDescription(editItem.description || "");
      setPrice(String(editItem.price));
      setCost(editItem.cost != null ? String(editItem.cost) : "");
      setReorderLevel(String(editItem.reorderLevel));
      setUnit(editItem.unit);
      setSupplier(editItem.supplier || "");
      setInitialQty("");
    } else {
      resetForm();
    }
  }, [editItem, open]);

  const resetForm = () => {
    setName("");
    setSku("");
    setCategory("Socks");
    setDescription("");
    setPrice("");
    setCost("");
    setInitialQty("");
    setReorderLevel("");
    setUnit("each");
    setSupplier("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast("error", "Name is required");
      return;
    }
    if (!price || Number(price) < 0) {
      toast("error", "Valid price is required");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        const res = await fetch(`/api/admin/inventory/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update",
            name: name.trim(),
            sku: sku || undefined,
            category,
            description: description || undefined,
            price: Number(price),
            cost: cost ? Number(cost) : null,
            reorderLevel: reorderLevel ? Number(reorderLevel) : 0,
            unit,
            supplier: supplier || undefined,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to update");

        toast("success", `${name} updated`);
      } else {
        const res = await fetch("/api/admin/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            sku: sku || undefined,
            category,
            description: description || undefined,
            price: Number(price),
            cost: cost ? Number(cost) : undefined,
            quantityOnHand: initialQty ? Number(initialQty) : 0,
            reorderLevel: reorderLevel ? Number(reorderLevel) : 0,
            unit,
            supplier: supplier || undefined,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to create");

        toast("success", `${name} added to inventory`);
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to save item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Item" : "Add Inventory Item"}
      description={isEditing ? `Editing ${editItem?.name}` : "Add a new product to your inventory."}
      size="md"
    >
      <div className="space-y-4">
        {/* Name + SKU */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Grip Socks (Small)" />
          </div>
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">
              SKU <span className="text-ink-secondary/60">(optional)</span>
            </label>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SOCK-S" />
          </div>
        </div>

        {/* Category + Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Category</label>
            <Select options={CATEGORY_OPTIONS} value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Unit</label>
            <Select options={UNIT_OPTIONS} value={unit} onChange={(e) => setUnit(e.target.value)} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-label text-ink-secondary font-medium mb-1 block">
            Description <span className="text-ink-secondary/60">(optional)</span>
          </label>
          <textarea
            className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-body-s text-ink placeholder:text-ink-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30 resize-none"
            rows={2}
            maxLength={300}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief product description..."
          />
        </div>

        {/* Price + Cost */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Sell Price *</label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              min={0}
              step={0.01}
            />
          </div>
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">
              Cost <span className="text-ink-secondary/60">(optional)</span>
            </label>
            <Input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
              min={0}
              step={0.01}
            />
          </div>
        </div>

        {/* Initial Qty (create only) + Reorder Level */}
        <div className="grid grid-cols-2 gap-3">
          {!isEditing && (
            <div>
              <label className="text-label text-ink-secondary font-medium mb-1 block">Initial Quantity</label>
              <Input
                type="number"
                value={initialQty}
                onChange={(e) => setInitialQty(e.target.value)}
                placeholder="0"
                min={0}
              />
            </div>
          )}
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Reorder Level</label>
            <Input
              type="number"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
              placeholder="0"
              min={0}
            />
          </div>
          {isEditing && (
            <div>
              <label className="text-label text-ink-secondary font-medium mb-1 block">
                Supplier <span className="text-ink-secondary/60">(optional)</span>
              </label>
              <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Supplier name" />
            </div>
          )}
        </div>

        {/* Supplier (create only — in edit mode it's in the row above) */}
        {!isEditing && (
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">
              Supplier <span className="text-ink-secondary/60">(optional)</span>
            </label>
            <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Supplier name" />
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !name.trim()} className="flex-1">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? "Save Changes" : "Add Item"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
