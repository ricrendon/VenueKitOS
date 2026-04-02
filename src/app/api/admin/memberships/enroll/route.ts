import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVenueId } from "@/lib/utils/venue";
import { stripe } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

// POST — enroll a parent in a membership plan (creates Stripe Subscription)
export async function POST(request: NextRequest) {
  try {
    const venueId = await getVenueId();
    const body = await request.json();
    const { parentId, planId, startDate, stripePaymentMethodId } = body;

    if (!parentId || !planId) {
      return NextResponse.json({ error: "parentId and planId are required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify plan belongs to this venue
    const { data: plan, error: planError } = await supabase
      .from("membership_plans")
      .select("id, name, monthly_price, stripe_price_id")
      .eq("id", planId)
      .eq("venue_id", venueId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Fetch parent info for Stripe customer
    const { data: parent } = await supabase
      .from("parent_accounts")
      .select("id, first_name, last_name, email")
      .eq("id", parentId)
      .single();

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    const enrollDate = startDate || new Date().toISOString().split("T")[0];
    const start = new Date(enrollDate + "T12:00:00");
    start.setMonth(start.getMonth() + 1);
    const nextBilling = start.toISOString().split("T")[0];

    // Cancel any existing active/paused membership
    await supabase
      .from("memberships")
      .update({ status: "cancelled" })
      .eq("parent_id", parentId)
      .eq("venue_id", venueId)
      .in("status", ["active", "paused"]);

    // --- Stripe: create or retrieve customer + subscription ---
    let stripeCustomerId: string | null = null;
    let stripeSubscriptionId: string | null = null;

    if (stripePaymentMethodId && plan.stripe_price_id) {
      // Create or find Stripe customer
      const existingCustomers = await stripe.customers.list({
        email: parent.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: parent.email,
          name: `${parent.first_name} ${parent.last_name}`,
          metadata: { parent_id: parentId, venue_id: venueId },
        });
        stripeCustomerId = customer.id;
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(stripePaymentMethodId, {
        customer: stripeCustomerId,
      });
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: { default_payment_method: stripePaymentMethodId },
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: plan.stripe_price_id }],
        metadata: { parent_id: parentId, venue_id: venueId, plan_id: planId },
      });
      stripeSubscriptionId = subscription.id;
    }

    // Insert membership record
    const { data: membership, error } = await supabase
      .from("memberships")
      .insert({
        parent_id: parentId,
        plan_id: planId,
        venue_id: venueId,
        status: "active",
        start_date: enrollDate,
        next_billing_date: nextBilling,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
      })
      .select("id, status, start_date, next_billing_date")
      .single();

    if (error || !membership) {
      console.error("Enroll error:", error);
      return NextResponse.json({ error: "Failed to enroll member" }, { status: 500 });
    }

    // Auto-generate a member pass
    await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/admin/passes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId, passType: "qr" }),
      }
    ).catch(() => {/* non-critical */});

    return NextResponse.json({ success: true, membership, stripeSubscriptionId });
  } catch (err) {
    console.error("Enroll POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
