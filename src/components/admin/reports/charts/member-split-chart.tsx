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

interface MemberSplitChartProps {
  data: { members: number; nonMembers: number };
}

export function MemberSplitChart({ data }: MemberSplitChartProps) {
  const chartData = [
    { name: "Members", value: data.members, color: "#8EAA92" },
    { name: "Non-Members", value: data.nonMembers, color: "#DDD3C7" },
  ].filter((d) => d.value > 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent>
          <h3 className="text-body-m font-medium text-ink mb-4">Member vs Non-Member</h3>
          <div className="h-[250px] flex items-center justify-center text-body-s text-ink-secondary">
            No data for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.members + data.nonMembers;
  const memberPct = total > 0 ? Math.round((data.members / total) * 100) : 0;

  return (
    <Card>
      <CardContent>
        <h3 className="text-body-m font-medium text-ink mb-4">Member vs Non-Member</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [value, "Bookings"]}
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
        <p className="text-center text-caption text-ink-secondary mt-1">
          {memberPct}% of bookings from members
        </p>
      </CardContent>
    </Card>
  );
}
