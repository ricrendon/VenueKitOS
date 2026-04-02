"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "bookings", label: "Reservations" },
  { id: "checkin", label: "Check-In" },
];

function OverviewMockup() {
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-48 bg-[#1A1714] p-3 shrink-0">
        <div className="px-2 py-1.5 mb-3">
          <p className="text-white text-[10px] font-semibold">VenueKit OS</p>
          <p className="text-white/30 text-[8px]">Playground Admin</p>
        </div>
        {["Dashboard", "Reservations", "Parties", "Check-In", "Members", "POS", "Reports", "Settings"].map((item, i) => (
          <div key={item} className={`px-3 py-2 rounded text-[10px] mb-0.5 ${i === 0 ? "bg-terracotta/20 text-terracotta" : "text-white/35"}`}>
            {item}
          </div>
        ))}
      </div>
      {/* Content */}
      <div className="flex-1 bg-cream overflow-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-ink/40">Friday, March 7</p>
              <p className="font-semibold text-ink text-[13px]">Dashboard Overview</p>
            </div>
            <div className="flex gap-2">
              <div className="px-2.5 py-1.5 bg-white border border-cream-300 text-[9px] text-ink/60 rounded-md">Export</div>
              <div className="px-2.5 py-1.5 bg-terracotta text-white text-[9px] font-medium rounded-md">+ New Booking</div>
            </div>
          </div>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Guests Today", val: "248", sub: "+12% vs last Fri", up: true },
              { label: "Revenue", val: "$4,820", sub: "+8% vs last Fri", up: true },
              { label: "Active Parties", val: "6", sub: "2 starting soon" },
              { label: "Members", val: "312", sub: "+3 this week", up: true },
            ].map((k) => (
              <div key={k.label} className="bg-white rounded-lg p-3 border border-cream-300 shadow-card">
                <p className="text-[8px] text-ink/40 uppercase tracking-wide font-semibold mb-1">{k.label}</p>
                <p className="text-[20px] font-bold text-ink leading-none mb-1">{k.val}</p>
                <p className={`text-[8px] font-medium ${k.up ? "text-success" : "text-ink/40"}`}>{k.sub}</p>
              </div>
            ))}
          </div>
          {/* Alert */}
          <div className="bg-mustard/10 border border-mustard/20 rounded-lg p-3 mb-4 flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1 shrink-0" />
            <p className="text-[9px] text-warning font-medium">Rivera Birthday Party starts in 45 minutes — check room setup and host assignment</p>
          </div>
          {/* Schedule */}
          <div className="bg-white rounded-lg border border-cream-300 shadow-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-cream-300 flex items-center justify-between">
              <p className="text-[11px] font-semibold text-ink">Today&apos;s Schedule</p>
              <p className="text-[9px] text-terracotta">View all →</p>
            </div>
            {[
              { time: "10:00 AM", name: "Johnson Family", type: "Open Play · 4 guests", status: "Checked In", c: "bg-success/10 text-success" },
              { time: "11:30 AM", name: "Rivera Birthday", type: "Premium Party · 18 guests", status: "Confirmed", c: "bg-dusty-blue/10 text-dusty-blue" },
              { time: "2:00 PM", name: "Chen Family", type: "Membership · 3 guests", status: "Upcoming", c: "bg-mustard/10 text-warning" },
              { time: "3:30 PM", name: "Park Birthday", type: "Classic Party · 22 guests", status: "Confirmed", c: "bg-dusty-blue/10 text-dusty-blue" },
            ].map((r) => (
              <div key={r.time} className="flex items-center gap-3 px-4 py-2.5 border-b border-cream-200 last:border-0">
                <span className="text-[9px] text-ink/40 w-16 shrink-0">{r.time}</span>
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-ink">{r.name}</p>
                  <p className="text-[8px] text-ink/40">{r.type}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-medium ${r.c}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingsMockup() {
  return (
    <div className="flex h-full">
      <div className="hidden md:flex flex-col w-48 bg-[#1A1714] p-3 shrink-0">
        {["Dashboard", "Reservations", "Parties", "Check-In", "Members", "POS", "Reports"].map((item, i) => (
          <div key={item} className={`px-3 py-2 rounded text-[10px] mb-0.5 ${i === 1 ? "bg-terracotta/20 text-terracotta" : "text-white/35"}`}>
            {item}
          </div>
        ))}
      </div>
      <div className="flex-1 bg-cream overflow-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-ink text-[13px]">All Reservations</p>
            <div className="flex gap-2">
              <div className="px-2.5 py-1.5 bg-white border border-cream-300 text-[9px] text-ink/60 rounded-md">Filter ▾</div>
              <div className="px-2.5 py-1.5 bg-terracotta text-white text-[9px] font-medium rounded-md">+ New Booking</div>
            </div>
          </div>
          {/* Filters */}
          <div className="flex gap-2 mb-4">
            {["All", "Open Play", "Parties", "Memberships"].map((f, i) => (
              <div key={f} className={`px-3 py-1.5 rounded-md text-[9px] font-medium ${i === 0 ? "bg-ink text-white" : "bg-white border border-cream-300 text-ink/50"}`}>{f}</div>
            ))}
          </div>
          {/* Table */}
          <div className="bg-white rounded-lg border border-cream-300 shadow-card overflow-hidden">
            <div className="grid grid-cols-5 gap-3 px-4 py-2.5 border-b border-cream-300 bg-cream-100">
              {["Guest", "Type", "Date & Time", "Guests", "Status"].map((h) => (
                <p key={h} className="text-[8px] font-semibold text-ink/40 uppercase tracking-wide">{h}</p>
              ))}
            </div>
            {[
              { name: "Johnson Family", type: "Open Play", date: "Mar 7 · 10:00 AM", guests: 4, status: "Active", c: "bg-success/10 text-success" },
              { name: "Rivera Family", type: "Birthday Party", date: "Mar 7 · 11:30 AM", guests: 18, status: "Confirmed", c: "bg-dusty-blue/10 text-dusty-blue" },
              { name: "Chen Family", type: "Membership", date: "Mar 7 · 2:00 PM", guests: 3, status: "Upcoming", c: "bg-mustard/10 text-warning" },
              { name: "Williams Fam.", type: "Open Play", date: "Mar 8 · 9:00 AM", guests: 5, status: "Upcoming", c: "bg-mustard/10 text-warning" },
              { name: "Park Family", type: "Birthday Party", date: "Mar 8 · 3:30 PM", guests: 22, status: "Deposit Paid", c: "bg-sage/10 text-sage" },
            ].map((r) => (
              <div key={r.name} className="grid grid-cols-5 gap-3 px-4 py-2.5 border-b border-cream-200 last:border-0 items-center">
                <div>
                  <p className="text-[10px] font-medium text-ink">{r.name}</p>
                </div>
                <p className="text-[9px] text-ink/50">{r.type}</p>
                <p className="text-[9px] text-ink/50">{r.date}</p>
                <p className="text-[9px] text-ink/50">{r.guests}</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-medium w-fit ${r.c}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckInMockup() {
  return (
    <div className="flex h-full">
      <div className="hidden md:flex flex-col w-48 bg-[#1A1714] p-3 shrink-0">
        {["Dashboard", "Reservations", "Parties", "Check-In", "Members", "POS", "Reports"].map((item, i) => (
          <div key={item} className={`px-3 py-2 rounded text-[10px] mb-0.5 ${i === 3 ? "bg-terracotta/20 text-terracotta" : "text-white/35"}`}>
            {item}
          </div>
        ))}
      </div>
      <div className="flex-1 bg-cream overflow-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-ink text-[13px]">Check-In Station</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-success/10 border border-success/20 rounded-md">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-[9px] text-success font-medium">Scanner Active</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* QR scanner area */}
            <div className="bg-white rounded-lg border border-cream-300 shadow-card p-4 flex flex-col items-center justify-center min-h-[160px]">
              <div className="w-20 h-20 border-2 border-dashed border-cream-300 rounded-lg flex items-center justify-center mb-3 relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-terracotta rounded-tl" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-terracotta rounded-tr" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-terracotta rounded-bl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-terracotta rounded-br" />
                <div className="grid grid-cols-3 gap-0.5 opacity-20">
                  {Array.from({length: 9}).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-[1px] ${[0,1,3,4,5,8].includes(i) ? "bg-ink" : "bg-transparent"}`} />
                  ))}
                </div>
              </div>
              <p className="text-[9px] text-ink/40 text-center">Scan booking QR code<br />or search by name</p>
            </div>

            {/* Manual search */}
            <div className="bg-white rounded-lg border border-cream-300 shadow-card p-4">
              <p className="text-[10px] font-semibold text-ink mb-3">Manual Lookup</p>
              <div className="bg-cream-100 rounded-md px-3 py-2 text-[9px] text-ink/30 mb-3 border border-cream-300">Search by name or phone…</div>
              <div className="flex flex-col gap-2">
                <p className="text-[9px] text-ink/40 font-medium">Recent</p>
                {[
                  { name: "Johnson Family", code: "BK-7821", guests: 4 },
                  { name: "Chen Family", code: "BK-7819", guests: 3 },
                ].map((f) => (
                  <div key={f.name} className="flex items-center justify-between py-1.5 border-b border-cream-200">
                    <div>
                      <p className="text-[9px] font-medium text-ink">{f.name}</p>
                      <p className="text-[8px] text-ink/40">{f.code} · {f.guests} guests</p>
                    </div>
                    <div className="px-2 py-1 bg-terracotta text-white text-[8px] font-medium rounded">Check In</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current floor */}
          <div className="bg-white rounded-lg border border-cream-300 shadow-card">
            <div className="px-4 py-2.5 border-b border-cream-300 flex items-center justify-between">
              <p className="text-[11px] font-semibold text-ink">Current Floor</p>
              <p className="text-[9px] text-ink/40">132 / 200 capacity</p>
            </div>
            <div className="px-4 py-3">
              <div className="w-full bg-cream-200 rounded-full h-2 mb-3">
                <div className="bg-terracotta h-2 rounded-full" style={{width: "66%"}} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { zone: "Main Play Area", count: 87, cap: 120 },
                  { zone: "Party Rooms", count: 32, cap: 60 },
                  { zone: "Cafe & Lobby", count: 13, cap: 40 },
                ].map((z) => (
                  <div key={z.zone} className="bg-cream-100 rounded-md p-2">
                    <p className="text-[8px] text-ink/40 mb-0.5">{z.zone}</p>
                    <p className="text-[11px] font-bold text-ink">{z.count}<span className="text-[8px] font-normal text-ink/30">/{z.cap}</span></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlatformPreview() {
  const [active, setActive] = useState("overview");

  return (
    <section id="platform" className="bg-ink section-padding-lg">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-caption font-semibold text-terracotta uppercase tracking-widest mb-3">
            The operator dashboard
          </p>
          <h2 className="font-display text-h1 text-white mb-4">
            Built for how venues actually work
          </h2>
          <p className="text-body-l text-white/50">
            A real-time command center for your entire operation. Every view designed for speed and clarity.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white/6 border border-white/10 rounded-lg p-1 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "px-5 py-2 rounded-md text-body-s font-medium transition-all duration-200",
                  active === tab.id
                    ? "bg-white text-ink shadow-sm"
                    : "text-white/50 hover:text-white/80"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mockup */}
        <div className="rounded-xl overflow-hidden border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
          {/* Browser bar */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#1C1916] border-b border-white/6">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
            </div>
            <div className="flex-1 bg-[#0E0D0B] rounded-md px-4 py-1.5">
              <span className="text-white/25 text-[11px] font-mono">app.venuekit.io/{active === "overview" ? "dashboard" : active}</span>
            </div>
          </div>
          {/* Screen */}
          <div className="h-[480px] md:h-[560px] overflow-hidden">
            {active === "overview" && <OverviewMockup />}
            {active === "bookings" && <BookingsMockup />}
            {active === "checkin" && <CheckInMockup />}
          </div>
        </div>
      </div>
    </section>
  );
}
