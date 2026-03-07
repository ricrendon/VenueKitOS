"use client";

import { EmptyState } from "@/components/ui";
import { Construction } from "lucide-react";

export default function Page() {
  const pageName = "memberships";
  return (
    <div>
      <h1 className="font-display text-h1 text-ink mb-6 capitalize">{pageName}</h1>
      <EmptyState
        icon={<Construction className="h-8 w-8" />}
        title={`${pageName} module coming soon`}
        description="This module is part of Phase 2-3 and will be built next."
      />
    </div>
  );
}
