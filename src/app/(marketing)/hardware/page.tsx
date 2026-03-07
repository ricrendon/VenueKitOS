import type { Metadata } from "next";
import Link from "next/link";
import { Monitor, CreditCard, Scan, Printer, Wifi, Shield, RefreshCw, Headphones, ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Hardware Leasing — VenueKit OS",
  description: "Pre-configured venue hardware — check-in tablets, POS terminals, wristband scanners, and receipt printers. Lease everything. Maintain nothing.",
};

const devices = [
  {
    icon: Monitor,
    name: "Check-In Tablet Station",
    tagline: "The front-door experience your guests deserve",
    description:
      "A wall-mounted or freestanding tablet pre-loaded with the VenueKit OS check-in app. Guests scan their booking QR code, verify their waiver status, and receive their wristband — all in under 10 seconds.",
    specs: [
      "10.1\" industrial-grade touch display",
      "Anti-glare tempered glass",
      "Wall mount & floor stand included",
      "Integrated barcode / QR scanner",
      "Auto-brightness for any lighting",
      "Pre-configured with your venue branding",
    ],
    use: "Entrance check-in, waiver signing, guest lookup",
    iconColor: "bg-terracotta/10 text-terracotta",
    accentColor: "border-terracotta/15",
  },
  {
    icon: CreditCard,
    name: "POS Terminal",
    tagline: "Every sale, every add-on, one device",
    description:
      "A full-featured all-in-one POS device that handles cafe sales, retail, party add-ons, membership upgrades, and deposits. Tap, chip, and swipe payments via Stripe Terminal — no separate hardware needed.",
    specs: [
      "15.6\" HD touchscreen display",
      "Integrated Stripe card reader",
      "Cash drawer port (drawer optional)",
      "Customer-facing display for totals",
      "Ethernet + Wi-Fi connectivity",
      "Pre-loaded VenueKit POS software",
    ],
    use: "Front desk, cafe counter, party add-on sales",
    iconColor: "bg-dusty-blue/10 text-dusty-blue",
    accentColor: "border-dusty-blue/15",
  },
  {
    icon: Scan,
    name: "Wristband Scanner",
    tagline: "Verify guests anywhere on the floor",
    description:
      "A wireless handheld scanner for staff to verify wristbands, look up guest records, or check membership status anywhere in the venue — no cables, no desk required.",
    specs: [
      "Wireless Bluetooth 5.0",
      "8-hour battery life",
      "RFID, NFC, and barcode support",
      "Ruggedized for active environments",
      "Instant sync with VenueKit dashboard",
      "Charging dock included",
    ],
    use: "Floor staff verification, zone access control",
    iconColor: "bg-sage/10 text-sage",
    accentColor: "border-sage/15",
  },
  {
    icon: Printer,
    name: "Thermal Receipt Printer",
    tagline: "Fast, quiet, and ink-free",
    description:
      "A compact thermal printer for POS receipts, booking confirmation printouts, and wristband tickets. No ink cartridges, no jams — just reliable output every time.",
    specs: [
      "Thermal (no ink required)",
      "USB + Ethernet + Wi-Fi",
      "Auto-cutter for clean receipts",
      "80mm paper width (standard)",
      "Print speed: 200mm/s",
      "Compatible with all VenueKit print jobs",
    ],
    use: "POS receipts, booking printouts, wristband tickets",
    iconColor: "bg-mustard/10 text-warning",
    accentColor: "border-mustard/15",
  },
];

const leasePerks = [
  {
    icon: Shield,
    title: "Warranty included",
    description: "Every device is covered for hardware failures, accidental damage, and manufacturer defects — no deductibles.",
  },
  {
    icon: RefreshCw,
    title: "Free replacements",
    description: "If any device fails or becomes obsolete, we ship a replacement. Usually within 2 business days.",
  },
  {
    icon: Wifi,
    title: "Pre-configured",
    description: "Every device ships with your venue's branding, network credentials, and VenueKit OS pre-installed. Plug in and go.",
  },
  {
    icon: Headphones,
    title: "Hardware support",
    description: "Dedicated hardware support line separate from software support. Talk to someone who knows the device.",
  },
];

export default function HardwarePage() {
  return (
    <div className="bg-cream">
      {/* Hero */}
      <section className="bg-ink pt-28 pb-20">
        <div className="container-wide text-center">
          <p className="text-caption font-semibold text-terracotta uppercase tracking-widest mb-4">Hardware leasing</p>
          <h1 className="font-display font-semibold text-white text-[42px] md:text-[56px] leading-tight mb-5 max-w-3xl mx-auto">
            Lease the hardware.<br />Maintain nothing.
          </h1>
          <p className="text-body-l text-white/55 max-w-2xl mx-auto mb-8">
            Every device in the VenueKit OS hardware kit comes pre-configured, warranted, and replaced if it ever fails. No capital expense. No IT headaches.
          </p>
          <Link
            href="/get-demo"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-terracotta text-white font-medium rounded-md hover:bg-terracotta-hover transition-all text-body-m"
          >
            Request a Demo
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Devices */}
      <section className="section-padding-lg">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="font-display text-h1 text-ink mb-3">What&apos;s in the kit</h2>
            <p className="text-body-l text-ink/55 max-w-xl mx-auto">
              All hardware ships together in one kit. Everything your venue needs from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {devices.map((device) => {
              const Icon = device.icon;
              return (
                <div key={device.name} className={`bg-white rounded-xl border ${device.accentColor} p-8 shadow-card hover:shadow-card-hover transition-all`}>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 ${device.iconColor}`}>
                    <Icon size={24} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-h3 text-ink mb-1">{device.name}</h3>
                  <p className="text-body-s text-terracotta font-medium mb-4">{device.tagline}</p>
                  <p className="text-body-m text-ink/60 leading-relaxed mb-6">{device.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-6">
                    {device.specs.map((spec) => (
                      <div key={spec} className="flex items-start gap-2 text-body-s text-ink/60">
                        <Check size={13} className="text-success mt-0.5 shrink-0" />
                        {spec}
                      </div>
                    ))}
                  </div>

                  <div className="px-3 py-2 bg-cream-100 rounded-md border border-cream-300 text-body-s text-ink/50">
                    <span className="font-medium text-ink/70">Best for:</span> {device.use}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lease perks */}
      <section className="bg-[#F0EBE4] section-padding-lg">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="font-display text-h2 text-ink mb-3">What the lease includes</h2>
            <p className="text-body-l text-ink/55 max-w-xl mx-auto">
              Hardware leasing with VenueKit OS is more than a rental — it&apos;s full lifecycle management.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leasePerks.map((perk) => {
              const Icon = perk.icon;
              return (
                <div key={perk.title} className="bg-white rounded-lg p-6 border border-cream-300 shadow-card">
                  <div className="w-10 h-10 rounded-md bg-terracotta/10 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-terracotta" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-h4 text-ink mb-2">{perk.title}</h3>
                  <p className="text-body-s text-ink/55 leading-relaxed">{perk.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream section-padding-lg">
        <div className="container-wide">
          <div className="bg-ink rounded-2xl px-10 py-14 text-center">
            <h2 className="font-display text-h2 text-white mb-4">Hardware included in Professional & Enterprise plans</h2>
            <p className="text-body-l text-white/50 mb-8 max-w-xl mx-auto">
              Get the full hardware kit as part of your VenueKit OS subscription. No separate hardware bills.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/get-demo" className="px-7 py-3.5 bg-terracotta text-white font-medium rounded-md hover:bg-terracotta-hover transition-colors text-body-m">
                Request a Demo
              </Link>
              <Link href="/pricing" className="px-7 py-3.5 text-white/70 hover:text-white font-medium rounded-md border border-white/15 hover:border-white/30 transition-all text-body-m">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
