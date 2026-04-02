"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const COLORS: Record<string, string> = {
  openPlay: "#C96E4B",
  parties: "#8EAA92",
  cafe: "#7F9BB3",
  memberships: "#D9B25F",
};

const LABELS: Record<string, string> = {
  openPlay: "Open Play",
  parties: "Parties",
  cafe: "Cafe / POS",
  memberships: "Memberships",
};

interface DashboardBreakdownChartProps {
  data: { openPlay: number; parties: number; cafe: number; memberships: number };
}

export function DashboardBreakdownChart({ data }: DashboardBreakdownChartProps) {
  const chartData = Object.entries(data)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: LABELS[key] || key,
      value: Math.round(value * 100) / 100,
      color: COLORS[key] || "#DDD3C7",
    }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center text-body-s text-ink-secondary">
        No revenue data
      </div>
    );
  }

  return (
    <div className="h-[240px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #DDD3C7",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(31,29,26,0.08)",
            }}
          />
          {/* Center total label */}
          <text x="50%" y="42%" textAnchor="middle" className="fill-ink" style={{ fontSize: 20, fontWeight: 600, fontFamily: "Poppins, sans-serif" }}>
            ${total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toFixed(0)}
          </text>
          <text x="50%" y="50%" textAnchor="middle" className="fill-ink-secondary" style={{ fontSize: 11 }}>
            Total
          </text>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend below */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 -mt-2">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-caption text-ink-secondary">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
