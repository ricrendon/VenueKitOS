"use client";

import { useEffect, useState, useCallback } from "react";
import { Button, Badge, useToast } from "@/components/ui";
import { Loader2, Shield, Save } from "lucide-react";

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
}

interface PagePermission {
  key: string;
  label: string;
  granted: boolean;
  isDefault: boolean;
  hasOverride: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  venue_owner: "Owner",
  venue_manager: "Manager",
  front_desk_staff: "Front Desk",
  party_host: "Party Host",
};

const FULL_ACCESS_ROLES = ["super_admin", "venue_owner", "venue_manager"];

export function StaffPermissionsForm() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [permissions, setPermissions] = useState<PagePermission[]>([]);
  const [staffInfo, setStaffInfo] = useState<{ role: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Fetch staff list
  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch("/api/admin/staff");
        const json = await res.json();
        setStaffList(json.staff || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, []);

  // Fetch permissions for selected staff
  const fetchPermissions = useCallback(async (staffId: string) => {
    if (!staffId) return;
    setLoadingPerms(true);
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/permissions`);
      const json = await res.json();
      setPermissions(json.pages || []);
      setStaffInfo(json.staff || null);
    } catch {
      toast("error", "Failed to load permissions");
    } finally {
      setLoadingPerms(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedStaffId) {
      fetchPermissions(selectedStaffId);
    } else {
      setPermissions([]);
      setStaffInfo(null);
    }
  }, [selectedStaffId, fetchPermissions]);

  const handleToggle = (pageKey: string) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.key === pageKey ? { ...p, granted: !p.granted, hasOverride: true } : p
      )
    );
  };

  const handleSave = async () => {
    if (!selectedStaffId) return;
    setSaving(true);
    try {
      const overrides: Record<string, boolean> = {};
      for (const p of permissions) {
        overrides[p.key] = p.granted;
      }

      const res = await fetch(`/api/admin/staff/${selectedStaffId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides }),
      });

      if (res.ok) {
        toast("success", "Permissions saved");
        // Refresh to see updated override status
        await fetchPermissions(selectedStaffId);
      } else {
        const json = await res.json();
        toast("error", json.error || "Failed to save");
      }
    } catch {
      toast("error", "Network error");
    } finally {
      setSaving(false);
    }
  };

  const isFullAccess = staffInfo && FULL_ACCESS_ROLES.includes(staffInfo.role);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-h3 text-ink mb-1">Employee Permissions</h3>
        <p className="text-body-s text-ink-secondary">
          Control which admin pages each employee can access. Owners and managers always have full access.
        </p>
      </div>

      {/* Staff selector */}
      <div className="max-w-sm">
        <label className="block text-label text-ink mb-1.5 font-medium">
          Select Employee
        </label>
        <select
          value={selectedStaffId}
          onChange={(e) => setSelectedStaffId(e.target.value)}
          className="flex h-[52px] w-full appearance-none rounded-sm border bg-cream-50 px-4 pr-10 text-body-m text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta border-cream-300"
        >
          <option value="">Choose a staff member...</option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.first_name} {s.last_name} — {ROLE_LABELS[s.role] || s.role}
            </option>
          ))}
        </select>
      </div>

      {/* Permissions table */}
      {selectedStaffId && (
        <>
          {loadingPerms ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-terracotta" />
            </div>
          ) : (
            <>
              {/* Staff info badge */}
              {staffInfo && (
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-ink-secondary" />
                  <span className="text-body-m font-medium text-ink">{staffInfo.name}</span>
                  <Badge variant={isFullAccess ? "success" : "info"}>
                    {ROLE_LABELS[staffInfo.role] || staffInfo.role}
                  </Badge>
                  {isFullAccess && (
                    <span className="text-body-s text-ink-secondary">
                      Full access — all pages enabled
                    </span>
                  )}
                </div>
              )}

              {/* Page toggles */}
              <div className="border border-cream-300 rounded-md overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-cream-200">
                      <th className="text-left text-label text-ink-secondary py-3 px-4 font-medium">Page</th>
                      <th className="text-center text-label text-ink-secondary py-3 px-4 font-medium w-24">Default</th>
                      <th className="text-center text-label text-ink-secondary py-3 px-4 font-medium w-24">Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((p) => (
                      <tr key={p.key} className="border-t border-cream-200 hover:bg-cream-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-body-s text-ink font-medium">{p.label}</span>
                            {p.hasOverride && (
                              <Badge variant="mustard">Override</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-body-s ${p.isDefault ? "text-success" : "text-ink-secondary"}`}>
                            {p.isDefault ? "✓" : "—"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggle(p.key)}
                            disabled={isFullAccess ?? false}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta/30 ${
                              p.granted ? "bg-success" : "bg-cream-300"
                            } ${isFullAccess ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                p.granted ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Save button */}
              {!isFullAccess && (
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Permissions
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
