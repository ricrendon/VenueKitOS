"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, Badge, MetricCard } from "@/components/ui";
import {
  Users, DollarSign, PartyPopper, CreditCard,
  Clock, AlertCircle, ArrowRight, ArrowUpRight,
  Plus, Loader2, CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";

interface DashboardData {
  kpis: {
    guestsToday: number;
    checkedIn: number;
    revenueToday: number;
    partiesToday: number;
    activeMemberships: number;
    signedWaivers: number;
  };
  bookings: {
    id: string;
    name: string;
    time: string;
    children: number;
    type: string;
    status: string;
    paymentStatus: string;
    confirmationCode: string;
    checkedIn: boolean;
  }[];
  parties: {
    id: string;
    name: string;
    time: string;
    package: string;
    guests: number;
    room: string;
    status: string;
    balanceRemaining: number;
  }[];
  alerts: {
    type: string;
    message: string;
    action: string;
  }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load dashboard data");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-terracotta mx-auto mb-3" />
          <p className="text-body-m text-ink-secondary">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-body-m text-error">{error || "Something went wrong"}</p>
      </div>
    );
  }

  const todayStr = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-h1 text-ink">Dashboard</h1>
          <p className="text-body-m text-ink-secondary">{todayStr}</p>
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
          value={String(data.kpis.guestsToday)}
          change={`${data.kpis.checkedIn} checked in`}
          changeType="positive"
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Revenue today"
          value={`$${data.kpis.revenueToday.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="From confirmed bookings"
          changeType="positive"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard
          title="Parties today"
          value={String(data.kpis.partiesToday)}
          change={data.kpis.partiesToday > 0 ? "See schedule below" : "None scheduled"}
          changeType="neutral"
          icon={<PartyPopper className="h-5 w-5" />}
        />
        <MetricCard
          title="Active memberships"
          value={String(data.kpis.activeMemberships)}
          change={`${data.kpis.signedWaivers} signed waivers`}
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
                <Button variant="tertiary" size="sm">View all <ArrowRight className="h-4 w-4" /></Button>
              </div>

              {data.bookings.length === 0 ? (
                <p className="text-body-m text-ink-secondary py-8 text-center">No bookings for today</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-cream-300">
                        <th className="text-left text-label text-ink-secondary py-3 font-medium">Time</th>
                        <th className="text-left text-label text-ink-secondary py-3 font-medium">Family</th>
                        <th className="text-left text-label text-ink-secondary py-3 font-medium">Kids</th>
                        <th className="text-left text-label text-ink-secondary py-3 font-medium">Type</th>
                        <th className="text-left text-label text-ink-secondary py-3 font-medium">Status</th>
                        <th className="text-left text-label text-ink-secondary py-3 font-medium">Check-in</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.bookings.map((b) => (
                        <tr key={b.id} className="border-b border-cream-200 hover:bg-cream-200/50 cursor-pointer transition-colors">
                          <td className="py-3 text-body-s text-ink font-medium">{b.time}</td>
                          <td className="py-3 text-body-s text-ink">{b.name}</td>
                          <td className="py-3 text-body-s text-ink">{b.children}</td>
                          <td className="py-3 text-body-s text-ink-secondary">{b.type}</td>
                          <td className="py-3">
                            <Badge variant={b.status === "confirmed" ? "success" : "warning"} className="text-[11px]">
                              {b.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            {b.checkedIn ? (
                              <span className="flex items-center gap-1 text-body-s text-success font-medium">
                                <CheckCircle2 className="h-4 w-4" /> Done
                              </span>
                            ) : (
                              <Badge variant="default" className="text-[11px]">Pending</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Today's parties */}
        <div>
          <Card>
            <CardContent>
              <h2 className="font-display text-h3 text-ink flex items-center gap-2 mb-4">
                <PartyPopper className="h-5 w-5 text-terracotta" /> Today&apos;s parties
              </h2>

              {data.parties.length === 0 ? (
                <p className="text-body-m text-ink-secondary py-8 text-center">No parties today</p>
              ) : (
                <div className="space-y-4">
                  {data.parties.map((p) => (
                    <div key={p.id} className="rounded-sm border border-cream-300 p-4 hover:shadow-card transition-shadow cursor-pointer">
                      <h3 className="text-body-m font-medium text-ink">{p.name}</h3>
                      <div className="mt-2 space-y-1 text-body-s text-ink-secondary">
                        <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {p.time}</p>
                        <p>{p.package} · {p.guests} guests · {p.room}</p>
                        {p.balanceRemaining > 0 && (
                          <p className="text-warning font-medium">
                            Balance: ${p.balanceRemaining.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <Button variant="tertiary" size="sm" className="mt-2 -ml-2">
                        View details <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alerts row */}
      {data.alerts.length > 0 && (
        <Card>
          <CardContent>
            <h2 className="font-display text-h3 text-ink flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-terracotta" /> Alerts & actions
            </h2>
            <div className="space-y-3">
              {data.alerts.map((alert, i) => (
                <div
                  key={i}
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
      )}
    </div>
  );
}
