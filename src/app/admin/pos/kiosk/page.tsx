"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, Badge } from "@/components/ui";
import {
  ShoppingCart, Plus, Minus, Trash2, Search,
  CreditCard, Banknote, Gift, QrCode, Loader2,
  CheckCircle, X, Receipt, History, ChevronLeft,
  Wifi,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface POSItem {
  id: string;
  sourceId: string;
  sourceType: "menu_item" | "product";
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  stock?: number;
}

interface CartItem extends POSItem {
  quantity: number;
}

interface MemberInfo {
  id: string;
  name: string;
  email: string;
  membership: {
    planName: string;
    partyDiscount: number;
    includesOpenPlay: boolean;
  } | null;
}

interface OrderRecord {
  id: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  parentName: string | null;
  items: { name: string; quantity: number; unit_price: number; total: number }[];
}

type View = "pos" | "history";
type PaymentMethod = "cash" | "card" | "gift_card" | "split";

export default function POSKioskPage() {
  const [items, setItems] = useState<POSItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("pos");

  // Member lookup
  const [memberCode, setMemberCode] = useState("");
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [memberLookupLoading, setMemberLookupLoading] = useState(false);
  const [memberError, setMemberError] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardAmount, setGiftCardAmount] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<{ id: string; total: number } | null>(null);

  // History
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const memberCodeRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pos/products");
      const json = await res.json();
      setItems(json.items || []);
      const cats = ["All", ...(json.categories || [])];
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/admin/pos/orders");
      const json = await res.json();
      setOrders(json.orders || []);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (view === "history") fetchHistory();
  }, [view, fetchHistory]);

  const addToCart = (item: POSItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => c.id === id ? { ...c, quantity: c.quantity + delta } : c)
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setMember(null);
    setMemberCode("");
    setMemberError("");
    setGiftCardCode("");
    setGiftCardAmount("");
    setPaymentMethod("cash");
  };

  const lookupMember = async () => {
    if (!memberCode.trim()) return;
    setMemberLookupLoading(true);
    setMemberError("");
    setMember(null);
    try {
      const res = await fetch(`/api/member/verify?code=${encodeURIComponent(memberCode.trim())}`);
      const json = await res.json();
      if (!json.valid) {
        setMemberError(json.error || "Invalid pass");
      } else {
        setMember({
          id: json.member.id,
          name: json.member.name,
          email: json.member.email,
          membership: json.membership
            ? {
                planName: json.membership.planName,
                partyDiscount: json.membership.partyDiscount,
                includesOpenPlay: json.membership.includesOpenPlay,
              }
            : null,
        });
      }
    } catch {
      setMemberError("Lookup failed");
    } finally {
      setMemberLookupLoading(false);
    }
  };

  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const memberDiscount =
    member?.membership?.partyDiscount
      ? Number(((subtotal * member.membership.partyDiscount) / 100).toFixed(2))
      : 0;
  const taxableAmount = Math.max(0, subtotal - memberDiscount);
  const tax = Number((taxableAmount * 0.08).toFixed(2));
  const total = Number((taxableAmount + tax).toFixed(2));

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/admin/pos/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((c) => ({
            sourceId: c.sourceId,
            sourceType: c.sourceType,
            name: c.name,
            quantity: c.quantity,
            unitPrice: c.price,
          })),
          paymentMethod,
          giftCardCode: paymentMethod === "gift_card" || paymentMethod === "split" ? giftCardCode : undefined,
          giftCardAmount: paymentMethod === "gift_card" ? total : giftCardAmount ? Number(giftCardAmount) : undefined,
          memberId: member?.id || undefined,
          discountAmount: memberDiscount,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setOrderComplete({ id: json.orderId, total: json.total });
        clearCart();
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-cream-50 border-b border-cream-300">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pos"
            className="flex items-center gap-1.5 text-ink-secondary hover:text-ink transition-colors text-body-s"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Deli
          </Link>
          <span className="text-cream-300">|</span>
          <ShoppingCart className="h-5 w-5 text-terracotta" />
          <h1 className="font-display text-h3 text-ink">Deli Kiosk</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("pos")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-body-s transition-colors ${
              view === "pos" ? "bg-terracotta text-white" : "border border-cream-300 text-ink hover:bg-cream-100"
            }`}
          >
            <ShoppingCart className="h-4 w-4" /> POS
          </button>
          <button
            onClick={() => setView("history")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-body-s transition-colors ${
              view === "history" ? "bg-terracotta text-white" : "border border-cream-300 text-ink hover:bg-cream-100"
            }`}
          >
            <History className="h-4 w-4" /> History
          </button>
        </div>
      </div>

      {/* Order complete overlay */}
      {orderComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40">
          <div className="bg-white rounded-sm shadow-xl p-8 max-w-sm w-full mx-4 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="font-display text-h3 text-ink">Order Complete</h2>
            <p className="text-body-m text-ink-secondary">
              Total charged: <span className="font-medium text-ink">${orderComplete.total.toFixed(2)}</span>
            </p>
            <p className="text-caption text-ink-secondary font-mono">{orderComplete.id.slice(0, 8).toUpperCase()}</p>
            <button
              onClick={() => setOrderComplete(null)}
              className="w-full px-4 py-2 bg-terracotta text-white text-body-s rounded-sm hover:bg-terracotta/90 transition-colors"
            >
              New Order
            </button>
          </div>
        </div>
      )}

      {view === "history" ? (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-3">
            <h2 className="font-display text-h3 text-ink mb-4">Recent Orders</h2>
            {historyLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-terracotta" /></div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Receipt className="h-10 w-10 text-ink-secondary mx-auto mb-3" />
                  <p className="text-body-s text-ink-secondary">No orders yet.</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id}>
                  <CardContent>
                    <button
                      className="w-full text-left"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-body-s text-ink font-medium">
                            ${Number(order.total).toFixed(2)}
                            {order.parentName && (
                              <span className="text-ink-secondary font-normal ml-2">— {order.parentName}</span>
                            )}
                          </p>
                          <p className="text-caption text-ink-secondary">
                            {format(new Date(order.createdAt), "MMM d, yyyy · h:mm a")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-[10px] capitalize">{order.paymentMethod?.replace("_", " ")}</Badge>
                          <Badge variant="success" className="text-[10px]">{order.status}</Badge>
                        </div>
                      </div>
                    </button>
                    {expandedOrder === order.id && (
                      <div className="mt-3 pt-3 border-t border-cream-200 space-y-1.5">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-caption text-ink-secondary">
                            <span>{item.quantity}× {item.name}</span>
                            <span>${Number(item.total).toFixed(2)}</span>
                          </div>
                        ))}
                        {Number(order.discount) > 0 && (
                          <div className="flex justify-between text-caption text-green-600">
                            <span>Member discount</span>
                            <span>-${Number(order.discount).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-caption text-ink-secondary">
                          <span>Tax</span>
                          <span>${Number(order.tax).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-body-s text-ink font-medium border-t border-cream-200 pt-1.5 mt-1">
                          <span>Total</span>
                          <span>${Number(order.total).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Products grid */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-cream-300">
            {/* Search + category filter */}
            <div className="px-4 pt-4 pb-2 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary" />
                <input
                  type="text"
                  placeholder="Search items…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-sm border border-cream-300 bg-cream-50 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 px-3 py-1 rounded-full text-caption font-medium transition-colors ${
                      activeCategory === cat
                        ? "bg-terracotta text-white"
                        : "bg-cream-200 text-ink hover:bg-cream-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="h-10 w-10 text-ink-secondary mx-auto mb-3" />
                  <p className="text-body-s text-ink-secondary">No items found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addToCart(item)}
                      className="group text-left p-3 bg-white border border-cream-300 rounded-sm hover:border-terracotta hover:shadow-sm transition-all"
                    >
                      <div className="aspect-square mb-2 rounded-sm overflow-hidden bg-cream-200 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingCart className="h-7 w-7 text-ink-secondary/40" />
                        )}
                      </div>
                      <p className="text-body-s text-ink font-medium truncate group-hover:text-terracotta transition-colors">
                        {item.name}
                      </p>
                      <p className="text-body-s text-terracotta font-medium">${item.price.toFixed(2)}</p>
                      {item.stock !== undefined && (
                        <p className="text-caption text-ink-secondary">{item.stock} in stock</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart + checkout panel */}
          <div className="w-80 xl:w-96 flex flex-col bg-cream-50">
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-h4 text-ink">Cart</h2>
                {cart.length > 0 && (
                  <button onClick={clearCart} className="text-caption text-ink-secondary hover:text-red-500 transition-colors">
                    Clear all
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-8 w-8 text-ink-secondary/40 mx-auto mb-2" />
                  <p className="text-caption text-ink-secondary">Add items to begin</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 bg-white border border-cream-200 rounded-sm p-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-body-s text-ink font-medium truncate">{item.name}</p>
                      <p className="text-caption text-terracotta">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.id, -1)} className="p-1 rounded-sm hover:bg-cream-200 text-ink-secondary transition-colors">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-body-s text-ink font-medium">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-1 rounded-sm hover:bg-cream-200 text-ink-secondary transition-colors">
                        <Plus className="h-3 w-3" />
                      </button>
                      <button onClick={() => removeFromCart(item.id)} className="p-1 rounded-sm hover:bg-red-50 text-ink-secondary hover:text-red-500 transition-colors ml-1">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout section */}
            {cart.length > 0 && (
              <div className="border-t border-cream-300 p-4 space-y-4">
                {/* Member scan */}
                <div className="space-y-2">
                  <p className="text-label text-ink-secondary font-medium uppercase tracking-wide text-[10px]">Member Pass (optional)</p>
                  {member ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-sm px-3 py-2">
                      <div>
                        <p className="text-body-s text-ink font-medium">{member.name}</p>
                        {member.membership && (
                          <p className="text-caption text-green-700">{member.membership.planName} · {member.membership.partyDiscount}% discount</p>
                        )}
                      </div>
                      <button onClick={() => { setMember(null); setMemberCode(""); }} className="text-ink-secondary hover:text-ink">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <QrCode className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-secondary" />
                        <input
                          ref={memberCodeRef}
                          type="text"
                          placeholder="Scan or type pass code…"
                          value={memberCode}
                          onChange={(e) => setMemberCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === "Enter" && lookupMember()}
                          className="w-full pl-7 pr-2 py-1.5 rounded-sm border border-cream-300 text-caption text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30 bg-white"
                        />
                      </div>
                      <button
                        onClick={lookupMember}
                        disabled={memberLookupLoading || !memberCode.trim()}
                        className="px-2.5 py-1.5 bg-ink text-white rounded-sm text-caption disabled:opacity-50 hover:bg-ink/90 transition-colors"
                      >
                        {memberLookupLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Go"}
                      </button>
                    </div>
                  )}
                  {memberError && <p className="text-caption text-red-500">{memberError}</p>}
                </div>

                {/* Totals */}
                <div className="space-y-1">
                  <div className="flex justify-between text-caption text-ink-secondary">
                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                  </div>
                  {memberDiscount > 0 && (
                    <div className="flex justify-between text-caption text-green-600">
                      <span>Member discount</span><span>-${memberDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-caption text-ink-secondary">
                    <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-body-s text-ink font-semibold border-t border-cream-300 pt-1.5 mt-1">
                    <span>Total</span><span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment method */}
                <div className="space-y-1.5">
                  <p className="text-label text-ink-secondary font-medium uppercase tracking-wide text-[10px]">Payment</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {([
                      { key: "cash", label: "Cash", icon: Banknote },
                      { key: "card", label: "Card", icon: CreditCard },
                      { key: "gift_card", label: "Gift Card", icon: Gift },
                      { key: "split", label: "Split", icon: Wifi },
                    ] as { key: PaymentMethod; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setPaymentMethod(key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-sm text-caption border transition-colors ${
                          paymentMethod === key
                            ? "border-terracotta bg-terracotta/10 text-terracotta font-medium"
                            : "border-cream-300 text-ink-secondary hover:border-ink/30"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {(paymentMethod === "gift_card" || paymentMethod === "split") && (
                    <div className="space-y-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="Gift card code…"
                        value={giftCardCode}
                        onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 rounded-sm border border-cream-300 text-caption text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30 bg-white"
                      />
                      {paymentMethod === "split" && (
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary text-caption">$</span>
                          <input
                            type="number"
                            placeholder="Amount from gift card…"
                            min="0"
                            step="0.01"
                            value={giftCardAmount}
                            onChange={(e) => setGiftCardAmount(e.target.value)}
                            className="w-full pl-6 pr-3 py-1.5 rounded-sm border border-cream-300 text-caption text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30 bg-white"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-terracotta text-white text-body-s font-medium rounded-sm hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
                >
                  {checkoutLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Charge ${total.toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
