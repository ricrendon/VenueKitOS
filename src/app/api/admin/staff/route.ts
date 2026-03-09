import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

const VALID_ROLES = [
  "super_admin",
  "venue_owner",
  "venue_manager",
  "front_desk_staff",
  "party_host",
];

// GET — list all staff members with KPIs
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    let query = supabase
      .from("staff_users")
      .select(
        "id, auth_user_id, first_name, last_name, role, email, phone, active, created_at"
      )
      .eq("venue_id", VENUE_ID)
      .order("first_name");

    if (statusFilter === "active") {
      query = query.eq("active", true);
    } else if (statusFilter === "terminated") {
      query = query.eq("active", false);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Staff list GET error:", error);
      return NextResponse.json(
        { error: "Failed to fetch staff" },
        { status: 500 }
      );
    }

    const rows = data || [];

    // KPIs from unfiltered data
    const { data: allStaff } = await supabase
      .from("staff_users")
      .select("active, role")
      .eq("venue_id", VENUE_ID);

    const all = allStaff || [];
    const activeCount = all.filter((s) => s.active).length;
    const byRole: Record<string, number> = {};
    for (const s of all.filter((s) => s.active)) {
      byRole[s.role] = (byRole[s.role] || 0) + 1;
    }

    return NextResponse.json({
      staff: rows,
      kpis: {
        totalStaff: all.length,
        activeStaff: activeCount,
        terminatedStaff: all.length - activeCount,
        byRole,
      },
    });
  } catch (err) {
    console.error("Staff list GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST — create a new staff member with Supabase auth user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, phone, role } = body;

    if (!first_name || !last_name || !email || !role) {
      return NextResponse.json(
        { error: "First name, last name, email, and role are required" },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Generate temporary password
    const { randomBytes } = await import("crypto");
    const tempPassword = randomBytes(12).toString("base64url");

    // Create Supabase auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      });

    if (authError) {
      console.error("Auth user creation error:", authError);
      return NextResponse.json(
        { error: authError.message || "Failed to create auth user" },
        { status: 400 }
      );
    }

    // Insert staff_users row
    const { data: staffData, error: staffError } = await supabase
      .from("staff_users")
      .insert({
        auth_user_id: authData.user.id,
        venue_id: VENUE_ID,
        role,
        first_name,
        last_name,
        email,
        phone: phone || null,
        active: true,
      })
      .select("*")
      .single();

    if (staffError) {
      // Best-effort cleanup: remove the auth user we just created
      await supabase.auth.admin.deleteUser(authData.user.id);
      console.error("Staff insert error:", staffError);
      return NextResponse.json(
        { error: "Failed to create staff record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      staff: staffData,
      temporaryPassword: tempPassword,
    });
  } catch (err) {
    console.error("Staff POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
