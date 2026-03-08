import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

const DEFAULT_CATEGORIES = [
  "Socks",
  "Food & Beverage",
  "Merchandise",
  "Party Supplies",
  "Operational",
];

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data } = await supabase
      .from("products")
      .select("category")
      .eq("venue_id", VENUE_ID)
      .not("category", "is", null);

    const dbCategories = Array.from(new Set((data || []).map((p) => p.category as string)));
    const all = Array.from(new Set([...DEFAULT_CATEGORIES, ...dbCategories])).sort();

    return NextResponse.json({ categories: all });
  } catch (err) {
    console.error("Categories GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
