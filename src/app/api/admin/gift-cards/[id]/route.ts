import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

// GET — gift card detail with transactions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: giftCard, error } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("id", id)
      .eq("venue_id", VENUE_ID)
      .single();

    if (error || !giftCard) {
      return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
    }

    const { data: transactions } = await supabase
      .from("gift_card_transactions")
      .select("*")
      .eq("gift_card_id", id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        initialValue: Number(giftCard.initial_value),
        currentBalance: Number(giftCard.current_balance),
        status: giftCard.status,
        purchaserName: giftCard.purchaser_name,
        purchaserEmail: giftCard.purchaser_email,
        recipientName: giftCard.recipient_name,
        recipientEmail: giftCard.recipient_email,
        message: giftCard.message,
        paymentMethod: giftCard.payment_method,
        purchasedAt: giftCard.purchased_at,
        expiresAt: giftCard.expires_at,
        createdAt: giftCard.created_at,
      },
      transactions: (transactions || []).map((t) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        balanceAfter: Number(t.balance_after),
        referenceType: t.reference_type,
        referenceId: t.reference_id,
        notes: t.notes,
        createdAt: t.created_at,
      })),
    });
  } catch (err) {
    console.error("Gift card detail GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — adjust balance or toggle status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, amount, notes } = body;

    const supabase = createAdminClient();

    // Fetch current card
    const { data: giftCard, error: fetchError } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("id", id)
      .eq("venue_id", VENUE_ID)
      .single();

    if (fetchError || !giftCard) {
      return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
    }

    if (action === "disable") {
      await supabase
        .from("gift_cards")
        .update({ status: "disabled", updated_at: new Date().toISOString() })
        .eq("id", id);

      return NextResponse.json({ success: true, status: "disabled" });
    }

    if (action === "enable") {
      const newStatus = Number(giftCard.current_balance) === 0 ? "redeemed" : "active";
      await supabase
        .from("gift_cards")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      return NextResponse.json({ success: true, status: newStatus });
    }

    if (action === "adjust") {
      if (!amount || amount === 0) {
        return NextResponse.json({ error: "Amount is required" }, { status: 400 });
      }

      const currentBalance = Number(giftCard.current_balance);
      const newBalance = currentBalance + amount; // amount can be negative (deduct) or positive (add)

      if (newBalance < 0) {
        return NextResponse.json({ error: "Cannot deduct more than current balance" }, { status: 400 });
      }

      const newStatus = newBalance === 0 ? "redeemed" : "active";

      await supabase
        .from("gift_cards")
        .update({
          current_balance: newBalance,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      // Create adjustment transaction
      await supabase.from("gift_card_transactions").insert({
        gift_card_id: id,
        type: "adjustment",
        amount: Math.abs(amount),
        balance_after: newBalance,
        reference_type: "manual",
        notes: notes || (amount > 0 ? "Balance added" : "Balance deducted"),
      });

      return NextResponse.json({
        success: true,
        currentBalance: newBalance,
        status: newStatus,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Gift card PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
