"use client";

import { Card, CardContent } from "@/components/ui";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { RevenueBySourceChart } from "./charts/revenue-by-source-chart";
import { AvgTransactionChart } from "./charts/avg-transaction-chart";

interface RevenueData {
  dailyBySource: { date: string; openPlay: number; parties: number; cafe: number; memberships: number }[];
  comparison: { current: number; previous: number; changePercent: number };
  topDays: { date: string; revenue: number; bookings: number }[];
  avgTransactionTrend: { date: string; avgValue: number }[];
}

interface RevenueTabProps {
  data: RevenueData;
}

export function RevenueTab({ data }: RevenueTabProps) {
  const { comparison } = data;
  const isUp = comparison.changePercent > 0;
  const isDown = comparison.changePercent < 0;

  return (
    <div className="space-y-6">
      {/* Revenue by Source */}
      <RevenueBySourceChart data={data.dailyBySource} />

      {/* Period Comparison */}
      <Card>
        <CardContent>
          <h3 className="text-body-m font-medium text-ink mb-4">Period Comparison</h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-label text-ink-secondary mb-1">Current Period</p>
              <p className="font-display text-h3 text-ink">
                ${comparison.current.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-label text-ink-secondary mb-1">Previous Period</p>
              <p className="font-display text-h3 text-ink-secondary">
                ${comparison.previous.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-label text-ink-secondary mb-1">Change</p>
              <div className="flex items-center justify-center gap-1">
                {isUp && <TrendingUp className="h-5 w-5 text-success" />}
                {isDown && <TrendingDown className="h-5 w-5 text-error" />}
                {!isUp && !isDown && <Minus className="h-5 w-5 text-ink-secondary" />}
                <p className={`font-display text-h3 ${isUp ? "text-success" : isDown ? "text-error" : "text-ink-secondary"}`}>
                  {isUp ? "+" : ""}{comparison.changePercent}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Revenue Days */}
        <Card>
          <CardContent>
            <h3 className="text-body-m font-medium text-ink mb-4">Top Revenue Days</h3>
            {data.topDays.length === 0 ? (
              <p className="text-body-s text-ink-secondary text-center py-6">No data for this period</p>
            ) : (
              <div className="space-y-3">
                {data.topDays.map((day, i) => {
                  const d = new Date(day.date + "T12:00:00");
                  const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                  return (
                    <div key={day.date} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center h-7 w-7 rounded-full bg-cream-200 text-caption font-medium text-ink-secondary">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-body-s font-medium text-ink">{label}</p>
                          <p className="text-caption text-ink-secondary">{day.bookings} bookings</p>
                        </div>
                      </div>
                      <p className="text-body-m font-medium text-terracotta">
                        ${day.revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Avg Transaction */}
        <AvgTransactionChart data={data.avgTransactionTrend} />
      </div>
    </div>
  );
}
