"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { useToast } from "@/components/ui";
import {
  Loader2, ArrowLeft, ArrowDownToLine, ShoppingCart,
  Settings, RotateCcw, Trash2, PackagePlus, Package,
  Ban, CheckCircle, Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { AdjustStockModal } from "@/components/admin/inventory/adjust-stock-modal";
import { AddItemModal } from "@/components/admin/inventory/add-item-modal";

interface ProductDetail {
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
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  type: string;
  quantityChange: number;
  quantityAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  createdAt: string;
}

const TX_ICONS: Record<string, { icon: typeof ArrowDownToLine; color: string }> = {
  received: { icon: ArrowDownToLine, color: "text-sage bg-sage/10" },
  sold: { icon: ShoppingCart, color: "text-terracotta bg-terracotta/10" },
  adjustment: { icon: Settings, color: "text-dusty-blue bg-dusty-blue/10" },
  return: { icon: RotateCcw, color: "text-mustard bg-mustard/10" },
  damaged: { icon: Trash2, color: "text-error bg-error/10" },
  initial: { icon: PackagePlus, color: "text-sage bg-sage/10" },
};

function stockBadge(qty: number, reorder: number, active: boolean) {
  if (!active) return { label: "Inactive", variant: "default" as const };
  if (qty === 0) return { label: "Out of Stock", variant: "error" as const };
  if (reorder > 0 && qty <= reorder) return { label: "Low Stock", variant: "warning" as const };
  return { label: "In Stock", variant: "success" as const };
}

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/inventory/${params.id}`);
      if (!res.ok) throw new Error("Not found");
      const json = await res.json();
      setProduct(json.item);
      setTransactions(json.transactions || []);
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleActive = async () => {
    if (!product) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/admin/inventory/${product.id}`, {
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

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="font-display text-h3 text-ink mb-2">Item Not Found</h2>
        <Button variant="ghost" onClick={() => router.push("/admin/inventory")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Inventory
        </Button>
      </div>
    );
  }

  const badge = stockBadge(product.quantityOnHand, product.reorderLevel, product.active);
  const stockPercent = product.reorderLevel > 0
    ? Math.min((product.quantityOnHand / (product.reorderLevel * 2)) * 100, 100)
    : product.quantityOnHand > 0 ? 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/inventory")}
            className="p-2 rounded-sm hover:bg-cream-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-ink-secondary" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-h2 text-ink">{product.name}</h1>
              <Badge variant={badge.variant} className="capitalize">
                {badge.label}
              </Badge>
            </div>
            {product.sku && (
              <p className="font-mono text-body-s text-ink-secondary mt-0.5">{product.sku}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowAdjustModal(true)}>
            <Package className="h-4 w-4 mr-1.5" />
            Adjust Stock
          </Button>
          <Button variant="secondary" onClick={() => setShowEditModal(true)}>
            <Pencil className="h-4 w-4 mr-1.5" />
            Edit
          </Button>
          <Button variant="ghost" onClick={handleToggleActive} disabled={toggling}>
            {product.active ? (
              <>
                <Ban className="h-4 w-4 mr-1.5" />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Activate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <InfoField label="SKU" value={product.sku || "—"} />
            <InfoField label="Category" value={product.category} />
            <InfoField label="Sell Price" value={`$${product.price.toFixed(2)}`} />
            <InfoField label="Cost" value={product.cost != null ? `$${product.cost.toFixed(2)}` : "—"} />
            <InfoField label="Supplier" value={product.supplier || "—"} />
            <InfoField label="Unit" value={product.unit} />
            <InfoField label="Reorder Level" value={product.reorderLevel > 0 ? `${product.reorderLevel} ${product.unit}` : "Not set"} />
            <InfoField label="Created" value={format(new Date(product.createdAt), "MMM d, yyyy")} />
          </div>
          {product.description && (
            <div className="mt-4 pt-4 border-t border-cream-200">
              <p className="text-label text-ink-secondary font-medium mb-1">Description</p>
              <p className="text-body-s text-ink">{product.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Level Card */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <p className="text-body-m text-ink font-medium">Stock Level</p>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
          <div className="text-center mb-4">
            <p className="font-display text-h1 text-ink">
              {product.quantityOnHand}
              <span className="text-body-m text-ink-secondary ml-2">{product.unit}</span>
            </p>
          </div>
          {product.reorderLevel > 0 && (
            <>
              <div className="h-3 bg-cream-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    product.quantityOnHand === 0
                      ? "bg-error"
                      : product.quantityOnHand <= product.reorderLevel
                        ? "bg-mustard"
                        : "bg-sage"
                  }`}
                  style={{ width: `${stockPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-caption text-ink-secondary">
                  Reorder at {product.reorderLevel} {product.unit}
                </p>
                <p className="text-caption text-ink-secondary">
                  {product.quantityOnHand > product.reorderLevel
                    ? `${product.quantityOnHand - product.reorderLevel} above reorder`
                    : product.quantityOnHand === 0
                      ? "Out of stock"
                      : `${product.reorderLevel - product.quantityOnHand} below reorder`}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardContent>
          <h3 className="text-body-m font-medium text-ink mb-4">Stock History</h3>
          {transactions.length === 0 ? (
            <p className="text-body-s text-ink-secondary text-center py-6">No stock transactions yet</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => {
                const cfg = TX_ICONS[tx.type] || TX_ICONS.adjustment;
                const Icon = cfg.icon;
                const isPositive = tx.quantityChange > 0;
                return (
                  <div key={tx.id} className="flex items-start gap-3">
                    <div className={`flex items-center justify-center h-9 w-9 rounded-full shrink-0 ${cfg.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-body-s text-ink font-medium capitalize">{tx.type}</p>
                        <p className={`text-body-s font-medium ${isPositive ? "text-sage" : "text-terracotta"}`}>
                          {isPositive ? "+" : ""}{tx.quantityChange}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-caption text-ink-secondary">
                          {tx.notes || (tx.referenceType ? `via ${tx.referenceType}` : "")}
                        </p>
                        <p className="text-caption text-ink-secondary">
                          Stock: {tx.quantityAfter}
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

      {/* Adjust Stock Modal */}
      <AdjustStockModal
        open={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        onSuccess={fetchData}
        productId={product.id}
        productName={product.name}
        currentQuantity={product.quantityOnHand}
        unit={product.unit}
      />

      {/* Edit Item Modal */}
      <AddItemModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchData}
        editItem={{
          id: product.id,
          name: product.name,
          sku: product.sku || undefined,
          category: product.category,
          description: product.description || undefined,
          price: product.price,
          cost: product.cost,
          reorderLevel: product.reorderLevel,
          unit: product.unit,
          supplier: product.supplier || undefined,
        }}
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
