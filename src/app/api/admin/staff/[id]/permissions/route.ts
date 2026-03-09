import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDefaultPages, ADMIN_PAGES } from "@/lib/permissions";
import type { PageKey } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET — get effective permissions for a specific staff member
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: staffId } = await params;
    const supabase = createAdminClient();

    // Get staff role
    const { data: staff } = await supabase
      .from("staff_users")
      .select("id, role, first_name, last_name")
      .eq("id", staffId)
      .single();

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Get role defaults
    const defaults = getDefaultPages(staff.role);

    // Get overrides
    const { data: overrides } = await supabase
      .from("staff_permissions")
      .select("page_key, granted")
      .eq("staff_id", staffId);

    const overrideMap: Record<string, boolean> = {};
    if (overrides) {
      for (const o of overrides) {
        overrideMap[o.page_key] = o.granted;
      }
    }

    // Build effective permissions
    const pages = ADMIN_PAGES.map((page) => {
      const isDefault = defaults.has(page.key);
      const hasOverride = page.key in overrideMap;
      const granted = hasOverride ? overrideMap[page.key] : isDefault;

      return {
        key: page.key,
        label: page.label,
        granted,
        isDefault,
        hasOverride,
      };
    });

    return NextResponse.json({
      staff: {
        id: staff.id,
        role: staff.role,
        name: `${staff.first_name} ${staff.last_name}`,
      },
      pages,
    });
  } catch (err) {
    console.error("Staff permissions GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT — update permission overrides for a staff member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: staffId } = await params;
    const body = await request.json();
    const { overrides } = body as { overrides: Record<string, boolean> };

    if (!overrides || typeof overrides !== "object") {
      return NextResponse.json({ error: "Missing overrides object" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify staff exists
    const { data: staff } = await supabase
      .from("staff_users")
      .select("id, role")
      .eq("id", staffId)
      .single();

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Get role defaults to determine which entries are overrides
    const defaults = getDefaultPages(staff.role);

    // Delete existing overrides for this staff
    await supabase
      .from("staff_permissions")
      .delete()
      .eq("staff_id", staffId);

    // Insert only rows that differ from defaults
    const rows: { staff_id: string; page_key: string; granted: boolean }[] = [];
    for (const [pageKey, granted] of Object.entries(overrides)) {
      const isDefault = defaults.has(pageKey as PageKey);
      // Only store if different from default
      if (granted !== isDefault) {
        rows.push({ staff_id: staffId, page_key: pageKey, granted });
      }
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from("staff_permissions")
        .insert(rows);

      if (error) {
        console.error("Staff permissions PUT insert error:", error);
        return NextResponse.json({ error: "Failed to save permissions" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, overridesStored: rows.length });
  } catch (err) {
    console.error("Staff permissions PUT error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — remove all overrides, resetting to role defaults
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: staffId } = await params;
    const supabase = createAdminClient();

    // Verify staff exists
    const { data: staff } = await supabase
      .from("staff_users")
      .select("id")
      .eq("id", staffId)
      .single();

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Delete all overrides for this staff member
    const { error } = await supabase
      .from("staff_permissions")
      .delete()
      .eq("staff_id", staffId);

    if (error) {
      console.error("Staff permissions DELETE error:", error);
      return NextResponse.json({ error: "Failed to reset permissions" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Staff permissions DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
