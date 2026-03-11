import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockInventoryTransactions } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

/**
 * GET — query the inventory ledger with filters
 *
 * Query params:
 * - search: text search on item name / notes
 * - eventType: filter by event type (comma-separated for multiple)
 * - itemId: filter by specific item
 * - locationId: filter by specific location
 * - referenceType: filter by reference type
 * - dateFrom: ISO date string
 * - dateTo: ISO date string
 * - page: page number (1-based, default 1)
 * - limit: items per page (default 50, max 200)
 * - includeLegacy: "true" to also include legacy stock_transactions
 */
export async function GET(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json(mockInventoryTransactions);
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const eventType = searchParams.get("eventType");
    const itemId = searchParams.get("itemId");
    const locationId = searchParams.get("locationId");
    const referenceType = searchParams.get("referenceType");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit")) || 50));
    const includeLegacy = searchParams.get("includeLegacy") === "true";

    const supabase = createAdminClient();

    // Build ledger query
    let query = supabase
      .from("inventory_ledger_entries")
      .select("*", { count: "exact" })
      .eq("venue_id", VENUE_ID)
      .order("occurred_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (eventType) {
      const types = eventType.split(",").map((t) => t.trim());
      if (types.length === 1) {
        query = query.eq("event_type", types[0]);
      } else {
        query = query.in("event_type", types);
      }
    }

    if (itemId) {
      query = query.eq("item_id", itemId);
    }

    if (locationId) {
      query = query.eq("location_id", locationId);
    }

    if (referenceType) {
      query = query.eq("reference_type", referenceType);
    }

    if (dateFrom) {
      query = query.gte("occurred_at", dateFrom);
    }

    if (dateTo) {
      // Add 1 day to include the entire end date
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt("occurred_at", endDate.toISOString());
    }

    if (search) {
      query = query.or(`notes.ilike.%${search}%`);
    }

    const { data: entries, error, count } = await query;

    if (error) {
      console.error("Transactions GET error:", error);
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }

    // Get item names for all referenced items
    const itemIds = Array.from(new Set((entries || []).map((e) => e.item_id).filter(Boolean)));
    let itemMap = new Map<string, { name: string; sku: string | null }>();
    if (itemIds.length > 0) {
      const { data: items } = await supabase
        .from("products")
        .select("id, name, sku")
        .in("id", itemIds);
      itemMap = new Map((items || []).map((i) => [i.id, { name: i.name, sku: i.sku }]));
    }

    // Get location names
    const locationIds = Array.from(new Set((entries || []).map((e) => e.location_id).filter(Boolean)));
    let locationMap = new Map<string, string>();
    if (locationIds.length > 0) {
      const { data: locations } = await supabase
        .from("inventory_locations")
        .select("id, name")
        .in("id", locationIds);
      locationMap = new Map((locations || []).map((l) => [l.id, l.name]));
    }

    // Map entries
    const transactions = (entries || []).map((e) => ({
      id: e.id,
      venueId: e.venue_id,
      locationId: e.location_id,
      locationName: e.location_id ? locationMap.get(e.location_id) || "Unknown" : null,
      itemId: e.item_id,
      itemName: itemMap.get(e.item_id)?.name || "Unknown",
      itemSku: itemMap.get(e.item_id)?.sku || null,
      eventType: e.event_type,
      quantityDelta: e.quantity_delta,
      unitCost: e.unit_cost,
      referenceType: e.reference_type,
      referenceId: e.reference_id,
      correlationId: e.correlation_id,
      notes: e.notes,
      occurredAt: e.occurred_at,
      createdBy: e.created_by,
      createdAt: e.created_at,
    }));

    // Optionally include legacy stock_transactions (merged)
    let legacyTransactions: typeof transactions = [];
    if (includeLegacy && !eventType && !locationId && !referenceType) {
      let legacyQuery = supabase
        .from("stock_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (itemId) {
        legacyQuery = legacyQuery.eq("product_id", itemId);
      }

      if (search) {
        legacyQuery = legacyQuery.or(`notes.ilike.%${search}%`);
      }

      const { data: legacy } = await legacyQuery;

      // Get item names for legacy
      const legacyItemIds = Array.from(new Set((legacy || []).map((t) => t.product_id).filter(Boolean)));
      if (legacyItemIds.length > 0) {
        const { data: items } = await supabase
          .from("products")
          .select("id, name, sku")
          .in("id", legacyItemIds);
        (items || []).forEach((i) => itemMap.set(i.id, { name: i.name, sku: i.sku }));
      }

      legacyTransactions = (legacy || []).map((t) => ({
        id: `legacy-${t.id}`,
        venueId: VENUE_ID,
        locationId: null,
        locationName: null,
        itemId: t.product_id,
        itemName: itemMap.get(t.product_id)?.name || "Unknown",
        itemSku: itemMap.get(t.product_id)?.sku || null,
        eventType: t.type,
        quantityDelta: t.quantity_change,
        unitCost: null,
        referenceType: t.reference_type,
        referenceId: t.reference_id,
        correlationId: null,
        notes: t.notes,
        occurredAt: t.created_at,
        createdBy: t.created_by,
        createdAt: t.created_at,
      }));
    }

    // Merge and sort if we have legacy data
    let allTransactions = transactions;
    if (legacyTransactions.length > 0) {
      allTransactions = [...transactions, ...legacyTransactions]
        .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
        .slice(0, limit);
    }

    // KPI summary
    const { data: summaryData } = await supabase
      .from("inventory_ledger_entries")
      .select("event_type, quantity_delta")
      .eq("venue_id", VENUE_ID)
      .gte("occurred_at", new Date(new Date().setDate(new Date().getDate() - 30)).toISOString());

    const summary = {
      totalEntries: count || 0,
      last30Days: (summaryData || []).length,
      received: (summaryData || []).filter((e) => e.event_type === "receive").reduce((s, e) => s + Math.abs(e.quantity_delta), 0),
      consumed: (summaryData || []).filter((e) => ["sale", "usage", "booking_consume"].includes(e.event_type)).reduce((s, e) => s + Math.abs(e.quantity_delta), 0),
      adjusted: (summaryData || []).filter((e) => e.event_type === "adjustment").reduce((s, e) => s + Math.abs(e.quantity_delta), 0),
      wasted: (summaryData || []).filter((e) => ["waste", "spoilage"].includes(e.event_type)).reduce((s, e) => s + Math.abs(e.quantity_delta), 0),
    };

    return NextResponse.json({
      transactions: allTransactions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      summary,
    });
  } catch (err) {
    console.error("Transactions GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
