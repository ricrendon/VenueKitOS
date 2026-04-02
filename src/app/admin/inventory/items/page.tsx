"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, Badge, MetricCard, Button } from "@/components/ui";
import { Package, DollarSign, AlertTriangle, XCircle, Loader2, Plus, Download, Search } from "lucide-react";
import { downloadCsv } from "@/lib/utils";
import { CATEGORY_BADGE_VARIANT, ITEM_TYPE_LABELS } from "@/lib/inventory/constants";
import type { InventoryItem } from "@/lib/inventory/types";

interface KPIs {
  totalItems: number;
  lowStock: number;
  totalValue: number;
  outOfStock: number;
}

function stockBadge(onHand: number, reorder: number, active: boolean) {
  if (!active) return { label: "Inactive", variant: "default" as const };
  if (onHand === 0) return { label: "Out of Stock", variant: "error" as const };
  if (reorder > 0 && onHand <= reorder) return { label: "Low Stock", variant: "warning" as const };
  return { label: "In Stock", variant: "success" as const };
}

const STOCK_FILTER_OPTIONS = [
  { value: "", label: "All Stock Levels" },
  { value: "low", label: "Low Stock" },
  { value: "out", label: "Out of Stock" },
];

const ITEM_TYPE_FILTER_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "standard", label: "Standard" },
  { value: "ingredient", label: "Ingredient" },
  { value: "supply", label: "Supply" },
  { value: "equipment", label: "Equipment" },
];

export default function ItemsListPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [itemType, setItemType] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (stockStatus) params.set("stockStatus", stockStatus);
      if (itemType) params.set("itemType", itemType);

      const res = await fetch(`/api/admin/inventory/items?${params}`);
      const json = await res.json();
      setItems(json.items || []);
      setKpis(json.kpis || null);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search, category, stockStatus, itemType]);

  // Fetch categories
  useEffect(() => {
    fetch("/api/admin/inventory/categories")
      .then((r) => r.json())
      .then((json) => setCategories(json.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(fetchData, search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [fetchData, search]);

  const handleDownload = () => {
    const headers = [
      "SKU", "Barcode", "Name", "Category", "Type", "Price", "Cost",
      "On Hand", "Reserved", "Available", "Reorder Level", "Unit", "Vendor", "Status",
    ];
    const rows = items.map((item) => {
      const badge = stockBadge(item.onHand || 0, item.reorderLevel, item.active);
      return [
        item.sku || "",
        item.barcode || "",
        item.name,
        item.category,
        ITEM_TYPE_LABELS[item.itemType] || item.itemType,
        `$${item.price.toFixed(2)}`,
        item.cost != null ? `$${item.cost.toFixed(2)}` : "",
        item.onHand || 0,
        item.reserved || 0,
        item.available || 0,
        item.reorderLevel,
        item.unit,
        item.vendorName || item.supplier || "",
        badge.label,
      ];
    });
    const today = new Date().toISOString().split("T")[0];
    downloadCsv(`inventory-items-${today}.csv`, headers, rows);
  };

  if (loading && !items.length) {
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
          <h1 className="font-display text-h2 text-ink">Items</h1>
          <p className="text-body-s text-ink-secondary">Manage your inventory catalog.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleDownload} disabled={items.length === 0}>
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </Button>
          <Link href="/admin/inventory/items/new">
            <Button>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Item
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Items"
            value={String(kpis.totalItems)}
            change="Active products"
            changeType="neutral"
            icon={<Package className="h-5 w-5" />}
          />
          <MetricCard
            title="Low Stock"
            value={String(kpis.lowStock)}
            change="Below reorder level"
            changeType={kpis.lowStock > 0 ? "negative" : "positive"}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <MetricCard
            title="Inventory Value"
            value={`$${kpis.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            change="At cost"
            changeType="neutral"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <MetricCard
            title="Out of Stock"
            value={String(kpis.outOfStock)}
            change="Need restocking"
            changeType={kpis.outOfStock > 0 ? "negative" : "positive"}
            icon={<XCircle className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, SKU, or barcode..."
                className="w-full pl-9 pr-3 py-2 rounded-sm border border-cream-300 bg-cream-50 text-body-s text-ink placeholder:text-ink-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              />
            </div>

            {/* Category filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Stock status filter */}
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
            >
              {STOCK_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Item type filter */}
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              className="rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
            >
              {ITEM_TYPE_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {items.length > 0 ? (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-300">
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Item</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">SKU</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Category</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Type</th>
                    <th className="text-right text-label text-ink-secondary py-3 font-medium">On Hand</th>
                    <th className="text-right text-label text-ink-secondary py-3 font-medium">Reserved</th>
                    <th className="text-right text-label text-ink-secondary py-3 font-medium">Available</th>
                    <th className="text-right text-label text-ink-secondary py-3 font-medium">Cost</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const onHand = item.onHand || 0;
                    const reserved = item.reserved || 0;
                    const available = item.available || 0;
                    const badge = stockBadge(onHand, item.reorderLevel, item.active);

                    return (
                      <tr key={item.id} className="border-b border-cream-200 hover:bg-cream-50 transition-colors">
                        <td className="py-3">
                          <Link href={`/admin/inventory/items/${item.id}`} className="hover:underline">
                            <p className="text-body-s text-ink font-medium">{item.name}</p>
                            {item.vendorName && (
                              <p className="text-caption text-ink-secondary">{item.vendorName}</p>
                            )}
                          </Link>
                        </td>
                        <td className="py-3">
                          <Link
                            href={`/admin/inventory/items/${item.id}`}
                            className="font-mono text-body-s text-terracotta font-medium hover:underline"
                          >
                            {item.sku || "—"}
                          </Link>
                        </td>
                        <td className="py-3">
                          <Badge variant={CATEGORY_BADGE_VARIANT[item.category] || "default"} className="text-[11px]">
                            {item.category}
                          </Badge>
                        </td>
                        <td className="py-3 text-body-s text-ink-secondary">
                          {ITEM_TYPE_LABELS[item.itemType] || item.itemType}
                        </td>
                        <td className="py-3 text-right">
                          <span className={`text-body-s font-medium ${
                            onHand === 0 ? "text-error" : onHand <= item.reorderLevel && item.reorderLevel > 0 ? "text-mustard" : "text-ink"
                          }`}>
                            {onHand}
                          </span>
                        </td>
                        <td className="py-3 text-right text-body-s text-ink-secondary">
                          {reserved > 0 ? reserved : "—"}
                        </td>
                        <td className="py-3 text-right">
                          <span className={`text-body-s font-medium ${
                            available === 0 ? "text-error" : available <= item.reorderLevel && item.reorderLevel > 0 ? "text-mustard" : "text-ink"
                          }`}>
                            {available}
                          </span>
                        </td>
                        <td className="py-3 text-body-s text-ink-secondary text-right">
                          {item.cost != null ? `$${item.cost.toFixed(2)}` : "—"}
                        </td>
                        <td className="py-3">
                          <Badge variant={badge.variant} className="text-[11px]">
                            {badge.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
            <h3 className="font-display text-h4 text-ink mb-2">No inventory items yet</h3>
            <p className="text-body-s text-ink-secondary mb-4">
              Add your first product to start tracking inventory.
            </p>
            <Link href="/admin/inventory/items/new">
              <Button>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Item
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
