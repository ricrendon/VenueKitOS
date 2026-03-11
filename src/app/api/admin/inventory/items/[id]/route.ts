import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { postLedgerEntry } from "@/lib/inventory/ledger";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { MOCK_INVENTORY_ITEMS } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

function mapItem(p: Record<string, unknown>) {
  return {
    id: p.id,
    venueId: p.venue_id,
    name: p.name,
    sku: p.sku || null,
    barcode: p.barcode || null,
    category: p.category || "Uncategorized",
    categoryId: p.category_id || null,
    subcategoryId: p.subcategory_id || null,
    itemType: p.item_type || "standard",
    description: p.description || null,
    price: Number(p.price),
    cost: p.cost != null ? Number(p.cost) : null,
    unit: p.unit || "each",
    uomId: p.uom_id || null,
    imageUrl: p.image_url || null,
    active: p.active,
    sellable: p.sellable ?? true,
    trackInventory: p.track_inventory ?? true,
    trackExpiration: p.track_expiration ?? false,
    preferredVendorId: p.preferred_vendor_id || null,
    reorderLevel: Number(p.reorder_level) || 0,
    reorderQty: Number(p.reorder_qty) || 0,
    parLevel: Number(p.par_level) || 0,
    leadTimeDays: Number(p.lead_time_days) || 0,
    countFrequency: p.count_frequency || "monthly",
    supplier: p.supplier || null,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

// GET — item detail with balances, transactions, vendor info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (isDemoMode()) return NextResponse.json({ item: MOCK_INVENTORY_ITEMS[0], vendor: null, stockByLocation: [], transactions: [] });
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("venue_id", VENUE_ID)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Fetch in parallel: balances, transactions, vendor, location balances
    const [balancesRes, transactionsRes, vendorRes, locationBalancesRes] = await Promise.all([
      // Aggregate balance
      supabase
        .from("inventory_balances")
        .select("on_hand_qty, reserved_qty, available_qty, avg_unit_cost")
        .eq("venue_id", VENUE_ID)
        .eq("item_id", id),

      // Recent ledger entries
      supabase
        .from("inventory_ledger_entries")
        .select("*")
        .eq("item_id", id)
        .eq("venue_id", VENUE_ID)
        .order("occurred_at", { ascending: false })
        .limit(50),

      // Vendor info
      product.preferred_vendor_id
        ? supabase
            .from("vendors")
            .select("id, name, contact_name, email, phone, lead_time_days")
            .eq("id", product.preferred_vendor_id)
            .single()
        : Promise.resolve({ data: null }),

      // Balances by location
      supabase
        .from("inventory_balances")
        .select("location_id, on_hand_qty, reserved_qty, available_qty")
        .eq("venue_id", VENUE_ID)
        .eq("item_id", id),
    ]);

    // Aggregate balances
    const balances = balancesRes.data || [];
    const totalOnHand = balances.reduce((s, b) => s + (b.on_hand_qty || 0), 0);
    const totalReserved = balances.reduce((s, b) => s + (b.reserved_qty || 0), 0);
    const avgCost = balances[0]?.avg_unit_cost || 0;

    // Get location names for balance rows
    const locationIds = (locationBalancesRes.data || [])
      .map((b) => b.location_id)
      .filter(Boolean);

    let locationMap = new Map<string, string>();
    if (locationIds.length > 0) {
      const { data: locations } = await supabase
        .from("inventory_locations")
        .select("id, name")
        .in("id", locationIds);
      locationMap = new Map((locations || []).map((l) => [l.id, l.name]));
    }

    const stockByLocation = (locationBalancesRes.data || []).map((b) => ({
      locationId: b.location_id,
      locationName: b.location_id ? locationMap.get(b.location_id) || "Unknown" : "Default",
      onHand: b.on_hand_qty || 0,
      reserved: b.reserved_qty || 0,
      available: b.available_qty || 0,
    }));

    // Map transactions
    const transactions = (transactionsRes.data || []).map((t) => ({
      id: t.id,
      itemId: t.item_id,
      eventType: t.event_type,
      quantityDelta: t.quantity_delta,
      unitCost: t.unit_cost,
      referenceType: t.reference_type,
      referenceId: t.reference_id,
      notes: t.notes,
      occurredAt: t.occurred_at,
      createdBy: t.created_by,
      createdAt: t.created_at,
    }));

    // Also include legacy stock_transactions for backward compatibility
    const { data: legacyTx } = await supabase
      .from("stock_transactions")
      .select("*")
      .eq("product_id", id)
      .order("created_at", { ascending: false })
      .limit(50);

    const legacyTransactions = (legacyTx || []).map((t) => ({
      id: t.id,
      itemId: t.product_id,
      eventType: t.type,
      quantityDelta: t.quantity_change,
      unitCost: null,
      referenceType: t.reference_type,
      referenceId: t.reference_id,
      notes: t.notes,
      occurredAt: t.created_at,
      createdBy: t.created_by,
      createdAt: t.created_at,
      legacy: true,
    }));

    // Merge and sort all transactions
    const allTransactions = [...transactions, ...legacyTransactions]
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    return NextResponse.json({
      item: {
        ...mapItem(product),
        onHand: totalOnHand || Number(product.quantity_on_hand) || 0,
        reserved: totalReserved,
        available: (totalOnHand || Number(product.quantity_on_hand) || 0) - totalReserved,
        avgUnitCost: Number(avgCost) || Number(product.cost) || 0,
      },
      vendor: vendorRes.data || null,
      stockByLocation,
      transactions: allTransactions,
    });
  } catch (err) {
    console.error("Item detail GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — update item fields, adjust stock, or toggle active
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (isDemoMode()) return NextResponse.json({ success: true });
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const supabase = createAdminClient();

    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("venue_id", VENUE_ID)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // ACTION: update item fields
    if (action === "update") {
      const {
        name, category, categoryId, subcategoryId, itemType, price, sku, barcode,
        description, cost, reorderLevel, reorderQty, parLevel, leadTimeDays,
        countFrequency, unit, uomId, supplier, preferredVendorId,
        sellable, trackInventory, trackExpiration, imageUrl,
      } = body;

      // Check SKU uniqueness if changed
      if (sku && sku !== product.sku) {
        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .eq("venue_id", VENUE_ID)
          .eq("sku", sku)
          .neq("id", id)
          .single();

        if (existing) {
          return NextResponse.json({ error: `SKU "${sku}" already exists` }, { status: 400 });
        }
      }

      // Check barcode uniqueness if changed
      if (barcode && barcode !== product.barcode) {
        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .eq("venue_id", VENUE_ID)
          .eq("barcode", barcode)
          .neq("id", id)
          .single();

        if (existing) {
          return NextResponse.json({ error: `Barcode "${barcode}" already exists` }, { status: 400 });
        }
      }

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (name !== undefined) updates.name = name.trim();
      if (category !== undefined) updates.category = category;
      if (categoryId !== undefined) updates.category_id = categoryId || null;
      if (subcategoryId !== undefined) updates.subcategory_id = subcategoryId || null;
      if (itemType !== undefined) updates.item_type = itemType;
      if (price !== undefined) updates.price = price;
      if (sku !== undefined) updates.sku = sku || null;
      if (barcode !== undefined) updates.barcode = barcode || null;
      if (description !== undefined) updates.description = description || null;
      if (cost !== undefined) updates.cost = cost != null ? cost : null;
      if (reorderLevel !== undefined) updates.reorder_level = reorderLevel;
      if (reorderQty !== undefined) updates.reorder_qty = reorderQty;
      if (parLevel !== undefined) updates.par_level = parLevel;
      if (leadTimeDays !== undefined) updates.lead_time_days = leadTimeDays;
      if (countFrequency !== undefined) updates.count_frequency = countFrequency;
      if (unit !== undefined) updates.unit = unit;
      if (uomId !== undefined) updates.uom_id = uomId || null;
      if (supplier !== undefined) updates.supplier = supplier || null;
      if (preferredVendorId !== undefined) updates.preferred_vendor_id = preferredVendorId || null;
      if (sellable !== undefined) updates.sellable = sellable;
      if (trackInventory !== undefined) updates.track_inventory = trackInventory;
      if (trackExpiration !== undefined) updates.track_expiration = trackExpiration;
      if (imageUrl !== undefined) updates.image_url = imageUrl || null;

      const { error: updateError } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id);

      if (updateError) {
        console.error("Item update error:", updateError);
        return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // ACTION: adjust stock (via ledger)
    if (action === "adjust_stock") {
      const { type, quantityChange, notes, locationId } = body;

      if (!type || quantityChange == null || quantityChange === 0) {
        return NextResponse.json({ error: "Type and quantity are required" }, { status: 400 });
      }

      const currentQty = Number(product.quantity_on_hand) || 0;
      const newQty = currentQty + quantityChange;

      if (newQty < 0) {
        return NextResponse.json({ error: "Cannot reduce stock below 0" }, { status: 400 });
      }

      // Map old adjustment types to ledger event types
      const eventTypeMap: Record<string, string> = {
        received: "receive",
        adjustment: "adjustment",
        return: "refund",
        damaged: "waste",
        waste: "waste",
        spoilage: "spoilage",
        usage: "usage",
      };

      const result = await postLedgerEntry(supabase, {
        venueId: VENUE_ID,
        locationId: locationId || null,
        itemId: id,
        eventType: (eventTypeMap[type] || "adjustment") as import("@/lib/inventory/types").LedgerEventType,
        quantityDelta: quantityChange,
        unitCost: product.cost != null ? Number(product.cost) : null,
        referenceType: "manual",
        notes: notes || null,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        quantityOnHand: newQty,
      });
    }

    // ACTION: toggle active
    if (action === "toggle_active") {
      const newActive = !product.active;

      await supabase
        .from("products")
        .update({
          active: newActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      return NextResponse.json({ success: true, active: newActive });
    }

    // ACTION: archive
    if (action === "archive") {
      await supabase
        .from("products")
        .update({
          active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Item PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
