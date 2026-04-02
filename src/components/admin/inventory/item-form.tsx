"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, Button, Input, Select } from "@/components/ui";
import { useToast } from "@/components/ui";
import { Loader2, ArrowLeft } from "lucide-react";
import { ITEM_TYPE_OPTIONS, COUNT_FREQUENCY_OPTIONS } from "@/lib/inventory/constants";

interface ItemFormData {
  id?: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  categoryId: string;
  itemType: string;
  description: string;
  price: string;
  cost: string;
  unit: string;
  uomId: string;
  initialQty: string;
  reorderLevel: string;
  reorderQty: string;
  parLevel: string;
  leadTimeDays: string;
  countFrequency: string;
  supplier: string;
  preferredVendorId: string;
  sellable: boolean;
  trackInventory: boolean;
  trackExpiration: boolean;
  locationId: string;
}

interface ItemFormProps {
  editItem?: Record<string, unknown> | null;
}

const UNIT_OPTIONS = [
  { value: "each", label: "Each" },
  { value: "pair", label: "Pair" },
  { value: "pack", label: "Pack" },
  { value: "case", label: "Case" },
  { value: "box", label: "Box" },
  { value: "bag", label: "Bag" },
  { value: "bottle", label: "Bottle" },
  { value: "lb", label: "Pound" },
  { value: "oz", label: "Ounce" },
  { value: "gallon", label: "Gallon" },
];

export function ItemForm({ editItem }: ItemFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);

  const isEditing = !!editItem;

  const [form, setForm] = useState<ItemFormData>({
    name: "",
    sku: "",
    barcode: "",
    category: "Socks",
    categoryId: "",
    itemType: "standard",
    description: "",
    price: "",
    cost: "",
    unit: "each",
    uomId: "",
    initialQty: "",
    reorderLevel: "",
    reorderQty: "",
    parLevel: "",
    leadTimeDays: "",
    countFrequency: "monthly",
    supplier: "",
    preferredVendorId: "",
    sellable: true,
    trackInventory: true,
    trackExpiration: false,
    locationId: "",
  });

  // Load categories, vendors, locations
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/inventory/categories").then((r) => r.json()),
      fetch("/api/admin/inventory/vendors").then((r) => r.json()),
      fetch("/api/admin/inventory/locations").then((r) => r.json()),
    ]).then(([catJson, venJson, locJson]) => {
      setCategories(catJson.categories || []);
      setVendors((venJson.vendors || []).map((v: Record<string, unknown>) => ({ id: v.id, name: v.name })));
      setLocations((locJson.locations || []).map((l: Record<string, unknown>) => ({ id: l.id, name: l.name })));
    }).catch(() => {});
  }, []);

  // Populate form for editing
  useEffect(() => {
    if (editItem) {
      setForm({
        name: String(editItem.name || ""),
        sku: String(editItem.sku || ""),
        barcode: String(editItem.barcode || ""),
        category: String(editItem.category || "Socks"),
        categoryId: String(editItem.categoryId || ""),
        itemType: String(editItem.itemType || "standard"),
        description: String(editItem.description || ""),
        price: editItem.price != null ? String(editItem.price) : "",
        cost: editItem.cost != null ? String(editItem.cost) : "",
        unit: String(editItem.unit || "each"),
        uomId: String(editItem.uomId || ""),
        initialQty: "",
        reorderLevel: editItem.reorderLevel != null ? String(editItem.reorderLevel) : "",
        reorderQty: editItem.reorderQty != null ? String(editItem.reorderQty) : "",
        parLevel: editItem.parLevel != null ? String(editItem.parLevel) : "",
        leadTimeDays: editItem.leadTimeDays != null ? String(editItem.leadTimeDays) : "",
        countFrequency: String(editItem.countFrequency || "monthly"),
        supplier: String(editItem.supplier || ""),
        preferredVendorId: String(editItem.preferredVendorId || ""),
        sellable: editItem.sellable !== false,
        trackInventory: editItem.trackInventory !== false,
        trackExpiration: editItem.trackExpiration === true,
        locationId: "",
      });
    }
  }, [editItem]);

  const updateField = (field: keyof ItemFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast("error", "Name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        const res = await fetch(`/api/admin/inventory/items/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update",
            name: form.name.trim(),
            sku: form.sku || undefined,
            barcode: form.barcode || undefined,
            category: form.category,
            categoryId: form.categoryId || undefined,
            itemType: form.itemType,
            description: form.description || undefined,
            price: form.price ? Number(form.price) : 0,
            cost: form.cost ? Number(form.cost) : null,
            unit: form.unit,
            uomId: form.uomId || undefined,
            reorderLevel: form.reorderLevel ? Number(form.reorderLevel) : 0,
            reorderQty: form.reorderQty ? Number(form.reorderQty) : 0,
            parLevel: form.parLevel ? Number(form.parLevel) : 0,
            leadTimeDays: form.leadTimeDays ? Number(form.leadTimeDays) : 0,
            countFrequency: form.countFrequency,
            supplier: form.supplier || undefined,
            preferredVendorId: form.preferredVendorId || undefined,
            sellable: form.sellable,
            trackInventory: form.trackInventory,
            trackExpiration: form.trackExpiration,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to update");
        toast("success", `${form.name} updated`);
        router.push(`/admin/inventory/items/${editItem.id}`);
      } else {
        const res = await fetch("/api/admin/inventory/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            sku: form.sku || undefined,
            barcode: form.barcode || undefined,
            category: form.category,
            categoryId: form.categoryId || undefined,
            itemType: form.itemType,
            description: form.description || undefined,
            price: form.price ? Number(form.price) : 0,
            cost: form.cost ? Number(form.cost) : undefined,
            quantityOnHand: form.initialQty ? Number(form.initialQty) : 0,
            reorderLevel: form.reorderLevel ? Number(form.reorderLevel) : 0,
            reorderQty: form.reorderQty ? Number(form.reorderQty) : 0,
            parLevel: form.parLevel ? Number(form.parLevel) : 0,
            leadTimeDays: form.leadTimeDays ? Number(form.leadTimeDays) : 0,
            countFrequency: form.countFrequency,
            unit: form.unit,
            uomId: form.uomId || undefined,
            supplier: form.supplier || undefined,
            preferredVendorId: form.preferredVendorId || undefined,
            sellable: form.sellable,
            trackInventory: form.trackInventory,
            trackExpiration: form.trackExpiration,
            locationId: form.locationId || undefined,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to create");
        toast("success", `${form.name} added to inventory`);
        router.push("/admin/inventory/items");
      }
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to save item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-sm hover:bg-cream-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-ink-secondary" />
        </button>
        <div>
          <h1 className="font-display text-h2 text-ink">
            {isEditing ? `Edit ${editItem.name}` : "Add Inventory Item"}
          </h1>
          <p className="text-body-s text-ink-secondary">
            {isEditing ? "Update item details." : "Add a new product to your inventory."}
          </p>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardContent>
          <h3 className="text-body-m font-medium text-ink mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-label text-ink-secondary font-medium mb-1 block">Name *</label>
                <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Grip Socks (Small)" />
              </div>
              <div>
                <label className="text-label text-ink-secondary font-medium mb-1 block">Item Type</label>
                <Select options={ITEM_TYPE_OPTIONS} value={form.itemType} onChange={(e) => updateField("itemType", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-label text-ink-secondary font-medium mb-1 block">SKU</label>
                <Input value={form.sku} onChange={(e) => updateField("sku", e.target.value)} placeholder="SOCK-S" />
              </div>
              <div>
                <label className="text-label text-ink-secondary font-medium mb-1 block">Barcode</label>
                <Input value={form.barcode} onChange={(e) => updateField("barcode", e.target.value)} placeholder="Scan or enter barcode" />
              </div>
            </div>

            <div>
              <label className="text-label text-ink-secondary font-medium mb-1 block">Description</label>
              <textarea
                className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-body-s text-ink placeholder:text-ink-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30 resize-none"
                rows={2}
                maxLength={500}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Brief product description..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categorization */}
      <Card>
        <CardContent>
          <h3 className="text-body-m font-medium text-ink mb-4">Categorization</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label text-ink-secondary font-medium mb-1 block">Category</label>
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              >
                {categories.length > 0
                  ? categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)
                  : <>
                      <option value="Socks">Socks</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Merchandise">Merchandise</option>
                      <option value="Party Supplies">Party Supplies</option>
                      <option value="Janitorial">Janitorial</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Operational">Operational</option>
                    </>
                }
              </select>
            </div>
            <div>
              <label className="text-label text-ink-secondary font-medium mb-1 block">Unit of Measure</label>
              <Select options={UNIT_OPTIONS} value={form.unit} onChange={(e) => updateField("unit", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Cost */}
      <Card>
        <CardContent>
          <h3 className="text-body-m font-medium text-ink mb-4">Pricing & Cost</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label text-ink-secondary font-medium mb-1 block">Sell Price</label>
              <Input type="number" value={form.price} onChange={(e) => updateField("price", e.target.value)} placeholder="0.00" min={0} step={0.01} />
            </div>
            <div>
              <label className="text-label text-ink-secondary font-medium mb-1 block">Cost</label>
              <Input type="number" value={form.cost} onChange={(e) => updateField("cost", e.target.value)} placeholder="0.00" min={0} step={0.01} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Settings */}
      <Card>
        <CardContent>
          <h3 className="text-body-m font-medium text-ink mb-4">Inventory Settings</h3>
          <div className="space-y-4">
            {/* Toggles */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.trackInventory}
                  onChange={(e) => updateField("trackInventory", e.target.checked)}
                  className="rounded border-cream-300 text-terracotta focus:ring-terracotta"
                />
                <span className="text-body-s text-ink">Track Inventory</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.sellable}
                  onChange={(e) => updateField("sellable", e.target.checked)}
                  className="rounded border-cream-300 text-terracotta focus:ring-terracotta"
                />
                <span className="text-body-s text-ink">Sellable at POS</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.trackExpiration}
                  onChange={(e) => updateField("trackExpiration", e.target.checked)}
                  className="rounded border-cream-300 text-terracotta focus:ring-terracotta"
                />
                <span className="text-body-s text-ink">Track Expiration</span>
              </label>
            </div>

            {!isEditing && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label text-ink-secondary font-medium mb-1 block">Initial Quantity</label>
                  <Input type="number" value={form.initialQty} onChange={(e) => updateField("initialQty", e.target.value)} placeholder="0" min={0} />
                </div>
                <div>
                  <label className="text-label text-ink-secondary font-medium mb-1 block">Default Location</label>
                  <select
                    value={form.locationId}
                    onChange={(e) => updateField("locationId", e.target.value)}
                    className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                  >
                    <option value="">No specific location</option>
                    {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-label text-ink-secondary font-medium mb-1 block">Reorder Point</label>
                <Input type="number" value={form.reorderLevel} onChange={(e) => updateField("reorderLevel", e.target.value)} placeholder="0" min={0} />
              </div>
              <div>
                <label className="text-label text-ink-secondary font-medium mb-1 block">Reorder Qty</label>
                <Input type="number" value={form.reorderQty} onChange={(e) => updateField("reorderQty", e.target.value)} placeholder="0" min={0} />
              </div>
              <div>
                <label className="text-label text-ink-secondary font-medium mb-1 block">Par Level</label>
                <Input type="number" value={form.parLevel} onChange={(e) => updateField("parLevel", e.target.value)} placeholder="0" min={0} />
              </div>
              <div>
                <label className="text-label text-ink-secondary font-medium mb-1 block">Lead Time (days)</label>
                <Input type="number" value={form.leadTimeDays} onChange={(e) => updateField("leadTimeDays", e.target.value)} placeholder="0" min={0} />
              </div>
            </div>

            <div>
              <label className="text-label text-ink-secondary font-medium mb-1 block">Count Frequency</label>
              <Select options={COUNT_FREQUENCY_OPTIONS} value={form.countFrequency} onChange={(e) => updateField("countFrequency", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendor */}
      <Card>
        <CardContent>
          <h3 className="text-body-m font-medium text-ink mb-4">Vendor</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label text-ink-secondary font-medium mb-1 block">Preferred Vendor</label>
              <select
                value={form.preferredVendorId}
                onChange={(e) => updateField("preferredVendorId", e.target.value)}
                className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              >
                <option value="">None</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-label text-ink-secondary font-medium mb-1 block">Supplier Name</label>
              <Input value={form.supplier} onChange={(e) => updateField("supplier", e.target.value)} placeholder="Supplier name (legacy)" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting || !form.name.trim()}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? "Save Changes" : "Add Item"}
        </Button>
      </div>
    </div>
  );
}
