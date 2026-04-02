"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { Loader2, Check } from "lucide-react";

interface PoliciesData {
  cancellationHours: number;
  cancellationText: string;
  waiverPolicyText: string;
  depositPercentage: number;
  depositPolicyText: string;
}

interface PoliciesFormProps {
  data: PoliciesData;
  onSave: (policies: PoliciesData) => void;
  saving: boolean;
}

export function PoliciesForm({ data, onSave, saving }: PoliciesFormProps) {
  const [form, setForm] = useState<PoliciesData>({ ...data });

  const updateText = (field: keyof PoliciesData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateNumber = (field: keyof PoliciesData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value === "" ? 0 : Number(value),
    }));
  };

  return (
    <div className="space-y-6">
      <h3 className="font-display text-h4 text-ink mb-4">Policies</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink mb-1">
            Cancellation Window (hours)
          </label>
          <Input
            type="number"
            value={form.cancellationHours}
            onChange={(e) => updateNumber("cancellationHours", e.target.value)}
            placeholder="48"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink mb-1">
            Deposit Percentage
          </label>
          <Input
            type="number"
            value={form.depositPercentage}
            onChange={(e) => updateNumber("depositPercentage", e.target.value)}
            placeholder="25"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-body-s font-medium text-ink mb-1">
          Cancellation Policy Text
        </label>
        <textarea
          value={form.cancellationText}
          onChange={(e) => updateText("cancellationText", e.target.value)}
          placeholder="Describe your cancellation policy"
          className="flex w-full rounded-md border border-cream-300 bg-white px-3 py-2 text-body-s text-ink placeholder:text-ink-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta min-h-[80px] resize-y"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-body-s font-medium text-ink mb-1">
          Waiver Policy Text
        </label>
        <textarea
          value={form.waiverPolicyText}
          onChange={(e) => updateText("waiverPolicyText", e.target.value)}
          placeholder="Describe your waiver policy"
          className="flex w-full rounded-md border border-cream-300 bg-white px-3 py-2 text-body-s text-ink placeholder:text-ink-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta min-h-[80px] resize-y"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-body-s font-medium text-ink mb-1">
          Deposit Policy Text
        </label>
        <textarea
          value={form.depositPolicyText}
          onChange={(e) => updateText("depositPolicyText", e.target.value)}
          placeholder="Describe your deposit policy"
          className="flex w-full rounded-md border border-cream-300 bg-white px-3 py-2 text-body-s text-ink placeholder:text-ink-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta min-h-[80px] resize-y"
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={() => onSave(form)} disabled={saving}>
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
