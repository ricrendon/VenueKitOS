"use client";

import { Card, CardContent } from "@/components/ui";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface DailyVisitorsChartProps {
  data: { date: string; visitors: number }[];
}

export function DailyVisitorsChart({ data }: DailyVisitorsChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <h3 className="text-body-m font-medium text-ink mb-4">Daily Visitors</h3>
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
        <h3 className="text-body-m font-medium text-ink mb-4">Daily Visitors</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDD3C7" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#6B645C" }}
                tickFormatter={(v) => {
                  const d = new Date(v + "T12:00:00");
                  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
                }}
              />
              <YAxis tick={{ fontSize: 11, fill: "#6B645C" }} />
              <Tooltip
                formatter={(value) => [value, "Visitors"]}
                labelFormatter={(label) => {
                  const d = new Date(label + "T12:00:00");
                  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                }}
                contentStyle={{ borderRadius: 8, border: "1px solid #DDD3C7", fontSize: 12 }}
              />
              <Bar dataKey="visitors" fill="#8EAA92" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
