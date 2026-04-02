import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockGiftCards } from "@/lib/mock/data";
import { getVenueId } from "@/lib/utils/venue";

export const dynamic = "force-dynamic";


// GET — lookup gift card by code for redemption
export async function GET(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json({ giftCard: mockGiftCards.giftCards[0] });
  try {
      const venueId = await getVenueId();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: giftCard, error } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("code", code)
      .eq("venue_id", venueId)
      .single();

    if (error || !giftCard) {
      return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
    }

    return NextResponse.json({
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        initialValue: Number(giftCard.initial_value),
        currentBalance: Number(giftCard.current_balance),
        status: giftCard.status,
        recipientName: giftCard.recipient_name,
        purchaserName: giftCard.purchaser_name,
        expiresAt: giftCard.expires_at,
      },
    });
  } catch (err) {
    console.error("Gift card lookup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
