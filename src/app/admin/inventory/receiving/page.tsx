"use client";

import { Card, CardContent } from "@/components/ui";
import { PackageCheck } from "lucide-react";

export default function ReceivingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-h2 text-ink">Receiving</h1>
        <p className="text-body-s text-ink-secondary">Receive shipments and verify deliveries against purchase orders.</p>
      </div>

      <Card>
        <CardContent className="text-center py-16">
          <PackageCheck className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
          <h3 className="font-display text-h4 text-ink mb-2">Coming in Sprint 3</h3>
          <p className="text-body-s text-ink-secondary max-w-md mx-auto">
            Tablet-optimized receiving workflow with barcode scanning, quantity verification,
            and automatic ledger posting will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
