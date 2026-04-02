import Link from "next/link";
import { Monitor, CreditCard, Scan, Printer, ArrowRight } from "lucide-react";

const hardware = [
  {
    icon: Monitor,
    name: "Check-In Tablet",
    tagline: "Wall-mounted or freestanding",
    description: "Pre-configured tablet station for fast guest check-in, QR scanning, and waiver signing at the entrance.",
    included: ["10\" industrial-grade display", "Mounting hardware", "Pre-installed VenueKit app"],
    color: "border-terracotta/20 bg-terracotta/4",
    iconColor: "bg-terracotta/10 text-terracotta",
  },
  {
    icon: CreditCard,
    name: "POS Terminal",
    tagline: "Full payment processing",
    description: "All-in-one POS device for cafe sales, retail, party add-ons, and membership upgrades at the desk.",
    included: ["Card reader (tap/chip/swipe)", "Cash drawer integration", "Receipt printer port"],
    color: "border-dusty-blue/20 bg-dusty-blue/4",
    iconColor: "bg-dusty-blue/10 text-dusty-blue",
  },
  {
    icon: Scan,
    name: "Wristband Scanner",
    tagline: "RFID & barcode support",
    description: "Handheld scanner for checking wristbands on the floor, verifying membership status, and tracking activity.",
    included: ["Wireless Bluetooth", "8-hour battery life", "Compatible with all wristband types"],
    color: "border-sage/20 bg-sage/4",
    iconColor: "bg-sage/10 text-sage",
  },
  {
    icon: Printer,
    name: "Receipt Printer",
    tagline: "Thermal, fast & quiet",
    description: "Compact thermal printer for POS receipts, booking confirmations, and wristband tickets.",
    included: ["Thermal (no ink cartridges)", "Network or USB", "Auto-cutter included"],
    color: "border-mustard/20 bg-mustard/4",
    iconColor: "bg-mustard/10 text-warning",
  },
];

export function HardwareTeaser() {
  return (
    <section id="hardware" className="bg-[#F0EBE4] section-padding-lg">
      <div className="container-wide">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <p className="text-caption font-semibold text-terracotta uppercase tracking-widest mb-3">
              Hardware leasing
            </p>
            <h2 className="font-display text-h1 text-ink mb-4">
              Lease the hardware.<br />Skip the hassle.
            </h2>
            <p className="text-body-l text-ink/55">
              Every device comes pre-configured and ready to plug in. No IT team required — just unbox, connect, and open for business.
            </p>
          </div>
          <Link
            href="/hardware"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white text-body-s font-medium rounded-md hover:bg-ink/85 transition-colors shrink-0"
          >
            See full hardware details
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {hardware.map((hw) => {
            const Icon = hw.icon;
            return (
              <div
                key={hw.name}
                className={`bg-white rounded-lg border ${hw.color} p-5 hover:shadow-card transition-all duration-200`}
              >
                <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-4 ${hw.iconColor}`}>
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <p className="font-display font-semibold text-h4 text-ink mb-0.5">{hw.name}</p>
                <p className="text-caption text-ink/40 mb-3">{hw.tagline}</p>
                <p className="text-body-s text-ink/55 mb-4 leading-relaxed">{hw.description}</p>
                <ul className="flex flex-col gap-1.5">
                  {hw.included.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-body-s text-ink/55">
                      <span className="w-1 h-1 rounded-full bg-terracotta mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom callout */}
        <div className="bg-ink rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-display text-h3 text-white mb-2">All hardware included in Professional & Enterprise plans</p>
            <p className="text-body-m text-white/50">Lease, don&apos;t buy. Hardware is maintained, replaced, and upgraded as part of your subscription.</p>
          </div>
          <Link
            href="/hardware"
            className="shrink-0 px-6 py-3 bg-terracotta text-white text-body-s font-medium rounded-md hover:bg-terracotta-hover transition-colors"
          >
            Learn about leasing
          </Link>
        </div>
      </div>
    </section>
  );
}
