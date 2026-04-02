import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "$149",
    period: "/month",
    tagline: "For single-location venues getting started with digital operations.",
    cta: "Get started",
    ctaHref: "/get-demo",
    featured: false,
    features: [
      { label: "1 venue location", included: true },
      { label: "Online bookings & reservations", included: true },
      { label: "QR check-in", included: true },
      { label: "Digital waivers", included: true },
      { label: "Parent portal", included: true },
      { label: "POS (software only)", included: true },
      { label: "Email support", included: true },
      { label: "Hardware lease", included: false },
      { label: "Party management suite", included: false },
      { label: "Membership module", included: false },
      { label: "Advanced analytics", included: false },
      { label: "Dedicated onboarding", included: false },
    ],
  },
  {
    name: "Professional",
    price: "$299",
    period: "/month",
    tagline: "The full VenueKit OS experience — software and hardware, all-in.",
    cta: "Request a demo",
    ctaHref: "/get-demo",
    featured: true,
    badge: "Most Popular",
    features: [
      { label: "Up to 3 venue locations", included: true },
      { label: "Online bookings & reservations", included: true },
      { label: "QR check-in", included: true },
      { label: "Digital waivers", included: true },
      { label: "Parent portal", included: true },
      { label: "Full POS with hardware", included: true },
      { label: "Priority support", included: true },
      { label: "Hardware lease (all devices)", included: true },
      { label: "Party management suite", included: true },
      { label: "Membership module", included: true },
      { label: "Advanced analytics", included: true },
      { label: "Dedicated onboarding call", included: true },
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    tagline: "For multi-location operators and franchise groups with custom needs.",
    cta: "Talk to sales",
    ctaHref: "/get-demo",
    featured: false,
    features: [
      { label: "Unlimited locations", included: true },
      { label: "Online bookings & reservations", included: true },
      { label: "QR check-in", included: true },
      { label: "Digital waivers", included: true },
      { label: "Parent portal", included: true },
      { label: "Full POS with hardware", included: true },
      { label: "24/7 dedicated support", included: true },
      { label: "Hardware lease (all devices)", included: true },
      { label: "Party management suite", included: true },
      { label: "Membership module", included: true },
      { label: "Custom analytics & exports", included: true },
      { label: "White-label branding", included: true },
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-cream section-padding-lg">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-caption font-semibold text-terracotta uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="font-display text-h1 text-ink mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-body-l text-ink/55">
            No setup fees. No per-transaction cuts. One flat monthly rate that covers your software, support, and hardware lease.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-xl border p-7 relative",
                plan.featured
                  ? "bg-ink border-ink shadow-[0_20px_60px_rgba(31,29,26,0.2)] lg:-mt-4 lg:mb-4"
                  : "bg-white border-cream-300"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-terracotta text-white text-caption font-semibold rounded-pill shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className={cn("font-display font-semibold text-h4 mb-1", plan.featured ? "text-white" : "text-ink")}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className={cn("font-display font-bold text-[42px] leading-none", plan.featured ? "text-white" : "text-ink")}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={cn("text-body-m", plan.featured ? "text-white/50" : "text-ink/40")}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={cn("text-body-s leading-relaxed", plan.featured ? "text-white/60" : "text-ink/55")}>
                  {plan.tagline}
                </p>
              </div>

              <Link
                href={plan.ctaHref}
                className={cn(
                  "block w-full py-3 rounded-md text-body-s font-medium text-center transition-all duration-200 mb-7",
                  plan.featured
                    ? "bg-terracotta text-white hover:bg-terracotta-hover shadow-sm"
                    : "bg-cream text-ink border border-cream-300 hover:border-ink/30 hover:bg-cream-200"
                )}
              >
                {plan.cta}
              </Link>

              <ul className="flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-3">
                    {f.included ? (
                      <Check
                        size={15}
                        strokeWidth={2.5}
                        className={plan.featured ? "text-terracotta shrink-0" : "text-success shrink-0"}
                      />
                    ) : (
                      <Minus size={15} strokeWidth={2} className="text-ink/20 shrink-0" />
                    )}
                    <span className={cn(
                      "text-body-s",
                      plan.featured
                        ? f.included ? "text-white/80" : "text-white/25"
                        : f.included ? "text-ink/70" : "text-ink/25"
                    )}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-body-s text-ink/40 mt-8">
          All plans include a 30-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
