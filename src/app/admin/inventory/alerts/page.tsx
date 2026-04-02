"use client";

import { Card, CardContent } from "@/components/ui";
import { Bell } from "lucide-react";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-h2 text-ink">Inventory Alerts</h1>
        <p className="text-body-s text-ink-secondary">Monitor stock levels, expirations, and anomalies.</p>
      </div>

      <Card>
        <CardContent className="text-center py-16">
          <Bell className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
          <h3 className="font-display text-h4 text-ink mb-2">Coming in Sprint 5</h3>
          <p className="text-body-s text-ink-secondary max-w-md mx-auto">
            Centralized alerts for low stock, out of stock, expiration warnings,
            variance anomalies, and booking conflicts will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
