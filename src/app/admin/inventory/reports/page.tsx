"use client";

import { Card, CardContent } from "@/components/ui";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-h2 text-ink">Inventory Reports</h1>
        <p className="text-body-s text-ink-secondary">Analyze inventory performance, costs, and trends.</p>
      </div>

      <Card>
        <CardContent className="text-center py-16">
          <BarChart3 className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
          <h3 className="font-display text-h4 text-ink mb-2">Coming in Sprint 6</h3>
          <p className="text-body-s text-ink-secondary max-w-md mx-auto">
            Valuation reports, usage analysis, vendor performance, waste tracking,
            and turnover metrics with exportable charts will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
