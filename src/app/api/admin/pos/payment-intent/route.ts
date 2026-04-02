import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { getVenueId } from "@/lib/utils/venue";

export const dynamic = "force-dynamic";

// POST — create a Stripe PaymentIntent for a card POS transaction
// The client uses this to confirm payment via Stripe.js before submitting the order
export async function POST(request: NextRequest) {
  try {
    const venueId = await getVenueId();
    const body = await request.json();
    const { amount, memberId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    const amountCents = Math.round(Number(amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        venue_id: venueId,
        parent_id: memberId || "",
        source: "venuekitos_pos",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("PaymentIntent create error:", err);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}
