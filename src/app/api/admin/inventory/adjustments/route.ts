import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { postLedgerEntry } from "@/lib/inventory/ledger";
import type { LedgerEventType } from "@/lib/inventory/types";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

// Allowed event types for manual adjustments
const ADJUSTMENT_EVENT_TYPES: LedgerEventType[] = [
  "receive",
  "adjustment",
  "waste",
  "spoilage",
  "usage",
  "return_to_vendor",
  "transfer_out",
  "transfer_in",
  "count_reconciliation",
];

/**
 * POST — create a stock adjustment (manual ledger entry)
 *
 * Body:
 * - itemId: string (required)
 * - eventType: LedgerEventType (required)
 * - quantity: number (positive, required)
 * - direction: "add" | "remove" (required for types that can go either way)
 * - locationId?: string
 * - unitCost?: number
 * - notes?: string
 * - reason?: string (appended to notes)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, eventType, quantity, direction, locationId, unitCost, notes, reason } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }
    if (!eventType || !ADJUSTMENT_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        { error: `Invalid event type. Allowed: ${ADJUSTMENT_EVENT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }
    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be greater than 0" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify item exists
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("id, name, quantity_on_hand, cost")
      .eq("id", itemId)
      .eq("venue_id", VENUE_ID)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Verify location exists if provided
    if (locationId) {
      const { data: loc } = await supabase
        .from("inventory_locations")
        .select("id")
        .eq("id", locationId)
        .eq("venue_id", VENUE_ID)
        .single();

      if (!loc) {
        return NextResponse.json({ error: "Location not found" }, { status: 404 });
      }
    }

    // Determine quantity delta direction
    // Some event types are always negative (waste, spoilage, usage, transfer_out, return_to_vendor)
    // Some are always positive (receive, transfer_in)
    // Some can be either (adjustment, count_reconciliation)
    const alwaysNegative: LedgerEventType[] = ["waste", "spoilage", "usage", "transfer_out", "return_to_vendor"];
    const alwaysPositive: LedgerEventType[] = ["receive", "transfer_in"];

    let quantityDelta: number;
    if (alwaysNegative.includes(eventType)) {
      quantityDelta = -Math.abs(quantity);
    } else if (alwaysPositive.includes(eventType)) {
      quantityDelta = Math.abs(quantity);
    } else {
      // For adjustment and count_reconciliation, use direction
      quantityDelta = direction === "remove" ? -Math.abs(quantity) : Math.abs(quantity);
    }

    // Check we won't go below zero
    const currentQty = Number(product.quantity_on_hand) || 0;
    if (currentQty + quantityDelta < 0) {
      return NextResponse.json(
        { error: `Cannot reduce stock below 0. Current: ${currentQty}, change: ${quantityDelta}` },
        { status: 400 }
      );
    }

    // Build notes
    const fullNotes = [reason, notes].filter(Boolean).join(" — ");

    const result = await postLedgerEntry(supabase, {
      venueId: VENUE_ID,
      locationId: locationId || null,
      itemId,
      eventType,
      quantityDelta,
      unitCost: unitCost ?? (product.cost != null ? Number(product.cost) : null),
      referenceType: "manual",
      notes: fullNotes || null,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      entryId: result.entryId,
      newQuantity: currentQty + quantityDelta,
      itemName: product.name,
    });
  } catch (err) {
    console.error("Adjustment POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
