"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  TrendingUp, DollarSign, Clock, Users, BarChart3,
} from "lucide-react";
import { Select } from "@/components/ui";
import { OverviewTab } from "@/components/admin/reports/overview-tab";
import { RevenueTab } from "@/components/admin/reports/revenue-tab";
import { OccupancyTab } from "@/components/admin/reports/occupancy-tab";
import { CustomersTab } from "@/components/admin/reports/customers-tab";
import { SocialTab } from "@/components/admin/reports/social-tab";

const tabs = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "revenue", label: "Revenue", icon: DollarSign },
  { id: "occupancy", label: "Occupancy", icon: Clock },
  { id: "customers", label: "Customers", icon: Users },
  { id: "social", label: "Social", icon: BarChart3 },
] as const;

type TabId = (typeof tabs)[number]["id"];

const periodOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [period, setPeriod] = useState("30d");
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Social tab manages its own data
    if (activeTab === "social") return;

    setLoading(true);
    setData(null);

    fetch(`/api/admin/reports?tab=${activeTab}&period=${period}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [activeTab, period]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-h1 text-ink">Reports</h1>
          <p className="text-body-m text-ink-secondary">
            Business analytics, revenue insights, and performance metrics.
          </p>
        </div>
        {activeTab !== "social" && (
          <div className="w-48">
            <Select
              options={periodOptions}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 border-b border-cream-300 pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-body-s font-medium rounded-t-md transition-colors ${
                isActive
                  ? "bg-white text-terracotta border border-cream-300 border-b-white -mb-px"
                  : "text-ink-secondary hover:text-ink hover:bg-cream-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {loading && (
          <div className="flex items-center justify-center h-[40vh]">
            <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
          </div>
        )}

        {!loading && activeTab === "overview" && data && (
          <OverviewTab data={data} />
        )}

        {!loading && activeTab === "revenue" && data && (
          <RevenueTab data={data} />
        )}

        {!loading && activeTab === "occupancy" && data && (
          <OccupancyTab data={data} />
        )}

        {!loading && activeTab === "customers" && data && (
          <CustomersTab data={data} />
        )}

        {activeTab === "social" && (
          <SocialTab />
        )}
      </div>
    </div>
  );
}
