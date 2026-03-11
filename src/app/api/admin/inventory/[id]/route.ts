import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { MOCK_INVENTORY_ITEMS } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

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

// GET — item detail with stock transactions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (isDemoMode()) return NextResponse.json({ item: MOCK_INVENTORY_ITEMS[0], transactions: [] });
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

    const { data: transactions } = await supabase
      .from("stock_transactions")
      .select("*")
      .eq("product_id", id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      item: mapProduct(product),
      transactions: (transactions || []).map((t) => ({
        id: t.id,
        productId: t.product_id,
        type: t.type,
        quantityChange: t.quantity_change,
        quantityAfter: t.quantity_after,
        referenceType: t.reference_type,
        referenceId: t.reference_id,
        notes: t.notes,
        createdBy: t.created_by,
        createdAt: t.created_at,
      })),
    });
  } catch (err) {
    console.error("Inventory detail GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — update item, adjust stock, or toggle active
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

    // Fetch current product
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
      const { name, category, price, sku, description, cost, reorderLevel, unit, supplier, imageUrl } = body;

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

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (name !== undefined) updates.name = name.trim();
      if (category !== undefined) updates.category = category;
      if (price !== undefined) updates.price = price;
      if (sku !== undefined) updates.sku = sku || null;
      if (description !== undefined) updates.description = description || null;
      if (cost !== undefined) updates.cost = cost != null ? cost : null;
      if (reorderLevel !== undefined) updates.reorder_level = reorderLevel;
      if (unit !== undefined) updates.unit = unit;
      if (supplier !== undefined) updates.supplier = supplier || null;
      if (imageUrl !== undefined) updates.image_url = imageUrl || null;

      const { error: updateError } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id);

      if (updateError) {
        console.error("Inventory update error:", updateError);
        return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // ACTION: adjust stock
    if (action === "adjust_stock") {
      const { type, quantityChange, notes } = body;

      if (!type || quantityChange == null || quantityChange === 0) {
        return NextResponse.json({ error: "Type and quantity are required" }, { status: 400 });
      }

      const currentQty = Number(product.quantity_on_hand) || 0;
      const newQty = currentQty + quantityChange; // quantityChange is signed

      if (newQty < 0) {
        return NextResponse.json({ error: "Cannot reduce stock below 0" }, { status: 400 });
      }

      // Update product quantity
      await supabase
        .from("products")
        .update({
          quantity_on_hand: newQty,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      // Create stock transaction
      await supabase.from("stock_transactions").insert({
        product_id: id,
        type,
        quantity_change: quantityChange,
        quantity_after: newQty,
        reference_type: "manual",
        notes: notes || null,
      });

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

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Inventory PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
