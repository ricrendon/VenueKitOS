"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  CardContent,
  Badge,
  MetricCard,
  Select,
  Modal,
  useToast,
} from "@/components/ui";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Plus,
  Loader2,
  Pencil,
  Ban,
  RotateCcw,
  UserCog,
} from "lucide-react";
import { AddEmployeeModal } from "@/components/admin/staff/add-employee-modal";
import { EditEmployeeModal } from "@/components/admin/staff/edit-employee-modal";
import type { StaffMember } from "@/lib/types";

/* ---------- constants ---------- */

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  venue_owner: "Owner",
  venue_manager: "Manager",
  front_desk_staff: "Front Desk",
  party_host: "Party Host",
};

const ROLE_BADGE: Record<string, "terracotta" | "sage" | "dusty" | "mustard" | "info"> = {
  super_admin: "terracotta",
  venue_owner: "terracotta",
  venue_manager: "sage",
  front_desk_staff: "dusty",
  party_host: "mustard",
};

/* ---------- component ---------- */

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [kpis, setKpis] = useState({
    totalStaff: 0,
    activeStaff: 0,
    terminatedStaff: 0,
    byRole: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [confirmTerminate, setConfirmTerminate] = useState<StaffMember | null>(null);
  const [terminating, setTerminating] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/staff?${params.toString()}`);
      const json = await res.json();

      setStaff(json.staff || []);
      setKpis(
        json.kpis || {
          totalStaff: 0,
          activeStaff: 0,
          terminatedStaff: 0,
          byRole: {},
        }
      );
    } catch {
      toast("error", "Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (member: StaffMember) => {
    setSelectedStaff(member);
    setEditModalOpen(true);
  };

  const handleTerminate = async () => {
    if (!confirmTerminate) return;
    setTerminating(true);
    try {
      const res = await fetch(`/api/admin/staff/${confirmTerminate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: false }),
      });

      if (res.ok) {
        toast("success", `${confirmTerminate.first_name} ${confirmTerminate.last_name} has been terminated`);
        setConfirmTerminate(null);
        fetchData();
      } else {
        const json = await res.json();
        toast("error", json.error || "Failed to terminate employee");
      }
    } catch {
      toast("error", "Network error");
    } finally {
      setTerminating(false);
    }
  };

  const handleReactivate = async (member: StaffMember) => {
    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      });

      if (res.ok) {
        toast("success", `${member.first_name} ${member.last_name} has been reactivated`);
        fetchData();
      } else {
        const json = await res.json();
        toast("error", json.error || "Failed to reactivate employee");
      }
    } catch {
      toast("error", "Network error");
    }
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

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const managersCount =
    (kpis.byRole["venue_owner"] || 0) +
    (kpis.byRole["venue_manager"] || 0) +
    (kpis.byRole["super_admin"] || 0);

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
          <h1 className="font-display text-h1 text-ink">Staff</h1>
          <p className="text-body-m text-ink-secondary">
            Manage employee accounts and access
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>
          <Plus className="h-4 w-4" /> Add Employee
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Staff"
          value={kpis.totalStaff}
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Active"
          value={kpis.activeStaff}
          icon={<UserCheck className="h-5 w-5" />}
        />
        <MetricCard
          title="Terminated"
          value={kpis.terminatedStaff}
          icon={<UserX className="h-5 w-5" />}
        />
        <MetricCard
          title="Managers"
          value={managersCount}
          icon={<Shield className="h-5 w-5" />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-48">
          <Select
            label="Status"
            options={[
              { value: "all", label: "All Staff" },
              { value: "active", label: "Active" },
              { value: "terminated", label: "Terminated" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Staff Table */}
      {staff.length === 0 ? (
        <Card>
          <CardContent>
            <div className="py-12 text-center">
              <UserCog className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
              <h3 className="font-display text-h3 text-ink mb-2">No staff found</h3>
              <p className="text-body-m text-ink-secondary mb-6 max-w-md mx-auto">
                {statusFilter !== "all"
                  ? "No staff match your current filter. Try adjusting it."
                  : "No staff accounts have been created yet. Click the button above to add your first employee."}
              </p>
              {statusFilter === "all" && (
                <Button onClick={() => setAddModalOpen(true)}>
                  <Plus className="h-4 w-4" /> Add First Employee
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
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">
                      Name
                    </th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">
                      Email
                    </th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">
                      Role
                    </th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">
                      Status
                    </th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">
                      Joined
                    </th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-cream-200 hover:bg-cream-200/50 transition-colors"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center text-label font-medium">
                            {getInitials(member.first_name, member.last_name)}
                          </div>
                          <span className="text-body-s text-ink font-medium">
                            {member.first_name} {member.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-body-s text-ink-secondary">
                        {member.email}
                      </td>
                      <td className="py-3">
                        <Badge variant={ROLE_BADGE[member.role] || "info"}>
                          {ROLE_LABELS[member.role] || member.role}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge variant={member.active ? "success" : "default"}>
                          {member.active ? "Active" : "Terminated"}
                        </Badge>
                      </td>
                      <td className="py-3 text-body-s text-ink-secondary">
                        {formatDate(member.created_at)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {member.active ? (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleEdit(member)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setConfirmTerminate(member)}
                              >
                                <Ban className="h-3.5 w-3.5" />
                                Terminate
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleReactivate(member)}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Reactivate
                            </Button>
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
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchData}
      />

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedStaff(null);
        }}
        onSuccess={fetchData}
        staff={selectedStaff}
      />

      {/* Terminate Confirmation Modal */}
      {confirmTerminate && (
        <Modal
          open={!!confirmTerminate}
          onClose={() => setConfirmTerminate(null)}
          title="Terminate Employee"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-body-m text-ink-secondary">
              Are you sure you want to terminate{" "}
              <span className="font-medium text-ink">
                {confirmTerminate.first_name} {confirmTerminate.last_name}
              </span>
              ? They will lose access to the admin dashboard. Their records will be preserved.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setConfirmTerminate(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleTerminate}
                disabled={terminating}
              >
                {terminating && <Loader2 className="h-4 w-4 animate-spin" />}
                Terminate
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
