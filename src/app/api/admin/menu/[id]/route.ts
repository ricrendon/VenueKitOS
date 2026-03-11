import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/mock/demo-mode";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

// PATCH — update a menu item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (isDemoMode()) return NextResponse.json({ success: true });
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.category !== undefined) updateData.category = body.category;
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl || null;
    if (body.available !== undefined) updateData.available = body.available;
    if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder;

    const { data, error } = await supabase
      .from("menu_items")
      .update(updateData)
      .eq("id", id)
      .eq("venue_id", VENUE_ID)
      .select("*")
      .single();

    if (error) {
      console.error("Menu PATCH error:", error);
      return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data });
  } catch (err) {
    console.error("Menu PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — remove a menu item
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (isDemoMode()) return NextResponse.json({ success: true });
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id)
      .eq("venue_id", VENUE_ID);

    if (error) {
      console.error("Menu DELETE error:", error);
      return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Menu DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
