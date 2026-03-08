import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const body = await request.json();
    const { clockIn, clockOut, breakMinutes, notes } = body;

    // Verify entry exists and belongs to venue
    const { data: existing, error: findError } = await supabase
      .from("time_entries")
      .select("id")
      .eq("id", id)
      .eq("venue_id", VENUE_ID)
      .single();

    if (findError || !existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Build update object
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (clockIn !== undefined) updates.clock_in = clockIn;
    if (clockOut !== undefined) {
      updates.clock_out = clockOut;
      updates.status = "completed";
    }
    if (breakMinutes !== undefined) updates.break_minutes = breakMinutes;
    if (notes !== undefined) updates.notes = notes;

    const { error: updateError } = await supabase
      .from("time_entries")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      console.error("Time entry PATCH error:", updateError);
      return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Time entry PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Verify entry exists and belongs to venue
    const { data: existing, error: findError } = await supabase
      .from("time_entries")
      .select("id")
      .eq("id", id)
      .eq("venue_id", VENUE_ID)
      .single();

    if (findError || !existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("time_entries")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Time entry DELETE error:", deleteError);
      return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Time entry DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
