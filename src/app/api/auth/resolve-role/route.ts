import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check if staff/admin (service role bypasses RLS)
    const { data: staffRow } = await supabase
      .from("staff_users")
      .select("role, venue_id")
      .eq("auth_user_id", userId)
      .single();

    if (staffRow) {
      const role =
        staffRow.role === "venue_owner" || staffRow.role === "manager"
          ? "admin"
          : "staff";
      return NextResponse.json({
        role,
        redirect: "/admin/dashboard",
        venueId: staffRow.venue_id,
      });
    }

    // Check if parent
    const { data: parentRow } = await supabase
      .from("parent_accounts")
      .select("id")
      .eq("auth_user_id", userId)
      .single();

    if (parentRow) {
      return NextResponse.json({
        role: "parent",
        redirect: "/portal/dashboard",
      });
    }

    // No role found
    return NextResponse.json({
      role: null,
      redirect: "/",
    });
  } catch (err) {
    console.error("Resolve role error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
