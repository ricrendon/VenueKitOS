import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

// GET — list children for a parent
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authUserId = searchParams.get("authUserId");

    if (!authUserId) {
      return NextResponse.json({ error: "Missing authUserId" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Find parent
    const { data: parent } = await supabase
      .from("parent_accounts")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single();

    if (!parent) {
      return NextResponse.json({ children: [] });
    }

    // Get children + their waivers
    const [childrenRes, waiversRes] = await Promise.all([
      supabase
        .from("children")
        .select("id, first_name, last_name, date_of_birth, allergies, special_needs")
        .eq("parent_id", parent.id)
        .order("first_name"),
      supabase
        .from("waivers")
        .select("id, child_id, status, signed_at, expires_at")
        .eq("parent_id", parent.id)
        .eq("venue_id", VENUE_ID),
    ]);

    const children = (childrenRes.data || []).map((c) => {
      const dob = new Date(c.date_of_birth);
      const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      const waiver = (waiversRes.data || []).find((w) => w.child_id === c.id);
      return {
        id: c.id,
        firstName: c.first_name,
        lastName: c.last_name,
        dateOfBirth: c.date_of_birth,
        age,
        allergies: c.allergies,
        specialNeeds: c.special_needs,
        waiverStatus: waiver?.status || "unsigned",
        waiverSignedAt: waiver?.signed_at || null,
        waiverExpiresAt: waiver?.expires_at || null,
      };
    });

    return NextResponse.json({ children });
  } catch (err) {
    console.error("Portal children GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — add a new child
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authUserId, firstName, lastName, dateOfBirth, allergies, specialNeeds } = body;

    if (!authUserId || !firstName || !lastName || !dateOfBirth) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: parent } = await supabase
      .from("parent_accounts")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single();

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    const { data: child, error } = await supabase
      .from("children")
      .insert({
        parent_id: parent.id,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        allergies: allergies || null,
        special_needs: specialNeeds || null,
      })
      .select("id, first_name, last_name, date_of_birth")
      .single();

    if (error) {
      console.error("Add child error:", error);
      return NextResponse.json({ error: "Failed to add child" }, { status: 500 });
    }

    return NextResponse.json({ success: true, child });
  } catch (err) {
    console.error("Portal children POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
