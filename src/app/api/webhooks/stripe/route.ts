import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// POST — Stripe webhook receiver
// Events handled:
//   customer.subscription.updated  → sync status to memberships table
//   customer.subscription.deleted  → mark membership cancelled
//   invoice.payment_succeeded      → update next_billing_date
//   invoice.payment_failed         → mark membership past_due
//   payment_intent.succeeded       → mark order completed (if not already)
export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!sig || !webhookSecret || webhookSecret === "whsec_placeholder") {
      // Dev mode — parse raw body without signature verification
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      // ── Subscription events ──────────────────────────────────
      case "customer.subscription.updated": {
        const sub = event.data.object as { id: string; status: string };
        const stripeStatus = sub.status;
        const dbStatus =
          stripeStatus === "active" ? "active"
          : stripeStatus === "paused" ? "paused"
          : stripeStatus === "past_due" ? "past_due"
          : stripeStatus === "canceled" ? "cancelled"
          : null;

        if (dbStatus) {
          await supabase
            .from("memberships")
            .update({ status: dbStatus })
            .eq("stripe_subscription_id", sub.id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as { id: string };
        await supabase
          .from("memberships")
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      // ── Invoice events ───────────────────────────────────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as {
          subscription?: string;
          period_end?: number;
        };
        if (invoice.subscription && invoice.period_end) {
          const nextBilling = new Date(invoice.period_end * 1000)
            .toISOString()
            .split("T")[0];
          await supabase
            .from("memberships")
            .update({ status: "active", next_billing_date: nextBilling })
            .eq("stripe_subscription_id", invoice.subscription);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as { subscription?: string };
        if (invoice.subscription) {
          await supabase
            .from("memberships")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription);
        }
        break;
      }

      // ── PaymentIntent events ─────────────────────────────────
      case "payment_intent.succeeded": {
        const pi = event.data.object as { id: string };
        await supabase
          .from("orders")
          .update({ status: "completed" })
          .eq("stripe_payment_intent_id", pi.id)
          .eq("status", "open");
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as { id: string };
        await supabase
          .from("orders")
          .update({ status: "voided" })
          .eq("stripe_payment_intent_id", pi.id);
        break;
      }

      default:
        // Unhandled event type — acknowledged but not processed
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
