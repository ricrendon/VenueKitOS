"use client";

import { useState } from "react";
import { Modal, Button, Input, Select, useToast } from "@/components/ui";
import { Loader2, Check, Copy } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLE_OPTIONS = [
  { value: "venue_owner", label: "Venue Owner" },
  { value: "venue_manager", label: "Venue Manager" },
  { value: "front_desk_staff", label: "Front Desk Staff" },
  { value: "party_host", label: "Party Host" },
];

export function AddEmployeeModal({ open, onClose, onSuccess }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdName, setCreatedName] = useState("");
  const [createdEmail, setCreatedEmail] = useState("");
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setRole("");
    setCreatedName("");
    setCreatedEmail("");
    setCreatedPassword(null);
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !role) {
      toast("error", "Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone: phone || null,
          role,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        toast("success", "Employee account created");
        setCreatedName(`${firstName} ${lastName}`);
        setCreatedEmail(email);
        setCreatedPassword(json.temporaryPassword);
        onSuccess();
      } else {
        toast("error", json.error || "Failed to create employee");
      }
    } catch {
      toast("error", "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!createdPassword) return;
    try {
      await navigator.clipboard.writeText(createdPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("error", "Failed to copy to clipboard");
    }
  };

  // Success phase — show temporary password
  if (createdPassword) {
    return (
      <Modal open={open} onClose={handleClose} title="Employee Created" size="md">
        <div className="space-y-4">
          <div className="rounded-md bg-success-light border border-success/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Check className="h-5 w-5 text-success" />
              <span className="text-body-m font-medium text-ink">
                Account created for {createdName}
              </span>
            </div>
            <p className="text-body-s text-ink-secondary mb-3">
              Share these credentials with the employee so they can sign in.
            </p>
            <div className="space-y-2 bg-white rounded-sm p-3 border border-cream-300">
              <div className="flex items-center justify-between">
                <span className="text-label text-ink-secondary">Email</span>
                <span className="text-body-s text-ink font-medium">{createdEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-label text-ink-secondary">Temporary Password</span>
                <div className="flex items-center gap-2">
                  <code className="text-body-s text-ink font-mono bg-cream-200 px-2 py-0.5 rounded">
                    {createdPassword}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-ink-secondary hover:text-ink transition-colors"
                    title="Copy password"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-body-s text-ink-secondary">
            This password will not be shown again. The employee should change it after their first login.
          </p>

          <div className="flex justify-end pt-2">
            <Button onClick={handleClose}>Done</Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Form phase
  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Employee"
      description="Create a new staff account with login credentials."
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

        <Input
          label="Email *"
          type="email"
          placeholder="employee@venue.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

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
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Add Employee
          </Button>
        </div>
      </form>
    </Modal>
  );
}
