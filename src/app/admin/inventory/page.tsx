"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, Badge, MetricCard, Button } from "@/components/ui";
import { Package, DollarSign, AlertTriangle, XCircle, Loader2, Plus, Download } from "lucide-react";
import { downloadCsv } from "@/lib/utils";
import { AddItemModal } from "@/components/admin/inventory/add-item-modal";
import { InventoryFilters } from "@/components/admin/inventory/inventory-filters";

interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  description: string | null;
  price: number;
  cost: number | null;
  quantityOnHand: number;
  reorderLevel: number;
  unit: string;
  supplier: string | null;
  active: boolean;
  updatedAt: string;
}

interface KPIs {
  totalItems: number;
  lowStock: number;
  totalValue: number;
  outOfStock: number;
}

const CATEGORY_VARIANT: Record<string, "sage" | "mustard" | "dusty" | "terracotta" | "default"> = {
  "Socks": "sage",
  "Food & Beverage": "mustard",
  "Merchandise": "dusty",
  "Party Supplies": "terracotta",
  "Operational": "default",
};

function stockBadge(qty: number, reorder: number, active: boolean) {
  if (!active) return { label: "Inactive", variant: "default" as const };
  if (qty === 0) return { label: "Out of Stock", variant: "error" as const };
  if (reorder > 0 && qty <= reorder) return { label: "Low Stock", variant: "warning" as const };
  return { label: "In Stock", variant: "success" as const };
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (stockStatus) params.set("stockStatus", stockStatus);

      const res = await fetch(`/api/admin/inventory?${params}`);
      const json = await res.json();
      setItems(json.items || []);
      setKpis(json.kpis || null);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search, category, stockStatus]);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(fetchData, search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [fetchData, search]);

  const handleDownload = () => {
    const headers = [
      "SKU", "Name", "Category", "Price", "Cost",
      "Quantity", "Reorder Level", "Unit", "Supplier", "Status",
    ];
    const rows = items.map((item) => {
      const badge = stockBadge(item.quantityOnHand, item.reorderLevel, item.active);
      return [
        item.sku || "",
        item.name,
        item.category,
        `$${item.price.toFixed(2)}`,
        item.cost != null ? `$${item.cost.toFixed(2)}` : "",
        item.quantityOnHand,
        item.reorderLevel,
        item.unit,
        item.supplier || "",
        badge.label,
      ];
    });
    const today = new Date().toISOString().split("T")[0];
    downloadCsv(`inventory-report-${today}.csv`, headers, rows);
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
          <h1 className="font-display text-h1 text-ink">Inventory</h1>
          <p className="text-body-m text-ink-secondary">Track stock levels, costs, and suppliers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleDownload} disabled={items.length === 0}>
            <Download className="h-4 w-4 mr-1.5" />
            Download Report
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Item
          </Button>
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
      <InventoryFilters
        search={search}
        category={category}
        stockStatus={stockStatus}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onStockStatusChange={setStockStatus}
      />

      {/* Table */}
      {items.length > 0 ? (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-300">
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">SKU</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Name</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Category</th>
                    <th className="text-right text-label text-ink-secondary py-3 font-medium">Price</th>
                    <th className="text-right text-label text-ink-secondary py-3 font-medium">Cost</th>
                    <th className="text-right text-label text-ink-secondary py-3 font-medium">Stock</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const badge = stockBadge(item.quantityOnHand, item.reorderLevel, item.active);
                    return (
                      <tr key={item.id} className="border-b border-cream-200 hover:bg-cream-50 transition-colors">
                        <td className="py-3">
                          <Link
                            href={`/admin/inventory/${item.id}`}
                            className="font-mono text-body-s text-terracotta font-medium hover:underline"
                          >
                            {item.sku || "—"}
                          </Link>
                        </td>
                        <td className="py-3">
                          <Link href={`/admin/inventory/${item.id}`} className="hover:underline">
                            <p className="text-body-s text-ink font-medium">{item.name}</p>
                            {item.description && (
                              <p className="text-caption text-ink-secondary truncate max-w-[200px]">
                                {item.description}
                              </p>
                            )}
                          </Link>
                        </td>
                        <td className="py-3">
                          <Badge variant={CATEGORY_VARIANT[item.category] || "default"} className="text-[11px]">
                            {item.category}
                          </Badge>
                        </td>
                        <td className="py-3 text-body-s text-ink text-right">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="py-3 text-body-s text-ink-secondary text-right">
                          {item.cost != null ? `$${item.cost.toFixed(2)}` : "—"}
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={`text-body-s font-medium ${
                              item.quantityOnHand === 0
                                ? "text-error"
                                : item.reorderLevel > 0 && item.quantityOnHand <= item.reorderLevel
                                  ? "text-mustard"
                                  : "text-ink"
                            }`}
                          >
                            {item.quantityOnHand}
                          </span>
                          <span className="text-caption text-ink-secondary ml-1">{item.unit}</span>
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
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Item
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Modal */}
      <AddItemModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
