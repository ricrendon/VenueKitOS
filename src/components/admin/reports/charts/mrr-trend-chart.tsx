"use client";

import { Card, CardContent } from "@/components/ui";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface MrrTrendChartProps {
  data: { month: string; mrr: number }[];
}

export function MrrTrendChart({ data }: MrrTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <h3 className="text-body-m font-medium text-ink mb-4">Monthly Recurring Revenue</h3>
          <div className="h-[300px] flex items-center justify-center text-body-s text-ink-secondary">
            No membership data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <h3 className="text-body-m font-medium text-ink mb-4">Monthly Recurring Revenue</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDD3C7" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#6B645C" }}
                tickFormatter={(v) => {
                  const [year, month] = v.split("-");
                  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  return `${months[parseInt(month) - 1]} '${year.slice(2)}`;
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B645C" }}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "MRR"]}
                contentStyle={{ borderRadius: 8, border: "1px solid #DDD3C7", fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="mrr"
                stroke="#8EAA92"
                strokeWidth={2}
                dot={{ r: 4, fill: "#8EAA92" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
