import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVenueId } from "@/lib/utils/venue";

export const dynamic = "force-dynamic";


export async function GET(request: NextRequest) {
  try {
      const venueId = await getVenueId();
    const { searchParams } = new URL(request.url);
    const authUserId = searchParams.get("authUserId");

    if (!authUserId) {
      return NextResponse.json({ error: "Missing authUserId" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: parent } = await supabase
      .from("parent_accounts")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single();

    if (!parent) {
      return NextResponse.json({ waivers: [] });
    }

    const { data: waivers } = await supabase
      .from("waivers")
      .select("id, child_id, parent_name, child_name, emergency_contact_name, emergency_contact_phone, signed_at, expires_at, status")
      .eq("parent_id", parent.id)
      .eq("venue_id", venueId)
      .order("signed_at", { ascending: false });

    return NextResponse.json({ waivers: waivers || [] });
  } catch (err) {
    console.error("Portal waivers error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
