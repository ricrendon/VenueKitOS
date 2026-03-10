"use client";

import { Card, CardContent } from "@/components/ui";
import { ClipboardList } from "lucide-react";

export default function PurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-h2 text-ink">Purchase Orders</h1>
        <p className="text-body-s text-ink-secondary">Create, track, and manage vendor purchase orders.</p>
      </div>

      <Card>
        <CardContent className="text-center py-16">
          <ClipboardList className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
          <h3 className="font-display text-h4 text-ink mb-2">Coming in Sprint 3</h3>
          <p className="text-body-s text-ink-secondary max-w-md mx-auto">
            Full purchasing workflow with PO creation, approval, vendor tracking,
            and receiving integration will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
