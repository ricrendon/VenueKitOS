import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getPeriodStart(period: string): string {
  const now = new Date();
  switch (period) {
    case "7d":
      now.setDate(now.getDate() - 7);
      break;
    case "90d":
      now.setDate(now.getDate() - 90);
      break;
    case "30d":
    default:
      now.setDate(now.getDate() - 30);
  }
  return now.toISOString();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "30d";
  const periodStart = getPeriodStart(period);

  const supabase = createServerSupabaseClient();

  // 1. Fetch orders in period
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, total, subtotal, tax, discount, payment_method, created_at")
    .gte("created_at", periodStart)
    .order("created_at", { ascending: true });

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  const orderList = orders ?? [];
  const orderIds = orderList.map((o) => o.id);

  // 2. Fetch order items with product cost (left join products for COGS)
  let itemRows: {
    order_id: string;
    product_id: string | null;
    name: string;
    quantity: number;
    unit_price: number;
    total: number;
    cost: number | null;
  }[] = [];

  if (orderIds.length > 0) {
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        order_id,
        product_id,
        name,
        quantity,
        unit_price,
        total,
        products ( cost )
      `)
      .in("order_id", orderIds);

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    itemRows = (items ?? []).map((item) => ({
      order_id: item.order_id,
      product_id: item.product_id,
      name: item.name,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      total: Number(item.total),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cost: (item as any).products?.cost != null ? Number((item as any).products.cost) : null,
    }));
  }

  // 3. KPIs
  const totalRevenue = orderList.reduce((s, o) => s + Number(o.total), 0);
  const orderCount = orderList.length;
  const avgTicket = orderCount > 0 ? totalRevenue / orderCount : 0;

  let totalCogs = 0;
  for (const row of itemRows) {
    if (row.cost != null) {
      totalCogs += row.cost * row.quantity;
    }
  }
  const grossMargin = totalRevenue - totalCogs;
  const grossMarginPct = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

  // 4. Top items (aggregate by name)
  const itemMap = new Map<
    string,
    { name: string; qty: number; revenue: number; cogs: number; hasCost: boolean }
  >();
  for (const row of itemRows) {
    const existing = itemMap.get(row.name) ?? {
      name: row.name,
      qty: 0,
      revenue: 0,
      cogs: 0,
      hasCost: row.cost != null,
    };
    existing.qty += row.quantity;
    existing.revenue += row.total;
    if (row.cost != null) {
      existing.cogs += row.cost * row.quantity;
      existing.hasCost = true;
    }
    itemMap.set(row.name, existing);
  }

  const topItems = Array.from(itemMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 20)
    .map((item) => ({
      name: item.name,
      qty: item.qty,
      revenue: item.revenue,
      cogs: item.cogs,
      margin_pct:
        item.hasCost && item.revenue > 0
          ? ((item.revenue - item.cogs) / item.revenue) * 100
          : null,
      has_cost: item.hasCost,
    }));

  // 5. Payment method breakdown
  const paymentMap = new Map<string, { count: number; total: number }>();
  for (const o of orderList) {
    const method = o.payment_method || "unknown";
    const existing = paymentMap.get(method) ?? { count: 0, total: 0 };
    existing.count += 1;
    existing.total += Number(o.total);
    paymentMap.set(method, existing);
  }
  const paymentBreakdown = Array.from(paymentMap.entries()).map(([method, stats]) => ({
    method,
    count: stats.count,
    total: stats.total,
  }));

  // 6. Daily sales (group by date)
  const dailyMap = new Map<string, { revenue: number; cogs: number; order_count: number }>();

  // Build a set of COGS per order
  const orderCogs = new Map<string, number>();
  for (const row of itemRows) {
    if (row.cost != null) {
      orderCogs.set(row.order_id, (orderCogs.get(row.order_id) ?? 0) + row.cost * row.quantity);
    }
  }

  for (const o of orderList) {
    const date = o.created_at.slice(0, 10); // YYYY-MM-DD
    const existing = dailyMap.get(date) ?? { revenue: 0, cogs: 0, order_count: 0 };
    existing.revenue += Number(o.total);
    existing.cogs += orderCogs.get(o.id) ?? 0;
    existing.order_count += 1;
    dailyMap.set(date, existing);
  }

  const dailySales = Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, stats]) => ({ date, ...stats }));

  // 7. Inventory summary (low stock + total value from products)
  const { data: products } = await supabase
    .from("products")
    .select("id, name, quantity_on_hand, reorder_point, cost, price")
    .eq("active", true);

  const productList = products ?? [];
  const lowStockItems = productList.filter(
    (p) => p.reorder_point != null && Number(p.quantity_on_hand) <= Number(p.reorder_point)
  );
  const totalSkuValue = productList.reduce(
    (s, p) =>
      s + (p.cost != null ? Number(p.cost) * Number(p.quantity_on_hand) : 0),
    0
  );

  const inventorySummary = {
    low_stock_count: lowStockItems.length,
    total_sku_count: productList.length,
    total_sku_value: totalSkuValue,
    low_stock_items: lowStockItems.slice(0, 10).map((p) => ({
      id: p.id,
      name: p.name,
      quantity_on_hand: Number(p.quantity_on_hand),
      reorder_point: Number(p.reorder_point),
    })),
  };

  // 8. Items missing cost (for the Costs & Margins tab warning)
  const noCostItems = Array.from(itemMap.values())
    .filter((item) => !item.hasCost)
    .map((item) => ({ name: item.name, qty: item.qty, revenue: item.revenue }));

  return NextResponse.json({
    period,
    kpis: {
      total_revenue: totalRevenue,
      total_cogs: totalCogs,
      gross_margin: grossMargin,
      gross_margin_pct: grossMarginPct,
      avg_ticket: avgTicket,
      order_count: orderCount,
    },
    top_items: topItems,
    payment_breakdown: paymentBreakdown,
    daily_sales: dailySales,
    inventory_summary: inventorySummary,
    no_cost_items: noCostItems,
  });
}
