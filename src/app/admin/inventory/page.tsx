"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, MetricCard, Button, Badge } from "@/components/ui";
import {
  DollarSign, AlertTriangle, XCircle, ShoppingCart, CalendarClock,
  Trash2, Plus, ArrowDownToLine, ClipboardCheck, Settings, Package, Loader2,
} from "lucide-react";
import { EVENT_TYPE_LABELS, ALERT_SEVERITY_VARIANT } from "@/lib/inventory/constants";

interface OverviewKPIs {
  totalInventoryValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  openPurchaseOrders: number;
  reservedForBookings: number;
  wasteThisMonth: number;
}

interface LowStockItem {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  quantityOnHand: number;
  reorderLevel: number;
}

interface ActivityItem {
  id: string;
  itemId: string;
  itemName: string;
  itemSku: string | null;
  eventType: string;
  quantityDelta: number;
  notes: string | null;
  occurredAt: string;
}

interface Alert {
  id: string;
  item_id: string;
  alert_type: string;
  message: string;
  severity: string;
  created_at: string;
}

export default function InventoryOverviewPage() {
  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inventory/overview");
      const json = await res.json();
      setKpis(json.kpis || null);
      setLowStock(json.lowStockAlerts || []);
      setActivity(json.recentActivity || []);
      setAlerts(json.alerts || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
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
          <p className="text-body-m text-ink-secondary">Operations dashboard — track stock, orders, and alerts.</p>
        </div>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Inventory Value"
            value={`$${kpis.totalInventoryValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            change="At cost"
            changeType="neutral"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <MetricCard
            title="Low Stock"
            value={String(kpis.lowStockItems)}
            change="Below reorder"
            changeType={kpis.lowStockItems > 0 ? "negative" : "positive"}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <MetricCard
            title="Out of Stock"
            value={String(kpis.outOfStockItems)}
            change="Need restocking"
            changeType={kpis.outOfStockItems > 0 ? "negative" : "positive"}
            icon={<XCircle className="h-5 w-5" />}
          />
          <MetricCard
            title="Open POs"
            value={String(kpis.openPurchaseOrders)}
            change="Pending orders"
            changeType="neutral"
            icon={<ShoppingCart className="h-5 w-5" />}
          />
          <MetricCard
            title="Reserved"
            value={String(kpis.reservedForBookings)}
            change="For bookings"
            changeType="neutral"
            icon={<CalendarClock className="h-5 w-5" />}
          />
          <MetricCard
            title="Waste (Month)"
            value={`$${kpis.wasteThisMonth.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            change="This month"
            changeType={kpis.wasteThisMonth > 0 ? "negative" : "neutral"}
            icon={<Trash2 className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/inventory/items/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Item
          </Button>
        </Link>
        <Link href="/admin/inventory/receiving">
          <Button variant="secondary" size="sm">
            <ArrowDownToLine className="h-4 w-4 mr-1.5" />
            Receive Shipment
          </Button>
        </Link>
        <Link href="/admin/inventory/purchase-orders">
          <Button variant="secondary" size="sm">
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            New Purchase Order
          </Button>
        </Link>
        <Link href="/admin/inventory/counts">
          <Button variant="secondary" size="sm">
            <ClipboardCheck className="h-4 w-4 mr-1.5" />
            Start Count
          </Button>
        </Link>
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Low Stock Alerts */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-body-m font-medium text-ink">Low Stock Items</h3>
              <Link href="/admin/inventory/items?stockStatus=low" className="text-caption text-terracotta hover:underline">
                View all
              </Link>
            </div>
            {lowStock.length === 0 ? (
              <p className="text-body-s text-ink-secondary text-center py-6">All stock levels healthy</p>
            ) : (
              <div className="space-y-3">
                {lowStock.slice(0, 8).map((item) => (
                  <Link
                    key={item.id}
                    href={`/admin/inventory/items/${item.id}`}
                    className="flex items-center justify-between py-2 hover:bg-cream-100 -mx-2 px-2 rounded-sm transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-body-s text-ink font-medium truncate">{item.name}</p>
                      <p className="text-caption text-ink-secondary">{item.category}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-body-s font-medium text-mustard">{item.quantityOnHand}</p>
                      <p className="text-caption text-ink-secondary">/ {item.reorderLevel}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Center: Recent Activity */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-body-m font-medium text-ink">Recent Activity</h3>
              <Link href="/admin/inventory/transactions" className="text-caption text-terracotta hover:underline">
                View all
              </Link>
            </div>
            {activity.length === 0 ? (
              <p className="text-body-s text-ink-secondary text-center py-6">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {activity.slice(0, 10).map((a) => (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${
                      a.quantityDelta > 0 ? "bg-sage/10 text-sage" : "bg-terracotta/10 text-terracotta"
                    }`}>
                      <Package className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-body-s text-ink">
                        <span className="font-medium">{a.itemName}</span>
                        {" "}
                        <span className={a.quantityDelta > 0 ? "text-sage" : "text-terracotta"}>
                          {a.quantityDelta > 0 ? "+" : ""}{a.quantityDelta}
                        </span>
                      </p>
                      <p className="text-caption text-ink-secondary">
                        {EVENT_TYPE_LABELS[a.eventType] || a.eventType}
                        {a.notes ? ` — ${a.notes}` : ""}
                      </p>
                      <p className="text-caption text-ink-secondary/60">
                        {new Date(a.occurredAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Active Alerts */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-body-m font-medium text-ink">Alerts</h3>
              <Link href="/admin/inventory/alerts" className="text-caption text-terracotta hover:underline">
                View all
              </Link>
            </div>
            {alerts.length === 0 ? (
              <p className="text-body-s text-ink-secondary text-center py-6">No active alerts</p>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 8).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 py-1">
                    <Badge
                      variant={ALERT_SEVERITY_VARIANT[alert.severity] || "default"}
                      className="text-[10px] shrink-0 mt-0.5"
                    >
                      {alert.severity}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-body-s text-ink">{alert.message}</p>
                      <p className="text-caption text-ink-secondary/60">
                        {new Date(alert.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
