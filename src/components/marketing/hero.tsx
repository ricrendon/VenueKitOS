"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative bg-ink min-h-screen flex flex-col overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-[#2A2420] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-terracotta/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-dusty-blue/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative flex-1 flex flex-col justify-center container-wide pt-28 pb-16 lg:pt-36 lg:pb-24">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white/6 border border-white/10 text-caption text-white/60">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
            Now available for indoor playgrounds & FECs
          </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-4xl mx-auto mb-6">
          <h1 className="font-display font-semibold text-white leading-[1.1] tracking-tight text-[42px] md:text-[58px] lg:text-[68px]">
            The Operating System<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta to-coral">
              for Modern Venues
            </span>
          </h1>
        </div>

        {/* Subheadline */}
        <p className="text-center text-white/55 text-body-l max-w-2xl mx-auto mb-10 leading-relaxed">
          VenueKit OS gives playground and entertainment venue operators a complete, cloud-based management platform — from bookings and check-in to POS, memberships, parties, and real-time reporting.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/get-demo"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-terracotta text-white font-medium rounded-md hover:bg-terracotta-hover transition-all duration-200 shadow-lg shadow-terracotta/20 hover:shadow-terracotta/30 hover:-translate-y-0.5 text-body-m"
          >
            Request a Demo
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 text-white/80 hover:text-white font-medium rounded-md border border-white/15 hover:border-white/30 transition-all duration-200 hover:bg-white/5 text-body-m"
          >
            <Play size={14} className="fill-current" />
            See it live
          </Link>
        </div>

        {/* Dashboard Mockup */}
        <div className="max-w-5xl mx-auto w-full">
          {/* Browser chrome */}
          <div className="rounded-xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.5)] border border-white/10 bg-[#151210]">
            {/* Browser bar */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#1C1916] border-b border-white/6">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <div className="flex-1 bg-[#0E0D0B] rounded-md px-4 py-1.5 flex items-center gap-2">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="opacity-30">
                  <path d="M5 1a4 4 0 100 8A4 4 0 005 1z" stroke="white" strokeWidth="1" />
                </svg>
                <span className="text-white/25 text-[11px] font-mono">app.venuekit.io/dashboard</span>
              </div>
            </div>

            {/* Dashboard UI */}
            <div className="flex h-[420px] md:h-[520px] overflow-hidden">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col w-52 bg-[#1A1714] border-r border-white/6 p-3 shrink-0">
                <div className="flex items-center gap-2 px-2 py-2 mb-4">
                  <div className="w-6 h-6 rounded bg-terracotta/80 flex items-center justify-center">
                    <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
                      <div className="bg-white rounded-[1px]" />
                      <div className="bg-white/50 rounded-[1px]" />
                      <div className="bg-white/50 rounded-[1px]" />
                      <div className="bg-white/20 rounded-[1px]" />
                    </div>
                  </div>
                  <span className="text-white text-[11px] font-semibold">VenueKit OS</span>
                </div>
                {[
                  { label: "Dashboard", active: true },
                  { label: "Reservations" },
                  { label: "Parties" },
                  { label: "Check-In" },
                  { label: "Members" },
                  { label: "POS" },
                  { label: "Reports" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`px-3 py-2 rounded-md text-[11px] mb-0.5 ${
                      item.active
                        ? "bg-terracotta/15 text-terracotta font-medium"
                        : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 bg-[#F7F3EE] overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-black/6">
                  <div>
                    <p className="text-[11px] text-ink/40 font-medium">Good morning</p>
                    <p className="text-[13px] font-semibold text-ink">Today&apos;s Overview</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-terracotta text-white text-[10px] font-medium rounded-md">+ New Booking</div>
                  </div>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-4 gap-3 p-4">
                  {[
                    { label: "Guests Today", value: "248", delta: "+12%", color: "text-success" },
                    { label: "Revenue", value: "$4,820", delta: "+8%", color: "text-success" },
                    { label: "Parties", value: "6", delta: "Active", color: "text-dusty-blue" },
                    { label: "Members", value: "312", delta: "+3 today", color: "text-sage" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="bg-white rounded-lg p-3 border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                      <p className="text-[9px] text-ink/40 font-medium uppercase tracking-wide mb-1">{kpi.label}</p>
                      <p className="text-[18px] font-bold text-ink leading-none mb-1">{kpi.value}</p>
                      <p className={`text-[9px] font-medium ${kpi.color}`}>{kpi.delta}</p>
                    </div>
                  ))}
                </div>

                {/* Schedule table */}
                <div className="mx-4 bg-white rounded-lg border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-black/5 flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-ink">Today&apos;s Schedule</p>
                    <p className="text-[9px] text-terracotta font-medium">View all</p>
                  </div>
                  <div className="divide-y divide-black/4">
                    {[
                      { time: "10:00 AM", name: "Johnson Family", type: "Open Play", guests: 4, status: "Checked In" },
                      { time: "11:30 AM", name: "Rivera Birthday", type: "Party Package", guests: 18, status: "Confirmed" },
                      { time: "2:00 PM", name: "Chen Family", type: "Membership", guests: 3, status: "Upcoming" },
                      { time: "3:30 PM", name: "Park Birthday", type: "Party Package", guests: 22, status: "Confirmed" },
                    ].map((row) => (
                      <div key={row.time} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="text-[9px] text-ink/40 w-16 shrink-0">{row.time}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-ink truncate">{row.name}</p>
                          <p className="text-[9px] text-ink/40">{row.type} · {row.guests} guests</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-medium ${
                          row.status === "Checked In" ? "bg-success/10 text-success" :
                          row.status === "Confirmed" ? "bg-dusty-blue/10 text-dusty-blue" :
                          "bg-mustard/10 text-warning"
                        }`}>
                          {row.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating stat pills */}
          <div className="hidden md:flex justify-between mt-6 px-4">
            {[
              { label: "Avg. setup time", value: "< 1 day" },
              { label: "Venues active", value: "Growing fast" },
              { label: "Uptime", value: "99.9%" },
              { label: "Support", value: "7-day response" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5 text-white/40">
                <div className="w-1 h-1 rounded-full bg-terracotta/60" />
                <span className="text-caption">
                  <span className="text-white/70 font-medium">{stat.value}</span> {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
