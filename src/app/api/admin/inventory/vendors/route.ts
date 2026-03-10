import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

// GET — list vendors with item counts
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: vendors, error } = await supabase
      .from("vendors")
      .select("*")
      .eq("venue_id", VENUE_ID)
      .order("name");

    if (error) {
      console.error("Vendors GET error:", error);
      return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
    }

    // Get item counts per vendor
    const vendorIds = (vendors || []).map((v) => v.id);
    const { data: items } = await supabase
      .from("products")
      .select("preferred_vendor_id")
      .eq("venue_id", VENUE_ID)
      .eq("active", true)
      .in("preferred_vendor_id", vendorIds.length > 0 ? vendorIds : ["00000000-0000-0000-0000-000000000000"]);

    const countMap = new Map<string, number>();
    (items || []).forEach((i) => {
      if (i.preferred_vendor_id) {
        countMap.set(i.preferred_vendor_id, (countMap.get(i.preferred_vendor_id) || 0) + 1);
      }
    });

    const mapped = (vendors || []).map((v) => ({
      id: v.id,
      venueId: v.venue_id,
      name: v.name,
      contactName: v.contact_name,
      email: v.email,
      phone: v.phone,
      leadTimeDays: v.lead_time_days || 0,
      paymentTerms: v.payment_terms,
      active: v.active,
      notes: v.notes,
      createdAt: v.created_at,
      updatedAt: v.updated_at,
      itemCount: countMap.get(v.id) || 0,
    }));

    return NextResponse.json({ vendors: mapped });
  } catch (err) {
    console.error("Vendors GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — create a new vendor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, contactName, email, phone, leadTimeDays = 0, paymentTerms, notes } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Vendor name is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: vendor, error } = await supabase
      .from("vendors")
      .insert({
        venue_id: VENUE_ID,
        name: name.trim(),
        contact_name: contactName || null,
        email: email || null,
        phone: phone || null,
        lead_time_days: leadTimeDays,
        payment_terms: paymentTerms || null,
        notes: notes || null,
        active: true,
      })
      .select("*")
      .single();

    if (error || !vendor) {
      console.error("Vendor insert error:", error);
      return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
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
        itemCount: 0,
      },
    });
  } catch (err) {
    console.error("Vendor POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
