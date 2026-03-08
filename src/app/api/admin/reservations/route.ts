import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLocalToday, formatStoredTime } from "@/lib/utils/timezone";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";
const VENUE_TZ = "America/Chicago";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // all, today, upcoming

    let query = supabase
      .from("bookings")
      .select("*, parent:parent_accounts(first_name, last_name, email)")
      .eq("venue_id", VENUE_ID)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    const today = getLocalToday(VENUE_TZ);
    if (filter === "today") {
      query = query.eq("date", today);
    } else if (filter === "upcoming") {
      query = query.gte("date", today);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Reservations API error:", error);
      return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
    }

    const formatted = (data || []).map((b) => {
      const parent = b.parent as { first_name: string; last_name: string; email: string } | null;
      const time = b.start_time
        ? formatStoredTime(b.start_time)
        : "";

      return {
        id: b.id,
        parentName: parent ? `${parent.first_name} ${parent.last_name}` : "Unknown",
        parentEmail: parent?.email || "",
        date: b.date,
        time,
        childCount: b.child_count || 0,
        adultCount: b.adult_count || 0,
        type: b.type === "party" ? "Party" : "Open Play",
        status: b.status,
        paymentStatus: b.payment_status,
        total: b.total || 0,
        confirmationCode: b.confirmation_code || "",
      };
    });

    return NextResponse.json({ reservations: formatted });
  } catch (err) {
    console.error("Reservations API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
