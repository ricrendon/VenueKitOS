"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const venueTypes = [
  "Indoor Playground",
  "Family Entertainment Center (FEC)",
  "Trampoline Park",
  "Ninja Gym",
  "Bounce House Facility",
  "Play Cafe",
  "Other",
];

const interests = [
  "Online bookings & reservations",
  "Check-in & capacity management",
  "Birthday party management",
  "Membership & loyalty program",
  "Point of sale (POS)",
  "Digital waivers",
  "Hardware leasing",
  "Analytics & reporting",
];

export default function GetDemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    venueName: "",
    venueType: "",
    locations: "1",
    message: "",
    interests: [] as string[],
  });

  const toggleInterest = (item: string) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(item)
        ? f.interests.filter((i) => i !== item)
        : [...f.interests, item],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center pt-20">
        <div className="text-center max-w-lg px-6">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={28} className="text-success" strokeWidth={2.5} />
          </div>
          <h2 className="font-display text-h2 text-ink mb-3">We&apos;ll be in touch shortly</h2>
          <p className="text-body-l text-ink/55 mb-8">
            Thanks for your interest in VenueKit OS. Our team will reach out within 1 business day to schedule your personalized demo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/admin/dashboard"
              className="px-6 py-3 bg-terracotta text-white font-medium rounded-md hover:bg-terracotta-hover transition-colors text-body-s"
            >
              Explore the demo dashboard
            </Link>
            <Link
              href="/"
              className="px-6 py-3 text-ink/60 hover:text-ink font-medium rounded-md border border-cream-300 hover:border-ink/20 transition-all text-body-s"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream">
      <section className="bg-ink pt-28 pb-16">
        <div className="container-wide text-center">
          <p className="text-caption font-semibold text-terracotta uppercase tracking-widest mb-4">Get a demo</p>
          <h1 className="font-display font-semibold text-white text-[40px] md:text-[52px] leading-tight mb-4">
            See VenueKit OS live
          </h1>
          <p className="text-body-l text-white/55 max-w-xl mx-auto">
            Fill out the form and we&apos;ll set up a personalized walkthrough for your venue. Usually within 24 hours.
          </p>
        </div>
      </section>

      <section className="section-padding-lg">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-cream-300 shadow-card p-8">
                <h2 className="font-display text-h3 text-ink mb-6">Tell us about your venue</h2>

                {/* Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-body-s font-medium text-ink mb-1.5">First name *</label>
                    <input
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                      className="w-full px-4 py-3 border border-cream-300 rounded-md text-body-s text-ink focus:outline-none focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/10 transition-all"
                      placeholder="Marcus"
                    />
                  </div>
                  <div>
                    <label className="block text-body-s font-medium text-ink mb-1.5">Last name *</label>
                    <input
                      type="text"
                      required
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                      className="w-full px-4 py-3 border border-cream-300 rounded-md text-body-s text-ink focus:outline-none focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/10 transition-all"
                      placeholder="Thompson"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-body-s font-medium text-ink mb-1.5">Work email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-cream-300 rounded-md text-body-s text-ink focus:outline-none focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/10 transition-all"
                      placeholder="marcus@bouncekingdom.com"
                    />
                  </div>
                  <div>
                    <label className="block text-body-s font-medium text-ink mb-1.5">Phone number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-cream-300 rounded-md text-body-s text-ink focus:outline-none focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/10 transition-all"
                      placeholder="(512) 555-0100"
                    />
                  </div>
                </div>

                {/* Venue */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-body-s font-medium text-ink mb-1.5">Venue name *</label>
                    <input
                      type="text"
                      required
                      value={form.venueName}
                      onChange={(e) => setForm((f) => ({ ...f, venueName: e.target.value }))}
                      className="w-full px-4 py-3 border border-cream-300 rounded-md text-body-s text-ink focus:outline-none focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/10 transition-all"
                      placeholder="Bounce Kingdom"
                    />
                  </div>
                  <div>
                    <label className="block text-body-s font-medium text-ink mb-1.5">Number of locations</label>
                    <select
                      value={form.locations}
                      onChange={(e) => setForm((f) => ({ ...f, locations: e.target.value }))}
                      className="w-full px-4 py-3 border border-cream-300 rounded-md text-body-s text-ink focus:outline-none focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/10 transition-all bg-white"
                    >
                      <option value="1">1 location</option>
                      <option value="2-3">2–3 locations</option>
                      <option value="4+">4+ locations</option>
                    </select>
                  </div>
                </div>

                {/* Venue type */}
                <div className="mb-6">
                  <label className="block text-body-s font-medium text-ink mb-2">Venue type *</label>
                  <div className="flex flex-wrap gap-2">
                    {venueTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, venueType: type }))}
                        className={`px-3 py-1.5 rounded-md text-body-s font-medium border transition-all ${
                          form.venueType === type
                            ? "bg-terracotta text-white border-terracotta"
                            : "bg-white text-ink/60 border-cream-300 hover:border-terracotta/40 hover:text-ink"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div className="mb-6">
                  <label className="block text-body-s font-medium text-ink mb-2">What are you most interested in?</label>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleInterest(item)}
                        className={`px-3 py-1.5 rounded-md text-body-s border transition-all ${
                          form.interests.includes(item)
                            ? "bg-ink text-white border-ink"
                            : "bg-white text-ink/60 border-cream-300 hover:border-ink/30 hover:text-ink"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="mb-7">
                  <label className="block text-body-s font-medium text-ink mb-1.5">Anything else we should know?</label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="w-full px-4 py-3 border border-cream-300 rounded-md text-body-s text-ink focus:outline-none focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/10 transition-all resize-none"
                    placeholder="Tell us about your current setup, pain points, or specific questions..."
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 w-full justify-center px-7 py-3.5 bg-terracotta text-white font-medium rounded-md hover:bg-terracotta-hover transition-all text-body-m shadow-sm"
                >
                  Request my demo
                  <ArrowRight size={16} />
                </button>
                <p className="text-caption text-ink/35 text-center mt-3">We&apos;ll respond within 1 business day</p>
              </form>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-xl border border-cream-300 shadow-card p-6">
                <h3 className="font-display text-h4 text-ink mb-4">What to expect</h3>
                <ul className="flex flex-col gap-4">
                  {[
                    { step: "01", title: "We reach out", desc: "Within 1 business day to schedule a call." },
                    { step: "02", title: "Live walkthrough", desc: "30-min demo tailored to your venue type." },
                    { step: "03", title: "Free trial", desc: "30 days free — no card, no commitment." },
                    { step: "04", title: "Go live", desc: "Hardware ships. You're open for business." },
                  ].map((s) => (
                    <li key={s.step} className="flex items-start gap-3">
                      <span className="text-caption font-bold text-terracotta/50 w-5 shrink-0 mt-0.5">{s.step}</span>
                      <div>
                        <p className="text-body-s font-semibold text-ink">{s.title}</p>
                        <p className="text-body-s text-ink/50">{s.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-ink rounded-xl p-6">
                <p className="text-body-s font-semibold text-white mb-2">Already exploring?</p>
                <p className="text-body-s text-white/50 mb-4">Browse the live demo dashboard — no login required.</p>
                <Link
                  href="/admin/dashboard"
                  className="block w-full py-2.5 text-center text-body-s font-medium text-white border border-white/15 rounded-md hover:border-white/30 hover:bg-white/5 transition-all"
                >
                  View demo dashboard →
                </Link>
              </div>

              <div className="bg-white rounded-xl border border-cream-300 p-6">
                <p className="text-body-s font-semibold text-ink mb-3">Questions?</p>
                <p className="text-body-s text-ink/55 mb-1">Email us directly:</p>
                <p className="text-body-s text-terracotta font-medium">hello@venuekit.io</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
