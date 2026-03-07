"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { CreditCard, Loader2, Check, Star, ArrowRight } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { format } from "date-fns";

interface MembershipData {
  membership: {
    id: string;
    status: string;
    nextBillingDate: string;
    plan: {
      name: string;
      monthlyPrice: number;
      maxChildren: number;
      includesOpenPlay: boolean;
      partyDiscount: number;
      guestPasses: number;
    } | null;
  } | null;
}

const plans = [
  {
    name: "Explorer",
    price: 29,
    features: ["4 sessions/month", "5% party discount", "1 guest pass/month", "1 child"],
    popular: false,
  },
  {
    name: "Family",
    price: 49,
    features: ["Unlimited play", "10% party discount", "2 guest passes/month", "Up to 3 kids"],
    popular: true,
  },
  {
    name: "VIP",
    price: 79,
    features: ["Unlimited family play", "15% party discount", "4 guest passes/month", "Up to 5 kids"],
    popular: false,
  },
];

export default function PortalMembershipsPage() {
  const [data, setData] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        return;
      }

      fetch(`/api/portal/dashboard?authUserId=${user.id}`)
        .then((res) => res.json())
        .then((json) => {
          setData({ membership: json.membership });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  const membership = data?.membership;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-h1 text-ink">Membership</h1>
        <p className="text-body-m text-ink-secondary">Manage your membership plan and benefits.</p>
      </div>

      {/* Current membership */}
      {membership?.plan ? (
        <div>
          <h2 className="font-display text-h3 text-ink mb-4">Your current plan</h2>
          <Card className="bg-gradient-to-r from-terracotta to-coral text-white">
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-white/80" />
                    <h3 className="font-display text-h3 text-white">{membership.plan.name} Plan</h3>
                    <Badge className="bg-white/20 text-white border-white/30">Active</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2">
                    <div>
                      <p className="text-body-s text-white/70">Monthly price</p>
                      <p className="text-body-m text-white font-medium">${membership.plan.monthlyPrice}/mo</p>
                    </div>
                    <div>
                      <p className="text-body-s text-white/70">Children covered</p>
                      <p className="text-body-m text-white font-medium">Up to {membership.plan.maxChildren}</p>
                    </div>
                    <div>
                      <p className="text-body-s text-white/70">Next billing</p>
                      <p className="text-body-m text-white font-medium">
                        {membership.nextBillingDate
                          ? format(new Date(membership.nextBillingDate + "T12:00:00"), "MMM d, yyyy")
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-body-s text-white/70">Party discount</p>
                      <p className="text-body-m text-white font-medium">{membership.plan.partyDiscount || 0}% off</p>
                    </div>
                  </div>
                  {membership.plan.includesOpenPlay && (
                    <p className="mt-3 text-body-s text-white/80 flex items-center gap-1">
                      <Check className="h-4 w-4" /> Unlimited open play included
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="text-center py-8">
              <CreditCard className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
              <h3 className="font-display text-h4 text-ink mb-2">No active membership</h3>
              <p className="text-body-s text-ink-secondary max-w-md mx-auto">
                Join a membership plan and save on every visit, get guest passes, and enjoy party discounts.
              </p>
            </CardContent>
          </Card>

          {/* Available plans */}
          <div>
            <h2 className="font-display text-h3 text-ink mb-4">Available plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={plan.popular ? "ring-2 ring-terracotta border-terracotta" : ""}
                >
                  <CardContent className="space-y-4">
                    {plan.popular && (
                      <Badge variant="terracotta" className="text-[11px]">Most Popular</Badge>
                    )}
                    <div>
                      <h3 className="font-display text-h3 text-ink">{plan.name}</h3>
                      <p className="font-display text-h2 text-terracotta mt-1">
                        ${plan.price}<span className="text-body-s text-ink-secondary">/mo</span>
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-body-s text-ink">
                          <Check className="h-4 w-4 text-success shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/memberships" className="block">
                      <Button
                        variant={plan.popular ? "primary" : "secondary"}
                        className="w-full"
                        size="sm"
                      >
                        Learn more <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
