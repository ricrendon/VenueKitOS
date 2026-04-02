"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, ArrowLeftRight, ShoppingCart,
  ArrowDownToLine, ClipboardCheck, Building2, MapPin,
  Boxes, Bell, BarChart3,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/inventory", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/inventory/items", label: "Items", icon: Package },
  { href: "/admin/inventory/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/admin/inventory/purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
  { href: "/admin/inventory/receiving", label: "Receiving", icon: ArrowDownToLine },
  { href: "/admin/inventory/counts", label: "Counts", icon: ClipboardCheck },
  { href: "/admin/inventory/vendors", label: "Vendors", icon: Building2 },
  { href: "/admin/inventory/locations", label: "Locations", icon: MapPin },
  { href: "/admin/inventory/bundles", label: "Bundles", icon: Boxes },
  { href: "/admin/inventory/alerts", label: "Alerts", icon: Bell },
  { href: "/admin/inventory/reports", label: "Reports", icon: BarChart3 },
];

export function InventoryNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-cream-300 bg-cream-50">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 px-1 min-w-max">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2.5 text-body-s font-medium whitespace-nowrap border-b-2 transition-colors",
                  isActive
                    ? "border-terracotta text-terracotta"
                    : "border-transparent text-ink-secondary hover:text-ink hover:border-cream-400"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
