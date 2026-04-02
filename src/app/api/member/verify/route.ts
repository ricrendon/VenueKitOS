import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVenueId } from "@/lib/utils/venue";

export const dynamic = "force-dynamic";

// GET /api/member/verify?code=MBR-XXXXXXXX
// Public endpoint — used by Square webhooks, kiosk scanners, NFC readers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: "code parameter is required" }, { status: 400 });
    }

    const venueId = await getVenueId();
    const supabase = createAdminClient();

    // Look up the pass
    const { data: pass, error: passError } = await supabase
      .from("member_passes")
      .select(`
        id, pass_code, pass_type, active,
        parent:parent_accounts(id, first_name, last_name, email, phone)
      `)
      .eq("pass_code", code)
      .eq("venue_id", venueId)
      .maybeSingle();

    if (passError) {
      console.error("Member verify error:", passError);
      return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
    }

    if (!pass) {
      return NextResponse.json({ valid: false, error: "Pass not found" }, { status: 404 });
    }

    if (!pass.active) {
      return NextResponse.json({ valid: false, error: "Pass is inactive" }, { status: 200 });
    }

    const parent = Array.isArray(pass.parent) ? pass.parent[0] : pass.parent;

    // Get active membership + plan for discount tier
    const { data: membership } = await supabase
      .from("memberships")
      .select(`
        id, status,
        membership_plans(id, name, party_discount, guest_passes, includes_open_play)
      `)
      .eq("parent_id", parent?.id)
      .eq("venue_id", venueId)
      .eq("status", "active")
      .maybeSingle();

    const plan = membership
      ? (Array.isArray(membership.membership_plans)
          ? membership.membership_plans[0]
          : membership.membership_plans)
      : null;

    return NextResponse.json({
      valid: true,
      pass: {
        id: pass.id,
        passCode: pass.pass_code,
        passType: pass.pass_type,
      },
      member: {
        id: parent?.id,
        name: parent ? `${parent.first_name} ${parent.last_name}` : "Unknown",
        email: parent?.email || "",
        phone: parent?.phone || "",
      },
      membership: membership
        ? {
            id: membership.id,
            status: membership.status,
            planName: plan?.name || "Unknown",
            partyDiscount: plan?.party_discount || 0,
            guestPasses: plan?.guest_passes || 0,
            includesOpenPlay: plan?.includes_open_play ?? false,
          }
        : null,
    });
  } catch (err) {
    console.error("Member verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
