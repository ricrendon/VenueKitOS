"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Badge } from "@/components/ui";
import { FileCheck, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Waiver {
  id: string;
  parentName: string;
  parentEmail: string;
  childName: string;
  status: string;
  signedAt: string;
  expiresAt: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export default function WaiversPage() {
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/waivers")
      .then((res) => res.json())
      .then((json) => {
        setWaivers(json.waivers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-h1 text-ink">Waivers</h1>
          <p className="text-body-m text-ink-secondary">{waivers.length} signed waiver{waivers.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-300">
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Child</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Parent / Guardian</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Emergency Contact</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Signed</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Expires</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {waivers.map((w) => {
                  const isExpired = new Date(w.expiresAt) < new Date();
                  return (
                    <tr key={w.id} className="border-b border-cream-200 hover:bg-cream-200/50 transition-colors">
                      <td className="py-3 text-body-s text-ink font-medium">{w.childName}</td>
                      <td className="py-3">
                        <div className="text-body-s text-ink">{w.parentName}</div>
                        <div className="text-caption text-ink-secondary">{w.parentEmail}</div>
                      </td>
                      <td className="py-3">
                        <div className="text-body-s text-ink">{w.emergencyContact || "—"}</div>
                        <div className="text-caption text-ink-secondary">{w.emergencyPhone || ""}</div>
                      </td>
                      <td className="py-3 text-body-s text-ink-secondary">
                        {w.signedAt ? format(new Date(w.signedAt), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="py-3 text-body-s text-ink-secondary">
                        {w.expiresAt ? format(new Date(w.expiresAt), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="py-3">
                        <Badge variant={isExpired ? "error" : w.status === "signed" ? "success" : "warning"} className="text-[11px]">
                          {isExpired ? "expired" : w.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {waivers.length === 0 && (
            <div className="py-12 text-center">
              <FileCheck className="h-8 w-8 text-ink-secondary mx-auto mb-3" />
              <p className="text-body-m text-ink-secondary">No waivers found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
