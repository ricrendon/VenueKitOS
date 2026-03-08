"use client";

import { Card, CardContent } from "@/components/ui";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
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
  cafe: "Cafe/POS",
  memberships: "Memberships",
};

interface RevenueBreakdownChartProps {
  data: { openPlay: number; parties: number; cafe: number; memberships: number };
}

export function RevenueBreakdownChart({ data }: RevenueBreakdownChartProps) {
  const chartData = Object.entries(data)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: LABELS[key] || key,
      value: Math.round(value * 100) / 100,
      color: COLORS[key] || "#DDD3C7",
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent>
          <h3 className="text-body-m font-medium text-ink mb-4">Revenue Breakdown</h3>
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
        <h3 className="text-body-m font-medium text-ink mb-4">Revenue Breakdown</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]}
                contentStyle={{ borderRadius: 8, border: "1px solid #DDD3C7", fontSize: 12 }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                formatter={(value) => <span className="text-body-s text-ink-secondary">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
