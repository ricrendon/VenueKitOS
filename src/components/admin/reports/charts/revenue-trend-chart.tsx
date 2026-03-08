"use client";

import { Card, CardContent } from "@/components/ui";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface RevenueTrendChartProps {
  data: { date: string; revenue: number }[];
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <h3 className="text-body-m font-medium text-ink mb-4">Revenue Trend</h3>
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
        <h3 className="text-body-m font-medium text-ink mb-4">Revenue Trend</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C96E4B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C96E4B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDD3C7" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#6B645C" }}
                tickFormatter={(v) => {
                  const d = new Date(v + "T12:00:00");
                  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B645C" }}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                labelFormatter={(label) => {
                  const d = new Date(label + "T12:00:00");
                  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                }}
                contentStyle={{ borderRadius: 8, border: "1px solid #DDD3C7", fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#C96E4B"
                strokeWidth={2}
                fill="url(#revGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
