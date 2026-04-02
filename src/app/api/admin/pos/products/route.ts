import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVenueId } from "@/lib/utils/venue";

export const dynamic = "force-dynamic";

// GET — return all available menu items + sellable products for POS grid
export async function GET() {
  try {
    const venueId = await getVenueId();
    const supabase = createAdminClient();

    const [menuRes, productRes] = await Promise.all([
      supabase
        .from("menu_items")
        .select("id, name, description, price, category, image_url, available")
        .eq("venue_id", venueId)
        .eq("available", true)
        .order("category")
        .order("display_order"),
      supabase
        .from("products")
        .select("id, name, description, price, category, image_url, active, quantity_on_hand")
        .eq("venue_id", venueId)
        .eq("active", true)
        .gt("quantity_on_hand", 0)
        .order("category"),
    ]);

    const menuItems = (menuRes.data || []).map((m) => ({
      id: `menu-${m.id}`,
      sourceId: m.id,
      sourceType: "menu_item" as const,
      name: m.name,
      description: m.description || "",
      price: Number(m.price),
      category: m.category || "Snacks",
      imageUrl: m.image_url || null,
    }));

    const products = (productRes.data || []).map((p) => ({
      id: `product-${p.id}`,
      sourceId: p.id,
      sourceType: "product" as const,
      name: p.name,
      description: p.description || "",
      price: Number(p.price),
      category: p.category || "Retail",
      imageUrl: p.image_url || null,
      stock: p.quantity_on_hand,
    }));

    const all = [...menuItems, ...products];
    const categories = Array.from(new Set(all.map((i) => i.category))).sort();

    return NextResponse.json({ items: all, categories });
  } catch (err) {
    console.error("POS products GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
