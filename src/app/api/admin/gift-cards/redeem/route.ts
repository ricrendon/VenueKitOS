import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

// POST — redeem gift card balance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, amount, referenceType, referenceId, notes } = body;

    if (!code || !amount || amount <= 0) {
      return NextResponse.json({ error: "Code and positive amount are required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Look up gift card
    const { data: giftCard, error: lookupError } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("venue_id", VENUE_ID)
      .single();

    if (lookupError || !giftCard) {
      return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
    }

    if (giftCard.status !== "active") {
      return NextResponse.json({ error: `Gift card is ${giftCard.status}` }, { status: 400 });
    }

    const currentBalance = Number(giftCard.current_balance);
    if (amount > currentBalance) {
      return NextResponse.json({
        error: `Insufficient balance. Available: $${currentBalance.toFixed(2)}`,
      }, { status: 400 });
    }

    // Try to use the atomic function first, fall back to manual update
    const { data: rpcResult, error: rpcError } = await supabase.rpc("redeem_gift_card", {
      p_gift_card_id: giftCard.id,
      p_amount: amount,
      p_reference_type: referenceType || null,
      p_reference_id: referenceId || null,
      p_notes: notes || null,
      p_created_by: null,
    });

    if (rpcError) {
      // Fallback: manual update if RPC function doesn't exist yet
      console.warn("RPC fallback:", rpcError.message);

      const newBalance = currentBalance - amount;
      const newStatus = newBalance === 0 ? "redeemed" : "active";

      await supabase
        .from("gift_cards")
        .update({
          current_balance: newBalance,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", giftCard.id);

      await supabase.from("gift_card_transactions").insert({
        gift_card_id: giftCard.id,
        type: "redemption",
        amount,
        balance_after: newBalance,
        reference_type: referenceType || "manual",
        reference_id: referenceId || null,
        notes: notes || null,
      });

      return NextResponse.json({
        success: true,
        newBalance,
        status: newStatus,
      });
    }

    const result = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;
    return NextResponse.json({
      success: true,
      newBalance: Number(result?.new_balance ?? 0),
      status: result?.new_status ?? "active",
    });
  } catch (err) {
    console.error("Gift card redeem error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
