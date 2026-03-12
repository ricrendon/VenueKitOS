import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockWaivers } from "@/lib/mock/data";
import { getVenueId } from "@/lib/utils/venue";

export const dynamic = "force-dynamic";

export async function GET() {
  if (isDemoMode()) return NextResponse.json(mockWaivers);
  try {
    const venueId = await getVenueId();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("waivers")
      .select("*, parent:parent_accounts(first_name, last_name, email)")
      .eq("venue_id", venueId)
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
