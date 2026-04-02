"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { useToast } from "@/components/ui";
import { ArrowLeft, Building2, Loader2, Pencil, Ban, CheckCircle, Package } from "lucide-react";

interface VendorDetail {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  leadTimeDays: number;
  paymentTerms: string | null;
  active: boolean;
  notes: string | null;
}

interface VendorItem {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  quantityOnHand: number;
  cost: number | null;
  active: boolean;
}

interface VendorPO {
  id: string;
  poNumber: string;
  status: string;
  orderedAt: string | null;
  expectedAt: string | null;
}

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [items, setItems] = useState<VendorItem[]>([]);
  const [pos, setPOs] = useState<VendorPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLeadTime, setEditLeadTime] = useState("");
  const [editPaymentTerms, setEditPaymentTerms] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/inventory/vendors/${params.id}`);
      if (!res.ok) throw new Error("Not found");
      const json = await res.json();
      setVendor(json.vendor || null);
      setItems(json.items || []);
      setPOs(json.purchaseOrders || []);
    } catch {
      setVendor(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startEditing = () => {
    if (!vendor) return;
    setEditName(vendor.name);
    setEditContact(vendor.contactName || "");
    setEditEmail(vendor.email || "");
    setEditPhone(vendor.phone || "");
    setEditLeadTime(String(vendor.leadTimeDays || ""));
    setEditPaymentTerms(vendor.paymentTerms || "");
    setEditNotes(vendor.notes || "");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!vendor || !editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/inventory/vendors/${vendor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          contactName: editContact || null,
          email: editEmail || null,
          phone: editPhone || null,
          leadTimeDays: editLeadTime ? Number(editLeadTime) : 0,
          paymentTerms: editPaymentTerms || null,
          notes: editNotes || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast("success", "Vendor updated");
      setEditing(false);
      fetchData();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!vendor) return;
    try {
      const res = await fetch(`/api/admin/inventory/vendors/${vendor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !vendor.active }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast("success", `Vendor ${vendor.active ? "deactivated" : "activated"}`);
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

  if (!vendor) {
    return (
      <div className="text-center py-20">
        <h2 className="font-display text-h3 text-ink mb-2">Vendor Not Found</h2>
        <Button variant="ghost" onClick={() => router.push("/admin/inventory/vendors")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Vendors
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin/inventory/vendors")} className="p-2 rounded-sm hover:bg-cream-200 transition-colors">
            <ArrowLeft className="h-5 w-5 text-ink-secondary" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-ink-secondary" />
              <h1 className="font-display text-h2 text-ink">{vendor.name}</h1>
              <Badge variant={vendor.active ? "success" : "default"}>
                {vendor.active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={startEditing}>
            <Pencil className="h-4 w-4 mr-1.5" />
            Edit
          </Button>
          <Button variant="ghost" onClick={handleToggleActive}>
            {vendor.active ? (
              <><Ban className="h-4 w-4 mr-1.5" />Deactivate</>
            ) : (
              <><CheckCircle className="h-4 w-4 mr-1.5" />Activate</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Info */}
        <Card>
          <CardContent>
            <h3 className="text-body-m font-medium text-ink mb-4">Contact Information</h3>
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-label text-ink-secondary font-medium mb-1 block">Name *</label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-label text-ink-secondary font-medium mb-1 block">Contact</label>
                    <Input value={editContact} onChange={(e) => setEditContact(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-label text-ink-secondary font-medium mb-1 block">Email</label>
                    <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-label text-ink-secondary font-medium mb-1 block">Phone</label>
                    <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-label text-ink-secondary font-medium mb-1 block">Lead Time (days)</label>
                    <Input type="number" value={editLeadTime} onChange={(e) => setEditLeadTime(e.target.value)} min={0} />
                  </div>
                  <div>
                    <label className="text-label text-ink-secondary font-medium mb-1 block">Payment Terms</label>
                    <Input value={editPaymentTerms} onChange={(e) => setEditPaymentTerms(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-label text-ink-secondary font-medium mb-1 block">Notes</label>
                  <Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={saving || !editName.trim()}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Contact" value={vendor.contactName || "—"} />
                <InfoField label="Email" value={vendor.email || "—"} />
                <InfoField label="Phone" value={vendor.phone || "—"} />
                <InfoField label="Lead Time" value={vendor.leadTimeDays > 0 ? `${vendor.leadTimeDays} days` : "—"} />
                <InfoField label="Payment Terms" value={vendor.paymentTerms || "—"} />
                <InfoField label="Notes" value={vendor.notes || "—"} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items Supplied */}
        <Card>
          <CardContent>
            <h3 className="text-body-m font-medium text-ink mb-4">
              Items Supplied ({items.length})
            </h3>
            {items.length === 0 ? (
              <p className="text-body-s text-ink-secondary text-center py-6">No items from this vendor</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/admin/inventory/items/${item.id}`}
                    className="flex items-center justify-between py-2 px-2 -mx-2 rounded-sm hover:bg-cream-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-ink-secondary" />
                      <div>
                        <p className="text-body-s text-ink font-medium">{item.name}</p>
                        {item.sku && <p className="font-mono text-caption text-ink-secondary">{item.sku}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-body-s text-ink font-medium">{item.quantityOnHand}</p>
                      {item.cost != null && (
                        <p className="text-caption text-ink-secondary">${item.cost.toFixed(2)}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-label text-ink-secondary font-medium mb-1">{label}</p>
      <p className="text-body-s text-ink font-medium">{value}</p>
    </div>
  );
}
