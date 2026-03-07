import {
  CalendarCheck,
  ScanLine,
  ShoppingCart,
  Users,
  PartyPopper,
  BarChart3,
  FileText,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Bookings & Reservations",
    description:
      "Online booking for open play sessions and birthday parties. Real-time availability, deposit collection, and instant confirmations.",
    color: "bg-terracotta/10 text-terracotta",
  },
  {
    icon: ScanLine,
    title: "QR Check-In",
    description:
      "Fast, contactless check-in via QR code or family ID. Track capacity in real time and manage your floor with ease.",
    color: "bg-dusty-blue/10 text-dusty-blue",
  },
  {
    icon: ShoppingCart,
    title: "Point of Sale",
    description:
      "Full-featured POS for cafe, retail, and party add-ons. Integrated with bookings so every order is tied to a guest.",
    color: "bg-sage/10 text-sage",
  },
  {
    icon: Users,
    title: "Memberships & Loyalty",
    description:
      "Sell and manage membership plans with automated billing, guest pass tracking, and member-only perks.",
    color: "bg-mustard/10 text-warning",
  },
  {
    icon: PartyPopper,
    title: "Party Management",
    description:
      "Full lifecycle management for birthday parties — package selection, timeline, host assignments, and day-of execution.",
    color: "bg-coral/10 text-coral",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Revenue, occupancy, membership trends, and more. Export to CSV or view live dashboards to make informed decisions.",
    color: "bg-terracotta/10 text-terracotta",
  },
  {
    icon: FileText,
    title: "Digital Waivers",
    description:
      "Collect and store signed waivers digitally. Auto-attached to family profiles — no clipboards, no paper.",
    color: "bg-dusty-blue/10 text-dusty-blue",
  },
  {
    icon: Bell,
    title: "Parent Portal",
    description:
      "A branded portal where families manage bookings, children's profiles, memberships, and waivers — all in one place.",
    color: "bg-sage/10 text-sage",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="bg-cream section-padding-lg">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-caption font-semibold text-terracotta uppercase tracking-widest mb-3">
            Everything you need
          </p>
          <h2 className="font-display text-h1 text-ink mb-4">
            One platform. Every operation.
          </h2>
          <p className="text-body-l text-ink/55">
            Stop juggling spreadsheets, paper waivers, and disconnected tools. VenueKit OS brings your entire venue into one modern system.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group bg-white rounded-lg p-6 border border-cream-300 hover:border-terracotta/20 hover:shadow-card-hover transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-4 ${feature.color}`}>
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-h4 text-ink mb-2">{feature.title}</h3>
                <p className="text-body-s text-ink/55 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
