"use client";

import { Card, CardContent } from "@/components/ui";
import { ClipboardCheck } from "lucide-react";

export default function CountSessionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-h2 text-ink">Inventory Counts</h1>
        <p className="text-body-s text-ink-secondary">Schedule and manage physical inventory counts.</p>
      </div>

      <Card>
        <CardContent className="text-center py-16">
          <ClipboardCheck className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
          <h3 className="font-display text-h4 text-ink mb-2">Coming in Sprint 4</h3>
          <p className="text-body-s text-ink-secondary max-w-md mx-auto">
            Count sessions with full/cycle/spot modes, variance tracking,
            reconciliation workflows, and audit trails will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
