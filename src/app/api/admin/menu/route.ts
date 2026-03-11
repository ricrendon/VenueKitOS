import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockMenu } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapMenuItem(row: any) {
  return {
    id: row.id,
    venueId: row.venue_id,
    name: row.name,
    description: row.description || null,
    price: Number(row.price),
    category: row.category || "Snacks",
    imageUrl: row.image_url || null,
    available: row.available ?? true,
    displayOrder: Number(row.display_order) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET — return all menu items, optionally grouped by category
export async function GET() {
  if (isDemoMode()) return NextResponse.json(mockMenu);
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("venue_id", VENUE_ID)
      .order("category")
      .order("display_order")
      .order("name");

    if (error) {
      console.error("Menu GET error:", error);
      return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
    }

    const items = (data || []).map(mapMenuItem);

    // Group by category
    const grouped: Record<string, typeof items> = {};
    for (const item of items) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    }

    return NextResponse.json({ items, grouped });
  } catch (err) {
    console.error("Menu GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — create a new menu item
export async function POST(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json({ success: true, item: { id: "demo-menu-new" } });
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      category = "Snacks",
      imageUrl,
      available = true,
      displayOrder = 0,
    } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (price == null || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        venue_id: VENUE_ID,
        name: name.trim(),
        description: description || null,
        price: Number(price),
        category,
        image_url: imageUrl || null,
        available,
        display_order: displayOrder,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Menu POST error:", error);
      return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: mapMenuItem(data) });
  } catch (err) {
    console.error("Menu POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
