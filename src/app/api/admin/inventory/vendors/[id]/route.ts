import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

// GET — vendor detail with supplied items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: vendor, error } = await supabase
      .from("vendors")
      .select("*")
      .eq("id", id)
      .eq("venue_id", VENUE_ID)
      .single();

    if (error || !vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Get items supplied by this vendor
    const { data: items } = await supabase
      .from("products")
      .select("id, name, sku, category, quantity_on_hand, cost, active")
      .eq("venue_id", VENUE_ID)
      .eq("preferred_vendor_id", id)
      .order("name");

    // Get recent POs for this vendor
    const { data: pos } = await supabase
      .from("purchase_orders")
      .select("id, po_number, status, ordered_at, expected_at, created_at")
      .eq("venue_id", VENUE_ID)
      .eq("vendor_id", id)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      vendor: {
        id: vendor.id,
        venueId: vendor.venue_id,
        name: vendor.name,
        contactName: vendor.contact_name,
        email: vendor.email,
        phone: vendor.phone,
        leadTimeDays: vendor.lead_time_days || 0,
        paymentTerms: vendor.payment_terms,
        active: vendor.active,
        notes: vendor.notes,
        createdAt: vendor.created_at,
        updatedAt: vendor.updated_at,
      },
      items: (items || []).map((i) => ({
        id: i.id,
        name: i.name,
        sku: i.sku,
        category: i.category,
        quantityOnHand: Number(i.quantity_on_hand) || 0,
        cost: i.cost != null ? Number(i.cost) : null,
        active: i.active,
      })),
      purchaseOrders: (pos || []).map((po) => ({
        id: po.id,
        poNumber: po.po_number,
        status: po.status,
        orderedAt: po.ordered_at,
        expectedAt: po.expected_at,
        createdAt: po.created_at,
      })),
    });
  } catch (err) {
    console.error("Vendor detail GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — update vendor
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, contactName, email, phone, leadTimeDays, paymentTerms, notes, active } = body;

    const supabase = createAdminClient();

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name.trim();
    if (contactName !== undefined) updates.contact_name = contactName || null;
    if (email !== undefined) updates.email = email || null;
    if (phone !== undefined) updates.phone = phone || null;
    if (leadTimeDays !== undefined) updates.lead_time_days = leadTimeDays;
    if (paymentTerms !== undefined) updates.payment_terms = paymentTerms || null;
    if (notes !== undefined) updates.notes = notes || null;
    if (active !== undefined) updates.active = active;

    const { error } = await supabase
      .from("vendors")
      .update(updates)
      .eq("id", id)
      .eq("venue_id", VENUE_ID);

    if (error) {
      console.error("Vendor update error:", error);
      return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Vendor PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
