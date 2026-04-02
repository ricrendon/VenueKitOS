"use client";

import { Button, Card, CardContent, Accordion } from "@/components/ui";
import { Check, ArrowRight, Star } from "lucide-react";
import { useVenue } from "@/components/providers/venue-provider";

const defaultPlans = [
  {
    id: "basic",
    name: "Explorer",
    monthly_price: 29,
    description: "Perfect for occasional visitors",
    features: [
      "4 open play sessions per month",
      "5% off party packages",
      "1 guest pass per month",
      "Priority booking",
      "Digital waiver on file",
    ],
    max_children: 1,
  },
  {
    id: "family",
    name: "Family",
    monthly_price: 49,
    description: "Best value for regular families",
    features: [
      "Unlimited open play sessions",
      "10% off all party packages",
      "2 guest passes per month",
      "Priority booking",
      "Digital waivers on file",
      "Free sibling add-on (up to 3 kids)",
    ],
    max_children: 3,
  },
  {
    id: "vip",
    name: "VIP",
    monthly_price: 79,
    description: "The ultimate play experience",
    features: [
      "Unlimited open play for whole family",
      "15% off all party packages",
      "4 guest passes per month",
      "Early access to events",
      "Priority booking",
      "Free birthday party room upgrade",
      "Exclusive member events",
    ],
    max_children: 5,
  },
];

const defaultFaqs = [
  { id: "1", question: "Can I cancel or pause my membership?", answer: "Yes! You can pause for up to 2 months per year or cancel anytime. Changes take effect at the end of your current billing cycle." },
  { id: "2", question: "How do guest passes work?", answer: "Guest passes let you bring a friend's child for free during your visit. Unused passes don't roll over. The guest still needs a signed waiver." },
  { id: "3", question: "Can I upgrade my plan?", answer: "Absolutely. You can upgrade at any time and the price difference will be prorated. Downgrades take effect at the next billing cycle." },
  { id: "4", question: "Is there a contract?", answer: "No contracts. Memberships are month-to-month. Cancel anytime with no fees or penalties." },
];

export default function MembershipsPage() {
  const { membershipPlans: dbPlans, venue } = useVenue();
  const wc = venue?.website_content as Record<string, unknown> | undefined;
  const faqData = wc?.faq as { categories?: { title: string; items: { id: string; question: string; answer: string }[] }[] } | undefined;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const plans: any[] = dbPlans.length ? dbPlans : defaultPlans;

  // Get membership FAQs from the Memberships category, or fallback
  const membershipFaqCat = faqData?.categories?.find((c) => c.title === "Memberships");
  const faqs = membershipFaqCat?.items?.length ? membershipFaqCat.items : defaultFaqs;

  // Mark the middle plan as popular if 3 plans exist
  const popularIndex = plans.length === 3 ? 1 : -1;

  return (
    <div className="pt-24 pb-16">
      <div className="container-content">
        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="font-display text-h1 md:text-display-l text-ink">Play more, save more</h1>
          <p className="mt-3 text-body-l text-ink-secondary max-w-2xl mx-auto">
            Join the family and enjoy unlimited play, party discounts, guest passes, and priority booking. No contracts, cancel anytime.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan: any, idx: number) => {
            const isPopular = idx === popularIndex;
            const price = plan.monthly_price;
            const featureList: string[] = Array.isArray(plan.features) ? plan.features : [];
            return (
              <Card
                key={plan.id}
                className={`relative ${isPopular ? "border-terracotta ring-2 ring-terracotta/20" : ""}`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-terracotta text-white text-caption font-medium px-3 py-1 rounded-pill flex items-center gap-1">
                    <Star className="h-3 w-3 fill-white" /> Best value
                  </span>
                )}
                <CardContent className="pt-2">
                  <h3 className="font-display text-h3 text-ink">{plan.name}</h3>
                  <p className="text-body-s text-ink-secondary">{plan.description}</p>
                  <div className="mt-4">
                    <span className="font-display text-display-l text-terracotta">${price}</span>
                    <span className="text-body-s text-ink-secondary">/month</span>
                  </div>
                  <p className="text-caption text-ink-secondary mt-1">Up to {plan.max_children} children</p>

                  <ul className="mt-6 space-y-3">
                    {featureList.map((f: string) => (
                      <li key={f} className="flex items-start gap-2 text-body-s text-ink-secondary">
                        <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isPopular ? "primary" : "secondary"}
                    className="w-full mt-6"
                    size="lg"
                  >
                    Join {plan.name} <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-20">
          <h2 className="font-display text-h2 text-ink text-center mb-8">Membership FAQs</h2>
          <Accordion items={faqs} />
        </div>
      </div>
    </div>
  );
}
