"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  {
    title: "Guest & Booking Management",
    summary: "Online booking, real-time availability, capacity control",
    features: [
      "Online booking for open play and private events",
      "Real-time capacity and availability management",
      "Automated booking confirmations and reminders via email/SMS",
      "Guest manifest with arrival tracking",
      "Flexible session time slots and recurring schedules",
      "Group booking and bulk reservations",
      "Cancellation and rescheduling with configurable policies",
      "Booking history per family profile",
    ],
  },
  {
    title: "Birthday Party & Event Management",
    summary: "Full lifecycle from deposit to party completion",
    features: [
      "Multi-package selection (Classic, Premium, Ultimate)",
      "Deposit collection and balance tracking",
      "Party room assignment and timeline management",
      "Host and staff assignment per event",
      "Add-on management (food, decorations, activities)",
      "Pre-party checklist and day-of runbook",
      "Guest count management and waitlists",
      "Post-party follow-up and review requests",
    ],
  },
  {
    title: "Membership & Loyalty",
    summary: "Recurring revenue through flexible membership plans",
    features: [
      "Multiple membership tiers with custom perks",
      "Automated recurring billing via Stripe",
      "Member check-in with instant status verification",
      "Guest pass tracking and limits",
      "Discounts on parties, add-ons, and POS",
      "Member-only booking windows",
      "Pause, cancel, and upgrade flows self-served",
      "Membership revenue reporting and churn tracking",
    ],
  },
  {
    title: "Digital Waivers",
    summary: "Paperless, compliant, auto-attached to family profiles",
    features: [
      "Branded digital waiver with e-signature capture",
      "Waiver auto-attached to family profiles on sign",
      "Expiration dates with renewal reminders",
      "Bulk waiver status view for today's guests",
      "Waiver signing via tablet at check-in",
      "PDF export and cloud storage",
      "Minor authorization with guardian signature",
      "Waiver history per family",
    ],
  },
  {
    title: "POS & Payments",
    summary: "Integrated point of sale for cafe, retail, and add-ons",
    features: [
      "Tap/chip/swipe card processing via Stripe Terminal",
      "Cafe and retail product catalog",
      "Tie POS orders to guest bookings",
      "End-of-day cash reconciliation",
      "Refund and void management",
      "Split payments and partial charges",
      "Tax configuration per product category",
      "Sales reporting by category, staff, and day",
    ],
  },
  {
    title: "Reporting & Analytics",
    summary: "Real-time data to run a smarter operation",
    features: [
      "Revenue dashboard with daily, weekly, monthly views",
      "Occupancy and capacity utilization reports",
      "Membership growth and churn metrics",
      "Party revenue and package popularity",
      "Staff performance tracking",
      "Booking source attribution",
      "Export to CSV for payroll and accounting",
      "Configurable alerts for low capacity or revenue targets",
    ],
  },
];

export function FeatureAccordion() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="bg-[#F0EBE4] section-padding-lg">
      <div className="container-wide">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left: sticky label */}
          <div className="lg:w-72 shrink-0">
            <p className="text-caption font-semibold text-terracotta uppercase tracking-widest mb-3">
              Feature breakdown
            </p>
            <h2 className="font-display text-h2 text-ink mb-4">
              Everything in detail
            </h2>
            <p className="text-body-m text-ink/55 leading-relaxed">
              Every module is built to work together, giving you a single source of truth for your entire venue.
            </p>
          </div>

          {/* Right: accordion */}
          <div className="flex-1 flex flex-col divide-y divide-cream-300">
            {categories.map((cat) => {
              const isOpen = open === cat.title;
              return (
                <div key={cat.title}>
                  <button
                    onClick={() => setOpen(isOpen ? null : cat.title)}
                    className="w-full flex items-center justify-between py-5 text-left group"
                  >
                    <div>
                      <p className="font-display font-semibold text-h4 text-ink group-hover:text-terracotta transition-colors">
                        {cat.title}
                      </p>
                      <p className="text-body-s text-ink/45 mt-0.5">{cat.summary}</p>
                    </div>
                    <ChevronDown
                      size={18}
                      className={cn(
                        "text-ink/30 shrink-0 ml-4 transition-transform duration-200",
                        isOpen && "rotate-180 text-terracotta"
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="pb-5">
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cat.features.map((f) => (
                          <li key={f} className="flex items-start gap-2.5 text-body-s text-ink/65">
                            <span className="w-1.5 h-1.5 rounded-full bg-terracotta mt-1.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
