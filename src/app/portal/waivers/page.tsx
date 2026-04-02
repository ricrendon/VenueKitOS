"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { FileCheck, Loader2, Plus, Clock, AlertTriangle } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { format, isBefore } from "date-fns";

interface WaiverItem {
  id: string;
  child_id: string;
  parent_name: string;
  child_name: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  signed_at: string;
  expires_at: string;
  status: string;
}

export default function PortalWaiversPage() {
  const [waivers, setWaivers] = useState<WaiverItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        return;
      }

      fetch(`/api/portal/waivers?authUserId=${user.id}`)
        .then((res) => res.json())
        .then((json) => {
          setWaivers(json.waivers || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  const statusVariant = (status: string, expiresAt: string) => {
    if (status === "expired" || isBefore(new Date(expiresAt), new Date())) return "error" as const;
    if (status === "signed") return "success" as const;
    return "warning" as const;
  };

  const statusLabel = (status: string, expiresAt: string) => {
    if (isBefore(new Date(expiresAt), new Date())) return "Expired";
    if (status === "signed") return "Active";
    return status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-h1 text-ink">My Waivers</h1>
          <p className="text-body-m text-ink-secondary">Manage liability waivers for your children.</p>
        </div>
        <Link href="/waivers/sign">
          <Button size="sm">
            <Plus className="h-4 w-4" /> Sign a waiver
          </Button>
        </Link>
      </div>

      {waivers.length > 0 ? (
        <div className="space-y-3">
          {waivers.map((waiver) => {
            const isExpired = isBefore(new Date(waiver.expires_at), new Date());
            return (
              <Card key={waiver.id} className={isExpired ? "opacity-75" : ""}>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-sm flex items-center justify-center shrink-0 ${
                        isExpired ? "bg-error-light" : "bg-success-light"
                      }`}>
                        {isExpired ? (
                          <AlertTriangle className="h-6 w-6 text-error" />
                        ) : (
                          <FileCheck className="h-6 w-6 text-success" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-body-m font-medium text-ink">{waiver.child_name}</h3>
                        <p className="text-body-s text-ink-secondary">
                          Signed by {waiver.parent_name}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-body-s text-ink-secondary">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Signed {format(new Date(waiver.signed_at), "MMM d, yyyy")}
                          </span>
                          <span>
                            Expires {format(new Date(waiver.expires_at), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusVariant(waiver.status, waiver.expires_at)}>
                        {statusLabel(waiver.status, waiver.expires_at)}
                      </Badge>
                      {isExpired && (
                        <Link href="/waivers/sign">
                          <Button size="sm" variant="secondary">Renew</Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Emergency contact info */}
                  {waiver.emergency_contact_name && (
                    <div className="mt-3 pt-3 border-t border-cream-200">
                      <p className="text-caption text-ink-secondary">
                        Emergency contact: {waiver.emergency_contact_name} &middot; {waiver.emergency_contact_phone}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileCheck className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
            <h3 className="font-display text-h4 text-ink mb-2">No waivers signed yet</h3>
            <p className="text-body-s text-ink-secondary mb-4">
              A signed waiver is required before your child can play.
            </p>
            <Link href="/waivers/sign">
              <Button size="sm">Sign a waiver</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
