import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

function generateGiftCardCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "GC-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// GET — public balance check by code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: giftCard, error } = await supabase
      .from("gift_cards")
      .select("code, initial_value, current_balance, status, expires_at")
      .eq("code", code)
      .eq("venue_id", VENUE_ID)
      .single();

    if (error || !giftCard) {
      return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
    }

    return NextResponse.json({
      giftCard: {
        code: giftCard.code,
        initialValue: Number(giftCard.initial_value),
        currentBalance: Number(giftCard.current_balance),
        status: giftCard.status,
        expiresAt: giftCard.expires_at,
      },
    });
  } catch (err) {
    console.error("Gift card balance check error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — public gift card purchase (pay at venue)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      purchaserName,
      purchaserEmail,
      recipientName,
      recipientEmail,
      message,
    } = body;

    if (!amount || amount < 10 || amount > 500) {
      return NextResponse.json({ error: "Amount must be between $10 and $500" }, { status: 400 });
    }
    if (!purchaserName || !purchaserEmail) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Generate unique code with retry
    let code = generateGiftCardCode();
    const { data: existing } = await supabase
      .from("gift_cards")
      .select("id")
      .eq("code", code)
      .single();

    if (existing) {
      code = generateGiftCardCode();
    }

    // Calculate expiration (1 year from now)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const { data: giftCard, error: insertError } = await supabase
      .from("gift_cards")
      .insert({
        venue_id: VENUE_ID,
        code,
        initial_value: amount,
        current_balance: amount,
        status: "active",
        purchaser_name: purchaserName,
        purchaser_email: purchaserEmail.toLowerCase(),
        recipient_name: recipientName || null,
        recipient_email: recipientEmail?.toLowerCase() || null,
        message: message || null,
        payment_method: "pay_at_venue",
        expires_at: expiresAt.toISOString(),
      })
      .select("id, code, initial_value, current_balance, status, expires_at, created_at")
      .single();

    if (insertError || !giftCard) {
      console.error("Public gift card purchase error:", insertError);
      return NextResponse.json({ error: "Failed to create gift card" }, { status: 500 });
    }

    // Create purchase transaction
    await supabase.from("gift_card_transactions").insert({
      gift_card_id: giftCard.id,
      type: "purchase",
      amount,
      balance_after: amount,
      reference_type: "manual",
      notes: "Online purchase — pay at venue",
    });

    return NextResponse.json({
      success: true,
      giftCard: {
        code: giftCard.code,
        initialValue: Number(giftCard.initial_value),
        currentBalance: Number(giftCard.current_balance),
        status: giftCard.status,
        expiresAt: giftCard.expires_at,
      },
    });
  } catch (err) {
    console.error("Public gift card purchase error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
