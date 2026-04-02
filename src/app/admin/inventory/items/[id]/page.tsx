"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, Badge, Button, MetricCard } from "@/components/ui";
import { useToast } from "@/components/ui";
import {
  Loader2, ArrowLeft, Package, Pencil, Ban, CheckCircle,
  ArrowDownToLine, ShoppingCart, Settings, RotateCcw, Trash2,
  PackagePlus, MapPin, Building2, ArrowRightLeft, ClipboardCheck,
} from "lucide-react";
import { format } from "date-fns";
import { AdjustStockModal } from "@/components/admin/inventory/adjust-stock-modal";
import { EVENT_TYPE_LABELS, CATEGORY_BADGE_VARIANT, ITEM_TYPE_LABELS } from "@/lib/inventory/constants";

interface ItemDetail {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  category: string;
  categoryId: string | null;
  itemType: string;
  description: string | null;
  price: number;
  cost: number | null;
  unit: string;
  imageUrl: string | null;
  active: boolean;
  sellable: boolean;
  trackInventory: boolean;
  trackExpiration: boolean;
  preferredVendorId: string | null;
  reorderLevel: number;
  reorderQty: number;
  parLevel: number;
  leadTimeDays: number;
  countFrequency: string;
  supplier: string | null;
  createdAt: string;
  updatedAt: string;
  onHand: number;
  reserved: number;
  available: number;
  avgUnitCost: number;
}

interface VendorInfo {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  leadTimeDays: number;
}

interface StockByLocation {
  locationId: string | null;
  locationName: string;
  onHand: number;
  reserved: number;
  available: number;
}

interface Transaction {
  id: string;
  eventType: string;
  quantityDelta: number;
  unitCost: number | null;
  referenceType: string | null;
  notes: string | null;
  occurredAt: string;
  legacy?: boolean;
}

const TX_ICONS: Record<string, { icon: typeof ArrowDownToLine; color: string }> = {
  receive: { icon: ArrowDownToLine, color: "text-sage bg-sage/10" },
  received: { icon: ArrowDownToLine, color: "text-sage bg-sage/10" },
  opening_balance: { icon: PackagePlus, color: "text-sage bg-sage/10" },
  initial: { icon: PackagePlus, color: "text-sage bg-sage/10" },
  sale: { icon: ShoppingCart, color: "text-terracotta bg-terracotta/10" },
  sold: { icon: ShoppingCart, color: "text-terracotta bg-terracotta/10" },
  adjustment: { icon: Settings, color: "text-dusty-blue bg-dusty-blue/10" },
  refund: { icon: RotateCcw, color: "text-mustard bg-mustard/10" },
  return: { icon: RotateCcw, color: "text-mustard bg-mustard/10" },
  waste: { icon: Trash2, color: "text-error bg-error/10" },
  damaged: { icon: Trash2, color: "text-error bg-error/10" },
  spoilage: { icon: Trash2, color: "text-error bg-error/10" },
  usage: { icon: Package, color: "text-ink-secondary bg-cream-200" },
  booking_reserve: { icon: Package, color: "text-dusty-blue bg-dusty-blue/10" },
  booking_release: { icon: Package, color: "text-mustard bg-mustard/10" },
  booking_consume: { icon: Package, color: "text-terracotta bg-terracotta/10" },
  count_reconciliation: { icon: Settings, color: "text-dusty-blue bg-dusty-blue/10" },
  transfer_out: { icon: ArrowRightLeft, color: "text-terracotta bg-terracotta/10" },
  transfer_in: { icon: ArrowRightLeft, color: "text-sage bg-sage/10" },
  return_to_vendor: { icon: RotateCcw, color: "text-mustard bg-mustard/10" },
  production_build: { icon: Package, color: "text-sage bg-sage/10" },
  production_consume: { icon: Package, color: "text-terracotta bg-terracotta/10" },
};

function stockBadge(onHand: number, reorder: number, active: boolean) {
  if (!active) return { label: "Inactive", variant: "default" as const };
  if (onHand === 0) return { label: "Out of Stock", variant: "error" as const };
  if (reorder > 0 && onHand <= reorder) return { label: "Low Stock", variant: "warning" as const };
  return { label: "In Stock", variant: "success" as const };
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [stockByLocation, setStockByLocation] = useState<StockByLocation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "locations" | "transactions" | "purchases" | "counts">("overview");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/inventory/items/${params.id}`);
      if (!res.ok) throw new Error("Not found");
      const json = await res.json();
      setItem(json.item);
      setVendor(json.vendor || null);
      setStockByLocation(json.stockByLocation || []);
      setTransactions(json.transactions || []);
    } catch {
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleActive = async () => {
    if (!item) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/admin/inventory/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_active" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast("success", `Item ${json.active ? "activated" : "deactivated"}`);
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

  if (!item) {
    return (
      <div className="text-center py-20">
        <h2 className="font-display text-h3 text-ink mb-2">Item Not Found</h2>
        <Button variant="ghost" onClick={() => router.push("/admin/inventory/items")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Items
        </Button>
      </div>
    );
  }

  const badge = stockBadge(item.onHand, item.reorderLevel, item.active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/inventory/items")}
            className="p-2 rounded-sm hover:bg-cream-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-ink-secondary" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-h2 text-ink">{item.name}</h1>
              <Badge variant={badge.variant} className="capitalize">{badge.label}</Badge>
              <Badge variant={CATEGORY_BADGE_VARIANT[item.category] || "default"} className="text-[11px]">
                {item.category}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              {item.sku && <span className="font-mono text-body-s text-ink-secondary">{item.sku}</span>}
              {item.barcode && <span className="font-mono text-body-s text-ink-secondary/60">{item.barcode}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowAdjustModal(true)}>
            <Package className="h-4 w-4 mr-1.5" />
            Adjust Stock
          </Button>
          <Link href={`/admin/inventory/items/${item.id}/edit`}>
            <Button variant="secondary">
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          </Link>
          <Button variant="ghost" onClick={handleToggleActive} disabled={toggling}>
            {item.active ? (
              <><Ban className="h-4 w-4 mr-1.5" />Deactivate</>
            ) : (
              <><CheckCircle className="h-4 w-4 mr-1.5" />Activate</>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard title="On Hand" value={String(item.onHand)} change={`${item.unit}`} changeType="neutral" />
        <MetricCard title="Reserved" value={String(item.reserved)} change="For bookings" changeType={item.reserved > 0 ? "negative" : "neutral"} />
        <MetricCard title="Available" value={String(item.available)} change="For sale/use" changeType={item.available <= 0 ? "negative" : "positive"} />
        <MetricCard title="Reorder Point" value={item.reorderLevel > 0 ? String(item.reorderLevel) : "—"} change={item.reorderQty > 0 ? `Order ${item.reorderQty}` : "Not set"} changeType="neutral" />
        <MetricCard title="Last Cost" value={item.cost != null ? `$${item.cost.toFixed(2)}` : "—"} changeType="neutral" />
        <MetricCard title="Avg Cost" value={item.avgUnitCost > 0 ? `$${item.avgUnitCost.toFixed(2)}` : "—"} changeType="neutral" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-cream-300 overflow-x-auto">
        {([
          { key: "overview", label: "Overview" },
          { key: "locations", label: "Stock by Location" },
          { key: "transactions", label: "Transactions" },
          { key: "purchases", label: "Purchase History" },
          { key: "counts", label: "Counts" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-body-s font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-terracotta text-terracotta"
                : "border-transparent text-ink-secondary hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Item Details */}
          <Card>
            <CardContent>
              <h3 className="text-body-m font-medium text-ink mb-4">Item Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Category" value={item.category} />
                <InfoField label="Type" value={ITEM_TYPE_LABELS[item.itemType] || item.itemType} />
                <InfoField label="SKU" value={item.sku || "—"} />
                <InfoField label="Barcode" value={item.barcode || "—"} />
                <InfoField label="Unit" value={item.unit} />
                <InfoField label="Sell Price" value={`$${item.price.toFixed(2)}`} />
                <InfoField label="Sellable" value={item.sellable ? "Yes" : "No"} />
                <InfoField label="Track Inventory" value={item.trackInventory ? "Yes" : "No"} />
                <InfoField label="Count Frequency" value={item.countFrequency} />
                <InfoField label="Lead Time" value={item.leadTimeDays > 0 ? `${item.leadTimeDays} days` : "—"} />
                <InfoField label="Created" value={format(new Date(item.createdAt), "MMM d, yyyy")} />
                <InfoField label="Updated" value={format(new Date(item.updatedAt), "MMM d, yyyy")} />
              </div>
              {item.description && (
                <div className="mt-4 pt-4 border-t border-cream-200">
                  <p className="text-label text-ink-secondary font-medium mb-1">Description</p>
                  <p className="text-body-s text-ink">{item.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vendor Info */}
          <Card>
            <CardContent>
              <h3 className="text-body-m font-medium text-ink mb-4">Vendor</h3>
              {vendor ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-ink-secondary" />
                    <Link href={`/admin/inventory/vendors/${vendor.id}`} className="text-body-s text-terracotta font-medium hover:underline">
                      {vendor.name}
                    </Link>
                  </div>
                  {vendor.contactName && <InfoField label="Contact" value={vendor.contactName} />}
                  {vendor.email && <InfoField label="Email" value={vendor.email} />}
                  {vendor.phone && <InfoField label="Phone" value={vendor.phone} />}
                  <InfoField label="Lead Time" value={vendor.leadTimeDays > 0 ? `${vendor.leadTimeDays} days` : "—"} />
                </div>
              ) : (
                <div className="text-center py-6">
                  <Building2 className="h-8 w-8 text-ink-secondary mx-auto mb-2" />
                  <p className="text-body-s text-ink-secondary">
                    {item.supplier ? `Supplier: ${item.supplier}` : "No vendor assigned"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "locations" && (
        <Card>
          <CardContent>
            <h3 className="text-body-m font-medium text-ink mb-4">Stock by Location</h3>
            {stockByLocation.length === 0 ? (
              <p className="text-body-s text-ink-secondary text-center py-6">No location-level stock data yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cream-300">
                      <th className="text-left text-label text-ink-secondary py-3 font-medium">Location</th>
                      <th className="text-right text-label text-ink-secondary py-3 font-medium">On Hand</th>
                      <th className="text-right text-label text-ink-secondary py-3 font-medium">Reserved</th>
                      <th className="text-right text-label text-ink-secondary py-3 font-medium">Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockByLocation.map((loc, idx) => (
                      <tr key={loc.locationId || idx} className="border-b border-cream-200">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-ink-secondary" />
                            <span className="text-body-s text-ink font-medium">{loc.locationName}</span>
                          </div>
                        </td>
                        <td className="py-3 text-right text-body-s text-ink font-medium">{loc.onHand}</td>
                        <td className="py-3 text-right text-body-s text-ink-secondary">{loc.reserved || "—"}</td>
                        <td className="py-3 text-right text-body-s text-ink font-medium">{loc.available}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "transactions" && (
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-body-m font-medium text-ink">Transaction History</h3>
              <Link
                href={`/admin/inventory/transactions?itemId=${item.id}`}
                className="text-caption text-terracotta hover:underline"
              >
                View all in ledger →
              </Link>
            </div>
            {transactions.length === 0 ? (
              <p className="text-body-s text-ink-secondary text-center py-6">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => {
                  const cfg = TX_ICONS[tx.eventType] || TX_ICONS.adjustment;
                  const Icon = cfg.icon;
                  const isPositive = tx.quantityDelta > 0;
                  return (
                    <div key={tx.id} className="flex items-start gap-3">
                      <div className={`flex items-center justify-center h-9 w-9 rounded-full shrink-0 ${cfg.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-body-s text-ink font-medium">
                            {EVENT_TYPE_LABELS[tx.eventType] || tx.eventType}
                          </p>
                          <p className={`text-body-s font-medium ${isPositive ? "text-sage" : "text-terracotta"}`}>
                            {isPositive ? "+" : ""}{tx.quantityDelta}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-caption text-ink-secondary">
                            {tx.notes || (tx.referenceType ? `via ${tx.referenceType}` : "")}
                          </p>
                        </div>
                        <p className="text-caption text-ink-secondary/60 mt-0.5">
                          {format(new Date(tx.occurredAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "purchases" && (
        <Card>
          <CardContent className="text-center py-12">
            <ArrowRightLeft className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
            <h3 className="font-display text-h4 text-ink mb-2">Purchase History</h3>
            <p className="text-body-s text-ink-secondary max-w-md mx-auto">
              Purchase orders, receipts, and vendor pricing history for this item
              will appear here once the purchasing module is built in Sprint 3.
            </p>
            <Link href="/admin/inventory/purchase-orders">
              <Button variant="secondary" className="mt-4">
                <ArrowRightLeft className="h-4 w-4 mr-1.5" />
                Go to Purchase Orders
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {activeTab === "counts" && (
        <Card>
          <CardContent className="text-center py-12">
            <ClipboardCheck className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
            <h3 className="font-display text-h4 text-ink mb-2">Count History</h3>
            <p className="text-body-s text-ink-secondary max-w-md mx-auto">
              Physical count results, variance tracking, and reconciliation history for
              this item will appear here once count sessions are built in Sprint 4.
            </p>
            <Link href="/admin/inventory/counts">
              <Button variant="secondary" className="mt-4">
                <ClipboardCheck className="h-4 w-4 mr-1.5" />
                Go to Counts
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Adjust Stock Modal */}
      <AdjustStockModal
        open={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        onSuccess={fetchData}
        productId={item.id}
        productName={item.name}
        currentQuantity={item.onHand}
        unit={item.unit}
      />
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-label text-ink-secondary font-medium mb-1">{label}</p>
      <p className="text-body-s text-ink font-medium">{value}</p>
    </div>
  );
}
