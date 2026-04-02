"use client";

import { Card, CardContent, Badge } from "@/components/ui";
import { NewVsReturningChart } from "./charts/new-vs-returning-chart";
import { MemberSplitChart } from "./charts/member-split-chart";
import { MrrTrendChart } from "./charts/mrr-trend-chart";

interface CustomersData {
  newVsReturning: { date: string; new: number; returning: number }[];
  memberSplit: { members: number; nonMembers: number };
  membersByTier: { tier: string; count: number }[];
  mrrTrend: { month: string; mrr: number }[];
  churnRate: number;
}

interface CustomersTabProps {
  data: CustomersData;
}

const TIER_COLORS: Record<string, string> = {
  Explorer: "bg-dusty-blue/20 text-dusty-blue",
  Adventurer: "bg-sage/20 text-sage",
  Ultimate: "bg-terracotta/20 text-terracotta",
};

export function CustomersTab({ data }: CustomersTabProps) {
  return (
    <div className="space-y-6">
      {/* New vs Returning */}
      <NewVsReturningChart data={data.newVsReturning} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Split */}
        <MemberSplitChart data={data.memberSplit} />

        {/* Members by Tier + Churn */}
        <Card>
          <CardContent>
            <h3 className="text-body-m font-medium text-ink mb-4">Membership Breakdown</h3>

            {data.membersByTier.length === 0 ? (
              <p className="text-body-s text-ink-secondary text-center py-4">No active memberships</p>
            ) : (
              <div className="space-y-3 mb-6">
                {data.membersByTier.map((tier) => (
                  <div key={tier.tier} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={TIER_COLORS[tier.tier] || "bg-cream-200 text-ink-secondary"}>
                        {tier.tier}
                      </Badge>
                    </div>
                    <span className="text-body-m font-medium text-ink">
                      {tier.count} {tier.count === 1 ? "member" : "members"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-cream-300">
              <div className="flex items-center justify-between">
                <p className="text-body-s text-ink-secondary">Churn Rate</p>
                <p className={`text-h4 font-display ${data.churnRate > 10 ? "text-error" : "text-success"}`}>
                  {data.churnRate}%
                </p>
              </div>
              <p className="text-caption text-ink-secondary mt-1">
                Percentage of cancelled memberships vs total
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MRR Trend */}
      <MrrTrendChart data={data.mrrTrend} />
    </div>
  );
}
