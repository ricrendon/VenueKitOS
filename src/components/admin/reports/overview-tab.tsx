"use client";

import { MetricCard } from "@/components/ui";
import { DollarSign, Users, TrendingUp, CalendarCheck } from "lucide-react";
import { RevenueTrendChart } from "./charts/revenue-trend-chart";
import { RevenueBreakdownChart } from "./charts/revenue-breakdown-chart";
import { DailyVisitorsChart } from "./charts/daily-visitors-chart";

interface OverviewData {
  kpis: {
    totalRevenue: number;
    revenueChange: number;
    totalVisitors: number;
    visitorsChange: number;
    avgRevenuePerVisitor: number;
    avgRevenueChange: number;
    bookingsCount: number;
    bookingsChange: number;
  };
  revenueTrend: { date: string; revenue: number }[];
  revenueBreakdown: { openPlay: number; parties: number; cafe: number; memberships: number };
  dailyVisitors: { date: string; visitors: number }[];
}

interface OverviewTabProps {
  data: OverviewData;
}

function formatChange(pct: number): string {
  if (pct === 0) return "No change";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}% vs prev period`;
}

export function OverviewTab({ data }: OverviewTabProps) {
  const { kpis } = data;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${kpis.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          change={formatChange(kpis.revenueChange)}
          changeType={kpis.revenueChange > 0 ? "positive" : kpis.revenueChange < 0 ? "negative" : "neutral"}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard
          title="Total Visitors"
          value={kpis.totalVisitors.toLocaleString()}
          change={formatChange(kpis.visitorsChange)}
          changeType={kpis.visitorsChange > 0 ? "positive" : kpis.visitorsChange < 0 ? "negative" : "neutral"}
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Avg Revenue / Visitor"
          value={`$${kpis.avgRevenuePerVisitor.toFixed(2)}`}
          change={formatChange(kpis.avgRevenueChange)}
          changeType={kpis.avgRevenueChange > 0 ? "positive" : kpis.avgRevenueChange < 0 ? "negative" : "neutral"}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          title="Bookings"
          value={kpis.bookingsCount.toLocaleString()}
          change={formatChange(kpis.bookingsChange)}
          changeType={kpis.bookingsChange > 0 ? "positive" : kpis.bookingsChange < 0 ? "negative" : "neutral"}
          icon={<CalendarCheck className="h-5 w-5" />}
        />
      </div>

      {/* Revenue Trend */}
      <RevenueTrendChart data={data.revenueTrend} />

      {/* 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueBreakdownChart data={data.revenueBreakdown} />
        <DailyVisitorsChart data={data.dailyVisitors} />
      </div>
    </div>
  );
}
