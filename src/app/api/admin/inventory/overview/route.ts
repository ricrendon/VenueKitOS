import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockInventoryOverview } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

export async function GET() {
  if (isDemoMode()) return NextResponse.json(mockInventoryOverview);
  try {
    const supabase = createAdminClient();

    // KPIs — all queries in parallel
    const [
      productsRes,
      posRes,
      alertsRes,
      ledgerRes,
      reservationsRes,
    ] = await Promise.all([
      // Active products with stock info
      supabase
        .from("products")
        .select("id, name, sku, category, quantity_on_hand, reorder_level, cost, active")
        .eq("venue_id", VENUE_ID)
        .eq("active", true),

      // Open purchase orders count
      supabase
        .from("purchase_orders")
        .select("id", { count: "exact" })
        .eq("venue_id", VENUE_ID)
        .in("status", ["draft", "submitted", "partially_received"]),

      // Active alerts
      supabase
        .from("inventory_alerts")
        .select("id, item_id, alert_type, message, severity, created_at")
        .eq("venue_id", VENUE_ID)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(20),

      // Recent ledger entries (activity feed)
      supabase
        .from("inventory_ledger_entries")
        .select("id, item_id, event_type, quantity_delta, notes, occurred_at, created_by")
        .eq("venue_id", VENUE_ID)
        .order("occurred_at", { ascending: false })
        .limit(15),

      // Active reservations total
      supabase
        .from("inventory_reservations")
        .select("reserved_qty")
        .eq("venue_id", VENUE_ID)
        .eq("status", "active"),
    ]);

    const products = productsRes.data || [];

    // Calculate KPIs
    const lowStockItems = products.filter(
      (p) => Number(p.reorder_level) > 0 && Number(p.quantity_on_hand) <= Number(p.reorder_level) && Number(p.quantity_on_hand) > 0
    );
    const outOfStockItems = products.filter((p) => Number(p.quantity_on_hand) === 0);
    const totalValue = products.reduce(
      (sum, p) => sum + Number(p.quantity_on_hand) * (Number(p.cost) || 0),
      0
    );
    const reservedTotal = (reservationsRes.data || []).reduce(
      (sum, r) => sum + (r.reserved_qty || 0),
      0
    );

    // Get waste this month from ledger
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: wasteEntries } = await supabase
      .from("inventory_ledger_entries")
      .select("quantity_delta, unit_cost")
      .eq("venue_id", VENUE_ID)
      .in("event_type", ["waste", "spoilage"])
      .gte("occurred_at", startOfMonth.toISOString());

    const wasteThisMonth = (wasteEntries || []).reduce(
      (sum, e) => sum + Math.abs(e.quantity_delta || 0) * (Number(e.unit_cost) || 0),
      0
    );

    // Map low stock items for alert list
    const lowStockAlerts = lowStockItems.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      quantityOnHand: Number(p.quantity_on_hand),
      reorderLevel: Number(p.reorder_level),
    }));

    // Map recent activity with item names
    const itemIds = Array.from(new Set((ledgerRes.data || []).map((e) => e.item_id)));
    const { data: itemNames } = await supabase
      .from("products")
      .select("id, name, sku")
      .in("id", itemIds.length > 0 ? itemIds : ["00000000-0000-0000-0000-000000000000"]);

    const itemMap = new Map((itemNames || []).map((i) => [i.id, { name: i.name, sku: i.sku }]));

    const recentActivity = (ledgerRes.data || []).map((e) => ({
      id: e.id,
      itemId: e.item_id,
      itemName: itemMap.get(e.item_id)?.name || "Unknown",
      itemSku: itemMap.get(e.item_id)?.sku || null,
      eventType: e.event_type,
      quantityDelta: e.quantity_delta,
      notes: e.notes,
      occurredAt: e.occurred_at,
    }));

    return NextResponse.json({
      kpis: {
        totalInventoryValue: Math.round(totalValue * 100) / 100,
        lowStockItems: lowStockItems.length,
        outOfStockItems: outOfStockItems.length,
        openPurchaseOrders: posRes.count || 0,
        reservedForBookings: reservedTotal,
        wasteThisMonth: Math.round(wasteThisMonth * 100) / 100,
      },
      lowStockAlerts,
      recentActivity,
      alerts: alertsRes.data || [],
    });
  } catch (err) {
    console.error("Inventory overview GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
