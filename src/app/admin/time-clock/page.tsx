"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
  Select,
  MetricCard,
  useToast,
} from "@/components/ui";
import {
  Timer,
  Users,
  Clock,
  CalendarDays,
  Loader2,
  LogIn,
  LogOut,
  Plus,
  Trash2,
  CircleDot,
} from "lucide-react";
import {
  ClockInOutModal,
  ManualEntryModal,
} from "@/components/admin/time-clock/clock-in-out-modal";

interface TimeEntryRow {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  clockIn: string;
  clockOut: string | null;
  breakMinutes: number;
  notes: string | null;
  status: "active" | "completed";
  hoursWorked: number | null;
}

interface KPIs {
  staffOnClock: number;
  hoursToday: number;
  totalStaff: number;
  weeklyHours: number;
}

interface StaffOption {
  id: string;
  name: string;
  role: string;
  isClockedIn: boolean;
}

export default function TimeClockPage() {
  const [entries, setEntries] = useState<TimeEntryRow[]>([]);
  const [kpis, setKpis] = useState<KPIs>({ staffOnClock: 0, hoursToday: 0, totalStaff: 0, weeklyHours: 0 });
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [staffFilter, setStaffFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [clockModalOpen, setClockModalOpen] = useState(false);
  const [clockModalMode, setClockModalMode] = useState<"in" | "out">("in");
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(() => {
    const params = new URLSearchParams();
    if (dateFilter) params.set("date", dateFilter);
    if (staffFilter) params.set("staffId", staffFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);

    fetch(`/api/admin/time-clock?${params}`)
      .then((res) => res.json())
      .then((json) => {
        setEntries(json.entries || []);
        setKpis(json.kpis || { staffOnClock: 0, hoursToday: 0, totalStaff: 0, weeklyHours: 0 });
        setStaff(json.staff || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dateFilter, staffFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClockIn = async (staffId: string) => {
    const res = await fetch("/api/admin/time-clock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clock_in", staffId }),
    });
    const json = await res.json();
    if (res.ok) {
      toast("success", "Staff member clocked in");
      fetchData();
    } else {
      toast("error", json.error || "Failed to clock in");
    }
  };

  const handleClockOut = async (staffId: string) => {
    const res = await fetch("/api/admin/time-clock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clock_out", staffId }),
    });
    const json = await res.json();
    if (res.ok) {
      toast("success", "Staff member clocked out");
      fetchData();
    } else {
      toast("error", json.error || "Failed to clock out");
    }
  };

  const handleManualEntry = async (data: {
    staffId: string;
    clockIn: string;
    clockOut: string;
    breakMinutes: number;
    notes: string;
  }) => {
    const res = await fetch("/api/admin/time-clock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "manual_entry", ...data }),
    });
    const json = await res.json();
    if (res.ok) {
      toast("success", "Manual entry added");
      fetchData();
    } else {
      toast("error", json.error || "Failed to add entry");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/time-clock/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("success", "Entry deleted");
        fetchData();
      } else {
        const json = await res.json();
        toast("error", json.error || "Failed to delete");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("en-US", {
        timeZone: "UTC",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return iso;
    }
  };

  const formatRole = (role: string) =>
    role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const activeStaff = staff.filter((s) => s.isClockedIn);

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
          <h1 className="font-display text-h1 text-ink">Time Clock</h1>
          <p className="text-body-m text-ink-secondary">Track staff hours and shifts</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setManualModalOpen(true)}
          >
            <Plus className="h-4 w-4" /> Manual Entry
          </Button>
          <Button
            variant="secondary"
            onClick={() => { setClockModalMode("out"); setClockModalOpen(true); }}
          >
            <LogOut className="h-4 w-4" /> Clock Out
          </Button>
          <Button
            onClick={() => { setClockModalMode("in"); setClockModalOpen(true); }}
          >
            <LogIn className="h-4 w-4" /> Clock In
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Staff On Clock"
          value={kpis.staffOnClock}
          icon={<CircleDot className="h-5 w-5" />}
        />
        <MetricCard
          title="Hours Today"
          value={`${kpis.hoursToday}h`}
          icon={<Clock className="h-5 w-5" />}
        />
        <MetricCard
          title="Total Staff"
          value={kpis.totalStaff}
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Weekly Hours"
          value={`${kpis.weeklyHours}h`}
          icon={<CalendarDays className="h-5 w-5" />}
        />
      </div>

      {/* Active staff banner */}
      {activeStaff.length > 0 && (
        <Card className="border-success/30 bg-success/5">
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <CircleDot className="h-4 w-4 text-success" />
              <span className="text-body-s font-medium text-ink">
                Currently On Clock ({activeStaff.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeStaff.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleClockOut(s.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-pill bg-cream-50 border border-cream-300 text-body-s text-ink hover:border-terracotta/50 hover:bg-terracotta/5 transition-colors"
                >
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  {s.name}
                  <LogOut className="h-3 w-3 text-ink-secondary" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-44">
          <Input
            label="Date"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <div className="w-52">
          <Select
            label="Staff"
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            options={[
              { value: "", label: "All Staff" },
              ...staff.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        </div>
        <div className="flex gap-1">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-pill text-body-s capitalize transition-colors h-[52px] ${
                statusFilter === f
                  ? "bg-terracotta text-white font-medium"
                  : "bg-cream-200 text-ink-secondary hover:bg-cream-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Data table */}
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-300">
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Staff</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Role</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Clock In</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Clock Out</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Break</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Hours</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Status</th>
                  <th className="text-right text-label text-ink-secondary py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-cream-200 hover:bg-cream-200/50 transition-colors"
                  >
                    <td className="py-3">
                      <div className="text-body-s text-ink font-medium">{entry.staffName}</div>
                    </td>
                    <td className="py-3 text-body-s text-ink-secondary">
                      {formatRole(entry.staffRole)}
                    </td>
                    <td className="py-3 text-body-s text-ink font-medium">
                      {formatTime(entry.clockIn)}
                    </td>
                    <td className="py-3 text-body-s text-ink">
                      {entry.clockOut ? formatTime(entry.clockOut) : "—"}
                    </td>
                    <td className="py-3 text-body-s text-ink-secondary">
                      {entry.breakMinutes > 0 ? `${entry.breakMinutes}m` : "—"}
                    </td>
                    <td className="py-3 text-body-s text-ink font-medium">
                      {entry.hoursWorked != null ? `${entry.hoursWorked}h` : "—"}
                    </td>
                    <td className="py-3">
                      {entry.status === "active" ? (
                        <Badge variant="success">On Clock</Badge>
                      ) : (
                        <Badge variant="default">Completed</Badge>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {entry.status === "active" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleClockOut(entry.staffId)}
                          >
                            <LogOut className="h-3.5 w-3.5" /> Out
                          </Button>
                        )}
                        <button
                          onClick={() => handleDelete(entry.id)}
                          disabled={deletingId === entry.id}
                          className="p-1.5 rounded-sm text-ink-secondary hover:text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                          title="Delete entry"
                        >
                          {deletingId === entry.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {entries.length === 0 && (
            <div className="py-12 text-center">
              <Timer className="h-8 w-8 text-ink-secondary mx-auto mb-3" />
              <p className="text-body-m text-ink-secondary">
                No time entries for this date
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ClockInOutModal
        open={clockModalOpen}
        onClose={() => setClockModalOpen(false)}
        onSubmit={clockModalMode === "in" ? handleClockIn : handleClockOut}
        staff={staff}
        mode={clockModalMode}
      />

      <ManualEntryModal
        open={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        onSubmit={handleManualEntry}
        staff={staff}
      />
    </div>
  );
}
