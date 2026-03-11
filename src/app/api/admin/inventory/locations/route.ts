import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockInventoryLocations } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

// GET — list locations with item counts
export async function GET() {
  if (isDemoMode()) return NextResponse.json(mockInventoryLocations);
  try {
    const supabase = createAdminClient();

    const { data: locations, error } = await supabase
      .from("inventory_locations")
      .select("*")
      .eq("venue_id", VENUE_ID)
      .order("name");

    if (error) {
      console.error("Locations GET error:", error);
      return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
    }

    // Get item counts per location from balances
    const { data: balances } = await supabase
      .from("inventory_balances")
      .select("location_id")
      .eq("venue_id", VENUE_ID)
      .gt("on_hand_qty", 0);

    const countMap = new Map<string, number>();
    (balances || []).forEach((b) => {
      if (b.location_id) {
        countMap.set(b.location_id, (countMap.get(b.location_id) || 0) + 1);
      }
    });

    const mapped = (locations || []).map((l) => ({
      id: l.id,
      venueId: l.venue_id,
      name: l.name,
      locationType: l.location_type,
      active: l.active,
      notes: l.notes,
      createdAt: l.created_at,
      updatedAt: l.updated_at,
      itemCount: countMap.get(l.id) || 0,
    }));

    return NextResponse.json({ locations: mapped });
  } catch (err) {
    console.error("Locations GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — create a new location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, locationType = "storage", notes } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: location, error } = await supabase
      .from("inventory_locations")
      .insert({
        venue_id: VENUE_ID,
        name: name.trim(),
        location_type: locationType,
        notes: notes || null,
        active: true,
      })
      .select("*")
      .single();

    if (error || !location) {
      console.error("Location insert error:", error);
      return NextResponse.json({ error: "Failed to create location" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      location: {
        id: location.id,
        venueId: location.venue_id,
        name: location.name,
        locationType: location.location_type,
        active: location.active,
        notes: location.notes,
        createdAt: location.created_at,
        updatedAt: location.updated_at,
        itemCount: 0,
      },
    });
  } catch (err) {
    console.error("Location POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — update a location
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, locationType, notes, active } = body;

    if (!id) {
      return NextResponse.json({ error: "Location ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name.trim();
    if (locationType !== undefined) updates.location_type = locationType;
    if (notes !== undefined) updates.notes = notes || null;
    if (active !== undefined) updates.active = active;

    const { error } = await supabase
      .from("inventory_locations")
      .update(updates)
      .eq("id", id)
      .eq("venue_id", VENUE_ID);

    if (error) {
      console.error("Location update error:", error);
      return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Location PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
