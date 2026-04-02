import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockInventoryItems } from "@/lib/mock/data";
import { getVenueId } from "@/lib/utils/venue";

export const dynamic = "force-dynamic";

function mapProduct(p: Record<string, unknown>) {
  return {
    id: p.id,
    venueId: p.venue_id,
    name: p.name,
    category: p.category || "Uncategorized",
    price: Number(p.price),
    imageUrl: p.image_url,
    active: p.active,
    sku: p.sku,
    description: p.description,
    cost: p.cost != null ? Number(p.cost) : null,
    quantityOnHand: Number(p.quantity_on_hand) || 0,
    reorderLevel: Number(p.reorder_level) || 0,
    unit: p.unit || "each",
    supplier: p.supplier,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

// GET — list inventory items with KPIs, search, and filters
export async function GET(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json(mockInventoryItems());
  try {
    const venueId = await getVenueId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const stockStatus = searchParams.get("stockStatus");

    const supabase = createAdminClient();

    // Filtered query for display
    let query = supabase
      .from("products")
      .select("*")
      .eq("venue_id", venueId)
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,sku.ilike.%${search}%,supplier.ilike.%${search}%`
      );
    }

    const { data: products, error } = await query;

    if (error) {
      console.error("Inventory GET error:", error);
      return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
    }

    // Apply stock status filter (post-query since it's a computed condition)
    let filtered = products || [];
    if (stockStatus === "low") {
      filtered = filtered.filter(
        (p) => Number(p.reorder_level) > 0 && Number(p.quantity_on_hand) <= Number(p.reorder_level) && Number(p.quantity_on_hand) > 0
      );
    } else if (stockStatus === "out") {
      filtered = filtered.filter((p) => Number(p.quantity_on_hand) === 0 && p.active);
    }

    // KPIs — unfiltered
    const { data: allProducts } = await supabase
      .from("products")
      .select("id, active, quantity_on_hand, reorder_level, cost")
      .eq("venue_id", venueId);

    const all = allProducts || [];
    const activeItems = all.filter((p) => p.active);
    const lowStock = activeItems.filter(
      (p) => Number(p.reorder_level) > 0 && Number(p.quantity_on_hand) <= Number(p.reorder_level) && Number(p.quantity_on_hand) > 0
    );
    const outOfStock = activeItems.filter((p) => Number(p.quantity_on_hand) === 0);
    const totalValue = activeItems.reduce(
      (sum, p) => sum + Number(p.quantity_on_hand) * (Number(p.cost) || 0),
      0
    );

    return NextResponse.json({
      items: filtered.map(mapProduct),
      kpis: {
        totalItems: activeItems.length,
        lowStock: lowStock.length,
        totalValue: Math.round(totalValue * 100) / 100,
        outOfStock: outOfStock.length,
      },
    });
  } catch (err) {
    console.error("Inventory GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — create a new inventory item
export async function POST(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json({ success: true, item: { id: "demo-item" } });
  try {
    const body = await request.json();
    const {
      name,
      category = "Uncategorized",
      price,
      sku,
      description,
      cost,
      quantityOnHand = 0,
      reorderLevel = 0,
      unit = "each",
      supplier,
      imageUrl,
    } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (price == null || price < 0) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
    }

    const venueId = await getVenueId();
    const supabase = createAdminClient();

    // Check SKU uniqueness within venue (if provided)
    if (sku) {
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("venue_id", venueId)
        .eq("sku", sku)
        .single();

      if (existing) {
        return NextResponse.json({ error: `SKU "${sku}" already exists` }, { status: 400 });
      }
    }

    const { data: product, error: insertError } = await supabase
      .from("products")
      .insert({
        venue_id: venueId,
        name: name.trim(),
        category,
        price,
        sku: sku || null,
        description: description || null,
        cost: cost != null ? cost : null,
        quantity_on_hand: quantityOnHand,
        reorder_level: reorderLevel,
        unit,
        supplier: supplier || null,
        image_url: imageUrl || null,
        active: true,
      })
      .select("*")
      .single();

    if (insertError || !product) {
      console.error("Inventory insert error:", insertError);
      return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
    }

    // Create initial stock transaction if quantity > 0
    if (quantityOnHand > 0) {
      await supabase.from("stock_transactions").insert({
        product_id: product.id,
        type: "initial",
        quantity_change: quantityOnHand,
        quantity_after: quantityOnHand,
        reference_type: "manual",
        notes: "Initial stock count",
      });
    }

    return NextResponse.json({
      success: true,
      item: mapProduct(product),
    });
  } catch (err) {
    console.error("Inventory POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
