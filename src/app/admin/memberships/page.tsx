"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, Badge, MetricCard } from "@/components/ui";
import {
  CreditCard, Users, DollarSign, Star,
  Loader2, Plus, X, CheckCircle, PauseCircle, XCircle,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { format } from "date-fns";

interface MembershipItem {
  id: string;
  status: string;
  startDate: string;
  nextBillingDate: string;
  parentId: string;
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

interface ParentOption {
  id: string;
  name: string;
  email: string;
}

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<MembershipItem[]>([]);
  const [allMemberships, setAllMemberships] = useState<MembershipItem[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"active" | "paused" | "cancelled" | "all">("active");

  // Modals
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Enroll form
  const [parents, setParents] = useState<ParentOption[]>([]);
  const [allParents, setAllParents] = useState<ParentOption[]>([]);
  const [parentSearch, setParentSearch] = useState("");
  const [selectedParent, setSelectedParent] = useState<ParentOption | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [enrollStartDate, setEnrollStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [parentDropdownOpen, setParentDropdownOpen] = useState(false);

  // Create plan form
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    monthlyPrice: "",
    annualPrice: "",
    maxChildren: "3",
    includesOpenPlay: true,
    partyDiscount: "0",
    guestPasses: "0",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/memberships");
      const json = await res.json();
      setAllMemberships(json.memberships || []);
      setPlans(json.plans || []);
      setKpis(json.kpis || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (statusFilter === "all") {
      setMemberships(allMemberships);
    } else {
      setMemberships(allMemberships.filter((m) => m.status === statusFilter));
    }
  }, [statusFilter, allMemberships]);

  const fetchParents = useCallback(async (q: string) => {
    if (q.length < 2) { setParents([]); return; }
    let source = allParents;
    if (source.length === 0) {
      try {
        const res = await fetch("/api/admin/families");
        const json = await res.json();
        source = (json.families || []).map((f: { id: string; firstName: string; lastName: string; email: string }) => ({
          id: f.id,
          name: `${f.firstName} ${f.lastName}`,
          email: f.email,
        }));
        setAllParents(source);
      } catch {
        setParents([]);
        return;
      }
    }
    const lq = q.toLowerCase();
    setParents(
      source.filter((p) =>
        p.name.toLowerCase().includes(lq) || p.email.toLowerCase().includes(lq)
      ).slice(0, 10)
    );
  }, [allParents]);

  useEffect(() => {
    fetchParents(parentSearch);
  }, [parentSearch, fetchParents]);

  const updateMembershipStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/memberships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnroll = async () => {
    if (!selectedParent || !selectedPlanId) return;
    setActionLoading("enroll");
    try {
      const res = await fetch("/api/admin/memberships/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: selectedParent.id,
          planId: selectedPlanId,
          startDate: enrollStartDate,
        }),
      });
      if (res.ok) {
        setShowEnroll(false);
        setSelectedParent(null);
        setSelectedPlanId("");
        setParentSearch("");
        await fetchData();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreatePlan = async () => {
    if (!planForm.name || !planForm.monthlyPrice) return;
    setActionLoading("plan");
    try {
      const res = await fetch("/api/admin/memberships/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: planForm.name,
          description: planForm.description,
          monthlyPrice: planForm.monthlyPrice,
          annualPrice: planForm.annualPrice || null,
          maxChildren: planForm.maxChildren,
          includesOpenPlay: planForm.includesOpenPlay,
          partyDiscount: planForm.partyDiscount,
          guestPasses: planForm.guestPasses,
        }),
      });
      if (res.ok) {
        setShowCreatePlan(false);
        setPlanForm({
          name: "", description: "", monthlyPrice: "", annualPrice: "",
          maxChildren: "3", includesOpenPlay: true, partyDiscount: "0", guestPasses: "0",
        });
        await fetchData();
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-h1 text-ink">Memberships</h1>
          <p className="text-body-m text-ink-secondary">Manage membership plans and active members.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEnroll(true)}
            className="flex items-center gap-2 px-4 py-2 bg-terracotta text-white text-body-s rounded-sm hover:bg-terracotta/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Enroll Member
          </button>
          <button
            onClick={() => setShowCreatePlan(true)}
            className="flex items-center gap-2 px-4 py-2 border border-cream-300 text-ink text-body-s rounded-sm hover:bg-cream-100 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Plan
          </button>
        </div>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Active Members" value={String(kpis.activeMembers)} change="Currently active" changeType="positive" icon={<Users className="h-5 w-5" />} />
          <MetricCard title="Monthly Revenue" value={`$${kpis.monthlyRecurringRevenue.toLocaleString()}`} change="Recurring" changeType="positive" icon={<DollarSign className="h-5 w-5" />} />
          <MetricCard title="Paused" value={String(kpis.pausedMembers)} change="On hold" changeType="neutral" icon={<CreditCard className="h-5 w-5" />} />
          <MetricCard title="Plans Available" value={String(kpis.totalPlans)} change="Membership tiers" changeType="neutral" icon={<Star className="h-5 w-5" />} />
        </div>
      )}

      {/* Plans */}
      <div>
        <h2 className="font-display text-h3 text-ink mb-4">Plans</h2>
        {plans.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10">
              <Star className="h-8 w-8 text-ink-secondary mx-auto mb-3" />
              <p className="text-body-s text-ink-secondary">No plans yet. Create your first membership plan.</p>
            </CardContent>
          </Card>
        ) : (
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
                  {plan.annual_price && (
                    <p className="text-caption text-ink-secondary">${plan.annual_price}/yr</p>
                  )}
                  <div className="pt-2 border-t border-cream-200 space-y-1.5">
                    <p className="text-caption text-ink-secondary">Max children: {plan.max_children}</p>
                    <p className="text-caption text-ink-secondary">Open play: {plan.includes_open_play ? "Included" : "Not included"}</p>
                    {plan.party_discount > 0 && (
                      <p className="text-caption text-ink-secondary">Party discount: {plan.party_discount}%</p>
                    )}
                    {plan.guest_passes > 0 && (
                      <p className="text-caption text-ink-secondary">Guest passes: {plan.guest_passes}/mo</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Members table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-h3 text-ink">Members</h2>
          <div className="flex gap-1 bg-cream-200 rounded-sm p-1">
            {(["active", "paused", "cancelled", "all"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-sm text-body-s capitalize transition-colors ${
                  statusFilter === s ? "bg-white text-ink font-medium shadow-sm" : "text-ink-secondary hover:text-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
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
                      <th className="text-right text-label text-ink-secondary py-3 font-medium">Start</th>
                      <th className="text-right text-label text-ink-secondary py-3 font-medium">Next Billing</th>
                      <th className="text-right text-label text-ink-secondary py-3 font-medium">Actions</th>
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
                        <td className="py-3 text-body-s text-ink text-right font-medium">${m.monthlyPrice}</td>
                        <td className="py-3 text-body-s text-ink-secondary text-right">
                          {m.startDate ? format(new Date(m.startDate + "T12:00:00"), "MMM d, yyyy") : "—"}
                        </td>
                        <td className="py-3 text-body-s text-ink-secondary text-right">
                          {m.nextBillingDate ? format(new Date(m.nextBillingDate + "T12:00:00"), "MMM d, yyyy") : "—"}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {m.status === "active" && (
                              <button
                                onClick={() => updateMembershipStatus(m.id, "paused")}
                                disabled={actionLoading === m.id}
                                title="Pause"
                                className="p-1.5 rounded-sm text-amber-600 hover:bg-amber-50 disabled:opacity-50 transition-colors"
                              >
                                {actionLoading === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <PauseCircle className="h-4 w-4" />}
                              </button>
                            )}
                            {m.status === "paused" && (
                              <button
                                onClick={() => updateMembershipStatus(m.id, "active")}
                                disabled={actionLoading === m.id}
                                title="Resume"
                                className="p-1.5 rounded-sm text-green-600 hover:bg-green-50 disabled:opacity-50 transition-colors"
                              >
                                {actionLoading === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                              </button>
                            )}
                            {m.status !== "cancelled" && (
                              <button
                                onClick={() => updateMembershipStatus(m.id, "cancelled")}
                                disabled={actionLoading === m.id}
                                title="Cancel"
                                className="p-1.5 rounded-sm text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                              >
                                {actionLoading === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                              </button>
                            )}
                            {m.status === "cancelled" && (
                              <button
                                onClick={() => updateMembershipStatus(m.id, "active")}
                                disabled={actionLoading === m.id}
                                title="Reinstate"
                                className="p-1.5 rounded-sm text-green-600 hover:bg-green-50 disabled:opacity-50 transition-colors"
                              >
                                {actionLoading === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                              </button>
                            )}
                          </div>
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
              <h3 className="font-display text-h4 text-ink mb-2">No members in this filter</h3>
              <p className="text-body-s text-ink-secondary">
                {statusFilter === "active"
                  ? "Enroll a parent to get started."
                  : "No members with this status."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enroll Modal */}
      {showEnroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-h3 text-ink">Enroll Member</h2>
              <button onClick={() => setShowEnroll(false)} className="text-ink-secondary hover:text-ink"><X className="h-5 w-5" /></button>
            </div>

            {/* Parent search */}
            <div className="space-y-1 relative">
              <label className="text-label text-ink-secondary font-medium">Parent</label>
              <input
                type="text"
                placeholder="Search by name or email…"
                value={selectedParent ? selectedParent.name : parentSearch}
                onChange={(e) => {
                  setSelectedParent(null);
                  setParentSearch(e.target.value);
                  setParentDropdownOpen(true);
                }}
                onFocus={() => setParentDropdownOpen(true)}
                className="w-full px-3 py-2 rounded-sm border border-cream-300 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              />
              {parentDropdownOpen && parents.length > 0 && !selectedParent && (
                <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-cream-300 rounded-sm shadow-lg">
                  {parents.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedParent(p);
                        setParentSearch("");
                        setParentDropdownOpen(false);
                        setParents([]);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-cream-100 transition-colors"
                    >
                      <p className="text-body-s text-ink font-medium">{p.name}</p>
                      <p className="text-caption text-ink-secondary">{p.email}</p>
                    </button>
                  ))}
                </div>
              )}
              {selectedParent && (
                <div className="flex items-center justify-between mt-1 px-3 py-2 bg-green-50 border border-green-200 rounded-sm">
                  <div>
                    <p className="text-body-s text-ink font-medium">{selectedParent.name}</p>
                    <p className="text-caption text-ink-secondary">{selectedParent.email}</p>
                  </div>
                  <button onClick={() => setSelectedParent(null)} className="text-ink-secondary hover:text-ink">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Plan select */}
            <div className="space-y-1">
              <label className="text-label text-ink-secondary font-medium">Plan</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3 py-2 rounded-sm border border-cream-300 text-body-s text-ink bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              >
                <option value="">Select a plan…</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${p.monthly_price}/mo
                  </option>
                ))}
              </select>
            </div>

            {/* Start date */}
            <div className="space-y-1">
              <label className="text-label text-ink-secondary font-medium">Start Date</label>
              <input
                type="date"
                value={enrollStartDate}
                onChange={(e) => setEnrollStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-sm border border-cream-300 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowEnroll(false)} className="flex-1 px-4 py-2 border border-cream-300 text-ink text-body-s rounded-sm hover:bg-cream-100 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleEnroll}
                disabled={!selectedParent || !selectedPlanId || actionLoading === "enroll"}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-terracotta text-white text-body-s rounded-sm hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
              >
                {actionLoading === "enroll" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Enroll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Plan Modal */}
      {showCreatePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 overflow-y-auto">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md mx-4 my-8 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-h3 text-ink">New Membership Plan</h2>
              <button onClick={() => setShowCreatePlan(false)} className="text-ink-secondary hover:text-ink"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-label text-ink-secondary font-medium">Plan Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Family Explorer"
                  value={planForm.name}
                  onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-sm border border-cream-300 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-label text-ink-secondary font-medium">Description</label>
                <textarea
                  placeholder="Brief description of this plan…"
                  rows={2}
                  value={planForm.description}
                  onChange={(e) => setPlanForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-sm border border-cream-300 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-label text-ink-secondary font-medium">Monthly Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary text-body-s">$</span>
                    <input
                      type="number"
                      placeholder="49"
                      min="0"
                      step="0.01"
                      value={planForm.monthlyPrice}
                      onChange={(e) => setPlanForm((f) => ({ ...f, monthlyPrice: e.target.value }))}
                      className="w-full pl-6 pr-3 py-2 rounded-sm border border-cream-300 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-label text-ink-secondary font-medium">Annual Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary text-body-s">$</span>
                    <input
                      type="number"
                      placeholder="499"
                      min="0"
                      step="0.01"
                      value={planForm.annualPrice}
                      onChange={(e) => setPlanForm((f) => ({ ...f, annualPrice: e.target.value }))}
                      className="w-full pl-6 pr-3 py-2 rounded-sm border border-cream-300 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-label text-ink-secondary font-medium">Max Children</label>
                  <input
                    type="number"
                    min="1"
                    value={planForm.maxChildren}
                    onChange={(e) => setPlanForm((f) => ({ ...f, maxChildren: e.target.value }))}
                    className="w-full px-3 py-2 rounded-sm border border-cream-300 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-label text-ink-secondary font-medium">Guest Passes/mo</label>
                  <input
                    type="number"
                    min="0"
                    value={planForm.guestPasses}
                    onChange={(e) => setPlanForm((f) => ({ ...f, guestPasses: e.target.value }))}
                    className="w-full px-3 py-2 rounded-sm border border-cream-300 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-label text-ink-secondary font-medium">Party Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={planForm.partyDiscount}
                  onChange={(e) => setPlanForm((f) => ({ ...f, partyDiscount: e.target.value }))}
                  className="w-full px-3 py-2 rounded-sm border border-cream-300 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={planForm.includesOpenPlay}
                  onChange={(e) => setPlanForm((f) => ({ ...f, includesOpenPlay: e.target.checked }))}
                  className="h-4 w-4 rounded accent-terracotta"
                />
                <span className="text-body-s text-ink">Includes open play sessions</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowCreatePlan(false)} className="flex-1 px-4 py-2 border border-cream-300 text-ink text-body-s rounded-sm hover:bg-cream-100 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreatePlan}
                disabled={!planForm.name || !planForm.monthlyPrice || actionLoading === "plan"}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-terracotta text-white text-body-s rounded-sm hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
              >
                {actionLoading === "plan" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
