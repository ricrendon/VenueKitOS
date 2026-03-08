"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Calendar, ClipboardCheck, ShoppingCart,
  Package, Gift, Timer, Megaphone, ArrowRight,
  Users, QrCode, CreditCard, BarChart3, Zap, Shield,
} from "lucide-react";

/* =============================================
   SIDEBAR — shared by all mockups
   ============================================= */

const sidebarItems = [
  "Dashboard", "Reservations", "Parties", "Check-In",
  "POS", "Inventory", "Gift Cards", "Time Clock", "Marketing",
];

function MockSidebar({ active }: { active: string }) {
  return (
    <div className="hidden md:flex flex-col w-48 bg-[#1A1714] p-3 shrink-0">
      <div className="px-2 py-1.5 mb-3">
        <p className="text-white text-[10px] font-semibold">VenueKit OS</p>
        <p className="text-white/30 text-[8px]">Playground Admin</p>
      </div>
      {sidebarItems.map((item) => (
        <div
          key={item}
          className={`px-3 py-2 rounded text-[10px] mb-0.5 ${
            item === active
              ? "bg-terracotta/20 text-terracotta"
              : "text-white/35"
          }`}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

/* =============================================
   MOCKUP 1 — Dashboard Overview
   ============================================= */

function DashboardMockup() {
  return (
    <div className="flex h-full">
      <MockSidebar active="Dashboard" />
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
          <div className="bg-mustard/10 border border-mustard/20 rounded-lg p-3 mb-4 flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1 shrink-0" />
            <p className="text-[9px] text-warning font-medium">Rivera Birthday Party starts in 45 min — check room setup</p>
          </div>
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

/* =============================================
   MOCKUP 2 — Reservations
   ============================================= */

function ReservationsMockup() {
  return (
    <div className="flex h-full">
      <MockSidebar active="Reservations" />
      <div className="flex-1 bg-cream overflow-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-ink text-[13px]">All Reservations</p>
            <div className="flex gap-2">
              <div className="px-2.5 py-1.5 bg-white border border-cream-300 text-[9px] text-ink/60 rounded-md">Filter ▾</div>
              <div className="px-2.5 py-1.5 bg-terracotta text-white text-[9px] font-medium rounded-md">+ New Booking</div>
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            {["All", "Open Play", "Parties", "Memberships"].map((f, i) => (
              <div key={f} className={`px-3 py-1.5 rounded-md text-[9px] font-medium ${i === 0 ? "bg-ink text-white" : "bg-white border border-cream-300 text-ink/50"}`}>{f}</div>
            ))}
          </div>
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
                <p className="text-[10px] font-medium text-ink">{r.name}</p>
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

/* =============================================
   MOCKUP 3 — Check-In
   ============================================= */

function CheckInMockup() {
  return (
    <div className="flex h-full">
      <MockSidebar active="Check-In" />
      <div className="flex-1 bg-cream overflow-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-ink text-[13px]">Check-In Station</p>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-success/10 border border-success/20 rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-[9px] text-success font-medium">Scanner Active</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg border border-cream-300 shadow-card p-4 flex flex-col items-center justify-center min-h-[160px]">
              <div className="w-20 h-20 border-2 border-dashed border-cream-300 rounded-lg flex items-center justify-center mb-3 relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-terracotta rounded-tl" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-terracotta rounded-tr" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-terracotta rounded-bl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-terracotta rounded-br" />
                <div className="grid grid-cols-3 gap-0.5 opacity-20">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-[1px] ${[0,1,3,4,5,8].includes(i) ? "bg-ink" : "bg-transparent"}`} />
                  ))}
                </div>
              </div>
              <p className="text-[9px] text-ink/40 text-center">Scan booking QR code<br />or search by name</p>
            </div>
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
          <div className="bg-white rounded-lg border border-cream-300 shadow-card">
            <div className="px-4 py-2.5 border-b border-cream-300 flex items-center justify-between">
              <p className="text-[11px] font-semibold text-ink">Current Floor</p>
              <p className="text-[9px] text-ink/40">132 / 200 capacity</p>
            </div>
            <div className="px-4 py-3">
              <div className="w-full bg-cream-200 rounded-full h-2 mb-3">
                <div className="bg-terracotta h-2 rounded-full" style={{ width: "66%" }} />
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

/* =============================================
   MOCKUP 4 — POS
   ============================================= */

function POSMockup() {
  return (
    <div className="flex h-full">
      <MockSidebar active="POS" />
      <div className="flex-1 bg-cream overflow-auto">
        <div className="p-4 flex gap-4 h-full">
          {/* Product grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-ink text-[13px]">Point of Sale</p>
              <div className="flex gap-2">
                {["All", "Play", "Food", "Merch"].map((f, i) => (
                  <div key={f} className={`px-2.5 py-1 rounded-md text-[9px] font-medium ${i === 0 ? "bg-ink text-white" : "bg-white border border-cream-300 text-ink/50"}`}>{f}</div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "Open Play", price: "$18", color: "bg-terracotta/10 border-terracotta/20" },
                { name: "Grip Socks", price: "$4", color: "bg-sage/10 border-sage/20" },
                { name: "Pizza Slice", price: "$5", color: "bg-mustard/10 border-mustard/20" },
                { name: "Juice Box", price: "$3", color: "bg-dusty-blue/10 border-dusty-blue/20" },
                { name: "Water", price: "$2", color: "bg-dusty-blue/10 border-dusty-blue/20" },
                { name: "T-Shirt", price: "$22", color: "bg-coral/10 border-coral/20" },
                { name: "Party Add-On", price: "$35", color: "bg-terracotta/10 border-terracotta/20" },
                { name: "Snack Pack", price: "$8", color: "bg-mustard/10 border-mustard/20" },
                { name: "Sticker Pack", price: "$6", color: "bg-sage/10 border-sage/20" },
              ].map((item) => (
                <div key={item.name} className={`rounded-lg border p-3 text-center cursor-pointer hover:shadow-sm transition-shadow ${item.color}`}>
                  <p className="text-[10px] font-medium text-ink">{item.name}</p>
                  <p className="text-[12px] font-bold text-ink mt-1">{item.price}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Cart */}
          <div className="w-52 bg-white rounded-lg border border-cream-300 shadow-card p-3 flex flex-col shrink-0">
            <p className="text-[10px] font-semibold text-ink mb-3">Current Order</p>
            <div className="flex-1 space-y-2">
              {[
                { name: "Open Play × 2", price: "$36" },
                { name: "Grip Socks × 2", price: "$8" },
                { name: "Pizza Slice × 1", price: "$5" },
              ].map((item) => (
                <div key={item.name} className="flex justify-between items-center py-1.5 border-b border-cream-200">
                  <p className="text-[9px] text-ink">{item.name}</p>
                  <p className="text-[9px] font-medium text-ink">{item.price}</p>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-3 border-t border-cream-300">
              <div className="flex justify-between mb-1">
                <p className="text-[9px] text-ink/50">Subtotal</p>
                <p className="text-[9px] text-ink">$49.00</p>
              </div>
              <div className="flex justify-between mb-3">
                <p className="text-[10px] font-semibold text-ink">Total</p>
                <p className="text-[10px] font-bold text-ink">$53.17</p>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="px-2 py-2 bg-cream-200 text-[8px] font-medium text-ink text-center rounded">Card</div>
                <div className="px-2 py-2 bg-terracotta text-[8px] font-medium text-white text-center rounded">Charge</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================
   MOCKUP 5 — Inventory
   ============================================= */

function InventoryMockup() {
  return (
    <div className="flex h-full">
      <MockSidebar active="Inventory" />
      <div className="flex-1 bg-cream overflow-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-ink text-[13px]">Inventory</p>
            <div className="px-2.5 py-1.5 bg-terracotta text-white text-[9px] font-medium rounded-md">+ Add Item</div>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: "Total Items", val: "48", sub: "Active SKUs" },
              { label: "Low Stock", val: "5", sub: "Need reorder", warn: true },
              { label: "Total Value", val: "$6,240", sub: "At cost" },
              { label: "Out of Stock", val: "2", sub: "Unavailable", warn: true },
            ].map((k) => (
              <div key={k.label} className="bg-white rounded-lg p-3 border border-cream-300 shadow-card">
                <p className="text-[8px] text-ink/40 uppercase tracking-wide font-semibold mb-1">{k.label}</p>
                <p className={`text-[18px] font-bold leading-none mb-1 ${k.warn ? "text-error" : "text-ink"}`}>{k.val}</p>
                <p className="text-[8px] text-ink/40">{k.sub}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-cream-300 shadow-card overflow-hidden">
            <div className="grid grid-cols-6 gap-2 px-4 py-2.5 border-b border-cream-300 bg-cream-100">
              {["Item", "SKU", "Category", "Price", "Stock", "Status"].map((h) => (
                <p key={h} className="text-[8px] font-semibold text-ink/40 uppercase tracking-wide">{h}</p>
              ))}
            </div>
            {[
              { name: "Grip Socks (S)", sku: "SKU-001", cat: "Socks", price: "$4.00", qty: 120, status: "In Stock", c: "bg-success/10 text-success" },
              { name: "Grip Socks (M)", sku: "SKU-002", cat: "Socks", price: "$4.00", qty: 85, status: "In Stock", c: "bg-success/10 text-success" },
              { name: "Pizza Slice", sku: "SKU-010", cat: "Food", price: "$5.00", qty: 8, status: "Low Stock", c: "bg-warning/10 text-warning" },
              { name: "Juice Box", sku: "SKU-011", cat: "Food", price: "$3.00", qty: 45, status: "In Stock", c: "bg-success/10 text-success" },
              { name: "Party Hat Pack", sku: "SKU-030", cat: "Party", price: "$12.00", qty: 3, status: "Low Stock", c: "bg-warning/10 text-warning" },
              { name: "Branded T-Shirt", sku: "SKU-020", cat: "Merch", price: "$22.00", qty: 0, status: "Out", c: "bg-error/10 text-error" },
            ].map((r) => (
              <div key={r.sku} className="grid grid-cols-6 gap-2 px-4 py-2.5 border-b border-cream-200 last:border-0 items-center">
                <p className="text-[10px] font-medium text-ink">{r.name}</p>
                <p className="text-[9px] text-ink/40 font-mono">{r.sku}</p>
                <p className="text-[9px] text-ink/50">{r.cat}</p>
                <p className="text-[9px] text-ink/50">{r.price}</p>
                <p className="text-[9px] text-ink font-medium">{r.qty}</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-medium w-fit ${r.c}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================
   MOCKUP 6 — Gift Cards
   ============================================= */

function GiftCardsMockup() {
  return (
    <div className="flex h-full">
      <MockSidebar active="Gift Cards" />
      <div className="flex-1 bg-cream overflow-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-ink text-[13px]">Gift Cards</p>
            <div className="px-2.5 py-1.5 bg-terracotta text-white text-[9px] font-medium rounded-md">+ Issue Gift Card</div>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: "Active Cards", val: "67", sub: "Currently in circulation" },
              { label: "Total Revenue", val: "$3,350", sub: "Lifetime sold" },
              { label: "Redeemed", val: "$1,420", sub: "Total used" },
              { label: "Outstanding", val: "$1,930", sub: "Remaining balance" },
            ].map((k) => (
              <div key={k.label} className="bg-white rounded-lg p-3 border border-cream-300 shadow-card">
                <p className="text-[8px] text-ink/40 uppercase tracking-wide font-semibold mb-1">{k.label}</p>
                <p className="text-[18px] font-bold text-ink leading-none mb-1">{k.val}</p>
                <p className="text-[8px] text-ink/40">{k.sub}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-cream-300 shadow-card overflow-hidden">
            <div className="grid grid-cols-5 gap-2 px-4 py-2.5 border-b border-cream-300 bg-cream-100">
              {["Code", "Purchaser", "Balance", "Original", "Status"].map((h) => (
                <p key={h} className="text-[8px] font-semibold text-ink/40 uppercase tracking-wide">{h}</p>
              ))}
            </div>
            {[
              { code: "GC-8A3F", buyer: "Sarah Johnson", bal: "$50.00", orig: "$50.00", status: "Active", c: "bg-success/10 text-success" },
              { code: "GC-2B7D", buyer: "Mike Rivera", bal: "$12.50", orig: "$25.00", status: "Partial", c: "bg-mustard/10 text-warning" },
              { code: "GC-9E1C", buyer: "Lisa Chen", bal: "$75.00", orig: "$75.00", status: "Active", c: "bg-success/10 text-success" },
              { code: "GC-4F6A", buyer: "Tom Williams", bal: "$0.00", orig: "$100.00", status: "Redeemed", c: "bg-ink/5 text-ink/40" },
              { code: "GC-7D2E", buyer: "Anna Park", bal: "$30.00", orig: "$50.00", status: "Partial", c: "bg-mustard/10 text-warning" },
            ].map((r) => (
              <div key={r.code} className="grid grid-cols-5 gap-2 px-4 py-2.5 border-b border-cream-200 last:border-0 items-center">
                <p className="text-[10px] font-medium text-ink font-mono">{r.code}</p>
                <p className="text-[9px] text-ink/50">{r.buyer}</p>
                <p className="text-[10px] font-semibold text-ink">{r.bal}</p>
                <p className="text-[9px] text-ink/40">{r.orig}</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-medium w-fit ${r.c}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================
   MOCKUP 7 — Time Clock
   ============================================= */

function TimeClockMockup() {
  return (
    <div className="flex h-full">
      <MockSidebar active="Time Clock" />
      <div className="flex-1 bg-cream overflow-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-ink text-[13px]">Time Clock</p>
            <div className="flex gap-2">
              <div className="px-2.5 py-1.5 bg-white border border-cream-300 text-[9px] text-ink/60 rounded-md">Manual Entry</div>
              <div className="px-2.5 py-1.5 bg-terracotta text-white text-[9px] font-medium rounded-md">Clock In / Out</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: "Staff On Clock", val: "4", sub: "Currently active", up: true },
              { label: "Hours Today", val: "26.5", sub: "Total logged" },
              { label: "Total Staff", val: "8", sub: "Registered employees" },
              { label: "Weekly Hours", val: "142", sub: "This pay period" },
            ].map((k) => (
              <div key={k.label} className="bg-white rounded-lg p-3 border border-cream-300 shadow-card">
                <p className="text-[8px] text-ink/40 uppercase tracking-wide font-semibold mb-1">{k.label}</p>
                <p className="text-[18px] font-bold text-ink leading-none mb-1">{k.val}</p>
                <p className={`text-[8px] font-medium ${k.up ? "text-success" : "text-ink/40"}`}>{k.sub}</p>
              </div>
            ))}
          </div>
          {/* Active staff banner */}
          <div className="bg-success/5 border border-success/15 rounded-lg p-3 mb-4">
            <p className="text-[9px] font-semibold text-success mb-2">Currently on clock</p>
            <div className="flex gap-2">
              {["Marcus T.", "Devon W.", "Lina P.", "Sarah K."].map((n) => (
                <div key={n} className="px-2.5 py-1 bg-white border border-success/20 rounded-full text-[8px] font-medium text-ink">
                  {n}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-cream-300 shadow-card overflow-hidden">
            <div className="grid grid-cols-6 gap-2 px-4 py-2.5 border-b border-cream-300 bg-cream-100">
              {["Staff", "Role", "Clock In", "Clock Out", "Hours", "Status"].map((h) => (
                <p key={h} className="text-[8px] font-semibold text-ink/40 uppercase tracking-wide">{h}</p>
              ))}
            </div>
            {[
              { name: "Marcus Thompson", role: "Manager", cin: "8:00 AM", cout: "—", hrs: "5.2h", status: "Active", c: "bg-success/10 text-success" },
              { name: "Devon Williams", role: "Host", cin: "9:30 AM", cout: "—", hrs: "3.7h", status: "Active", c: "bg-success/10 text-success" },
              { name: "Lina Patel", role: "Staff", cin: "10:00 AM", cout: "—", hrs: "3.2h", status: "Active", c: "bg-success/10 text-success" },
              { name: "Jake Morrison", role: "Staff", cin: "7:00 AM", cout: "3:00 PM", hrs: "7.5h", status: "Done", c: "bg-ink/5 text-ink/40" },
            ].map((r) => (
              <div key={r.name} className="grid grid-cols-6 gap-2 px-4 py-2.5 border-b border-cream-200 last:border-0 items-center">
                <p className="text-[10px] font-medium text-ink">{r.name}</p>
                <p className="text-[9px] text-ink/50">{r.role}</p>
                <p className="text-[9px] text-ink/50">{r.cin}</p>
                <p className="text-[9px] text-ink/50">{r.cout}</p>
                <p className="text-[9px] font-medium text-ink">{r.hrs}</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-medium w-fit ${r.c}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================
   MOCKUP 8 — Marketing
   ============================================= */

function MarketingMockup() {
  return (
    <div className="flex h-full">
      <MockSidebar active="Marketing" />
      <div className="flex-1 bg-cream overflow-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-ink text-[13px]">Marketing</p>
            <div className="flex gap-2">
              <div className="px-2.5 py-1.5 bg-white border border-cream-300 text-[9px] text-ink/60 rounded-md">Sync All</div>
              <div className="px-2.5 py-1.5 bg-terracotta text-white text-[9px] font-medium rounded-md">+ Connect Account</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: "Total Followers", val: "8.2K", sub: "+340 this month", up: true },
              { label: "Engagement Rate", val: "4.7%", sub: "Above average", up: true },
              { label: "Messages", val: "23", sub: "This week" },
              { label: "Profile Views", val: "1.4K", sub: "+18% vs last week", up: true },
            ].map((k) => (
              <div key={k.label} className="bg-white rounded-lg p-3 border border-cream-300 shadow-card">
                <p className="text-[8px] text-ink/40 uppercase tracking-wide font-semibold mb-1">{k.label}</p>
                <p className="text-[18px] font-bold text-ink leading-none mb-1">{k.val}</p>
                <p className={`text-[8px] font-medium ${k.up ? "text-success" : "text-ink/40"}`}>{k.sub}</p>
              </div>
            ))}
          </div>
          {/* Connected accounts */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { platform: "Instagram", handle: "@wonderplay.fun", followers: "5,200", synced: "2m ago" },
              { platform: "Facebook", handle: "WonderPlay Park", followers: "3,050", synced: "2m ago" },
            ].map((a) => (
              <div key={a.platform} className="bg-white rounded-lg border border-cream-300 shadow-card p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-cream-200 flex items-center justify-center">
                    <span className="text-[9px] text-ink/60">{a.platform === "Instagram" ? "IG" : "FB"}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-ink">{a.handle}</p>
                    <p className="text-[8px] text-ink/40">{a.followers} followers · Synced {a.synced}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="px-2 py-1 bg-cream-200 text-[8px] text-ink/60 rounded">Sync</div>
                  <div className="px-2 py-1 bg-cream-100 text-[8px] text-ink/40 rounded">Disconnect</div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-cream-300 shadow-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-cream-300">
              <p className="text-[11px] font-semibold text-ink">Engagement Overview — Last 7 Days</p>
            </div>
            <div className="grid grid-cols-4 gap-2 px-4 py-2 border-b border-cream-300 bg-cream-100">
              {["Date", "Impressions", "Reach", "Engagement"].map((h) => (
                <p key={h} className="text-[8px] font-semibold text-ink/40 uppercase tracking-wide">{h}</p>
              ))}
            </div>
            {[
              { date: "Mar 7", imp: "1,240", reach: "890", eng: "5.1%" },
              { date: "Mar 6", imp: "1,100", reach: "780", eng: "4.8%" },
              { date: "Mar 5", imp: "980", reach: "710", eng: "4.2%" },
              { date: "Mar 4", imp: "1,350", reach: "920", eng: "5.5%" },
            ].map((r) => (
              <div key={r.date} className="grid grid-cols-4 gap-2 px-4 py-2 border-b border-cream-200 last:border-0">
                <p className="text-[9px] font-medium text-ink">{r.date}</p>
                <p className="text-[9px] text-ink/50">{r.imp}</p>
                <p className="text-[9px] text-ink/50">{r.reach}</p>
                <p className="text-[9px] text-success font-medium">{r.eng}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================
   TAB CONFIG
   ============================================= */

const tabs = [
  { id: "dashboard", label: "Dashboard", urlPath: "dashboard" },
  { id: "reservations", label: "Reservations", urlPath: "reservations" },
  { id: "checkin", label: "Check-In", urlPath: "check-in" },
  { id: "pos", label: "POS", urlPath: "pos" },
  { id: "inventory", label: "Inventory", urlPath: "inventory" },
  { id: "giftcards", label: "Gift Cards", urlPath: "gift-cards" },
  { id: "timeclock", label: "Time Clock", urlPath: "time-clock" },
  { id: "marketing", label: "Marketing", urlPath: "marketing" },
];

const mockups: Record<string, () => React.JSX.Element> = {
  dashboard: DashboardMockup,
  reservations: ReservationsMockup,
  checkin: CheckInMockup,
  pos: POSMockup,
  inventory: InventoryMockup,
  giftcards: GiftCardsMockup,
  timeclock: TimeClockMockup,
  marketing: MarketingMockup,
};

/* =============================================
   FEATURE GRID DATA
   ============================================= */

const features = [
  { icon: LayoutDashboard, title: "Real-time Dashboard", description: "Live KPIs, alerts, and today's schedule at a glance." },
  { icon: Calendar, title: "Reservations", description: "Manage bookings, walk-ins, and party scheduling." },
  { icon: ClipboardCheck, title: "QR Check-In", description: "Scan-and-go check-in with real-time capacity tracking." },
  { icon: ShoppingCart, title: "Point of Sale", description: "Ring up play sessions, food, merch, and party add-ons." },
  { icon: Package, title: "Inventory", description: "Track stock levels, get low-stock alerts, manage SKUs." },
  { icon: Gift, title: "Gift Cards", description: "Issue, sell, and redeem digital gift cards with balance tracking." },
  { icon: Timer, title: "Time Clock", description: "Employee clock in/out, break tracking, and payroll reports." },
  { icon: Megaphone, title: "Marketing", description: "Social media metrics, account management, and engagement data." },
];

/* =============================================
   PAGE
   ============================================= */

export default function VenueDemoPage() {
  const [active, setActive] = useState("dashboard");
  const activeTab = tabs.find((t) => t.id === active) || tabs[0];
  const MockupComponent = mockups[active] || DashboardMockup;

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="bg-ink pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="container-wide text-center">
          <p className="text-caption font-semibold text-terracotta uppercase tracking-widest mb-4">
            Product Tour
          </p>
          <h1 className="font-display font-semibold text-white text-[36px] md:text-[48px] lg:text-[56px] leading-tight mb-5 max-w-3xl mx-auto">
            See the platform in action
          </h1>
          <p className="text-body-l text-white/50 max-w-2xl mx-auto mb-8">
            Every tool a venue operator needs — bookings, check-in, POS, inventory, time clock, marketing — in one unified dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-terracotta text-white font-medium rounded-md hover:bg-terracotta-hover transition-colors text-body-m shadow-sm"
            >
              Try the Live Dashboard
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/get-demo"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-white font-medium rounded-md border border-white/16 hover:border-white/30 hover:bg-white/5 transition-all text-body-m"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ===== INTERACTIVE SHOWCASE ===== */}
      <section className="bg-ink pb-20 md:pb-28">
        <div className="container-wide">
          {/* Tab switcher */}
          <div className="flex justify-center mb-8 overflow-x-auto pb-2">
            <div className="inline-flex bg-white/6 border border-white/10 rounded-lg p-1 gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={cn(
                    "px-4 py-2 rounded-md text-body-s font-medium transition-all duration-200 whitespace-nowrap",
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

          {/* Browser chrome + mockup */}
          <div className="rounded-xl overflow-hidden border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
            {/* Browser bar */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#1C1916] border-b border-white/6">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <div className="flex-1 bg-[#0E0D0B] rounded-md px-4 py-1.5">
                <span className="text-white/25 text-[11px] font-mono">
                  app.venuekit.io/admin/{activeTab.urlPath}
                </span>
              </div>
            </div>
            {/* Screen */}
            <div className="h-[480px] md:h-[560px] overflow-hidden">
              <MockupComponent />
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURE GRID ===== */}
      <section className="bg-cream section-padding-lg">
        <div className="container-wide">
          <div className="text-center mb-12">
            <p className="text-caption font-semibold text-terracotta uppercase tracking-widest mb-3">
              Everything you need
            </p>
            <h2 className="font-display text-h1 text-ink mb-4">
              One platform, every operation
            </h2>
            <p className="text-body-l text-ink/55 max-w-2xl mx-auto">
              From the front desk to the back office, VenueKit OS gives you a complete command center to run your venue.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl border border-cream-300 p-6 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="w-11 h-11 rounded-lg bg-terracotta/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-terracotta" />
                </div>
                <h3 className="font-display text-h4 text-ink mb-2">{f.title}</h3>
                <p className="text-body-s text-ink/55">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="border-y border-cream-300 bg-cream-50">
        <div className="container-wide py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: "14+", label: "Admin modules" },
              { val: "< 2 min", label: "Average check-in time" },
              { val: "99.9%", label: "Platform uptime" },
              { val: "24/7", label: "Operator support" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-h2 text-terracotta">{s.val}</p>
                <p className="text-body-s text-ink/50 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ADDITIONAL CAPABILITIES ===== */}
      <section className="bg-cream-50 section-padding-lg">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="font-display text-h2 text-ink mb-4">And so much more</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { icon: Users, title: "Family Management", desc: "Track family profiles, children, and visit history." },
              { icon: CreditCard, title: "Memberships", desc: "Unlimited play plans, auto-renewal, and member perks." },
              { icon: QrCode, title: "Digital Waivers", desc: "E-sign waivers online or on-site before play." },
              { icon: BarChart3, title: "Analytics & Reports", desc: "Revenue, attendance, and trends at a glance." },
              { icon: Zap, title: "Automated Alerts", desc: "Party reminders, low-stock warnings, capacity alerts." },
              { icon: Shield, title: "Role-based Access", desc: "Control what each staff member can see and do." },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4 p-5 bg-white rounded-xl border border-cream-300">
                <div className="w-10 h-10 rounded-lg bg-ink/5 flex items-center justify-center shrink-0">
                  <f.icon className="h-5 w-5 text-ink/60" />
                </div>
                <div>
                  <h3 className="text-body-m font-semibold text-ink mb-1">{f.title}</h3>
                  <p className="text-body-s text-ink/50">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-ink section-padding-lg">
        <div className="container-wide">
          <div className="rounded-xl bg-gradient-to-r from-terracotta to-coral p-12 md:p-16 text-center">
            <h2 className="font-display text-h2 md:text-h1 text-white mb-4">
              Ready to run your venue smarter?
            </h2>
            <p className="text-body-l text-white/80 max-w-lg mx-auto mb-8">
              Get a personalized walkthrough or jump straight into the live demo dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/get-demo"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-terracotta font-medium rounded-md hover:bg-cream-50 transition-colors text-body-m"
              >
                Request a Demo
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-white font-medium rounded-md border border-white/30 hover:bg-white/10 transition-all text-body-m"
              >
                Explore Live Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
