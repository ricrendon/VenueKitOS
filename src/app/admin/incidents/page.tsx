"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  CardContent,
  Badge,
  MetricCard,
  Select,
  useToast,
} from "@/components/ui";
import {
  AlertTriangle,
  Plus,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  DollarSign,
  ClipboardList,
} from "lucide-react";
import { ReportIncidentModal } from "@/components/admin/incidents/report-incident-modal";
import { ResolveIncidentModal } from "@/components/admin/incidents/resolve-incident-modal";
import type { Incident } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ---------- constants ---------- */

const TYPE_LABELS: Record<string, string> = {
  injury: "Injury",
  property_damage: "Property Damage",
  behavioral: "Behavioral",
  equipment_failure: "Equipment Failure",
  safety_hazard: "Safety Hazard",
  medical: "Medical",
  theft: "Theft",
  other: "Other",
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "sage",
  medium: "mustard",
  high: "warning",
  critical: "error",
};

const STATUS_BADGE: Record<string, "warning" | "info" | "success" | "default"> = {
  open: "warning",
  investigating: "info",
  resolved: "success",
  closed: "default",
};

const AREA_LABELS: Record<string, string> = {
  play_area: "Play Area",
  party_rooms: "Party Rooms",
  lobby: "Lobby",
  restrooms: "Restrooms",
  kitchen: "Kitchen",
  outdoor: "Outdoor",
  parking: "Parking",
  other: "Other",
};

const PIE_COLORS: Record<string, string> = {
  low: "#7C9A82",
  medium: "#C4993C",
  high: "#E8913A",
  critical: "#D44B4B",
};

const BAR_COLOR = "#C4663A";

/* ---------- component ---------- */

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [kpis, setKpis] = useState({ total: 0, open: 0, resolvedThisMonth: 0, avgResolutionCost: 0 });
  const [chartByType, setChartByType] = useState<{ type: string; count: number }[]>([]);
  const [chartBySeverity, setChartBySeverity] = useState<{ severity: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);

      const res = await fetch(`/api/admin/incidents?${params.toString()}`);
      const json = await res.json();

      setIncidents(json.incidents || []);
      setKpis(json.kpis || { total: 0, open: 0, resolvedThisMonth: 0, avgResolutionCost: 0 });
      setChartByType(json.charts?.byType || []);
      setChartBySeverity(json.charts?.bySeverity || []);
    } catch {
      toast("error", "Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResolve = (incident: Incident) => {
    setSelectedIncident(incident);
    setResolveModalOpen(true);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const formatCurrency = (n: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  };

  /* ---------- loading ---------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-h1 text-ink">Incidents</h1>
          <p className="text-body-m text-ink-secondary">
            Track, report, and resolve venue incidents
          </p>
        </div>
        <Button onClick={() => setReportModalOpen(true)}>
          <Plus className="h-4 w-4" /> Report Incident
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Incidents"
          value={kpis.total}
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <MetricCard
          title="Open"
          value={kpis.open}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <MetricCard
          title="Resolved This Month"
          value={kpis.resolvedThisMonth}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <MetricCard
          title="Avg Resolution Cost"
          value={formatCurrency(kpis.avgResolutionCost)}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      {(chartByType.length > 0 || chartBySeverity.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* By Type Bar Chart */}
          {chartByType.length > 0 && (
            <Card>
              <CardContent>
                <h3 className="font-display text-h3 text-ink mb-4">By Type</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartByType.map((d) => ({ ...d, label: TYPE_LABELS[d.type] || d.type }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B6560" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#6B6560" }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* By Severity Pie Chart */}
          {chartBySeverity.length > 0 && (
            <Card>
              <CardContent>
                <h3 className="font-display text-h3 text-ink mb-4">By Severity</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartBySeverity.map((d) => ({
                          ...d,
                          name: d.severity.charAt(0).toUpperCase() + d.severity.slice(1),
                        }))}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={50}
                        paddingAngle={2}
                        label={({ name, value }: { name?: string; value?: number }) => `${name}: ${value}`}
                      >
                        {chartBySeverity.map((entry) => (
                          <Cell
                            key={entry.severity}
                            fill={PIE_COLORS[entry.severity] || "#999"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-48">
          <Select
            label="Status"
            options={[
              { value: "all", label: "All Statuses" },
              { value: "open", label: "Open" },
              { value: "investigating", label: "Investigating" },
              { value: "resolved", label: "Resolved" },
              { value: "closed", label: "Closed" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select
            label="Type"
            options={[
              { value: "all", label: "All Types" },
              { value: "injury", label: "Injury" },
              { value: "property_damage", label: "Property Damage" },
              { value: "behavioral", label: "Behavioral" },
              { value: "equipment_failure", label: "Equipment Failure" },
              { value: "safety_hazard", label: "Safety Hazard" },
              { value: "medical", label: "Medical" },
              { value: "theft", label: "Theft" },
              { value: "other", label: "Other" },
            ]}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Incidents Table */}
      {incidents.length === 0 ? (
        <Card>
          <CardContent>
            <div className="py-12 text-center">
              <ShieldAlert className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
              <h3 className="font-display text-h3 text-ink mb-2">No incidents found</h3>
              <p className="text-body-m text-ink-secondary mb-6 max-w-md mx-auto">
                {statusFilter !== "all" || typeFilter !== "all"
                  ? "No incidents match your current filters. Try adjusting them."
                  : "No incidents have been reported yet. Click the button above to report one."}
              </p>
              {statusFilter === "all" && typeFilter === "all" && (
                <Button onClick={() => setReportModalOpen(true)}>
                  <Plus className="h-4 w-4" /> Report First Incident
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-300">
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Date</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Type</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Title</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Severity</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Area</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Status</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Reporter</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr
                      key={incident.id}
                      className="border-b border-cream-200 hover:bg-cream-200/50 transition-colors"
                    >
                      <td className="py-3 text-body-s text-ink">
                        {formatDate(incident.created_at)}
                      </td>
                      <td className="py-3">
                        <Badge variant="info">
                          {TYPE_LABELS[incident.type] || incident.type}
                        </Badge>
                      </td>
                      <td className="py-3 text-body-s text-ink font-medium max-w-[200px] truncate">
                        {incident.title}
                      </td>
                      <td className="py-3">
                        <Badge variant={SEVERITY_COLORS[incident.severity] as "sage" | "mustard" | "warning" | "error" || "default"}>
                          {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 text-body-s text-ink-secondary">
                        {AREA_LABELS[incident.affected_area] || incident.affected_area}
                      </td>
                      <td className="py-3">
                        <Badge variant={STATUS_BADGE[incident.status] || "default"}>
                          {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 text-body-s text-ink-secondary">
                        {incident.reporter_name || "—"}
                      </td>
                      <td className="py-3">
                        {(incident.status === "open" || incident.status === "investigating") && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleResolve(incident)}
                          >
                            Resolve
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ReportIncidentModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSuccess={fetchData}
      />
      <ResolveIncidentModal
        open={resolveModalOpen}
        onClose={() => {
          setResolveModalOpen(false);
          setSelectedIncident(null);
        }}
        onSuccess={fetchData}
        incident={selectedIncident}
      />
    </div>
  );
}
