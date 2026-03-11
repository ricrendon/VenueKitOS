import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { postLedgerEntry } from "@/lib/inventory/ledger";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockInventoryItems } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

function mapItem(p: Record<string, unknown>, balance?: Record<string, unknown> | null) {
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
    // Balance data
    onHand: balance ? Number(balance.on_hand_qty) || 0 : Number(p.quantity_on_hand) || 0,
    reserved: balance ? Number(balance.reserved_qty) || 0 : 0,
    available: balance ? Number(balance.available_qty) || 0 : Number(p.quantity_on_hand) || 0,
    avgUnitCost: balance ? Number(balance.avg_unit_cost) || 0 : Number(p.cost) || 0,
  };
}

// GET — list items with balances, search, and filters
export async function GET(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json(mockInventoryItems());
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const stockStatus = searchParams.get("stockStatus");
    const itemType = searchParams.get("itemType");
    const vendorId = searchParams.get("vendorId");
    const sellable = searchParams.get("sellable");
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const supabase = createAdminClient();

    // Build query
    let query = supabase
      .from("products")
      .select("*")
      .eq("venue_id", VENUE_ID)
      .order("created_at", { ascending: false });

    if (activeOnly) {
      query = query.eq("active", true);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (itemType) {
      query = query.eq("item_type", itemType);
    }

    if (vendorId) {
      query = query.eq("preferred_vendor_id", vendorId);
    }

    if (sellable === "true") {
      query = query.eq("sellable", true);
    } else if (sellable === "false") {
      query = query.eq("sellable", false);
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%,supplier.ilike.%${search}%`
      );
    }

    const { data: products, error } = await query;

    if (error) {
      console.error("Items GET error:", error);
      return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
    }

    // Fetch balances for all items
    const itemIds = (products || []).map((p) => p.id);
    const { data: balances } = await supabase
      .from("inventory_balances")
      .select("item_id, on_hand_qty, reserved_qty, available_qty, avg_unit_cost")
      .eq("venue_id", VENUE_ID)
      .in("item_id", itemIds.length > 0 ? itemIds : ["00000000-0000-0000-0000-000000000000"]);

    const balanceMap = new Map(
      (balances || []).map((b) => [b.item_id, b])
    );

    // Map items with balance data
    let items = (products || []).map((p) => mapItem(p, balanceMap.get(p.id)));

    // Apply stock status filter (post-query computed)
    if (stockStatus === "low") {
      items = items.filter(
        (i) => i.reorderLevel > 0 && i.onHand <= i.reorderLevel && i.onHand > 0
      );
    } else if (stockStatus === "out") {
      items = items.filter((i) => i.onHand === 0);
    }

    // Fetch vendor names for display
    const vendorIds = Array.from(new Set(items.map((i) => i.preferredVendorId).filter(Boolean)));
    if (vendorIds.length > 0) {
      const { data: vendors } = await supabase
        .from("vendors")
        .select("id, name")
        .in("id", vendorIds);

      const vendorMap = new Map((vendors || []).map((v) => [v.id, v.name]));
      items = items.map((i) => ({
        ...i,
        vendorName: i.preferredVendorId ? vendorMap.get(i.preferredVendorId) || null : null,
      }));
    }

    // KPIs (unfiltered)
    const allActive = (products || []).filter((p) => p.active);
    const lowCount = allActive.filter(
      (p) => Number(p.reorder_level) > 0 && Number(p.quantity_on_hand) <= Number(p.reorder_level) && Number(p.quantity_on_hand) > 0
    ).length;
    const outCount = allActive.filter((p) => Number(p.quantity_on_hand) === 0).length;
    const totalValue = allActive.reduce(
      (sum, p) => sum + Number(p.quantity_on_hand) * (Number(p.cost) || 0),
      0
    );

    return NextResponse.json({
      items,
      kpis: {
        totalItems: allActive.length,
        lowStock: lowCount,
        totalValue: Math.round(totalValue * 100) / 100,
        outOfStock: outCount,
      },
    });
  } catch (err) {
    console.error("Items GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — create a new inventory item
export async function POST(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json({ success: true, item: { id: "demo-item-new" } });
  try {
    const body = await request.json();
    const {
      name,
      category = "Uncategorized",
      categoryId,
      subcategoryId,
      itemType = "standard",
      price = 0,
      sku,
      barcode,
      description,
      cost,
      quantityOnHand = 0,
      reorderLevel = 0,
      reorderQty = 0,
      parLevel = 0,
      leadTimeDays = 0,
      countFrequency = "monthly",
      unit = "each",
      uomId,
      supplier,
      preferredVendorId,
      sellable = true,
      trackInventory = true,
      trackExpiration = false,
      imageUrl,
      locationId,
    } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check SKU uniqueness
    if (sku) {
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("venue_id", VENUE_ID)
        .eq("sku", sku)
        .single();

      if (existing) {
        return NextResponse.json({ error: `SKU "${sku}" already exists` }, { status: 400 });
      }
    }

    // Check barcode uniqueness
    if (barcode) {
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("venue_id", VENUE_ID)
        .eq("barcode", barcode)
        .single();

      if (existing) {
        return NextResponse.json({ error: `Barcode "${barcode}" already exists` }, { status: 400 });
      }
    }

    // Insert product
    const { data: product, error: insertError } = await supabase
      .from("products")
      .insert({
        venue_id: VENUE_ID,
        name: name.trim(),
        category,
        category_id: categoryId || null,
        subcategory_id: subcategoryId || null,
        item_type: itemType,
        price,
        sku: sku || null,
        barcode: barcode || null,
        description: description || null,
        cost: cost != null ? cost : null,
        quantity_on_hand: quantityOnHand,
        reorder_level: reorderLevel,
        reorder_qty: reorderQty,
        par_level: parLevel,
        lead_time_days: leadTimeDays,
        count_frequency: countFrequency,
        unit,
        uom_id: uomId || null,
        supplier: supplier || null,
        preferred_vendor_id: preferredVendorId || null,
        sellable,
        track_inventory: trackInventory,
        track_expiration: trackExpiration,
        image_url: imageUrl || null,
        active: true,
      })
      .select("*")
      .single();

    if (insertError || !product) {
      console.error("Item insert error:", insertError);
      return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
    }

    // Create initial ledger entry if quantity > 0
    if (quantityOnHand > 0 && trackInventory) {
      await postLedgerEntry(supabase, {
        venueId: VENUE_ID,
        locationId: locationId || null,
        itemId: product.id,
        eventType: "opening_balance",
        quantityDelta: quantityOnHand,
        unitCost: cost != null ? cost : null,
        referenceType: "manual",
        notes: "Initial stock on item creation",
      });
    }

    return NextResponse.json({
      success: true,
      item: mapItem(product),
    });
  } catch (err) {
    console.error("Items POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
