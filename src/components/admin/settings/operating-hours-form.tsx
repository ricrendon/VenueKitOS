"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Loader2, Check } from "lucide-react";
import type { OperatingHours } from "@/lib/types";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface OperatingHoursFormProps {
  data: OperatingHours[];
  onSave: (hours: OperatingHours[]) => void;
  saving: boolean;
}

export function OperatingHoursForm({
  data,
  onSave,
  saving,
}: OperatingHoursFormProps) {
  const [hours, setHours] = useState<OperatingHours[]>(
    data.map((h) => ({ ...h }))
  );

  const updateHour = (
    index: number,
    field: keyof OperatingHours,
    value: string | boolean
  ) => {
    setHours((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h))
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="font-display text-h4 text-ink mb-4">Operating Hours</h3>

      <div className="space-y-3">
        {hours.map((hour, index) => (
          <div
            key={hour.dayOfWeek}
            className="flex items-center gap-4 rounded-md border border-cream-300 bg-white px-4 py-3"
          >
            <span className="w-28 text-body-s font-medium text-ink shrink-0">
              {DAY_NAMES[hour.dayOfWeek]}
            </span>

            <div className="flex items-center gap-3 flex-1">
              <div className="space-y-1">
                <label className="block text-body-s font-medium text-ink mb-1">
                  Open
                </label>
                <input
                  type="time"
                  value={hour.openTime}
                  onChange={(e) =>
                    updateHour(index, "openTime", e.target.value)
                  }
                  disabled={hour.isClosed}
                  className="flex h-9 rounded-md border border-cream-300 bg-cream-50 px-3 py-1 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta disabled:cursor-not-allowed disabled:opacity-40"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-body-s font-medium text-ink mb-1">
                  Close
                </label>
                <input
                  type="time"
                  value={hour.closeTime}
                  onChange={(e) =>
                    updateHour(index, "closeTime", e.target.value)
                  }
                  disabled={hour.isClosed}
                  className="flex h-9 rounded-md border border-cream-300 bg-cream-50 px-3 py-1 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta disabled:cursor-not-allowed disabled:opacity-40"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => updateHour(index, "isClosed", !hour.isClosed)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-body-s font-medium transition-colors ${
                hour.isClosed
                  ? "bg-cream-200 text-ink-secondary border border-cream-300"
                  : "bg-terracotta/10 text-terracotta border border-terracotta/30"
              }`}
            >
              {hour.isClosed ? "Closed" : "Open"}
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={() => onSave(hours)} disabled={saving}>
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
