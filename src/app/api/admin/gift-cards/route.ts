import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockGiftCards } from "@/lib/mock/data";

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

// GET — list gift cards with KPIs, search, and status filter
export async function GET(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json(mockGiftCards);
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const supabase = createAdminClient();

    // Filtered query for display
    let query = supabase
      .from("gift_cards")
      .select("*")
      .eq("venue_id", VENUE_ID)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(
        `code.ilike.%${search}%,purchaser_email.ilike.%${search}%,recipient_email.ilike.%${search}%,recipient_name.ilike.%${search}%,purchaser_name.ilike.%${search}%`
      );
    }

    const { data: giftCards, error } = await query;

    if (error) {
      console.error("Gift cards GET error:", error);
      return NextResponse.json({ error: "Failed to fetch gift cards" }, { status: 500 });
    }

    // KPIs — unfiltered
    const { data: allCards } = await supabase
      .from("gift_cards")
      .select("id, status, current_balance, initial_value")
      .eq("venue_id", VENUE_ID);

    const cards = allCards || [];
    const activeCards = cards.filter((c) => c.status === "active");
    const redeemedCards = cards.filter((c) => c.status === "redeemed");
    const activeBalance = activeCards.reduce((sum, c) => sum + Number(c.current_balance), 0);

    return NextResponse.json({
      giftCards: (giftCards || []).map((gc) => ({
        id: gc.id,
        code: gc.code,
        initialValue: Number(gc.initial_value),
        currentBalance: Number(gc.current_balance),
        status: gc.status,
        purchaserName: gc.purchaser_name,
        purchaserEmail: gc.purchaser_email,
        recipientName: gc.recipient_name,
        recipientEmail: gc.recipient_email,
        message: gc.message,
        paymentMethod: gc.payment_method,
        purchasedAt: gc.purchased_at,
        expiresAt: gc.expires_at,
        createdAt: gc.created_at,
      })),
      kpis: {
        totalActive: activeCards.length,
        activeBalance: Number(activeBalance.toFixed(2)),
        totalRedeemed: redeemedCards.length,
        totalIssued: cards.length,
      },
    });
  } catch (err) {
    console.error("Gift cards GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — issue a new gift card
export async function POST(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json({ success: true, giftCard: { id: "gc-demo", code: "GC-DEMO01", initialValue: 50, currentBalance: 50, status: "active", purchaserName: "Demo User", purchaserEmail: "demo@example.com", recipientName: null, recipientEmail: null, createdAt: new Date().toISOString() } });
  try {
    const body = await request.json();
    const {
      initialValue,
      purchaserName,
      purchaserEmail,
      recipientName,
      recipientEmail,
      message,
      expiresAt,
      paymentMethod = "in_store",
    } = body;

    if (!initialValue || initialValue < 1) {
      return NextResponse.json({ error: "Invalid gift card amount" }, { status: 400 });
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
      code = generateGiftCardCode(); // retry once
    }

    const { data: giftCard, error: insertError } = await supabase
      .from("gift_cards")
      .insert({
        venue_id: VENUE_ID,
        code,
        initial_value: initialValue,
        current_balance: initialValue,
        status: "active",
        purchaser_name: purchaserName || null,
        purchaser_email: purchaserEmail || null,
        recipient_name: recipientName || null,
        recipient_email: recipientEmail || null,
        message: message || null,
        payment_method: paymentMethod,
        expires_at: expiresAt || null,
      })
      .select("*")
      .single();

    if (insertError || !giftCard) {
      console.error("Gift card insert error:", insertError);
      return NextResponse.json({ error: "Failed to create gift card" }, { status: 500 });
    }

    // Create initial purchase transaction
    await supabase.from("gift_card_transactions").insert({
      gift_card_id: giftCard.id,
      type: "purchase",
      amount: initialValue,
      balance_after: initialValue,
      reference_type: "manual",
      notes: `Gift card issued — ${paymentMethod}`,
    });

    return NextResponse.json({
      success: true,
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
        createdAt: giftCard.created_at,
      },
    });
  } catch (err) {
    console.error("Gift card POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
