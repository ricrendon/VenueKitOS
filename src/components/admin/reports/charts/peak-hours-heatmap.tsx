"use client";

import { Card, CardContent } from "@/components/ui";

interface PeakHoursHeatmapProps {
  data: { dayOfWeek: number; hour: number; utilization: number }[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 9); // 9 AM to 9 PM

function getColor(utilization: number): string {
  if (utilization === 0) return "bg-cream-100";
  if (utilization < 20) return "bg-terracotta/10";
  if (utilization < 40) return "bg-terracotta/20";
  if (utilization < 60) return "bg-terracotta/40";
  if (utilization < 80) return "bg-terracotta/60";
  return "bg-terracotta/80";
}

function formatHour(hour: number): string {
  if (hour === 0 || hour === 12) return "12";
  return String(hour > 12 ? hour - 12 : hour);
}

export function PeakHoursHeatmap({ data }: PeakHoursHeatmapProps) {
  const dataMap: Record<string, number> = {};
  data.forEach((d) => {
    dataMap[`${d.dayOfWeek}-${d.hour}`] = d.utilization;
  });

  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <h3 className="text-body-m font-medium text-ink mb-4">Peak Hours</h3>
          <div className="h-[300px] flex items-center justify-center text-body-s text-ink-secondary">
            No data for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <h3 className="text-body-m font-medium text-ink mb-4">Peak Hours</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Hour headers */}
            <div className="grid gap-1" style={{ gridTemplateColumns: `60px repeat(${HOURS.length}, 1fr)` }}>
              <div />
              {HOURS.map((h) => (
                <div key={h} className="text-center text-[10px] text-ink-secondary font-medium pb-1">
                  {formatHour(h)}{h < 12 ? "a" : "p"}
                </div>
              ))}

              {/* Day rows */}
              {DAY_LABELS.map((day, dayIndex) => (
                <>
                  <div key={`label-${dayIndex}`} className="text-body-s text-ink-secondary font-medium flex items-center">
                    {day}
                  </div>
                  {HOURS.map((hour) => {
                    const util = dataMap[`${dayIndex}-${hour}`] || 0;
                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className={`h-8 rounded-sm ${getColor(util)} transition-colors`}
                        title={`${day} ${formatHour(hour)}${hour < 12 ? "AM" : "PM"}: ${util}% capacity`}
                      />
                    );
                  })}
                </>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 justify-center">
              <span className="text-[10px] text-ink-secondary">Low</span>
              <div className="h-3 w-6 rounded-sm bg-terracotta/10" />
              <div className="h-3 w-6 rounded-sm bg-terracotta/20" />
              <div className="h-3 w-6 rounded-sm bg-terracotta/40" />
              <div className="h-3 w-6 rounded-sm bg-terracotta/60" />
              <div className="h-3 w-6 rounded-sm bg-terracotta/80" />
              <span className="text-[10px] text-ink-secondary">High</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
