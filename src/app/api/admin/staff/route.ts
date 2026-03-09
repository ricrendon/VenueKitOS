import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

// GET — list all staff members for the venue
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("staff_users")
      .select("id, first_name, last_name, role, email, active")
      .eq("venue_id", VENUE_ID)
      .eq("active", true)
      .order("first_name");

    if (error) {
      console.error("Staff list GET error:", error);
      return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
    }

    return NextResponse.json({ staff: data || [] });
  } catch (err) {
    console.error("Staff list GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
