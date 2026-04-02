"use client";

import { InventoryNav } from "@/components/admin/inventory/inventory-nav";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col -m-6">
      {/* Sub-navigation */}
      <InventoryNav />

      {/* Page content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
