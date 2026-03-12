import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockIncidents } from "@/lib/mock/data";
import { getVenueId } from "@/lib/utils/venue";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";

export const dynamic = "force-dynamic";

// GET — list incidents with KPIs and chart data
export async function GET(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json(mockIncidents);
  try {
    const venueId = await getVenueId();
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const statusFilter = searchParams.get("status");
    const typeFilter = searchParams.get("type");

    // Build query
    let query = supabase
      .from("incidents")
      .select("*")
      .eq("venue_id", venueId)
      .order("created_at", { ascending: false });

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }
    if (typeFilter && typeFilter !== "all") {
      query = query.eq("type", typeFilter);
    }

    const { data: incidents, error } = await query;

    if (error) {
      console.error("Incidents GET error:", error);
      return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 });
    }

    const rows = incidents || [];

    // Get reporter names via separate query
    const reporterIds = Array.from(new Set(rows.map((r) => r.reported_by).filter(Boolean)));
    const resolverIds = Array.from(new Set(rows.map((r) => r.resolved_by).filter(Boolean)));
    const allStaffIds = Array.from(new Set([...reporterIds, ...resolverIds]));

    let staffMap: Record<string, string> = {};
    if (allStaffIds.length > 0) {
      const { data: staffRows } = await supabase
        .from("staff_users")
        .select("id, first_name, last_name")
        .in("id", allStaffIds);

      if (staffRows) {
        for (const s of staffRows) {
          staffMap[s.id] = `${s.first_name} ${s.last_name}`;
        }
      }
    }

    // Enrich incidents with names
    const enriched = rows.map((r) => ({
      ...r,
      reporter_name: staffMap[r.reported_by] || "Unknown",
      resolver_name: r.resolved_by ? staffMap[r.resolved_by] || "Unknown" : null,
    }));

    // KPIs
    const total = rows.length;
    const openCount = rows.filter((r) => r.status === "open" || r.status === "investigating").length;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const resolvedThisMonth = rows.filter(
      (r) =>
        (r.status === "resolved" || r.status === "closed") &&
        r.resolved_at &&
        new Date(r.resolved_at) >= monthStart
    ).length;

    const resolvedWithCost = rows.filter(
      (r) => (r.status === "resolved" || r.status === "closed") && Number(r.resolution_cost) > 0
    );
    const avgCost =
      resolvedWithCost.length > 0
        ? resolvedWithCost.reduce((sum, r) => sum + Number(r.resolution_cost), 0) / resolvedWithCost.length
        : 0;

    // Chart data — by type
    const typeCounts: Record<string, number> = {};
    for (const r of rows) {
      typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
    }
    const byType = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));

    // Chart data — by severity
    const sevCounts: Record<string, number> = {};
    for (const r of rows) {
      sevCounts[r.severity] = (sevCounts[r.severity] || 0) + 1;
    }
    const bySeverity = Object.entries(sevCounts).map(([severity, count]) => ({ severity, count }));

    return NextResponse.json({
      incidents: enriched,
      kpis: {
        total,
        open: openCount,
        resolvedThisMonth,
        avgResolutionCost: Number(avgCost.toFixed(2)),
      },
      charts: {
        byType,
        bySeverity,
      },
    });
  } catch (err) {
    console.error("Incidents GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — create a new incident
export async function POST(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json({ success: true, incident: { id: "demo-incident" } });
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const venueId = await getVenueId();
    const body = await request.json();
    const { type, title, description, severity, affected_area } = body;

    if (!type || !title || !severity || !affected_area) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("incidents")
      .insert({
        venue_id: venueId,
        reported_by: staff.id,
        type,
        title,
        description: description || null,
        severity,
        affected_area,
        status: "open",
      })
      .select("*")
      .single();

    if (error) {
      console.error("Incidents POST error:", error);
      return NextResponse.json({ error: "Failed to create incident" }, { status: 500 });
    }

    return NextResponse.json({ success: true, incident: data });
  } catch (err) {
    console.error("Incidents POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
