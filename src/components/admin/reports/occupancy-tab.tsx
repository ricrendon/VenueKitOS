"use client";

import { Card, CardContent } from "@/components/ui";
import { PeakHoursHeatmap } from "./charts/peak-hours-heatmap";
import { CapacityTrendChart } from "./charts/capacity-trend-chart";

interface OccupancyData {
  heatmap: { dayOfWeek: number; hour: number; utilization: number }[];
  fillRate: { timeSlot: string; fillPercent: number }[];
  capacityTrend: { date: string; utilization: number }[];
  busiestDays: { date: string; dayName: string; guests: number }[];
}

interface OccupancyTabProps {
  data: OccupancyData;
}

export function OccupancyTab({ data }: OccupancyTabProps) {
  return (
    <div className="space-y-6">
      {/* Peak Hours Heatmap */}
      <PeakHoursHeatmap data={data.heatmap} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fill Rate by Time Slot */}
        <Card>
          <CardContent>
            <h3 className="text-body-m font-medium text-ink mb-4">Fill Rate by Time Slot</h3>
            {data.fillRate.length === 0 ? (
              <p className="text-body-s text-ink-secondary text-center py-6">No data for this period</p>
            ) : (
              <div className="space-y-3">
                {data.fillRate.map((slot) => {
                  const hour = parseInt(slot.timeSlot);
                  const label = `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;
                  return (
                    <div key={slot.timeSlot}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-body-s text-ink">{label}</span>
                        <span className="text-caption text-ink-secondary">{slot.fillPercent}%</span>
                      </div>
                      <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-terracotta rounded-full transition-all"
                          style={{ width: `${Math.min(100, slot.fillPercent)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Busiest Days */}
        <Card>
          <CardContent>
            <h3 className="text-body-m font-medium text-ink mb-4">Busiest Days</h3>
            {data.busiestDays.length === 0 ? (
              <p className="text-body-s text-ink-secondary text-center py-6">No data for this period</p>
            ) : (
              <div className="space-y-3">
                {data.busiestDays.map((day, i) => {
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
                          <p className="text-caption text-ink-secondary">{day.dayName}</p>
                        </div>
                      </div>
                      <p className="text-body-m font-medium text-terracotta">
                        {day.guests} guests
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Capacity Trend */}
      <CapacityTrendChart data={data.capacityTrend} />
    </div>
  );
}
