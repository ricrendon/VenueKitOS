"use client";

import { useState } from "react";
import { Button, Modal, Select, Input } from "@/components/ui";
import { Loader2 } from "lucide-react";

interface StaffOption {
  id: string;
  name: string;
  role: string;
  isClockedIn: boolean;
}

interface ClockInOutModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (staffId: string) => Promise<void>;
  staff: StaffOption[];
  mode: "in" | "out";
}

export function ClockInOutModal({ open, onClose, onSubmit, staff, mode }: ClockInOutModalProps) {
  const [selectedStaff, setSelectedStaff] = useState("");
  const [loading, setLoading] = useState(false);

  const eligibleStaff = staff.filter((s) =>
    mode === "in" ? !s.isClockedIn : s.isClockedIn
  );

  const handleSubmit = async () => {
    if (!selectedStaff) return;
    setLoading(true);
    try {
      await onSubmit(selectedStaff);
      setSelectedStaff("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedStaff("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={mode === "in" ? "Clock In" : "Clock Out"}
      description={
        mode === "in"
          ? "Select a staff member to clock in."
          : "Select a staff member to clock out."
      }
    >
      <div className="space-y-4">
        {eligibleStaff.length === 0 ? (
          <p className="text-body-s text-ink-secondary py-4 text-center">
            {mode === "in"
              ? "All staff members are already clocked in."
              : "No staff members are currently clocked in."}
          </p>
        ) : (
          <>
            <Select
              label="Staff Member"
              placeholder="Select staff…"
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              options={eligibleStaff.map((s) => ({
                value: s.id,
                label: `${s.name} — ${s.role.replace(/_/g, " ")}`,
              }))}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedStaff || loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mode === "in" ? (
                  "Clock In"
                ) : (
                  "Clock Out"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

interface ManualEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    staffId: string;
    clockIn: string;
    clockOut: string;
    breakMinutes: number;
    notes: string;
  }) => Promise<void>;
  staff: StaffOption[];
}

export function ManualEntryModal({ open, onClose, onSubmit, staff }: ManualEntryModalProps) {
  const [selectedStaff, setSelectedStaff] = useState("");
  const [date, setDate] = useState("");
  const [clockInTime, setClockInTime] = useState("");
  const [clockOutTime, setClockOutTime] = useState("");
  const [breakMins, setBreakMins] = useState("0");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedStaff || !date || !clockInTime || !clockOutTime) return;
    setLoading(true);
    try {
      await onSubmit({
        staffId: selectedStaff,
        clockIn: `${date}T${clockInTime}:00`,
        clockOut: `${date}T${clockOutTime}:00`,
        breakMinutes: parseInt(breakMins) || 0,
        notes,
      });
      resetForm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedStaff("");
    setDate("");
    setClockInTime("");
    setClockOutTime("");
    setBreakMins("0");
    setNotes("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Manual Entry"
      description="Create a time entry for a past shift."
      size="md"
    >
      <div className="space-y-4">
        <Select
          label="Staff Member"
          placeholder="Select staff…"
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          options={staff.map((s) => ({
            value: s.id,
            label: `${s.name} — ${s.role.replace(/_/g, " ")}`,
          }))}
        />

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Clock In"
            type="time"
            value={clockInTime}
            onChange={(e) => setClockInTime(e.target.value)}
          />
          <Input
            label="Clock Out"
            type="time"
            value={clockOutTime}
            onChange={(e) => setClockOutTime(e.target.value)}
          />
        </div>

        <Input
          label="Break (minutes)"
          type="number"
          value={breakMins}
          onChange={(e) => setBreakMins(e.target.value)}
          min={0}
          max={480}
        />

        <div>
          <label className="block text-label text-ink mb-1.5 font-medium">Notes</label>
          <textarea
            className="flex w-full rounded-sm border border-cream-300 bg-cream-50 px-4 py-3 text-body-m text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
            rows={2}
            placeholder="Optional notes…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedStaff || !date || !clockInTime || !clockOutTime || loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Entry"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
