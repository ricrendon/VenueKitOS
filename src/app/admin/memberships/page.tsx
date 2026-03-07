"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Badge, MetricCard } from "@/components/ui";
import {
  CreditCard, Users, TrendingUp, DollarSign,
  Loader2, Star,
} from "lucide-react";
import { format } from "date-fns";

interface MembershipItem {
  id: string;
  status: string;
  startDate: string;
  nextBillingDate: string;
  parentName: string;
  parentEmail: string;
  planName: string;
  monthlyPrice: number;
}

interface PlanItem {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  annual_price: number | null;
  max_children: number;
  includes_open_play: boolean;
  party_discount: number;
  guest_passes: number;
  features: string[];
}

interface KPIs {
  activeMembers: number;
  pausedMembers: number;
  monthlyRecurringRevenue: number;
  totalPlans: number;
}

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<MembershipItem[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/memberships")
      .then((res) => res.json())
      .then((json) => {
        setMemberships(json.memberships || []);
        setPlans(json.plans || []);
        setKpis(json.kpis || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-h1 text-ink">Memberships</h1>
        <p className="text-body-m text-ink-secondary">Manage membership plans and active members.</p>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Members"
            value={String(kpis.activeMembers)}
            change="Currently active"
            changeType="positive"
            icon={<Users className="h-5 w-5" />}
          />
          <MetricCard
            title="Monthly Revenue"
            value={`$${kpis.monthlyRecurringRevenue.toLocaleString()}`}
            change="Recurring"
            changeType="positive"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <MetricCard
            title="Paused"
            value={String(kpis.pausedMembers)}
            change="On hold"
            changeType="neutral"
            icon={<CreditCard className="h-5 w-5" />}
          />
          <MetricCard
            title="Plans Available"
            value={String(kpis.totalPlans)}
            change="Membership tiers"
            changeType="neutral"
            icon={<Star className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Membership Plans */}
      <div>
        <h2 className="font-display text-h3 text-ink mb-4">Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-h4 text-ink">{plan.name}</h3>
                  <Badge variant="success" className="text-[11px]">Active</Badge>
                </div>
                <p className="text-body-s text-ink-secondary">{plan.description}</p>
                <p className="font-display text-h3 text-terracotta">
                  ${plan.monthly_price}<span className="text-body-s text-ink-secondary">/mo</span>
                </p>
                <div className="pt-2 border-t border-cream-200 space-y-1.5">
                  <p className="text-caption text-ink-secondary">
                    Max children: {plan.max_children}
                  </p>
                  <p className="text-caption text-ink-secondary">
                    Open play: {plan.includes_open_play ? "Included" : "Not included"}
                  </p>
                  {plan.party_discount > 0 && (
                    <p className="text-caption text-ink-secondary">
                      Party discount: {plan.party_discount}%
                    </p>
                  )}
                  {plan.guest_passes > 0 && (
                    <p className="text-caption text-ink-secondary">
                      Guest passes: {plan.guest_passes}/mo
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Members Table */}
      <div>
        <h2 className="font-display text-h3 text-ink mb-4">Active Members</h2>
        {memberships.length > 0 ? (
          <Card>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cream-300">
                      <th className="text-left text-label text-ink-secondary py-3 font-medium">Member</th>
                      <th className="text-left text-label text-ink-secondary py-3 font-medium">Plan</th>
                      <th className="text-left text-label text-ink-secondary py-3 font-medium">Status</th>
                      <th className="text-right text-label text-ink-secondary py-3 font-medium">Monthly</th>
                      <th className="text-right text-label text-ink-secondary py-3 font-medium">Start Date</th>
                      <th className="text-right text-label text-ink-secondary py-3 font-medium">Next Billing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberships.map((m) => (
                      <tr key={m.id} className="border-b border-cream-200">
                        <td className="py-3">
                          <p className="text-body-s text-ink font-medium">{m.parentName}</p>
                          <p className="text-caption text-ink-secondary">{m.parentEmail}</p>
                        </td>
                        <td className="py-3">
                          <Badge variant="default" className="text-[11px]">{m.planName}</Badge>
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={m.status === "active" ? "success" : m.status === "paused" ? "warning" : "error"}
                            className="text-[11px]"
                          >
                            {m.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-body-s text-ink text-right font-medium">
                          ${m.monthlyPrice}
                        </td>
                        <td className="py-3 text-body-s text-ink-secondary text-right">
                          {m.startDate ? format(new Date(m.startDate + "T12:00:00"), "MMM d, yyyy") : "—"}
                        </td>
                        <td className="py-3 text-body-s text-ink-secondary text-right">
                          {m.nextBillingDate ? format(new Date(m.nextBillingDate + "T12:00:00"), "MMM d, yyyy") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
              <h3 className="font-display text-h4 text-ink mb-2">No active members yet</h3>
              <p className="text-body-s text-ink-secondary">
                Members will appear here when parents sign up for membership plans.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
