import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLocalToday } from "@/lib/utils/timezone";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockTimeClock } from "@/lib/mock/data";
import { getVenueId, getVenueTz } from "@/lib/utils/venue";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";

export const dynamic = "force-dynamic";

function computeHours(clockIn: string, clockOut: string | null, breakMinutes: number): number | null {
  if (!clockOut) return null;
  const ms = new Date(clockOut).getTime() - new Date(clockIn).getTime();
  const totalMinutes = ms / 60000;
  return Math.round(((totalMinutes - breakMinutes) / 60) * 100) / 100;
}

export async function GET(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json(mockTimeClock());
  try {
    const venueId = await getVenueId();
    const venueTz = await getVenueTz();
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const staffId = searchParams.get("staffId") || "";
    const status = searchParams.get("status") || "";

    // Support date range (for time card generation) or single date
    let dayStart: string;
    let dayEnd: string;

    if (startDate && endDate) {
      dayStart = `${startDate}T00:00:00`;
      dayEnd = `${endDate}T23:59:59`;
    } else {
      const date = searchParams.get("date") || getLocalToday(venueTz);
      dayStart = `${date}T00:00:00`;
      dayEnd = `${date}T23:59:59`;
    }

    let query = supabase
      .from("time_entries")
      .select("*")
      .eq("venue_id", venueId)
      .gte("clock_in", dayStart)
      .lte("clock_in", dayEnd)
      .order("clock_in", { ascending: false });

    if (staffId) {
      query = query.eq("staff_id", staffId);
    }
    if (status === "active" || status === "completed") {
      query = query.eq("status", status);
    }

    const { data: entries, error: entriesError } = await query;

    if (entriesError) {
      console.error("Time clock GET error:", entriesError);
      return NextResponse.json({ error: "Failed to fetch time entries" }, { status: 500 });
    }

    // Fetch all staff for name lookup (avoids ambiguous FK join)
    const { data: allStaff } = await supabase
      .from("staff_users")
      .select("id, first_name, last_name, role")
      .eq("venue_id", venueId);

    const staffMap = new Map(
      (allStaff || []).map((s) => [s.id, s])
    );

    // Also fetch ALL active entries (for KPIs — regardless of date filter)
    const { data: allActive } = await supabase
      .from("time_entries")
      .select("id, staff_id, clock_in, break_minutes")
      .eq("venue_id", venueId)
      .eq("status", "active");

    // Fetch total active staff
    const { count: totalStaff } = await supabase
      .from("staff_users")
      .select("id", { count: "exact", head: true })
      .eq("venue_id", venueId)
      .eq("active", true);

    // Fetch weekly completed entries for weekly hours KPI
    const today = getLocalToday(venueTz);
    const todayDate = new Date(today + "T12:00:00");
    const dayOfWeek = todayDate.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(todayDate);
    monday.setDate(monday.getDate() - mondayOffset);
    const weekStart = monday.toISOString().split("T")[0];

    const { data: weekEntries } = await supabase
      .from("time_entries")
      .select("clock_in, clock_out, break_minutes")
      .eq("venue_id", venueId)
      .eq("status", "completed")
      .gte("clock_in", `${weekStart}T00:00:00`);

    // Calculate KPIs
    const staffOnClock = (allActive || []).length;

    // Hours today: sum completed + estimate active
    const todayStart = `${today}T00:00:00`;
    const todayEnd = `${today}T23:59:59`;
    const todayCompleted = (entries || []).filter((e) => e.status === "completed");
    const todayActive = (allActive || []).filter((e) => {
      const ci = e.clock_in;
      return ci >= todayStart && ci <= todayEnd;
    });

    let hoursToday = 0;
    for (const e of todayCompleted) {
      const h = computeHours(e.clock_in, e.clock_out, e.break_minutes || 0);
      if (h) hoursToday += h;
    }
    // Add estimated hours for active shifts
    const now = new Date().toISOString();
    for (const e of todayActive) {
      const h = computeHours(e.clock_in, now, e.break_minutes || 0);
      if (h) hoursToday += h;
    }
    hoursToday = Math.round(hoursToday * 10) / 10;

    let weeklyHours = 0;
    for (const e of (weekEntries || [])) {
      const h = computeHours(e.clock_in, e.clock_out, e.break_minutes || 0);
      if (h) weeklyHours += h;
    }
    // Add active hours to weekly total
    for (const e of (allActive || [])) {
      const h = computeHours(e.clock_in, now, e.break_minutes || 0);
      if (h) weeklyHours += h;
    }
    weeklyHours = Math.round(weeklyHours * 10) / 10;

    // Format entries
    const formatted = (entries || []).map((e) => {
      const staff = staffMap.get(e.staff_id);
      return {
        id: e.id,
        venueId: e.venue_id,
        staffId: e.staff_id,
        staffName: staff ? `${staff.first_name} ${staff.last_name}` : "Unknown",
        staffRole: staff?.role || "",
        clockIn: e.clock_in,
        clockOut: e.clock_out,
        breakMinutes: e.break_minutes || 0,
        notes: e.notes,
        status: e.status,
        hoursWorked: computeHours(e.clock_in, e.clock_out, e.break_minutes || 0),
      };
    });

    const activeStaffIds = new Set((allActive || []).map((e) => e.staff_id));

    // Build staff list for dropdowns (reuse allStaff, filter active only)
    const activeStaffList = (allStaff || [])
      .filter((s) => {
        // Check if staff is active (we don't have 'active' in this query, so include all)
        return true;
      })
      .sort((a, b) => a.first_name.localeCompare(b.first_name));

    return NextResponse.json({
      entries: formatted,
      kpis: {
        staffOnClock,
        hoursToday,
        totalStaff: totalStaff || 0,
        weeklyHours,
      },
      staff: activeStaffList.map((s) => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        role: s.role,
        isClockedIn: activeStaffIds.has(s.id),
      })),
    });
  } catch (err) {
    console.error("Time clock GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json({ success: true, entryId: "demo-entry-001" });
  try {
    const currentStaff = await getCurrentStaff();
    if (!currentStaff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const venueId = await getVenueId();
    const supabase = createAdminClient();
    const body = await request.json();
    const { action, staffId, clockIn, clockOut, breakMinutes, notes } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    switch (action) {
      case "clock_in": {
        if (!staffId) {
          return NextResponse.json({ error: "Missing staffId" }, { status: 400 });
        }

        // Check if staff already has an active entry
        const { data: existing } = await supabase
          .from("time_entries")
          .select("id")
          .eq("staff_id", staffId)
          .eq("venue_id", venueId)
          .eq("status", "active")
          .single();

        if (existing) {
          return NextResponse.json({ error: "Staff member is already clocked in" }, { status: 409 });
        }

        const { data: entry, error: insertError } = await supabase
          .from("time_entries")
          .insert({
            venue_id: venueId,
            staff_id: staffId,
            clock_in: new Date().toISOString(),
            status: "active",
            created_by: currentStaff.id,
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("Clock in error:", insertError);
          return NextResponse.json({ error: "Failed to clock in" }, { status: 500 });
        }

        return NextResponse.json({ success: true, entryId: entry?.id });
      }

      case "clock_out": {
        if (!staffId) {
          return NextResponse.json({ error: "Missing staffId" }, { status: 400 });
        }

        // Find the active entry
        const { data: activeEntry, error: findError } = await supabase
          .from("time_entries")
          .select("id, clock_in")
          .eq("staff_id", staffId)
          .eq("venue_id", venueId)
          .eq("status", "active")
          .single();

        if (findError || !activeEntry) {
          return NextResponse.json({ error: "No active shift found for this staff member" }, { status: 404 });
        }

        const clockOutTime = new Date().toISOString();

        const { error: updateError } = await supabase
          .from("time_entries")
          .update({
            clock_out: clockOutTime,
            status: "completed",
            updated_at: clockOutTime,
          })
          .eq("id", activeEntry.id);

        if (updateError) {
          console.error("Clock out error:", updateError);
          return NextResponse.json({ error: "Failed to clock out" }, { status: 500 });
        }

        return NextResponse.json({ success: true, entryId: activeEntry.id });
      }

      case "manual_entry": {
        if (!staffId || !clockIn || !clockOut) {
          return NextResponse.json({ error: "Missing staffId, clockIn, or clockOut" }, { status: 400 });
        }

        // Validate times
        const ciDate = new Date(clockIn);
        const coDate = new Date(clockOut);
        if (coDate <= ciDate) {
          return NextResponse.json({ error: "Clock out must be after clock in" }, { status: 400 });
        }

        const { data: entry, error: insertError } = await supabase
          .from("time_entries")
          .insert({
            venue_id: venueId,
            staff_id: staffId,
            clock_in: clockIn,
            clock_out: clockOut,
            break_minutes: breakMinutes || 0,
            notes: notes || null,
            status: "completed",
            created_by: currentStaff.id,
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("Manual entry error:", insertError);
          return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
        }

        return NextResponse.json({ success: true, entryId: entry?.id });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    console.error("Time clock POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
