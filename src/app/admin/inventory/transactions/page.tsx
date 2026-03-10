"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, Badge, Button, Input, Select, MetricCard } from "@/components/ui";
import {
  ArrowRightLeft, Loader2, Search, Download, ChevronLeft, ChevronRight,
  ArrowDownToLine, ShoppingCart, Settings, RotateCcw, Trash2,
  PackagePlus, Package, MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { EVENT_TYPE_LABELS } from "@/lib/inventory/constants";
import { downloadCsv } from "@/lib/utils";

interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  itemSku: string | null;
  locationId: string | null;
  locationName: string | null;
  eventType: string;
  quantityDelta: number;
  unitCost: number | null;
  referenceType: string | null;
  notes: string | null;
  occurredAt: string;
  createdBy: string | null;
}

interface Summary {
  totalEntries: number;
  last30Days: number;
  received: number;
  consumed: number;
  adjusted: number;
  wasted: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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
  return_to_vendor: { icon: RotateCcw, color: "text-mustard bg-mustard/10" },
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
  production_build: { icon: Package, color: "text-sage bg-sage/10" },
  production_consume: { icon: Package, color: "text-terracotta bg-terracotta/10" },
};

const EVENT_TYPE_FILTER_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "receive", label: "Received" },
  { value: "sale", label: "Sold" },
  { value: "adjustment", label: "Adjustment" },
  { value: "waste,spoilage", label: "Waste / Spoilage" },
  { value: "usage", label: "Usage" },
  { value: "booking_reserve,booking_release,booking_consume", label: "Booking" },
  { value: "transfer_in,transfer_out", label: "Transfer" },
  { value: "count_reconciliation", label: "Count" },
  { value: "refund", label: "Refund" },
  { value: "return_to_vendor", label: "Return to Vendor" },
];

const REFERENCE_TYPE_OPTIONS = [
  { value: "", label: "All Sources" },
  { value: "manual", label: "Manual" },
  { value: "purchase_order", label: "Purchase Order" },
  { value: "receipt", label: "Receipt" },
  { value: "order", label: "POS Order" },
  { value: "booking", label: "Booking" },
  { value: "count_session", label: "Count Session" },
  { value: "transfer", label: "Transfer" },
];

export default function TransactionsPage() {
  const urlParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [filterItemName, setFilterItemName] = useState<string | null>(null);

  // Filters (initialized from URL params)
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("");
  const [referenceType, setReferenceType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [itemId, setItemId] = useState(urlParams.get("itemId") || "");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "50");
      params.set("includeLegacy", "true");

      if (debouncedSearch) params.set("search", debouncedSearch);
      if (eventType) params.set("eventType", eventType);
      if (referenceType) params.set("referenceType", referenceType);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (itemId) params.set("itemId", itemId);

      const res = await fetch(`/api/admin/inventory/transactions?${params}`);
      const json = await res.json();

      const txs = json.transactions || [];
      setTransactions(txs);
      setPagination(json.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 });
      if (json.summary) setSummary(json.summary);
      // Capture item name for filter display
      if (itemId && txs.length > 0 && !filterItemName) {
        setFilterItemName(txs[0].itemName);
      }
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, eventType, referenceType, dateFrom, dateTo, itemId]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleExport = () => {
    if (transactions.length === 0) return;
    const rows = transactions.map((tx) => ({
      Date: format(new Date(tx.occurredAt), "yyyy-MM-dd HH:mm"),
      Item: tx.itemName,
      SKU: tx.itemSku || "",
      Type: EVENT_TYPE_LABELS[tx.eventType] || tx.eventType,
      "Qty Change": tx.quantityDelta,
      "Unit Cost": tx.unitCost != null ? Number(tx.unitCost).toFixed(2) : "",
      Location: tx.locationName || "",
      Source: tx.referenceType || "",
      Notes: tx.notes || "",
    }));
    downloadCsv(rows, `inventory-transactions-${format(new Date(), "yyyy-MM-dd")}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-h2 text-ink">Transaction Ledger</h1>
          <p className="text-body-s text-ink-secondary">
            {itemId && filterItemName ? (
              <>
                Showing transactions for <span className="font-medium text-ink">{filterItemName}</span>.{" "}
                <button onClick={() => { setItemId(""); setFilterItemName(null); }} className="text-terracotta hover:underline">
                  Show all
                </button>
              </>
            ) : (
              <>All inventory movements across locations.
              {pagination.total > 0 && ` ${pagination.total.toLocaleString()} total entries.`}</>
            )}
          </p>
        </div>
        <Button variant="secondary" onClick={handleExport} disabled={transactions.length === 0}>
          <Download className="h-4 w-4 mr-1.5" />
          Export CSV
        </Button>
      </div>

      {/* KPI Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Received (30d)" value={String(summary.received)} change="units in" changeType="positive" />
          <MetricCard title="Consumed (30d)" value={String(summary.consumed)} change="units out" changeType="negative" />
          <MetricCard title="Adjusted (30d)" value={String(summary.adjusted)} change="units" changeType="neutral" />
          <MetricCard title="Wasted (30d)" value={String(summary.wasted)} change="units lost" changeType={summary.wasted > 0 ? "negative" : "neutral"} />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="pl-10"
              />
            </div>
            <Select
              options={EVENT_TYPE_FILTER_OPTIONS}
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            />
            <Select
              options={REFERENCE_TYPE_OPTIONS}
              value={referenceType}
              onChange={(e) => setReferenceType(e.target.value)}
            />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          {(search || eventType || referenceType || dateFrom || dateTo || itemId) && (
            <button
              onClick={() => {
                setSearch("");
                setEventType("");
                setReferenceType("");
                setDateFrom("");
                setDateTo("");
                setItemId("");
                setFilterItemName(null);
              }}
              className="text-caption text-terracotta hover:underline mt-2"
            >
              Clear filters
            </button>
          )}
        </CardContent>
      </Card>

      {/* Transactions Table */}
      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        </div>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ArrowRightLeft className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
            <h3 className="font-display text-h4 text-ink mb-2">No transactions found</h3>
            <p className="text-body-s text-ink-secondary">
              {search || eventType || referenceType || dateFrom || dateTo || itemId
                ? "Try adjusting your filters."
                : "Stock movements will appear here as they occur."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-300 bg-cream-100">
                    <th className="text-left text-label text-ink-secondary py-3 px-4 font-medium">Date</th>
                    <th className="text-left text-label text-ink-secondary py-3 px-4 font-medium">Type</th>
                    <th className="text-left text-label text-ink-secondary py-3 px-4 font-medium">Item</th>
                    <th className="text-left text-label text-ink-secondary py-3 px-4 font-medium">Location</th>
                    <th className="text-right text-label text-ink-secondary py-3 px-4 font-medium">Qty Change</th>
                    <th className="text-right text-label text-ink-secondary py-3 px-4 font-medium">Unit Cost</th>
                    <th className="text-left text-label text-ink-secondary py-3 px-4 font-medium">Source</th>
                    <th className="text-left text-label text-ink-secondary py-3 px-4 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const cfg = TX_ICONS[tx.eventType] || TX_ICONS.adjustment;
                    const Icon = cfg.icon;
                    const isPositive = tx.quantityDelta > 0;

                    return (
                      <tr key={tx.id} className="border-b border-cream-200 hover:bg-cream-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="text-body-s text-ink whitespace-nowrap">
                            {format(new Date(tx.occurredAt), "MMM d, yyyy")}
                          </p>
                          <p className="text-caption text-ink-secondary">
                            {format(new Date(tx.occurredAt), "h:mm a")}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`flex items-center justify-center h-7 w-7 rounded-full shrink-0 ${cfg.color}`}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-body-s text-ink font-medium whitespace-nowrap">
                              {EVENT_TYPE_LABELS[tx.eventType] || tx.eventType}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/admin/inventory/items/${tx.itemId}`}
                            className="text-body-s text-terracotta font-medium hover:underline"
                          >
                            {tx.itemName}
                          </Link>
                          {tx.itemSku && (
                            <p className="font-mono text-caption text-ink-secondary">{tx.itemSku}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {tx.locationName ? (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-ink-secondary" />
                              <span className="text-body-s text-ink">{tx.locationName}</span>
                            </div>
                          ) : (
                            <span className="text-body-s text-ink-secondary">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`text-body-s font-medium ${isPositive ? "text-sage" : "text-terracotta"}`}>
                            {isPositive ? "+" : ""}{tx.quantityDelta}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {tx.unitCost != null ? (
                            <span className="text-body-s text-ink">${Number(tx.unitCost).toFixed(2)}</span>
                          ) : (
                            <span className="text-body-s text-ink-secondary">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {tx.referenceType ? (
                            <Badge variant="default" className="text-[10px] capitalize">
                              {tx.referenceType.replace("_", " ")}
                            </Badge>
                          ) : (
                            <span className="text-body-s text-ink-secondary">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-body-s text-ink-secondary max-w-[200px] truncate">
                            {tx.notes || "—"}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-cream-200">
                <p className="text-caption text-ink-secondary">
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    onClick={() => fetchData(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="flex items-center px-3 text-body-s text-ink">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => fetchData(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
