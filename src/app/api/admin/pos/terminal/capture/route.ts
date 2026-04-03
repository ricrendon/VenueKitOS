import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";

export async function POST(request: Request) {
  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    return NextResponse.json({
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("Terminal capture error:", err);
    return NextResponse.json({ error: "Failed to capture payment" }, { status: 500 });
  }
}
