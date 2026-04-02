"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface DashboardVisitorsChartProps {
  data: { date: string; visitors: number }[];
}

export function DashboardVisitorsChart({ data }: DashboardVisitorsChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center text-body-s text-ink-secondary">
        No visitor data
      </div>
    );
  }

  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDD3C7" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#6B645C" }}
            tickLine={false}
            axisLine={{ stroke: "#DDD3C7" }}
            tickFormatter={(v) => {
              const d = new Date(v + "T12:00:00");
              return d.toLocaleDateString("en-US", { weekday: "narrow" });
            }}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6B645C" }}
            tickLine={false}
            axisLine={false}
            width={32}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(value) => [value, "Visitors"]}
            labelFormatter={(label) => {
              const d = new Date(label + "T12:00:00");
              return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
            }}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #DDD3C7",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(31,29,26,0.08)",
            }}
          />
          <Bar
            dataKey="visitors"
            fill="#8EAA92"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
