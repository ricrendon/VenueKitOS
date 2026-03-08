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
  Legend,
} from "recharts";

interface NewVsReturningChartProps {
  data: { date: string; new: number; returning: number }[];
}

export function NewVsReturningChart({ data }: NewVsReturningChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <h3 className="text-body-m font-medium text-ink mb-4">New vs Returning Customers</h3>
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
        <h3 className="text-body-m font-medium text-ink mb-4">New vs Returning Customers</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
                labelFormatter={(label) => {
                  const d = new Date(label + "T12:00:00");
                  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                }}
                contentStyle={{ borderRadius: 8, border: "1px solid #DDD3C7", fontSize: 12 }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                formatter={(value) => {
                  const labels: Record<string, string> = { new: "New", returning: "Returning" };
                  return <span className="text-body-s text-ink-secondary">{labels[value] || value}</span>;
                }}
              />
              <Area type="monotone" dataKey="returning" stackId="1" stroke="#8EAA92" fill="#8EAA92" fillOpacity={0.4} />
              <Area type="monotone" dataKey="new" stackId="1" stroke="#7F9BB3" fill="#7F9BB3" fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
