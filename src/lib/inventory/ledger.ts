// ===================================
// Inventory Ledger Engine
// ===================================
// Source of truth for all inventory movements.
// Every stock change MUST go through postLedgerEntry.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { LedgerEventType, LedgerReferenceType } from "./types";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

export interface LedgerEntryInput {
  venueId?: string;
  locationId?: string | null;
  itemId: string;
  eventType: LedgerEventType;
  quantityDelta: number;
  unitCost?: number | null;
  referenceType?: LedgerReferenceType | null;
  referenceId?: string | null;
  correlationId?: string | null;
  notes?: string | null;
  createdBy?: string | null;
}

/**
 * Post an entry to the inventory ledger and update the balance projection.
 * This is the ONLY way to change inventory quantities.
 */
export async function postLedgerEntry(
  supabase: SupabaseClient,
  entry: LedgerEntryInput
): Promise<{ success: boolean; error?: string; entryId?: string }> {
  const venueId = entry.venueId || VENUE_ID;

  // 1. Insert the ledger entry
  const { data: ledgerEntry, error: insertError } = await supabase
    .from("inventory_ledger_entries")
    .insert({
      venue_id: venueId,
      location_id: entry.locationId || null,
      item_id: entry.itemId,
      event_type: entry.eventType,
      quantity_delta: entry.quantityDelta,
      unit_cost: entry.unitCost ?? null,
      reference_type: entry.referenceType || null,
      reference_id: entry.referenceId || null,
      correlation_id: entry.correlationId || null,
      notes: entry.notes || null,
      occurred_at: new Date().toISOString(),
      created_by: entry.createdBy || null,
    })
    .select("id")
    .single();

  if (insertError || !ledgerEntry) {
    console.error("Ledger insert error:", insertError);
    return { success: false, error: "Failed to post ledger entry" };
  }

  // 2. Update the balance projection
  await updateBalance(supabase, venueId, entry.locationId || null, entry.itemId, entry.quantityDelta, entry.unitCost ?? null);

  // 3. Also update the legacy products.quantity_on_hand for backward compatibility
  await updateLegacyQuantity(supabase, entry.itemId, entry.quantityDelta);

  // 4. Check for alert conditions (async, non-blocking)
  checkAlerts(supabase, venueId, entry.itemId).catch((err) =>
    console.error("Alert check error:", err)
  );

  return { success: true, entryId: ledgerEntry.id };
}

/**
 * Update or create the inventory_balances projection row.
 */
async function updateBalance(
  supabase: SupabaseClient,
  venueId: string,
  locationId: string | null,
  itemId: string,
  quantityDelta: number,
  unitCost: number | null
) {
  // Try to fetch existing balance
  let query = supabase
    .from("inventory_balances")
    .select("on_hand_qty, reserved_qty, avg_unit_cost")
    .eq("venue_id", venueId)
    .eq("item_id", itemId);

  if (locationId) {
    query = query.eq("location_id", locationId);
  } else {
    query = query.is("location_id", null);
  }

  const { data: existing } = await query.single();

  if (existing) {
    // Update existing balance
    const newOnHand = (existing.on_hand_qty || 0) + quantityDelta;
    const newAvgCost = unitCost != null && quantityDelta > 0
      ? calculateNewAvgCost(existing.on_hand_qty || 0, existing.avg_unit_cost || 0, quantityDelta, unitCost)
      : existing.avg_unit_cost || 0;

    let updateQuery = supabase
      .from("inventory_balances")
      .update({
        on_hand_qty: Math.max(newOnHand, 0),
        avg_unit_cost: newAvgCost,
        last_updated_at: new Date().toISOString(),
      })
      .eq("venue_id", venueId)
      .eq("item_id", itemId);

    if (locationId) {
      updateQuery = updateQuery.eq("location_id", locationId);
    } else {
      updateQuery = updateQuery.is("location_id", null);
    }

    await updateQuery;
  } else {
    // Insert new balance row
    await supabase.from("inventory_balances").insert({
      venue_id: venueId,
      location_id: locationId,
      item_id: itemId,
      on_hand_qty: Math.max(quantityDelta, 0),
      reserved_qty: 0,
      avg_unit_cost: unitCost || 0,
      last_updated_at: new Date().toISOString(),
    });
  }
}

/**
 * Update the legacy products.quantity_on_hand field.
 * This maintains backward compatibility with existing POS and other modules.
 */
async function updateLegacyQuantity(
  supabase: SupabaseClient,
  itemId: string,
  quantityDelta: number
) {
  const { data: product } = await supabase
    .from("products")
    .select("quantity_on_hand")
    .eq("id", itemId)
    .single();

  if (product) {
    const newQty = Math.max((product.quantity_on_hand || 0) + quantityDelta, 0);
    await supabase
      .from("products")
      .update({
        quantity_on_hand: newQty,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId);
  }
}

/**
 * Calculate weighted average cost when receiving new stock.
 */
function calculateNewAvgCost(
  currentQty: number,
  currentAvgCost: number,
  addedQty: number,
  addedUnitCost: number
): number {
  if (currentQty + addedQty === 0) return 0;
  const totalValue = (currentQty * currentAvgCost) + (addedQty * addedUnitCost);
  return Math.round((totalValue / (currentQty + addedQty)) * 100) / 100;
}

/**
 * Recalculate a balance row entirely from ledger entries.
 * Use when balance appears out of sync.
 */
export async function recalcBalance(
  supabase: SupabaseClient,
  venueId: string,
  locationId: string | null,
  itemId: string
): Promise<{ onHand: number; reserved: number; available: number }> {
  let query = supabase
    .from("inventory_ledger_entries")
    .select("quantity_delta, unit_cost")
    .eq("venue_id", venueId)
    .eq("item_id", itemId);

  if (locationId) {
    query = query.eq("location_id", locationId);
  }

  const { data: entries } = await query;

  const onHand = (entries || []).reduce((sum, e) => sum + (e.quantity_delta || 0), 0);

  // Get reserved qty from active reservations
  let resQuery = supabase
    .from("inventory_reservations")
    .select("reserved_qty")
    .eq("venue_id", venueId)
    .eq("item_id", itemId)
    .eq("status", "active");

  if (locationId) {
    resQuery = resQuery.eq("location_id", locationId);
  }

  const { data: reservations } = await resQuery;
  const reserved = (reservations || []).reduce((sum, r) => sum + (r.reserved_qty || 0), 0);

  // Upsert the balance
  let upsertQuery = supabase
    .from("inventory_balances")
    .upsert({
      venue_id: venueId,
      location_id: locationId,
      item_id: itemId,
      on_hand_qty: Math.max(onHand, 0),
      reserved_qty: reserved,
      last_updated_at: new Date().toISOString(),
    });

  await upsertQuery;

  return {
    onHand: Math.max(onHand, 0),
    reserved,
    available: Math.max(onHand - reserved, 0),
  };
}

/**
 * Get the current balance for an item (across all locations or a specific one).
 */
export async function getBalance(
  supabase: SupabaseClient,
  venueId: string,
  itemId: string,
  locationId?: string | null
): Promise<{ onHand: number; reserved: number; available: number; avgCost: number }> {
  let query = supabase
    .from("inventory_balances")
    .select("on_hand_qty, reserved_qty, available_qty, avg_unit_cost")
    .eq("venue_id", venueId)
    .eq("item_id", itemId);

  if (locationId) {
    query = query.eq("location_id", locationId);
  }

  const { data } = await query;

  if (!data || data.length === 0) {
    return { onHand: 0, reserved: 0, available: 0, avgCost: 0 };
  }

  // Aggregate across locations if no specific location
  const onHand = data.reduce((sum, b) => sum + (b.on_hand_qty || 0), 0);
  const reserved = data.reduce((sum, b) => sum + (b.reserved_qty || 0), 0);
  const avgCost = data[0].avg_unit_cost || 0;

  return {
    onHand,
    reserved,
    available: onHand - reserved,
    avgCost,
  };
}

/**
 * Check alert conditions after a ledger entry and create/resolve alerts.
 */
async function checkAlerts(
  supabase: SupabaseClient,
  venueId: string,
  itemId: string
) {
  // Get current product info
  const { data: product } = await supabase
    .from("products")
    .select("id, name, quantity_on_hand, reorder_level, active")
    .eq("id", itemId)
    .single();

  if (!product || !product.active) return;

  const qty = Number(product.quantity_on_hand) || 0;
  const reorder = Number(product.reorder_level) || 0;

  // Check: out of stock
  if (qty === 0) {
    await upsertAlert(supabase, venueId, itemId, "out_of_stock", "critical",
      `${product.name} is out of stock`);
    // Resolve any low_stock alert (it's now out of stock)
    await resolveAlert(supabase, venueId, itemId, "low_stock");
  } else if (reorder > 0 && qty <= reorder) {
    // Check: low stock
    await upsertAlert(supabase, venueId, itemId, "low_stock", "warning",
      `${product.name} is below reorder point (${qty} on hand, reorder at ${reorder})`);
    // Resolve out_of_stock if it existed
    await resolveAlert(supabase, venueId, itemId, "out_of_stock");
  } else {
    // Stock is healthy — resolve both alerts if they exist
    await resolveAlert(supabase, venueId, itemId, "low_stock");
    await resolveAlert(supabase, venueId, itemId, "out_of_stock");
  }
}

/**
 * Create or update an active alert. If one already exists for this item+type, skip.
 */
async function upsertAlert(
  supabase: SupabaseClient,
  venueId: string,
  itemId: string,
  alertType: string,
  severity: string,
  message: string
) {
  // Check if active alert already exists
  const { data: existing } = await supabase
    .from("inventory_alerts")
    .select("id")
    .eq("venue_id", venueId)
    .eq("item_id", itemId)
    .eq("alert_type", alertType)
    .eq("status", "active")
    .single();

  if (existing) return; // Already active, don't duplicate

  await supabase.from("inventory_alerts").insert({
    venue_id: venueId,
    item_id: itemId,
    alert_type: alertType,
    message,
    severity,
    status: "active",
  });
}

/**
 * Resolve an active alert (stock levels recovered).
 */
async function resolveAlert(
  supabase: SupabaseClient,
  venueId: string,
  itemId: string,
  alertType: string
) {
  await supabase
    .from("inventory_alerts")
    .update({ status: "resolved", dismissed_at: new Date().toISOString() })
    .eq("venue_id", venueId)
    .eq("item_id", itemId)
    .eq("alert_type", alertType)
    .eq("status", "active");
}
