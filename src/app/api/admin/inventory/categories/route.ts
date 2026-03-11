import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockInventoryCategories } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

// GET — list categories from item_categories table (with fallback to products.category)
export async function GET() {
  if (isDemoMode()) return NextResponse.json(mockInventoryCategories);
  try {
    const supabase = createAdminClient();

    // Try item_categories table first
    const { data: dbCategories, error } = await supabase
      .from("item_categories")
      .select("id, name, sort_order, active")
      .eq("venue_id", VENUE_ID)
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (!error && dbCategories && dbCategories.length > 0) {
      return NextResponse.json({
        categories: dbCategories.map((c) => ({
          id: c.id,
          name: c.name,
          sortOrder: c.sort_order,
        })),
      });
    }

    // Fallback: read distinct categories from products table
    const { data: products } = await supabase
      .from("products")
      .select("category")
      .eq("venue_id", VENUE_ID)
      .not("category", "is", null);

    const fallback = [
      "Socks",
      "Food & Beverage",
      "Merchandise",
      "Party Supplies",
      "Operational",
    ];

    const productCategories = Array.from(
      new Set((products || []).map((p) => p.category as string))
    );
    const all = Array.from(new Set([...fallback, ...productCategories])).sort();

    return NextResponse.json({
      categories: all.map((name, i) => ({ id: null, name, sortOrder: i })),
    });
  } catch (err) {
    console.error("Categories GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get next sort_order
    const { data: existing } = await supabase
      .from("item_categories")
      .select("sort_order")
      .eq("venue_id", VENUE_ID)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextSort = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { data: category, error } = await supabase
      .from("item_categories")
      .insert({
        venue_id: VENUE_ID,
        name: name.trim(),
        sort_order: nextSort,
        active: true,
      })
      .select("*")
      .single();

    if (error || !category) {
      console.error("Category insert error:", error);
      return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        sortOrder: category.sort_order,
      },
    });
  } catch (err) {
    console.error("Category POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
