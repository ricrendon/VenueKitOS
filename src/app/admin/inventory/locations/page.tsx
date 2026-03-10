"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, Badge, Button, Modal, Input, Select } from "@/components/ui";
import { useToast } from "@/components/ui";
import { MapPin, Plus, Loader2, Pencil } from "lucide-react";
import { LOCATION_TYPE_LABELS, LOCATION_TYPE_OPTIONS } from "@/lib/inventory/constants";

interface Location {
  id: string;
  name: string;
  locationType: string;
  active: boolean;
  notes: string | null;
  itemCount: number;
}

export default function LocationsPage() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("storage");
  const [formNotes, setFormNotes] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inventory/locations");
      const json = await res.json();
      setLocations(json.locations || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = () => {
    setEditingLocation(null);
    setFormName("");
    setFormType("storage");
    setFormNotes("");
    setShowModal(true);
  };

  const openEditModal = (loc: Location) => {
    setEditingLocation(loc);
    setFormName(loc.name);
    setFormType(loc.locationType);
    setFormNotes(loc.notes || "");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast("error", "Name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingLocation) {
        const res = await fetch("/api/admin/inventory/locations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingLocation.id,
            name: formName.trim(),
            locationType: formType,
            notes: formNotes || null,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        toast("success", `${formName} updated`);
      } else {
        const res = await fetch("/api/admin/inventory/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            locationType: formType,
            notes: formNotes || null,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        toast("success", `${formName} created`);
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (loc: Location) => {
    try {
      const res = await fetch("/api/admin/inventory/locations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: loc.id, active: !loc.active }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast("success", `${loc.name} ${loc.active ? "deactivated" : "activated"}`);
      fetchData();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed");
    }
  };

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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-h2 text-ink">Locations</h1>
          <p className="text-body-s text-ink-secondary">Manage inventory storage and operating zones.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Location
        </Button>
      </div>

      {/* Locations Grid */}
      {locations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <Card key={loc.id} className={!loc.active ? "opacity-60" : ""}>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-sm bg-cream-200 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-ink-secondary" />
                    </div>
                    <div>
                      <p className="text-body-s text-ink font-medium">{loc.name}</p>
                      <p className="text-caption text-ink-secondary">
                        {LOCATION_TYPE_LABELS[loc.locationType] || loc.locationType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(loc)}
                      className="p-1.5 rounded-sm hover:bg-cream-200 text-ink-secondary hover:text-ink transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-cream-200">
                  <div className="flex items-center gap-2">
                    <Badge variant={loc.active ? "success" : "default"} className="text-[10px]">
                      {loc.active ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-caption text-ink-secondary">{loc.itemCount} items</span>
                  </div>
                  <button
                    onClick={() => handleToggleActive(loc)}
                    className="text-caption text-ink-secondary hover:text-ink transition-colors"
                  >
                    {loc.active ? "Deactivate" : "Activate"}
                  </button>
                </div>

                {loc.notes && (
                  <p className="text-caption text-ink-secondary mt-2">{loc.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
            <h3 className="font-display text-h4 text-ink mb-2">No locations yet</h3>
            <p className="text-body-s text-ink-secondary mb-4">
              Add storage locations to track inventory by zone.
            </p>
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Location
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingLocation ? "Edit Location" : "Add Location"}
        description={editingLocation ? `Editing ${editingLocation.name}` : "Create a new inventory location."}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Name *</label>
            <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g., Café Backstock" />
          </div>
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Location Type</label>
            <Select options={LOCATION_TYPE_OPTIONS} value={formType} onChange={(e) => setFormType(e.target.value)} />
          </div>
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Notes</label>
            <Input value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Additional details..." />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting || !formName.trim()} className="flex-1">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingLocation ? "Save" : "Add Location"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
