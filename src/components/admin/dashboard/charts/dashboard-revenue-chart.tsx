"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface DashboardRevenueChartProps {
  data: { date: string; revenue: number }[];
}

export function DashboardRevenueChart({ data }: DashboardRevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center text-body-s text-ink-secondary">
        No revenue data for this period
      </div>
    );
  }

  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="dashRevGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C96E4B" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#C96E4B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDD3C7" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#6B645C" }}
            tickLine={false}
            axisLine={{ stroke: "#DDD3C7" }}
            tickFormatter={(v) => {
              const d = new Date(v + "T12:00:00");
              return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
            }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6B645C" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
            width={48}
          />
          <Tooltip
            formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
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
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#C96E4B"
            strokeWidth={2.5}
            fill="url(#dashRevGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#C96E4B", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
