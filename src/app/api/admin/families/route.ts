import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Get parents with children
    const { data: parents, error: parentsError } = await supabase
      .from("parent_accounts")
      .select("*, children(*)")
      .order("created_at", { ascending: false });

    if (parentsError) {
      console.error("Families API error:", parentsError);
      return NextResponse.json({ error: "Failed to fetch families" }, { status: 500 });
    }

    const formatted = (parents || []).map((p) => ({
      id: p.id,
      firstName: p.first_name,
      lastName: p.last_name,
      email: p.email,
      phone: p.phone,
      hasAuth: !!p.auth_user_id,
      createdAt: p.created_at,
      children: (p.children || []).map((c: Record<string, unknown>) => ({
        id: c.id,
        firstName: c.first_name,
        lastName: c.last_name,
        dateOfBirth: c.date_of_birth,
        allergies: c.allergies,
        avatarColor: c.avatar_color,
      })),
    }));

    return NextResponse.json({ families: formatted });
  } catch (err) {
    console.error("Families API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
