import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";

export async function POST(request: Request) {
  try {
    const { amount, orderId } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: "usd",
      payment_method_types: ["card_present"],
      capture_method: "automatic",
      metadata: orderId ? { order_id: orderId } : {},
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("Terminal payment intent error:", err);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}
