import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVenueId } from "@/lib/utils/venue";

export const dynamic = "force-dynamic";

function generatePassCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "MBR-";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// GET — list all member passes with parent + membership info
export async function GET() {
  try {
    const venueId = await getVenueId();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("member_passes")
      .select(`
        id, pass_code, pass_type, active, created_at,
        parent:parent_accounts(id, first_name, last_name, email, phone)
      `)
      .eq("venue_id", venueId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Passes GET error:", error);
      return NextResponse.json({ error: "Failed to fetch passes" }, { status: 500 });
    }

    // Enrich with membership status
    const parentIds = (data || []).map((p) => {
      const parent = Array.isArray(p.parent) ? p.parent[0] : p.parent;
      return parent?.id;
    }).filter(Boolean);

    const { data: memberships } = await supabase
      .from("memberships")
      .select("parent_id, status, membership_plans(name, party_discount)")
      .in("parent_id", parentIds)
      .eq("status", "active");

    const membershipMap: Record<string, { planName: string; discount: number }> = {};
    for (const m of memberships || []) {
      const plan = Array.isArray(m.membership_plans) ? m.membership_plans[0] : m.membership_plans;
      membershipMap[m.parent_id] = {
        planName: plan?.name || "Unknown",
        discount: plan?.party_discount || 0,
      };
    }

    const passes = (data || []).map((p) => {
      const parent = Array.isArray(p.parent) ? p.parent[0] : p.parent;
      return {
        id: p.id,
        passCode: p.pass_code,
        passType: p.pass_type,
        active: p.active,
        createdAt: p.created_at,
        parentId: parent?.id,
        parentName: parent ? `${parent.first_name} ${parent.last_name}` : "Unknown",
        parentEmail: parent?.email || "",
        parentPhone: parent?.phone || "",
        membership: membershipMap[parent?.id] || null,
      };
    });

    return NextResponse.json({ passes });
  } catch (err) {
    console.error("Passes GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — generate (or regenerate) a pass for a parent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parentId, passType = "qr" } = body;

    if (!parentId) {
      return NextResponse.json({ error: "parentId is required" }, { status: 400 });
    }

    const venueId = await getVenueId();
    const supabase = createAdminClient();

    // Generate unique code
    let passCode = generatePassCode();
    const { data: existing } = await supabase
      .from("member_passes")
      .select("id")
      .eq("pass_code", passCode)
      .maybeSingle();
    if (existing) passCode = generatePassCode();

    // Upsert — one pass per parent per venue
    const { data: pass, error } = await supabase
      .from("member_passes")
      .upsert(
        { venue_id: venueId, parent_id: parentId, pass_code: passCode, pass_type: passType, active: true },
        { onConflict: "venue_id,parent_id" }
      )
      .select("id, pass_code, pass_type, active, created_at")
      .single();

    if (error || !pass) {
      console.error("Pass upsert error:", error);
      return NextResponse.json({ error: "Failed to generate pass" }, { status: 500 });
    }

    return NextResponse.json({ success: true, pass });
  } catch (err) {
    console.error("Passes POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
