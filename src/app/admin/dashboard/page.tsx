"use client";

import { Button, Card, CardContent, Badge, MetricCard } from "@/components/ui";
import {
  Users, DollarSign, PartyPopper, CreditCard,
  Clock, AlertCircle, ArrowRight, ArrowUpRight,
  Calendar, FileCheck, Plus,
} from "lucide-react";

const todayBookings = [
  { id: "1", name: "Sarah Johnson", time: "9:00 AM", children: 2, type: "Open Play", status: "confirmed", waiver: "signed" },
  { id: "2", name: "Mike Chen", time: "10:30 AM", children: 3, type: "Open Play", status: "confirmed", waiver: "signed" },
  { id: "3", name: "Amanda Torres", time: "12:00 PM", children: 1, type: "Open Play", status: "pending", waiver: "unsigned" },
  { id: "4", name: "David Kim", time: "1:30 PM", children: 2, type: "Open Play", status: "confirmed", waiver: "signed" },
];

const todayParties = [
  { id: "1", name: "Emma's 7th Birthday", time: "2:00 PM", package: "Premium", guests: 15, room: "Grand Suite", host: "Maria" },
  { id: "2", name: "Noah's Party", time: "5:00 PM", package: "Classic", guests: 10, room: "Party Room A", host: "TBD" },
];

const alerts = [
  { id: "1", type: "warning" as const, message: "3 unsigned waivers for today's bookings", action: "View waivers" },
  { id: "2", type: "info" as const, message: "Noah's party host not yet assigned", action: "Assign host" },
  { id: "3", type: "error" as const, message: "1 failed membership payment needs attention", action: "View details" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-h1 text-ink">Dashboard</h1>
          <p className="text-body-m text-ink-secondary">Saturday, March 7, 2026</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm">Export</Button>
          <Button size="sm"><Plus className="h-4 w-4" /> New Booking</Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Guests today"
          value="38"
          change="+12% vs last Sat"
          changeType="positive"
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Revenue today"
          value="$1,284"
          change="+8% vs last Sat"
          changeType="positive"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard
          title="Parties today"
          value="2"
          change="Both confirmed"
          changeType="neutral"
          icon={<PartyPopper className="h-5 w-5" />}
        />
        <MetricCard
          title="Active memberships"
          value="156"
          change="+4 this week"
          changeType="positive"
          icon={<CreditCard className="h-5 w-5" />}
        />
      </div>

      {/* Main row: Today's schedule + Upcoming parties */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-h3 text-ink flex items-center gap-2">
                  <Clock className="h-5 w-5 text-terracotta" /> Today&apos;s schedule
                </h2>
                <Button variant="tertiary" size="sm">View calendar <ArrowRight className="h-4 w-4" /></Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cream-300">
                      <th className="text-left text-label text-ink-secondary py-3 font-medium">Time</th>
                      <th className="text-left text-label text-ink-secondary py-3 font-medium">Family</th>
                      <th className="text-left text-label text-ink-secondary py-3 font-medium">Kids</th>
                      <th className="text-left text-label text-ink-secondary py-3 font-medium">Type</th>
                      <th className="text-left text-label text-ink-secondary py-3 font-medium">Waiver</th>
                      <th className="text-left text-label text-ink-secondary py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayBookings.map((b) => (
                      <tr key={b.id} className="border-b border-cream-200 hover:bg-cream-200/50 cursor-pointer transition-colors">
                        <td className="py-3 text-body-s text-ink font-medium">{b.time}</td>
                        <td className="py-3 text-body-s text-ink">{b.name}</td>
                        <td className="py-3 text-body-s text-ink">{b.children}</td>
                        <td className="py-3 text-body-s text-ink-secondary">{b.type}</td>
                        <td className="py-3">
                          <Badge variant={b.waiver === "signed" ? "success" : "error"} className="text-[11px]">
                            {b.waiver}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge variant={b.status === "confirmed" ? "success" : "warning"} className="text-[11px]">
                            {b.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming parties */}
        <div>
          <Card>
            <CardContent>
              <h2 className="font-display text-h3 text-ink flex items-center gap-2 mb-4">
                <PartyPopper className="h-5 w-5 text-terracotta" /> Today&apos;s parties
              </h2>
              <div className="space-y-4">
                {todayParties.map((p) => (
                  <div key={p.id} className="rounded-sm border border-cream-300 p-4 hover:shadow-card transition-shadow cursor-pointer">
                    <h3 className="text-body-m font-medium text-ink">{p.name}</h3>
                    <div className="mt-2 space-y-1 text-body-s text-ink-secondary">
                      <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {p.time}</p>
                      <p>{p.package} · {p.guests} guests · {p.room}</p>
                      <p>Host: {p.host}</p>
                    </div>
                    <Button variant="tertiary" size="sm" className="mt-2 -ml-2">
                      View details <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alerts row */}
      <Card>
        <CardContent>
          <h2 className="font-display text-h3 text-ink flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-terracotta" /> Alerts & actions
          </h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between rounded-sm border p-3 ${
                  alert.type === "error" ? "border-error/30 bg-error-light" :
                  alert.type === "warning" ? "border-warning/30 bg-warning-light" :
                  "border-info/30 bg-info-light"
                }`}
              >
                <p className="text-body-s text-ink">{alert.message}</p>
                <Button variant="tertiary" size="sm">{alert.action} <ArrowRight className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
