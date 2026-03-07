import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("waivers")
      .select("*, parent:parent_accounts(first_name, last_name, email)")
      .eq("venue_id", VENUE_ID)
      .order("signed_at", { ascending: false });

    if (error) {
      console.error("Waivers API error:", error);
      return NextResponse.json({ error: "Failed to fetch waivers" }, { status: 500 });
    }

    const formatted = (data || []).map((w) => {
      const parent = w.parent as { first_name: string; last_name: string; email: string } | null;
      return {
        id: w.id,
        parentName: w.parent_name || (parent ? `${parent.first_name} ${parent.last_name}` : "Unknown"),
        parentEmail: parent?.email || "",
        childName: w.child_name || "Unknown",
        status: w.status,
        signedAt: w.signed_at,
        expiresAt: w.expires_at,
        emergencyContact: w.emergency_contact_name,
        emergencyPhone: w.emergency_contact_phone,
      };
    });

    return NextResponse.json({ waivers: formatted });
  } catch (err) {
    console.error("Waivers API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
