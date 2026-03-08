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
  Legend,
} from "recharts";

interface RevenueBySourceChartProps {
  data: { date: string; openPlay: number; parties: number; cafe: number; memberships: number }[];
}

export function RevenueBySourceChart({ data }: RevenueBySourceChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <h3 className="text-body-m font-medium text-ink mb-4">Revenue by Source</h3>
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
        <h3 className="text-body-m font-medium text-ink mb-4">Revenue by Source</h3>
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
              <YAxis
                tick={{ fontSize: 11, fill: "#6B645C" }}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              />
              <Tooltip
                formatter={(value, name) => {
                  const labels: Record<string, string> = {
                    openPlay: "Open Play",
                    parties: "Parties",
                    cafe: "Cafe/POS",
                    memberships: "Memberships",
                  };
                  return [`$${Number(value).toFixed(2)}`, labels[String(name)] || String(name)];
                }}
                contentStyle={{ borderRadius: 8, border: "1px solid #DDD3C7", fontSize: 12 }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    openPlay: "Open Play",
                    parties: "Parties",
                    cafe: "Cafe/POS",
                    memberships: "Memberships",
                  };
                  return <span className="text-body-s text-ink-secondary">{labels[value] || value}</span>;
                }}
              />
              <Bar dataKey="openPlay" stackId="a" fill="#C96E4B" />
              <Bar dataKey="parties" stackId="a" fill="#8EAA92" />
              <Bar dataKey="cafe" stackId="a" fill="#7F9BB3" />
              <Bar dataKey="memberships" stackId="a" fill="#D9B25F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
