"use client";

import { Card, CardContent } from "@/components/ui";
import { Boxes } from "lucide-react";

export default function BundlesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-h2 text-ink">Bundles & Recipes</h1>
        <p className="text-body-s text-ink-secondary">Manage bill-of-materials for composite items and party packages.</p>
      </div>

      <Card>
        <CardContent className="text-center py-16">
          <Boxes className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
          <h3 className="font-display text-h4 text-ink mb-2">Coming in Phase 2</h3>
          <p className="text-body-s text-ink-secondary max-w-md mx-auto">
            Recipe/BOM management linking parent items to component items with quantities,
            auto-deduction on consumption, and cost rollup will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
