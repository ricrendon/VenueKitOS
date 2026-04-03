"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign, TrendingUp, ShoppingCart, BarChart3,
  Package, AlertTriangle, Loader2, ExternalLink,
  CreditCard, Banknote, Gift, ArrowRight,
} from "lucide-react";
import { Card, CardContent, Select } from "@/components/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Kpis {
  total_revenue: number;
  total_cogs: number;
  gross_margin: number;
  gross_margin_pct: number;
  avg_ticket: number;
  order_count: number;
}

interface TopItem {
  name: string;
  qty: number;
  revenue: number;
  cogs: number;
  margin_pct: number | null;
  has_cost: boolean;
}

interface PaymentRow {
  method: string;
  count: number;
  total: number;
}

interface DailySale {
  date: string;
  revenue: number;
  cogs: number;
  order_count: number;
}

interface InventorySummary {
  low_stock_count: number;
  total_sku_count: number;
  total_sku_value: number;
  low_stock_items: { id: string; name: string; quantity_on_hand: number; reorder_point: number }[];
}

interface NoCostItem {
  name: string;
  qty: number;
  revenue: number;
}

interface AnalyticsData {
  period: string;
  kpis: Kpis;
  top_items: TopItem[];
  payment_breakdown: PaymentRow[];
  daily_sales: DailySale[];
  inventory_summary: InventorySummary;
  no_cost_items: NoCostItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pct(n: number) {
  return n.toFixed(1) + "%";
}

const PAYMENT_ICONS: Record<string, React.ElementType> = {
  cash: Banknote,
  card: CreditCard,
  gift_card: Gift,
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  gift_card: "Gift Card",
  split: "Split",
};

// ─── Mini bar chart (inline SVG) ─────────────────────────────────────────────

function DailySalesChart({ data }: { data: DailySale[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-caption text-ink-secondary">
        No sales data for this period.
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const barWidth = Math.max(4, Math.floor(560 / data.length) - 2);
  const chartH = 80;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${Math.max(560, data.length * (barWidth + 2))} ${chartH + 24}`}
        className="w-full"
        style={{ minWidth: "320px" }}
      >
        {data.map((d, i) => {
          const barH = Math.max(2, (d.revenue / maxRevenue) * chartH);
          const x = i * (barWidth + 2);
          const y = chartH - barH;
          const cogsH = d.revenue > 0 ? (d.cogs / d.revenue) * barH : 0;

          return (
            <g key={d.date}>
              {/* Revenue bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={2}
                className="fill-terracotta/30"
              />
              {/* COGS overlay */}
              {cogsH > 0 && (
                <rect
                  x={x}
                  y={chartH - cogsH}
                  width={barWidth}
                  height={cogsH}
                  rx={2}
                  className="fill-dusty-blue/60"
                />
              )}
              {/* Date label — show only every Nth label to avoid crowding */}
              {(data.length <= 14 || i % Math.ceil(data.length / 14) === 0) && (
                <text
                  x={x + barWidth / 2}
                  y={chartH + 16}
                  textAnchor="middle"
                  fontSize="8"
                  className="fill-ink-secondary"
                >
                  {d.date.slice(5)} {/* MM-DD */}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5 text-caption text-ink-secondary">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-terracotta/30" />
          Revenue
        </div>
        <div className="flex items-center gap-1.5 text-caption text-ink-secondary">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-dusty-blue/60" />
          COGS
        </div>
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 py-5">
        <div>
          <p className="text-caption text-ink-secondary uppercase tracking-wide font-medium">{label}</p>
          <p className={`font-display text-h2 mt-1 ${highlight ? "text-terracotta" : "text-ink"}`}>{value}</p>
          {sub && <p className="text-caption text-ink-secondary mt-0.5">{sub}</p>}
        </div>
        <div className="h-10 w-10 rounded-sm bg-cream-200 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-ink-secondary" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "sales", label: "Sales", icon: TrendingUp },
  { id: "costs", label: "Costs & Margins", icon: DollarSign },
  { id: "inventory", label: "Inventory", icon: Package },
] as const;

type TabId = (typeof TABS)[number]["id"];

const PERIOD_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function POSManagementPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [period, setPeriod] = useState("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setData(null);
    fetch(`/api/admin/pos/analytics?period=${period}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-h1 text-ink">Deli</h1>
          <p className="text-body-m text-ink-secondary">
            Sales performance, costs, margins, and inventory for the deli.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-44">
            <Select
              options={PERIOD_OPTIONS}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>
          <Link
            href="/admin/pos/kiosk"
            className="flex items-center gap-2 px-4 py-2 bg-terracotta text-white text-body-s font-medium rounded-sm hover:bg-terracotta/90 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            Open Kiosk
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 border-b border-cream-300 pb-px">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-body-s font-medium rounded-t-md transition-colors ${
                isActive
                  ? "bg-white text-terracotta border border-cream-300 border-b-white -mb-px"
                  : "text-ink-secondary hover:text-ink hover:bg-cream-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        </div>
      )}

      {/* ── Overview Tab ── */}
      {!loading && activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Total Revenue"
              value={`$${fmt(kpis?.total_revenue ?? 0)}`}
              sub={`${kpis?.order_count ?? 0} orders`}
              icon={DollarSign}
            />
            <KpiCard
              label="Gross Profit"
              value={`$${fmt(kpis?.gross_margin ?? 0)}`}
              sub={`COGS: $${fmt(kpis?.total_cogs ?? 0)}`}
              icon={TrendingUp}
              highlight
            />
            <KpiCard
              label="Margin"
              value={pct(kpis?.gross_margin_pct ?? 0)}
              sub="Revenue − COGS"
              icon={BarChart3}
            />
            <KpiCard
              label="Avg Ticket"
              value={`$${fmt(kpis?.avg_ticket ?? 0)}`}
              sub="Per order"
              icon={ShoppingCart}
            />
          </div>

          {/* Daily sales chart */}
          <Card>
            <CardContent className="space-y-4">
              <h2 className="font-display text-h4 text-ink">Daily Sales</h2>
              <DailySalesChart data={data?.daily_sales ?? []} />
            </CardContent>
          </Card>

          {/* Payment breakdown */}
          <Card>
            <CardContent className="space-y-3">
              <h2 className="font-display text-h4 text-ink">Payment Methods</h2>
              {(data?.payment_breakdown ?? []).length === 0 ? (
                <p className="text-body-s text-ink-secondary">No payments recorded.</p>
              ) : (
                <div className="space-y-2">
                  {(data?.payment_breakdown ?? []).map((row) => {
                    const Icon = PAYMENT_ICONS[row.method] ?? CreditCard;
                    const totalRev = data?.kpis.total_revenue ?? 1;
                    const share = totalRev > 0 ? (row.total / totalRev) * 100 : 0;
                    return (
                      <div key={row.method} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-sm bg-cream-200 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-ink-secondary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-body-s text-ink mb-1">
                            <span className="capitalize">{PAYMENT_LABELS[row.method] ?? row.method}</span>
                            <span className="font-medium">${fmt(row.total)}</span>
                          </div>
                          <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-terracotta rounded-full"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <p className="text-caption text-ink-secondary mt-0.5">{row.count} orders · {pct(share)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Sales Tab ── */}
      {!loading && activeTab === "sales" && (
        <div className="space-y-6">
          {/* KPI summary */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard label="Revenue" value={`$${fmt(kpis?.total_revenue ?? 0)}`} icon={DollarSign} />
            <KpiCard label="Orders" value={String(kpis?.order_count ?? 0)} icon={ShoppingCart} />
            <KpiCard label="Avg Ticket" value={`$${fmt(kpis?.avg_ticket ?? 0)}`} icon={TrendingUp} />
          </div>

          {/* Top sellers table */}
          <Card>
            <CardContent className="space-y-3">
              <h2 className="font-display text-h4 text-ink">Top Items by Revenue</h2>
              {(data?.top_items ?? []).length === 0 ? (
                <p className="text-body-s text-ink-secondary">No sales recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-body-s">
                    <thead>
                      <tr className="border-b border-cream-300">
                        <th className="text-left py-2 pr-4 text-ink-secondary font-medium text-caption">Item</th>
                        <th className="text-right py-2 pr-4 text-ink-secondary font-medium text-caption">Units</th>
                        <th className="text-right py-2 pr-4 text-ink-secondary font-medium text-caption">Revenue</th>
                        <th className="text-right py-2 text-ink-secondary font-medium text-caption">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.top_items ?? []).map((item, i) => {
                        const totalRev = data?.kpis.total_revenue ?? 1;
                        const share = totalRev > 0 ? (item.revenue / totalRev) * 100 : 0;
                        return (
                          <tr key={i} className="border-b border-cream-100 hover:bg-cream-50">
                            <td className="py-2.5 pr-4 text-ink font-medium">{item.name}</td>
                            <td className="py-2.5 pr-4 text-right text-ink-secondary">{item.qty}</td>
                            <td className="py-2.5 pr-4 text-right text-ink">${fmt(item.revenue)}</td>
                            <td className="py-2.5 text-right text-ink-secondary">{pct(share)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment breakdown */}
          <Card>
            <CardContent className="space-y-3">
              <h2 className="font-display text-h4 text-ink">Payment Breakdown</h2>
              {(data?.payment_breakdown ?? []).length === 0 ? (
                <p className="text-body-s text-ink-secondary">No payments recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-body-s">
                    <thead>
                      <tr className="border-b border-cream-300">
                        <th className="text-left py-2 pr-4 text-ink-secondary font-medium text-caption">Method</th>
                        <th className="text-right py-2 pr-4 text-ink-secondary font-medium text-caption">Orders</th>
                        <th className="text-right py-2 text-ink-secondary font-medium text-caption">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.payment_breakdown ?? []).map((row, i) => {
                        const Icon = PAYMENT_ICONS[row.method] ?? CreditCard;
                        return (
                          <tr key={i} className="border-b border-cream-100 hover:bg-cream-50">
                            <td className="py-2.5 pr-4">
                              <div className="flex items-center gap-2 text-ink">
                                <Icon className="h-4 w-4 text-ink-secondary" />
                                <span className="capitalize">{PAYMENT_LABELS[row.method] ?? row.method}</span>
                              </div>
                            </td>
                            <td className="py-2.5 pr-4 text-right text-ink-secondary">{row.count}</td>
                            <td className="py-2.5 text-right text-ink font-medium">${fmt(row.total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Costs & Margins Tab ── */}
      {!loading && activeTab === "costs" && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Revenue" value={`$${fmt(kpis?.total_revenue ?? 0)}`} icon={DollarSign} />
            <KpiCard label="Total COGS" value={`$${fmt(kpis?.total_cogs ?? 0)}`} icon={Package} />
            <KpiCard label="Gross Profit" value={`$${fmt(kpis?.gross_margin ?? 0)}`} icon={TrendingUp} highlight />
            <KpiCard label="Margin %" value={pct(kpis?.gross_margin_pct ?? 0)} icon={BarChart3} />
          </div>

          {/* Items missing cost warning */}
          {(data?.no_cost_items ?? []).length > 0 && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-sm">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-body-s text-amber-800 font-medium">
                  {data!.no_cost_items.length} item{data!.no_cost_items.length !== 1 ? "s" : ""} sold without a cost set
                </p>
                <p className="text-caption text-amber-700 mt-0.5">
                  Margin calculations are incomplete. Set a cost in{" "}
                  <Link href="/admin/inventory" className="underline hover:text-amber-900">
                    Inventory
                  </Link>{" "}
                  to get accurate margins.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {data!.no_cost_items.slice(0, 8).map((item) => (
                    <span key={item.name} className="px-2 py-0.5 bg-amber-100 rounded-full text-caption text-amber-800">
                      {item.name}
                    </span>
                  ))}
                  {data!.no_cost_items.length > 8 && (
                    <span className="px-2 py-0.5 text-caption text-amber-700">
                      +{data!.no_cost_items.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Costs & margins table */}
          <Card>
            <CardContent className="space-y-3">
              <h2 className="font-display text-h4 text-ink">Item Cost Analysis</h2>
              {(data?.top_items ?? []).length === 0 ? (
                <p className="text-body-s text-ink-secondary">No sales recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-body-s">
                    <thead>
                      <tr className="border-b border-cream-300">
                        <th className="text-left py-2 pr-4 text-ink-secondary font-medium text-caption">Item</th>
                        <th className="text-right py-2 pr-4 text-ink-secondary font-medium text-caption">Units</th>
                        <th className="text-right py-2 pr-4 text-ink-secondary font-medium text-caption">Revenue</th>
                        <th className="text-right py-2 pr-4 text-ink-secondary font-medium text-caption">COGS</th>
                        <th className="text-right py-2 text-ink-secondary font-medium text-caption">Margin %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.top_items ?? []).map((item, i) => (
                        <tr key={i} className="border-b border-cream-100 hover:bg-cream-50">
                          <td className="py-2.5 pr-4 text-ink font-medium">{item.name}</td>
                          <td className="py-2.5 pr-4 text-right text-ink-secondary">{item.qty}</td>
                          <td className="py-2.5 pr-4 text-right text-ink">${fmt(item.revenue)}</td>
                          <td className="py-2.5 pr-4 text-right text-ink-secondary">
                            {item.has_cost ? `$${fmt(item.cogs)}` : (
                              <span className="text-amber-500 text-caption italic">No cost set</span>
                            )}
                          </td>
                          <td className="py-2.5 text-right">
                            {item.margin_pct != null ? (
                              <span className={item.margin_pct < 20 ? "text-red-500 font-medium" : "text-green-600 font-medium"}>
                                {pct(item.margin_pct)}
                              </span>
                            ) : (
                              <span className="text-ink-secondary text-caption">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Summary totals row */}
                    {(data?.top_items ?? []).length > 0 && (
                      <tfoot>
                        <tr className="border-t-2 border-cream-300 bg-cream-50">
                          <td className="py-2.5 pr-4 text-ink font-semibold text-caption uppercase tracking-wide">Total</td>
                          <td className="py-2.5 pr-4 text-right text-ink font-medium">
                            {(data?.top_items ?? []).reduce((s, i) => s + i.qty, 0)}
                          </td>
                          <td className="py-2.5 pr-4 text-right text-ink font-medium">${fmt(kpis?.total_revenue ?? 0)}</td>
                          <td className="py-2.5 pr-4 text-right text-ink font-medium">${fmt(kpis?.total_cogs ?? 0)}</td>
                          <td className="py-2.5 text-right text-ink font-medium">{pct(kpis?.gross_margin_pct ?? 0)}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Inventory Tab ── */}
      {!loading && activeTab === "inventory" && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard
              label="Active SKUs"
              value={String(data?.inventory_summary.total_sku_count ?? 0)}
              icon={Package}
            />
            <KpiCard
              label="Inventory Value"
              value={`$${fmt(data?.inventory_summary.total_sku_value ?? 0)}`}
              sub="At cost"
              icon={DollarSign}
            />
            <KpiCard
              label="Low Stock Items"
              value={String(data?.inventory_summary.low_stock_count ?? 0)}
              sub="At or below reorder point"
              icon={AlertTriangle}
              highlight={Number(data?.inventory_summary.low_stock_count) > 0}
            />
          </div>

          {/* Low stock table */}
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-h4 text-ink">Low Stock Items</h2>
                <Link
                  href="/admin/inventory"
                  className="flex items-center gap-1.5 text-caption text-terracotta hover:underline"
                >
                  Full inventory
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {(data?.inventory_summary.low_stock_items ?? []).length === 0 ? (
                <div className="flex items-center gap-2 py-4 text-body-s text-green-700">
                  <Package className="h-4 w-4" />
                  All items are well-stocked.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-body-s">
                    <thead>
                      <tr className="border-b border-cream-300">
                        <th className="text-left py-2 pr-4 text-ink-secondary font-medium text-caption">Item</th>
                        <th className="text-right py-2 pr-4 text-ink-secondary font-medium text-caption">On Hand</th>
                        <th className="text-right py-2 pr-4 text-ink-secondary font-medium text-caption">Reorder At</th>
                        <th className="text-right py-2 text-ink-secondary font-medium text-caption">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.inventory_summary.low_stock_items ?? []).map((item) => {
                        const isOut = item.quantity_on_hand <= 0;
                        return (
                          <tr key={item.id} className="border-b border-cream-100 hover:bg-cream-50">
                            <td className="py-2.5 pr-4 text-ink font-medium">{item.name}</td>
                            <td className="py-2.5 pr-4 text-right text-ink">{item.quantity_on_hand}</td>
                            <td className="py-2.5 pr-4 text-right text-ink-secondary">{item.reorder_point}</td>
                            <td className="py-2.5 text-right">
                              {isOut ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption bg-red-100 text-red-700 font-medium">
                                  Out of stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption bg-amber-100 text-amber-700 font-medium">
                                  Low stock
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prompt to manage */}
          <div className="flex items-center justify-between p-4 bg-cream-100 border border-cream-300 rounded-sm">
            <div>
              <p className="text-body-s text-ink font-medium">Manage full inventory</p>
              <p className="text-caption text-ink-secondary">Add stock, set costs, and track waste in the Inventory module.</p>
            </div>
            <Link
              href="/admin/inventory"
              className="flex items-center gap-2 px-4 py-2 bg-ink text-white text-body-s rounded-sm hover:bg-ink/90 transition-colors"
            >
              Go to Inventory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
