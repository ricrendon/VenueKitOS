import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

export async function GET(request: NextRequest) {
  try {
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
      .eq("venue_id", VENUE_ID)
      .order("signed_at", { ascending: false });

    return NextResponse.json({ waivers: waivers || [] });
  } catch (err) {
    console.error("Portal waivers error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
