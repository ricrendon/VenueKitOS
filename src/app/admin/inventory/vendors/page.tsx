"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Button, Modal, Input } from "@/components/ui";
import { useToast } from "@/components/ui";
import { Building2, Plus, Loader2, Mail, Phone, Clock } from "lucide-react";

interface VendorSummary {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  leadTimeDays: number;
  paymentTerms: string | null;
  active: boolean;
  itemCount: number;
}

export default function VendorsPage() {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<VendorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formLeadTime, setFormLeadTime] = useState("");
  const [formPaymentTerms, setFormPaymentTerms] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inventory/vendors");
      const json = await res.json();
      setVendors(json.vendors || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormName("");
    setFormContact("");
    setFormEmail("");
    setFormPhone("");
    setFormLeadTime("");
    setFormPaymentTerms("");
    setFormNotes("");
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast("error", "Vendor name is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/inventory/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          contactName: formContact || undefined,
          email: formEmail || undefined,
          phone: formPhone || undefined,
          leadTimeDays: formLeadTime ? Number(formLeadTime) : 0,
          paymentTerms: formPaymentTerms || undefined,
          notes: formNotes || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast("success", `${formName} added`);
      resetForm();
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to create vendor");
    } finally {
      setSubmitting(false);
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
          <h1 className="font-display text-h2 text-ink">Vendors</h1>
          <p className="text-body-s text-ink-secondary">Manage suppliers and vendor contacts.</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Vendor
        </Button>
      </div>

      {/* Vendors Table */}
      {vendors.length > 0 ? (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-300">
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Vendor</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Contact</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Email</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Phone</th>
                    <th className="text-right text-label text-ink-secondary py-3 font-medium">Lead Time</th>
                    <th className="text-right text-label text-ink-secondary py-3 font-medium">Items</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => (
                    <tr key={v.id} className="border-b border-cream-200 hover:bg-cream-50 transition-colors">
                      <td className="py-3">
                        <Link href={`/admin/inventory/vendors/${v.id}`} className="hover:underline">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-ink-secondary" />
                            <span className="text-body-s text-ink font-medium">{v.name}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 text-body-s text-ink-secondary">{v.contactName || "—"}</td>
                      <td className="py-3">
                        {v.email ? (
                          <span className="text-body-s text-ink-secondary flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />{v.email}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-3">
                        {v.phone ? (
                          <span className="text-body-s text-ink-secondary flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />{v.phone}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-3 text-right text-body-s text-ink-secondary">
                        {v.leadTimeDays > 0 ? (
                          <span className="flex items-center justify-end gap-1">
                            <Clock className="h-3.5 w-3.5" />{v.leadTimeDays}d
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-3 text-right text-body-s text-ink font-medium">{v.itemCount}</td>
                      <td className="py-3">
                        <Badge variant={v.active ? "success" : "default"} className="text-[11px]">
                          {v.active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
            <h3 className="font-display text-h4 text-ink mb-2">No vendors yet</h3>
            <p className="text-body-s text-ink-secondary mb-4">
              Add your first supplier to manage purchasing.
            </p>
            <Button onClick={() => { resetForm(); setShowModal(true); }}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Vendor
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Vendor Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Add Vendor"
        description="Add a new supplier or vendor."
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label text-ink-secondary font-medium mb-1 block">Vendor Name *</label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g., Sysco" />
            </div>
            <div>
              <label className="text-label text-ink-secondary font-medium mb-1 block">Contact Name</label>
              <Input value={formContact} onChange={(e) => setFormContact(e.target.value)} placeholder="John Smith" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label text-ink-secondary font-medium mb-1 block">Email</label>
              <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="vendor@example.com" />
            </div>
            <div>
              <label className="text-label text-ink-secondary font-medium mb-1 block">Phone</label>
              <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="(555) 123-4567" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label text-ink-secondary font-medium mb-1 block">Lead Time (days)</label>
              <Input type="number" value={formLeadTime} onChange={(e) => setFormLeadTime(e.target.value)} placeholder="0" min={0} />
            </div>
            <div>
              <label className="text-label text-ink-secondary font-medium mb-1 block">Payment Terms</label>
              <Input value={formPaymentTerms} onChange={(e) => setFormPaymentTerms(e.target.value)} placeholder="Net 30" />
            </div>
          </div>
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Notes</label>
            <Input value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Additional notes..." />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting || !formName.trim()} className="flex-1">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Vendor"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
