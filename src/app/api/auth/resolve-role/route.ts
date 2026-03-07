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
    const { data: staffRow, error: staffError } = await supabase
      .from("staff_users")
      .select("role, venue_id")
      .eq("auth_user_id", userId)
      .single();

    if (staffError) {
      console.error("Staff query error:", staffError.message, staffError.code);
    }

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
    const { data: parentRow, error: parentError } = await supabase
      .from("parent_accounts")
      .select("id")
      .eq("auth_user_id", userId)
      .single();

    if (parentError) {
      console.error("Parent query error:", parentError.message, parentError.code);
    }

    if (parentRow) {
      return NextResponse.json({
        role: "parent",
        redirect: "/portal/dashboard",
      });
    }

    // No role found — return debug info
    return NextResponse.json({
      role: null,
      redirect: "/",
      debug: {
        userId,
        staffError: staffError?.message || null,
        parentError: parentError?.message || null,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        keyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || "missing",
      },
    });
  } catch (err) {
    console.error("Resolve role error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
