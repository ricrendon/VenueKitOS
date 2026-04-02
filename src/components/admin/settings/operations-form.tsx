"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { Loader2, Check } from "lucide-react";
import type { VenueSettings } from "@/lib/types";

interface OperationsFormProps {
  data: VenueSettings;
  onSave: (settings: Partial<VenueSettings>) => void;
  saving: boolean;
}

export function OperationsForm({ data, onSave, saving }: OperationsFormProps) {
  const [form, setForm] = useState({
    maxCapacity: data.maxCapacity,
    taxRate: +(data.taxRate * 100).toFixed(4),
    sessionDurationMinutes: data.sessionDurationMinutes,
    bookingLeadTimeHours: data.bookingLeadTimeHours,
    cancellationPolicyHours: data.cancellationPolicyHours,
    waiverExpirationDays: data.waiverExpirationDays,
    requireWaiverBeforeBooking: data.requireWaiverBeforeBooking,
  });

  const updateNumber = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value === "" ? "" : Number(value) }));
  };

  const handleSave = () => {
    onSave({
      maxCapacity: Number(form.maxCapacity),
      taxRate: Number(form.taxRate) / 100,
      sessionDurationMinutes: Number(form.sessionDurationMinutes),
      bookingLeadTimeHours: Number(form.bookingLeadTimeHours),
      cancellationPolicyHours: Number(form.cancellationPolicyHours),
      waiverExpirationDays: Number(form.waiverExpirationDays),
      requireWaiverBeforeBooking: form.requireWaiverBeforeBooking,
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="font-display text-h4 text-ink mb-4">
        Operations Settings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink mb-1">
            Max Capacity
          </label>
          <Input
            type="number"
            value={form.maxCapacity}
            onChange={(e) => updateNumber("maxCapacity", e.target.value)}
            placeholder="200"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink mb-1">
            Tax Rate (%)
          </label>
          <Input
            type="number"
            step="0.01"
            value={form.taxRate}
            onChange={(e) => updateNumber("taxRate", e.target.value)}
            placeholder="8"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink mb-1">
            Session Duration (minutes)
          </label>
          <Input
            type="number"
            value={form.sessionDurationMinutes}
            onChange={(e) =>
              updateNumber("sessionDurationMinutes", e.target.value)
            }
            placeholder="90"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink mb-1">
            Booking Lead Time (hours)
          </label>
          <Input
            type="number"
            value={form.bookingLeadTimeHours}
            onChange={(e) =>
              updateNumber("bookingLeadTimeHours", e.target.value)
            }
            placeholder="24"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink mb-1">
            Cancellation Policy (hours)
          </label>
          <Input
            type="number"
            value={form.cancellationPolicyHours}
            onChange={(e) =>
              updateNumber("cancellationPolicyHours", e.target.value)
            }
            placeholder="48"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink mb-1">
            Waiver Expiration (days)
          </label>
          <Input
            type="number"
            value={form.waiverExpirationDays}
            onChange={(e) =>
              updateNumber("waiverExpirationDays", e.target.value)
            }
            placeholder="365"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-body-s font-medium text-ink mb-1">
          Require Waiver Before Booking
        </label>
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              requireWaiverBeforeBooking: !prev.requireWaiverBeforeBooking,
            }))
          }
          className={`rounded-md px-4 py-2 text-body-s font-medium transition-colors ${
            form.requireWaiverBeforeBooking
              ? "bg-terracotta text-white"
              : "bg-cream-200 text-ink-secondary border border-cream-300"
          }`}
        >
          {form.requireWaiverBeforeBooking ? "Enabled" : "Disabled"}
        </button>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}{" "}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
