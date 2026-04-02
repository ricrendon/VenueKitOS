"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { Loader2, Check } from "lucide-react";

interface VenueInfoData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  timezone: string;
}

interface VenueInfoFormProps {
  data: VenueInfoData;
  onSave: (fields: VenueInfoData) => void;
  saving: boolean;
}

const timezoneOptions = [
  { value: "America/New_York", label: "Eastern (America/New_York)" },
  { value: "America/Chicago", label: "Central (America/Chicago)" },
  { value: "America/Denver", label: "Mountain (America/Denver)" },
  { value: "America/Los_Angeles", label: "Pacific (America/Los_Angeles)" },
  { value: "America/Phoenix", label: "Arizona (America/Phoenix)" },
];

export function VenueInfoForm({ data, onSave, saving }: VenueInfoFormProps) {
  const [form, setForm] = useState<VenueInfoData>({ ...data });

  const update = (field: keyof VenueInfoData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <h3 className="font-display text-h4 text-ink mb-4">Venue Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink mb-1">
            Venue Name
          </label>
          <Input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Enter venue name"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink mb-1">
            Address
          </label>
          <Input
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Street address"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink mb-1">
            City
          </label>
          <Input
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="City"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink mb-1">
            State
          </label>
          <Input
            value={form.state}
            onChange={(e) => update("state", e.target.value)}
            placeholder="State"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink mb-1">
            Zip
          </label>
          <Input
            value={form.zip}
            onChange={(e) => update("zip", e.target.value)}
            placeholder="Zip code"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink mb-1">
            Phone
          </label>
          <Input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink mb-1">
            Email
          </label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="hello@venue.com"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink mb-1">
            Timezone
          </label>
          <Select
            value={form.timezone}
            onChange={(e) => update("timezone", e.target.value)}
            options={timezoneOptions}
            placeholder="Select timezone"
          />
        </div>
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
