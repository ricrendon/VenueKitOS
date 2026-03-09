"use client";

import { useState } from "react";
import { Modal, Button, Input, Select, useToast } from "@/components/ui";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const INCIDENT_TYPES = [
  { value: "injury", label: "Injury" },
  { value: "property_damage", label: "Property Damage" },
  { value: "behavioral", label: "Behavioral" },
  { value: "equipment_failure", label: "Equipment Failure" },
  { value: "safety_hazard", label: "Safety Hazard" },
  { value: "medical", label: "Medical" },
  { value: "theft", label: "Theft" },
  { value: "other", label: "Other" },
];

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const AREA_OPTIONS = [
  { value: "play_area", label: "Play Area" },
  { value: "party_rooms", label: "Party Rooms" },
  { value: "lobby", label: "Lobby" },
  { value: "restrooms", label: "Restrooms" },
  { value: "kitchen", label: "Kitchen" },
  { value: "outdoor", label: "Outdoor" },
  { value: "parking", label: "Parking" },
  { value: "other", label: "Other" },
];

export function ReportIncidentModal({ open, onClose, onSuccess }: Props) {
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("");
  const [affectedArea, setAffectedArea] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !title || !severity || !affectedArea) {
      toast("error", "Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          severity,
          affected_area: affectedArea,
          description: description || null,
        }),
      });

      if (res.ok) {
        toast("success", "Incident reported successfully");
        // Reset form
        setType("");
        setTitle("");
        setSeverity("");
        setAffectedArea("");
        setDescription("");
        onSuccess();
        onClose();
      } else {
        const json = await res.json();
        toast("error", json.error || "Failed to report incident");
      }
    } catch {
      toast("error", "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Report Incident" description="Fill in the details below to log a new incident." size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type *"
            options={INCIDENT_TYPES}
            placeholder="Select type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <Select
            label="Severity *"
            options={SEVERITY_OPTIONS}
            placeholder="Select severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          />
        </div>

        <Input
          label="Title *"
          placeholder="Brief description of the incident"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Select
          label="Affected Area *"
          options={AREA_OPTIONS}
          placeholder="Select area"
          value={affectedArea}
          onChange={(e) => setAffectedArea(e.target.value)}
        />

        <div>
          <label className="block text-label text-ink mb-1.5 font-medium">Description</label>
          <textarea
            className="flex w-full rounded-sm border bg-cream-50 px-4 py-3 text-body-m text-ink transition-colors placeholder:text-ink-secondary/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta border-cream-300 min-h-[100px] resize-y"
            placeholder="Provide additional details about the incident..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Report Incident
          </Button>
        </div>
      </form>
    </Modal>
  );
}
