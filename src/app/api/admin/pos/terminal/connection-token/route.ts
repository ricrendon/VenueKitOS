import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";

export async function POST() {
  try {
    const token = await stripe.terminal.connectionTokens.create();
    return NextResponse.json({ secret: token.secret });
  } catch (err) {
    console.error("Terminal connection token error:", err);
    return NextResponse.json({ error: "Failed to create connection token" }, { status: 500 });
  }
}
