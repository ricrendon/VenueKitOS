import { Package, Plug, Settings, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Package,
    title: "We ship your hardware",
    description:
      "Your pre-configured hardware kit ships directly to your venue. Every device is loaded with VenueKit OS and your venue's settings before it leaves the warehouse.",
    detail: "Estimated delivery: 3–5 business days",
    color: "text-terracotta",
    bg: "bg-terracotta/8 border-terracotta/15",
  },
  {
    number: "02",
    icon: Plug,
    title: "Plug in & power on",
    description:
      "Mount the tablet, connect the POS terminal, and power everything on. No configuration required — devices automatically connect to VenueKit OS.",
    detail: "Setup time: under 30 minutes",
    color: "text-dusty-blue",
    bg: "bg-dusty-blue/8 border-dusty-blue/15",
  },
  {
    number: "03",
    icon: Settings,
    title: "Configure your venue",
    description:
      "Walk through our guided setup wizard to enter your hours, capacity limits, party packages, pricing, and waiver. We'll also help import any existing customer data.",
    detail: "Includes onboarding call with our team",
    color: "text-sage",
    bg: "bg-sage/8 border-sage/15",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Open for business",
    description:
      "You're live. Accept bookings, check in guests, run your POS, and track everything in real time from any device — including your phone.",
    detail: "Go live in under 24 hours",
    color: "text-mustard",
    bg: "bg-mustard/8 border-mustard/15",
  },
];

export function PlugAndPlay() {
  return (
    <section id="how-it-works" className="bg-cream section-padding-lg">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-caption font-semibold text-terracotta uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2 className="font-display text-h1 text-ink mb-4">
            From box to bookings in one day
          </h2>
          <p className="text-body-l text-ink/55">
            We designed VenueKit OS for operators — not IT departments. Getting started is genuinely simple.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-terracotta/20 via-sage/30 to-mustard/20 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5 relative z-10">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex flex-col">
                  {/* Icon + number */}
                  <div className={`w-16 h-16 rounded-xl border flex flex-col items-center justify-center mb-5 bg-white shadow-card ${step.bg}`}>
                    <Icon size={22} strokeWidth={1.75} className={step.color} />
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`font-display text-[13px] font-bold ${step.color} opacity-60`}>
                      {step.number}
                    </span>
                    <div className="h-px flex-1 bg-cream-300" />
                  </div>

                  <h3 className="font-display text-h4 text-ink mb-2">{step.title}</h3>
                  <p className="text-body-s text-ink/55 leading-relaxed mb-4 flex-1">{step.description}</p>

                  <div className={`px-3 py-2 rounded-md border text-body-s font-medium ${step.bg} ${step.color}`}>
                    {step.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
