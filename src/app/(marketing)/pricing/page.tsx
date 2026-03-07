import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing — VenueKit OS",
  description: "Simple, transparent pricing for venue operators. One flat monthly rate — software, support, and hardware lease all included.",
};

const plans = [
  {
    name: "Starter",
    price: "$149",
    period: "/mo",
    tagline: "For single-location venues getting started.",
    cta: "Start free trial",
    ctaHref: "/get-demo",
    featured: false,
  },
  {
    name: "Professional",
    price: "$299",
    period: "/mo",
    tagline: "The complete VenueKit OS experience.",
    cta: "Request a demo",
    ctaHref: "/get-demo",
    featured: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    tagline: "Multi-location operators & franchise groups.",
    cta: "Talk to sales",
    ctaHref: "/get-demo",
    featured: false,
  },
];

const features = [
  { label: "Venue locations", starter: "1", pro: "Up to 3", enterprise: "Unlimited" },
  { label: "Online booking (open play)", starter: true, pro: true, enterprise: true },
  { label: "Online booking (parties)", starter: true, pro: true, enterprise: true },
  { label: "QR check-in system", starter: true, pro: true, enterprise: true },
  { label: "Digital waivers", starter: true, pro: true, enterprise: true },
  { label: "Parent portal", starter: true, pro: true, enterprise: true },
  { label: "Membership module", starter: false, pro: true, enterprise: true },
  { label: "Party management suite", starter: false, pro: true, enterprise: true },
  { label: "POS software", starter: true, pro: true, enterprise: true },
  { label: "Hardware lease (all devices)", starter: false, pro: true, enterprise: true },
  { label: "Advanced analytics & reports", starter: false, pro: true, enterprise: true },
  { label: "Stripe payment processing", starter: true, pro: true, enterprise: true },
  { label: "Email & SMS notifications", starter: true, pro: true, enterprise: true },
  { label: "Support", starter: "Email", pro: "Priority", enterprise: "Dedicated CSM" },
  { label: "Onboarding", starter: "Self-serve", pro: "Guided call", enterprise: "Full concierge" },
  { label: "White-label branding", starter: false, pro: false, enterprise: true },
  { label: "Custom integrations", starter: false, pro: false, enterprise: true },
  { label: "SLA uptime guarantee", starter: "99.5%", pro: "99.9%", enterprise: "99.99%" },
];

function FeatureCell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check size={16} strokeWidth={2.5} className="text-success mx-auto" />
    ) : (
      <Minus size={16} strokeWidth={2} className="text-ink/15 mx-auto" />
    );
  }
  return <span className="text-body-s text-ink/70">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="bg-cream">
      {/* Hero */}
      <section className="bg-ink pt-28 pb-20">
        <div className="container-wide text-center">
          <p className="text-caption font-semibold text-terracotta uppercase tracking-widest mb-4">Pricing</p>
          <h1 className="font-display font-semibold text-white text-[42px] md:text-[56px] leading-tight mb-5">
            One price. Everything included.
          </h1>
          <p className="text-body-l text-white/55 max-w-2xl mx-auto">
            No setup fees. No per-transaction cuts. No surprise bills. Your monthly subscription covers software, support, and your full hardware lease.
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section className="section-padding-lg">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-8 relative ${
                  plan.featured
                    ? "bg-ink border-ink shadow-[0_20px_60px_rgba(31,29,26,0.2)]"
                    : "bg-white border-cream-300"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-terracotta text-white text-caption font-semibold rounded-pill">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <p className={`font-display font-semibold text-h4 mb-2 ${plan.featured ? "text-white" : "text-ink"}`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className={`font-display font-bold text-[44px] leading-none ${plan.featured ? "text-white" : "text-ink"}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={plan.featured ? "text-white/50 text-body-m" : "text-ink/40 text-body-m"}>{plan.period}</span>
                  )}
                </div>
                <p className={`text-body-s mb-7 ${plan.featured ? "text-white/55" : "text-ink/50"}`}>{plan.tagline}</p>
                <Link
                  href={plan.ctaHref}
                  className={`block w-full py-3 rounded-md text-body-s font-medium text-center transition-all ${
                    plan.featured
                      ? "bg-terracotta text-white hover:bg-terracotta-hover"
                      : "bg-cream text-ink border border-cream-300 hover:border-ink/30 hover:bg-cream-200"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-body-s text-ink/40 mt-6">
            All plans include a 30-day free trial · No credit card required
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-[#F0EBE4] section-padding-lg">
        <div className="container-wide">
          <h2 className="font-display text-h2 text-ink text-center mb-10">Full comparison</h2>

          <div className="bg-white rounded-xl border border-cream-300 shadow-card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-4 gap-0 border-b border-cream-300">
              <div className="px-6 py-4" />
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`px-6 py-4 text-center ${plan.featured ? "bg-ink" : ""}`}
                >
                  <p className={`font-display font-semibold text-h4 ${plan.featured ? "text-white" : "text-ink"}`}>
                    {plan.name}
                  </p>
                  <p className={`text-caption ${plan.featured ? "text-white/40" : "text-ink/40"}`}>
                    {plan.price}{plan.period}
                  </p>
                </div>
              ))}
            </div>

            {/* Rows */}
            {features.map((feature, i) => (
              <div
                key={feature.label}
                className={`grid grid-cols-4 gap-0 border-b border-cream-200 last:border-0 ${i % 2 === 0 ? "" : "bg-cream-50/50"}`}
              >
                <div className="px-6 py-3.5 flex items-center">
                  <span className="text-body-s text-ink/70">{feature.label}</span>
                </div>
                <div className="px-6 py-3.5 flex items-center justify-center">
                  <FeatureCell value={feature.starter} />
                </div>
                <div className="px-6 py-3.5 flex items-center justify-center bg-ink/3">
                  <FeatureCell value={feature.pro} />
                </div>
                <div className="px-6 py-3.5 flex items-center justify-center">
                  <FeatureCell value={feature.enterprise} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-cream section-padding-lg">
        <div className="container-wide max-w-3xl">
          <h2 className="font-display text-h2 text-ink text-center mb-10">Pricing FAQ</h2>
          <div className="flex flex-col divide-y divide-cream-300">
            {[
              {
                q: "Is there a setup fee?",
                a: "No. There are no setup fees, activation fees, or hidden charges. You pay the flat monthly rate and nothing else.",
              },
              {
                q: "Does VenueKit OS take a cut of my transactions?",
                a: "No. We charge a flat monthly subscription. Stripe's standard processing fees apply to payments (2.9% + $0.30 per transaction), but VenueKit OS takes nothing on top.",
              },
              {
                q: "What happens to the hardware if I cancel?",
                a: "Leased hardware is returned to us. We'll send prepaid return boxes and arrange pickup at no cost to you.",
              },
              {
                q: "Can I change plans later?",
                a: "Yes, you can upgrade or downgrade at any time. Changes take effect at the next billing cycle.",
              },
              {
                q: "Is there a long-term contract?",
                a: "No long-term contracts required. Plans are month-to-month. Annual billing is available at a 15% discount.",
              },
            ].map((faq) => (
              <div key={faq.q} className="py-5">
                <p className="font-display font-semibold text-h4 text-ink mb-2">{faq.q}</p>
                <p className="text-body-m text-ink/60 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#F0EBE4] section-padding-lg">
        <div className="container-wide">
          <div className="bg-ink rounded-2xl px-10 py-14 text-center">
            <h2 className="font-display text-h2 text-white mb-4">Start your free trial today</h2>
            <p className="text-body-l text-white/50 mb-8 max-w-lg mx-auto">30 days free, no credit card. Get a demo and see the platform live with your venue&apos;s data.</p>
            <Link
              href="/get-demo"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-terracotta text-white font-medium rounded-md hover:bg-terracotta-hover transition-colors text-body-m"
            >
              Request a Demo
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
