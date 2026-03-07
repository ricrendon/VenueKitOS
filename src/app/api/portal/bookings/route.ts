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
      return NextResponse.json({ bookings: [] });
    }

    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, type, status, payment_status, date, start_time, end_time, child_count, adult_count, total, confirmation_code, notes, created_at")
      .eq("parent_id", parent.id)
      .eq("venue_id", VENUE_ID)
      .order("date", { ascending: false });

    return NextResponse.json({ bookings: bookings || [] });
  } catch (err) {
    console.error("Portal bookings error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
