"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  ShoppingCart, Plus, Minus, Trash2, Search,
  CreditCard, Banknote, Gift, QrCode, Loader2,
  CheckCircle, X, Wifi,
} from "lucide-react";

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

type PaymentMethod = "cash" | "card" | "gift_card" | "split";

export default function KioskPage() {
  const [items, setItems] = useState<POSItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Member lookup
  const [memberCode, setMemberCode] = useState("");
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [memberLookupLoading, setMemberLookupLoading] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [showMemberPanel, setShowMemberPanel] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardAmount, setGiftCardAmount] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<{ id: string; total: number } | null>(null);

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

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
    setShowMemberPanel(false);
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
        setShowMemberPanel(false);
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
    <div className="flex flex-col h-dvh bg-cream overflow-hidden">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-3 bg-ink text-white shrink-0">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-5 w-5 text-terracotta" />
          <span className="font-display text-h3 text-cream-50">FoodHub</span>
        </div>
        {member && (
          <div className="flex items-center gap-2 bg-green-700/40 border border-green-500/30 px-3 py-1.5 rounded-sm">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-body-s text-cream-50">{member.name}</span>
            {member.membership && (
              <span className="text-caption text-green-300">· {member.membership.partyDiscount}% off</span>
            )}
            <button onClick={() => { setMember(null); setMemberCode(""); }} className="ml-1 text-cream-300 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </header>

      {/* ── Order complete overlay ── */}
      {orderComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60">
          <div className="bg-white rounded-lg shadow-2xl p-10 max-w-sm w-full mx-6 text-center space-y-5">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h2 className="font-display text-h2 text-ink">Order Complete!</h2>
            <p className="text-body-l text-ink-secondary">
              Total: <span className="font-semibold text-ink text-h3">${orderComplete.total.toFixed(2)}</span>
            </p>
            <p className="text-caption text-ink-secondary font-mono tracking-wider">
              #{orderComplete.id.slice(0, 8).toUpperCase()}
            </p>
            <button
              onClick={() => setOrderComplete(null)}
              className="w-full py-4 bg-terracotta text-white text-body-l font-medium rounded-lg hover:bg-terracotta/90 active:scale-[0.98] transition-all"
            >
              New Order
            </button>
          </div>
        </div>
      )}

      {/* ── Member scan modal ── */}
      {showMemberPanel && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/50">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full mx-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-h3 text-ink">Scan Member Pass</h2>
              <button onClick={() => setShowMemberPanel(false)} className="text-ink-secondary hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-body-s text-ink-secondary">Scan QR code or type the pass code below.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary" />
                <input
                  ref={memberCodeRef}
                  type="text"
                  placeholder="MBR-XXXXXXXX"
                  value={memberCode}
                  onChange={(e) => setMemberCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && lookupMember()}
                  autoFocus
                  className="w-full pl-10 pr-3 py-3 rounded-lg border border-cream-300 text-body-m text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                />
              </div>
              <button
                onClick={lookupMember}
                disabled={memberLookupLoading || !memberCode.trim()}
                className="px-5 py-3 bg-ink text-white rounded-lg text-body-s font-medium disabled:opacity-50 hover:bg-ink/90 transition-colors"
              >
                {memberLookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Look up"}
              </button>
            </div>
            {memberError && <p className="text-body-s text-red-500">{memberError}</p>}
          </div>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: product grid ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search + categories */}
          <div className="px-4 pt-3 pb-2 bg-cream-50 border-b border-cream-300 space-y-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-secondary" />
              <input
                type="text"
                placeholder="Search items…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-cream-300 bg-white text-body-m text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-4 py-2 rounded-full text-body-s font-medium transition-colors ${
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

          {/* Item grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center pt-20">
                <Loader2 className="h-10 w-10 animate-spin text-terracotta" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center pt-20">
                <ShoppingCart className="h-12 w-12 text-ink-secondary/40 mx-auto mb-3" />
                <p className="text-body-m text-ink-secondary">No items found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="group text-left p-4 bg-white border-2 border-cream-200 rounded-xl hover:border-terracotta hover:shadow-md active:scale-[0.97] transition-all"
                  >
                    <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-cream-200 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingCart className="h-8 w-8 text-ink-secondary/30" />
                      )}
                    </div>
                    <p className="text-body-m text-ink font-semibold leading-tight group-hover:text-terracotta transition-colors line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-body-l text-terracotta font-bold mt-1">${item.price.toFixed(2)}</p>
                    {item.stock !== undefined && (
                      <p className="text-caption text-ink-secondary mt-0.5">{item.stock} left</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: cart + checkout ── */}
        <div className="w-80 xl:w-96 flex flex-col bg-cream-50 border-l border-cream-300">

          {/* Cart header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200">
            <h2 className="font-display text-h3 text-ink flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-terracotta" />
              Cart
              {cart.length > 0 && (
                <span className="ml-1 h-6 w-6 rounded-full bg-terracotta text-white text-caption font-bold flex items-center justify-center">
                  {cart.reduce((s, c) => s + c.quantity, 0)}
                </span>
              )}
            </h2>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-body-s text-ink-secondary hover:text-red-500 transition-colors">
                Clear
              </button>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-10 space-y-2">
                <ShoppingCart className="h-12 w-12 text-ink-secondary/20" />
                <p className="text-body-m text-ink-secondary">Tap items to add them</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-white border border-cream-200 rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-body-s text-ink font-semibold truncate">{item.name}</p>
                    <p className="text-body-s text-terracotta font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="h-8 w-8 rounded-full bg-cream-200 flex items-center justify-center hover:bg-cream-300 active:scale-95 transition-all"
                    >
                      <Minus className="h-4 w-4 text-ink" />
                    </button>
                    <span className="w-7 text-center text-body-m text-ink font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="h-8 w-8 rounded-full bg-cream-200 flex items-center justify-center hover:bg-cream-300 active:scale-95 transition-all"
                    >
                      <Plus className="h-4 w-4 text-ink" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="h-8 w-8 rounded-full ml-1 flex items-center justify-center hover:bg-red-50 text-ink-secondary hover:text-red-500 active:scale-95 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout section */}
          {cart.length > 0 && (
            <div className="border-t border-cream-200 px-5 py-4 space-y-4 shrink-0">

              {/* Member button */}
              <button
                onClick={() => setShowMemberPanel(true)}
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border text-body-s font-medium transition-colors ${
                  member
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-cream-300 bg-white text-ink-secondary hover:border-terracotta hover:text-terracotta"
                }`}
              >
                <QrCode className="h-4 w-4" />
                {member ? `${member.name} · ${member.membership?.partyDiscount ?? 0}% off` : "Add member discount"}
              </button>

              {/* Totals */}
              <div className="space-y-1.5 text-body-s">
                <div className="flex justify-between text-ink-secondary">
                  <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                </div>
                {memberDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Member discount</span><span>-${memberDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-ink-secondary">
                  <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-body-l text-ink font-bold border-t border-cream-200 pt-2 mt-1">
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment method */}
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: "cash", label: "Cash", icon: Banknote },
                  { key: "card", label: "Card", icon: CreditCard },
                  { key: "gift_card", label: "Gift Card", icon: Gift },
                  { key: "split", label: "Split", icon: Wifi },
                ] as { key: PaymentMethod; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setPaymentMethod(key)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-body-s font-medium border-2 transition-colors ${
                      paymentMethod === key
                        ? "border-terracotta bg-terracotta/10 text-terracotta"
                        : "border-cream-200 bg-white text-ink-secondary hover:border-ink/20"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              {(paymentMethod === "gift_card" || paymentMethod === "split") && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Gift card code…"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl border border-cream-300 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30 bg-white"
                  />
                  {paymentMethod === "split" && (
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-secondary text-body-s">$</span>
                      <input
                        type="number"
                        placeholder="Gift card amount…"
                        min="0"
                        step="0.01"
                        value={giftCardAmount}
                        onChange={(e) => setGiftCardAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-cream-300 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30 bg-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Charge button */}
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full flex items-center justify-center gap-3 py-5 bg-terracotta text-white text-body-l font-bold rounded-xl hover:bg-terracotta/90 disabled:opacity-50 active:scale-[0.98] transition-all shadow-md"
              >
                {checkoutLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Charge ${total.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
