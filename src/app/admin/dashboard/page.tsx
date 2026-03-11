"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, Badge, MetricCard } from "@/components/ui";
import {
  Users, DollarSign, PartyPopper, CreditCard,
  Clock, AlertCircle, ArrowRight, ArrowUpRight,
  Plus, Loader2, CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DashboardRevenueChart } from "@/components/admin/dashboard/charts/dashboard-revenue-chart";
import { DashboardBreakdownChart } from "@/components/admin/dashboard/charts/dashboard-breakdown-chart";
import { DashboardVisitorsChart } from "@/components/admin/dashboard/charts/dashboard-visitors-chart";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DashboardData {
  kpis: {
    guestsToday: number;
    checkedIn: number;
    revenueToday: number;
    partiesToday: number;
    activeMemberships: number;
    signedWaivers: number;
    guestsTrend: number;
    revenueTrend: number;
  };
  trends: {
    revenueLast30: { date: string; revenue: number }[];
    revenueBreakdown: { openPlay: number; parties: number; cafe: number; memberships: number };
    visitorsLast14: { date: string; visitors: number }[];
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

/* ------------------------------------------------------------------ */
/*  Period selector options                                            */
/* ------------------------------------------------------------------ */

const PERIODS = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
] as const;

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/dashboard?period=${period}`)
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
  }, [period]);

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
      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-h1 text-ink">Dashboard</h1>
          <p className="text-body-m text-ink-secondary">{todayStr}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector pills */}
          <div className="flex rounded-sm border border-cream-300 bg-cream-50 p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  "px-3 py-1.5 rounded-sm text-body-s font-medium transition-colors",
                  period === p.value
                    ? "bg-terracotta text-white shadow-sm"
                    : "text-ink-secondary hover:text-ink"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm">Export</Button>
          <Button size="sm"><Plus className="h-4 w-4" /> New Booking</Button>
        </div>
      </div>

      {/* ── KPI row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Guests today"
          value={String(data.kpis.guestsToday)}
          change={
            data.kpis.guestsTrend !== 0
              ? `${data.kpis.guestsTrend > 0 ? "+" : ""}${data.kpis.guestsTrend}% vs yesterday`
              : `${data.kpis.checkedIn} checked in`
          }
          changeType={data.kpis.guestsTrend > 0 ? "positive" : data.kpis.guestsTrend < 0 ? "negative" : "neutral"}
          icon={<Users className="h-5 w-5" />}
          iconColor="terracotta"
        />
        <MetricCard
          title="Revenue today"
          value={`$${data.kpis.revenueToday.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={
            data.kpis.revenueTrend !== 0
              ? `${data.kpis.revenueTrend > 0 ? "+" : ""}${data.kpis.revenueTrend}% vs yesterday`
              : "From confirmed bookings"
          }
          changeType={data.kpis.revenueTrend > 0 ? "positive" : data.kpis.revenueTrend < 0 ? "negative" : "neutral"}
          icon={<DollarSign className="h-5 w-5" />}
          iconColor="sage"
        />
        <MetricCard
          title="Parties today"
          value={String(data.kpis.partiesToday)}
          change={data.kpis.partiesToday > 0 ? "See schedule below" : "None scheduled"}
          changeType="neutral"
          icon={<PartyPopper className="h-5 w-5" />}
          iconColor="mustard"
        />
        <MetricCard
          title="Active memberships"
          value={String(data.kpis.activeMemberships)}
          change={`${data.kpis.signedWaivers} signed waivers`}
          changeType="positive"
          icon={<CreditCard className="h-5 w-5" />}
          iconColor="dusty-blue"
        />
      </div>

      {/* ── Charts row: Revenue trend + Revenue breakdown ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-h4 text-ink">Revenue Trend</h2>
              <Link
                href="/admin/reports"
                className="text-body-s text-terracotta hover:text-terracotta-hover font-medium flex items-center gap-1 transition-colors"
              >
                View Report <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <DashboardRevenueChart data={data.trends.revenueLast30} />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="font-display text-h4 text-ink mb-4">Revenue Sources</h2>
            <DashboardBreakdownChart data={data.trends.revenueBreakdown} />
          </CardContent>
        </Card>
      </div>

      {/* ── Mid row: Visitors chart + Today's schedule ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visitors bar chart */}
        <Card>
          <CardContent>
            <h2 className="font-display text-h4 text-ink mb-4">Daily Visitors</h2>
            <DashboardVisitorsChart data={data.trends.visitorsLast14} />
          </CardContent>
        </Card>

        {/* Today's schedule */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-h4 text-ink flex items-center gap-2">
                  <Clock className="h-5 w-5 text-terracotta" /> Today&apos;s Schedule
                </h2>
                <Link
                  href="/admin/reservations"
                  className="text-body-s text-terracotta hover:text-terracotta-hover font-medium flex items-center gap-1 transition-colors"
                >
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
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
      </div>

      {/* ── Bottom row: Today's parties + Alerts ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's parties */}
        <Card>
          <CardContent>
            <h2 className="font-display text-h4 text-ink flex items-center gap-2 mb-4">
              <PartyPopper className="h-5 w-5 text-terracotta" /> Today&apos;s Parties
            </h2>

            {data.parties.length === 0 ? (
              <p className="text-body-m text-ink-secondary py-8 text-center">No parties today</p>
            ) : (
              <div className="space-y-3">
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
                    <Link
                      href="/admin/parties"
                      className="inline-flex items-center gap-1 mt-2 text-body-s text-terracotta hover:text-terracotta-hover font-medium transition-colors"
                    >
                      View details <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts & actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent>
              <h2 className="font-display text-h4 text-ink flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-terracotta" /> Alerts & Actions
              </h2>

              {data.alerts.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-body-m text-ink-secondary">All clear — no alerts right now</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.alerts.map((alert, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center justify-between rounded-sm border p-3",
                        alert.type === "error" && "border-error/30 bg-error-light",
                        alert.type === "warning" && "border-warning/30 bg-warning-light",
                        alert.type !== "error" && alert.type !== "warning" && "border-info/30 bg-info-light",
                      )}
                    >
                      <p className="text-body-s text-ink">{alert.message}</p>
                      <Button variant="tertiary" size="sm">{alert.action} <ArrowRight className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
