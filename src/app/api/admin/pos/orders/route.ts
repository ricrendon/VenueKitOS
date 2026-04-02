import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVenueId } from "@/lib/utils/venue";
import { stripe } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

interface CartItem {
  sourceId: string;
  sourceType: "menu_item" | "product";
  name: string;
  quantity: number;
  unitPrice: number;
}

// POST — complete a POS order
export async function POST(request: NextRequest) {
  try {
    const venueId = await getVenueId();
    const body = await request.json();
    const {
      items,            // CartItem[]
      paymentMethod,    // "cash" | "card" | "gift_card" | "split"
      giftCardCode,     // optional
      giftCardAmount,   // optional
      memberId,         // optional parent_id
      discountAmount,   // optional member discount
      stripePaymentMethodId, // optional — client-side Stripe PM id for card payments
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Calculate totals
    const subtotal = (items as CartItem[]).reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const taxRate = 0.08;
    const discount = Number(discountAmount) || 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Number((taxableAmount * taxRate).toFixed(2));
    const total = Number((taxableAmount + tax).toFixed(2));

    // --- Stripe card charge ---
    let stripePaymentIntentId: string | null = null;
    if (paymentMethod === "card" && stripePaymentMethodId) {
      const amountCents = Math.round(total * 100);
      const pi = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: "usd",
        payment_method: stripePaymentMethodId,
        confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
        metadata: {
          venue_id: venueId,
          parent_id: memberId || "",
          source: "venuekitos_pos",
        },
      });
      stripePaymentIntentId = pi.id;
    }

    // --- Gift card redemption ---
    if (giftCardCode && giftCardAmount && Number(giftCardAmount) > 0) {
      const { data: gc } = await supabase
        .from("gift_cards")
        .select("id, current_balance, status")
        .eq("code", giftCardCode.trim().toUpperCase())
        .eq("venue_id", venueId)
        .maybeSingle();

      if (!gc || gc.status !== "active") {
        return NextResponse.json({ error: "Gift card not valid" }, { status: 400 });
      }

      const redeem = Math.min(Number(giftCardAmount), Number(gc.current_balance), total);
      const newBalance = Number(gc.current_balance) - redeem;
      const newStatus = newBalance === 0 ? "redeemed" : "active";

      await supabase
        .from("gift_cards")
        .update({ current_balance: newBalance, status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", gc.id);

      await supabase.from("gift_card_transactions").insert({
        gift_card_id: gc.id,
        type: "redemption",
        amount: redeem,
        balance_after: newBalance,
        reference_type: "pos",
        notes: "POS sale",
      });
    }

    // --- Create order record ---
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        venue_id: venueId,
        parent_id: memberId || null,
        subtotal,
        tax,
        discount,
        total,
        payment_method: paymentMethod || "cash",
        status: "completed",
        stripe_payment_intent_id: stripePaymentIntentId,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // --- Order items ---
    const orderItems = (items as CartItem[]).map((item) => ({
      order_id: order.id,
      product_id: item.sourceType === "product" ? item.sourceId : null,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: Number((item.unitPrice * item.quantity).toFixed(2)),
    }));

    await supabase.from("order_items").insert(orderItems);

    // --- Decrement inventory for physical products ---
    const productItems = (items as CartItem[]).filter((i) => i.sourceType === "product");
    for (const item of productItems) {
      const { data: prod } = await supabase
        .from("products")
        .select("id, quantity_on_hand")
        .eq("id", item.sourceId)
        .single();

      if (prod) {
        const newQty = Math.max(0, (prod.quantity_on_hand || 0) - item.quantity);
        await supabase
          .from("products")
          .update({ quantity_on_hand: newQty, updated_at: new Date().toISOString() })
          .eq("id", item.sourceId);

        await supabase.from("stock_transactions").insert({
          product_id: item.sourceId,
          type: "sold",
          quantity_change: -item.quantity,
          quantity_after: newQty,
          reference_type: "pos",
          reference_id: order.id,
        });
      }
    }

    return NextResponse.json({ success: true, orderId: order.id, total, stripePaymentIntentId });
  } catch (err) {
    console.error("POS orders POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET — recent order history
export async function GET() {
  try {
    const venueId = await getVenueId();
    const supabase = createAdminClient();

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id, subtotal, tax, discount, total, payment_method, status, created_at,
        stripe_payment_intent_id,
        parent:parent_accounts(first_name, last_name),
        order_items(name, quantity, unit_price, total)
      `)
      .eq("venue_id", venueId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    return NextResponse.json({
      orders: (orders || []).map((o) => {
        const parent = Array.isArray(o.parent) ? o.parent[0] : o.parent;
        return {
          id: o.id,
          total: o.total,
          subtotal: o.subtotal,
          tax: o.tax,
          discount: o.discount,
          paymentMethod: o.payment_method,
          status: o.status,
          createdAt: o.created_at,
          stripePaymentIntentId: o.stripe_payment_intent_id,
          parentName: parent ? `${parent.first_name} ${parent.last_name}` : null,
          items: o.order_items || [],
        };
      }),
    });
  } catch (err) {
    console.error("POS orders GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
