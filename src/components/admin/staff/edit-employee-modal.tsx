"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Input, Select, useToast } from "@/components/ui";
import { Loader2 } from "lucide-react";
import type { StaffMember } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  staff: StaffMember | null;
}

const ROLE_OPTIONS = [
  { value: "venue_owner", label: "Venue Owner" },
  { value: "venue_manager", label: "Venue Manager" },
  { value: "front_desk_staff", label: "Front Desk Staff" },
  { value: "party_host", label: "Party Host" },
];

export function EditEmployeeModal({ open, onClose, onSuccess, staff }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (staff) {
      setFirstName(staff.first_name);
      setLastName(staff.last_name);
      setPhone(staff.phone || "");
      setRole(staff.role);
    }
  }, [staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;
    if (!firstName || !lastName || !role) {
      toast("error", "Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/staff/${staff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          role,
        }),
      });

      if (res.ok) {
        toast("success", "Employee updated");
        onSuccess();
        onClose();
      } else {
        const json = await res.json();
        toast("error", json.error || "Failed to update employee");
      }
    } catch {
      toast("error", "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!staff) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Employee"
      description={`Update details for ${staff.first_name} ${staff.last_name}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name *"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Last Name *"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-label text-ink mb-1.5 font-medium">Email</label>
          <div className="flex h-[52px] w-full items-center rounded-sm border bg-cream-100 px-4 text-body-m text-ink-secondary border-cream-300 cursor-not-allowed">
            {staff.email}
          </div>
          <p className="text-body-s text-ink-secondary mt-1">
            Email cannot be changed after account creation.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Select
            label="Role *"
            options={ROLE_OPTIONS}
            placeholder="Select role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
