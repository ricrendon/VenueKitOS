"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Modal, Input, Select } from "@/components/ui";
import { Loader2, Download } from "lucide-react";
import { downloadCsv } from "@/lib/utils";

interface StaffOption {
  id: string;
  name: string;
  role: string;
  isClockedIn: boolean;
}

interface TimeCardEntry {
  id: string;
  staffName: string;
  staffRole: string;
  clockIn: string;
  clockOut: string | null;
  breakMinutes: number;
  hoursWorked: number | null;
  status: "active" | "completed";
}

interface TimeCardModalProps {
  open: boolean;
  onClose: () => void;
  staff: StaffOption[];
}

function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(monday.getDate() - mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return { start: fmt(monday), end: fmt(sunday) };
}

function formatRole(role: string) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function TimeCardModal({ open, onClose, staff }: TimeCardModalProps) {
  const week = getWeekRange();
  const [startDate, setStartDate] = useState(week.start);
  const [endDate, setEndDate] = useState(week.end);
  const [staffFilter, setStaffFilter] = useState("");
  const [entries, setEntries] = useState<TimeCardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });
      if (staffFilter) params.set("staffId", staffFilter);

      const res = await fetch(`/api/admin/time-clock?${params}`);
      const json = await res.json();
      setEntries(json.entries || []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, staffFilter]);

  useEffect(() => {
    if (open) fetchEntries();
  }, [open, fetchEntries]);

  // Build summary grouped by employee
  const summary = entries.reduce<
    Record<string, { name: string; role: string; totalShifts: number; totalHours: number }>
  >((acc, entry) => {
    if (!acc[entry.staffName]) {
      acc[entry.staffName] = {
        name: entry.staffName,
        role: formatRole(entry.staffRole),
        totalShifts: 0,
        totalHours: 0,
      };
    }
    acc[entry.staffName].totalShifts += 1;
    acc[entry.staffName].totalHours += entry.hoursWorked || 0;
    return acc;
  }, {});

  const summaryRows = Object.values(summary).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const totalHours = summaryRows.reduce((sum, r) => sum + r.totalHours, 0);
  const totalShifts = summaryRows.reduce((sum, r) => sum + r.totalShifts, 0);

  const handleDownload = () => {
    const headers = [
      "Employee", "Role", "Date", "Clock In", "Clock Out", "Break (min)", "Hours Worked",
    ];

    const detailRows: (string | number | null | undefined)[][] = entries
      .sort((a, b) => a.staffName.localeCompare(b.staffName) || a.clockIn.localeCompare(b.clockIn))
      .map((entry) => {
        const date = new Date(entry.clockIn).toLocaleDateString("en-US", {
          timeZone: "UTC",
        });
        const clockInTime = new Date(entry.clockIn).toLocaleTimeString("en-US", {
          timeZone: "UTC",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        const clockOutTime = entry.clockOut
          ? new Date(entry.clockOut).toLocaleTimeString("en-US", {
              timeZone: "UTC",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "Active";

        return [
          entry.staffName,
          formatRole(entry.staffRole),
          date,
          clockInTime,
          clockOutTime,
          entry.breakMinutes,
          entry.hoursWorked != null ? entry.hoursWorked : "",
        ];
      });

    // Blank separator row
    const separatorRow = Array(7).fill("");
    const summaryHeader = ["Employee", "Role", "Total Shifts", "Total Hours", "", "", ""];
    const summaryData = summaryRows.map((r) => [
      r.name,
      r.role,
      r.totalShifts,
      Math.round(r.totalHours * 100) / 100,
      "",
      "",
      "",
    ]);
    const totalRow = ["TOTAL", "", totalShifts, Math.round(totalHours * 100) / 100, "", "", ""];

    const allRows = [
      ...detailRows,
      separatorRow,
      summaryHeader,
      ...summaryData,
      totalRow,
    ];

    downloadCsv(
      `time-cards-${startDate}-to-${endDate}.csv`,
      headers,
      allRows
    );
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Generate Time Cards" size="lg">
      <div className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
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

        {/* Summary Preview */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
          </div>
        ) : entries.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-body-s font-medium text-ink">
              Summary — {entries.length} entries found
            </h4>
            <div className="overflow-x-auto rounded-lg border border-cream-300">
              <table className="w-full">
                <thead>
                  <tr className="bg-cream-100">
                    <th className="text-left text-label text-ink-secondary py-2.5 px-3 font-medium">
                      Employee
                    </th>
                    <th className="text-left text-label text-ink-secondary py-2.5 px-3 font-medium">
                      Role
                    </th>
                    <th className="text-right text-label text-ink-secondary py-2.5 px-3 font-medium">
                      Shifts
                    </th>
                    <th className="text-right text-label text-ink-secondary py-2.5 px-3 font-medium">
                      Total Hours
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summaryRows.map((row) => (
                    <tr
                      key={row.name}
                      className="border-t border-cream-200"
                    >
                      <td className="py-2.5 px-3 text-body-s text-ink font-medium">
                        {row.name}
                      </td>
                      <td className="py-2.5 px-3 text-body-s text-ink-secondary">
                        {row.role}
                      </td>
                      <td className="py-2.5 px-3 text-body-s text-ink text-right">
                        {row.totalShifts}
                      </td>
                      <td className="py-2.5 px-3 text-body-s text-ink font-medium text-right">
                        {(Math.round(row.totalHours * 100) / 100).toFixed(1)}h
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-cream-400 bg-cream-50">
                    <td className="py-2.5 px-3 text-body-s text-ink font-semibold">
                      Total
                    </td>
                    <td />
                    <td className="py-2.5 px-3 text-body-s text-ink font-semibold text-right">
                      {totalShifts}
                    </td>
                    <td className="py-2.5 px-3 text-body-s text-ink font-semibold text-right">
                      {(Math.round(totalHours * 100) / 100).toFixed(1)}h
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-body-s text-ink-secondary">
            No time entries found for the selected date range.
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={entries.length === 0 || loading}
          >
            <Download className="h-4 w-4" /> Download CSV
          </Button>
        </div>
      </div>
    </Modal>
  );
}
