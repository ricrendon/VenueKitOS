"use client";

import { useState } from "react";
import { Modal, Button, Input, Select, useToast } from "@/components/ui";
import { Loader2 } from "lucide-react";
import type { Incident } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  incident: Incident | null;
}

const STATUS_OPTIONS = [
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const IMPACT_OPTIONS = [
  { value: "none", label: "None" },
  { value: "minor", label: "Minor" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

export function ResolveIncidentModal({ open, onClose, onSuccess, incident }: Props) {
  const [status, setStatus] = useState("resolved");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionCost, setResolutionCost] = useState("");
  const [operationalImpact, setOperationalImpact] = useState("");
  const [outcome, setOutcome] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/incidents/${incident.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          resolution_notes: resolutionNotes || null,
          resolution_cost: resolutionCost ? Number(resolutionCost) : 0,
          operational_impact: operationalImpact || null,
          outcome: outcome || null,
        }),
      });

      if (res.ok) {
        toast("success", `Incident ${status === "resolved" ? "resolved" : "updated"}`);
        // Reset form
        setStatus("resolved");
        setResolutionNotes("");
        setResolutionCost("");
        setOperationalImpact("");
        setOutcome("");
        onSuccess();
        onClose();
      } else {
        const json = await res.json();
        toast("error", json.error || "Failed to update incident");
      }
    } catch {
      toast("error", "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!incident) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Resolve Incident"
      description={`${incident.title} — reported as ${incident.severity} severity`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Update Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />

        <div>
          <label className="block text-label text-ink mb-1.5 font-medium">Resolution Notes</label>
          <textarea
            className="flex w-full rounded-sm border bg-cream-50 px-4 py-3 text-body-m text-ink transition-colors placeholder:text-ink-secondary/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta border-cream-300 min-h-[100px] resize-y"
            placeholder="Describe how the incident was resolved..."
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Financial Cost ($)"
            type="number"
            placeholder="0.00"
            value={resolutionCost}
            onChange={(e) => setResolutionCost(e.target.value)}
          />
          <Select
            label="Operational Impact"
            options={IMPACT_OPTIONS}
            placeholder="Select impact"
            value={operationalImpact}
            onChange={(e) => setOperationalImpact(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-label text-ink mb-1.5 font-medium">Outcome</label>
          <textarea
            className="flex w-full rounded-sm border bg-cream-50 px-4 py-3 text-body-m text-ink transition-colors placeholder:text-ink-secondary/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta border-cream-300 resize-y"
            placeholder="Final outcome or follow-up actions..."
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "resolved" ? "Resolve Incident" : "Update Incident"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
