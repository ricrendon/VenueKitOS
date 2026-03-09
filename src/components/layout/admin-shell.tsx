"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { HREF_TO_PAGE_KEY } from "@/lib/permissions";
import {
  LayoutDashboard, Calendar, PartyPopper, FileCheck,
  Users, CreditCard, ClipboardCheck, Timer, ShoppingCart,
  Package, Gift, BarChart3, Megaphone, UserCog, AlertTriangle, Settings, Search, Bell, ChevronDown,
  Menu, X, LogOut,
} from "lucide-react";

const sidebarNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/reservations", label: "Reservations", icon: Calendar },
  { href: "/admin/parties", label: "Parties", icon: PartyPopper },
  { href: "/admin/waivers", label: "Waivers", icon: FileCheck },
  { href: "/admin/families", label: "Families", icon: Users },
  { href: "/admin/memberships", label: "Memberships", icon: CreditCard },
  { href: "/admin/check-in", label: "Check-In", icon: ClipboardCheck },
  { href: "/admin/time-clock", label: "Time Clock", icon: Timer },
  { href: "/admin/pos", label: "POS", icon: ShoppingCart },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/gift-cards", label: "Gift Cards", icon: Gift },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/staff", label: "Staff", icon: UserCog },
  { href: "/admin/incidents", label: "Incidents", icon: AlertTriangle },
];

interface AdminShellProps {
  children: React.ReactNode;
  venueName?: string | null;
  logoUrl?: string | null;
}

export function AdminShell({ children, venueName, logoUrl }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { allowedPages } = usePermissions();

  // Filter sidebar items by the user's allowed pages
  const visibleNav = sidebarNav.filter((item) => {
    const pageKey = HREF_TO_PAGE_KEY[item.href];
    if (!pageKey) return true; // show items not mapped (shouldn't happen)
    return allowedPages.has(pageKey);
  });

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="flex h-screen bg-cream">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-ink text-cream-200 flex flex-col transition-transform lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-cream-300/10">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-sm bg-terracotta flex items-center justify-center shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt={venueName ?? "Venue"} className="h-6 w-6 object-contain" />
              ) : (
                <span className="text-white font-display font-bold text-body-s">
                  {venueName ? venueName[0].toUpperCase() : "V"}
                </span>
              )}
            </div>
            <span className="font-display font-semibold text-body-m text-cream-50">
              {venueName ?? "VenueKit OS"}
            </span>
          </Link>
          <button className="lg:hidden text-cream-300 hover:text-cream-50" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {visibleNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-sm text-body-s transition-colors",
                      isActive
                        ? "bg-terracotta text-white font-medium"
                        : "text-cream-300 hover:text-cream-50 hover:bg-cream-300/10"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="px-3 py-4 border-t border-cream-300/10 space-y-1">
          <Link
            href="/admin/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-sm text-body-s transition-colors",
              pathname === "/admin/settings" || pathname.startsWith("/admin/settings/")
                ? "bg-terracotta text-white font-medium"
                : "text-cream-300 hover:text-cream-50 hover:bg-cream-300/10"
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <Settings className="h-5 w-5 shrink-0" />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-sm text-body-s text-cream-300 hover:text-cream-50 hover:bg-cream-300/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-ink/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-6 bg-cream-50 border-b border-cream-300">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-ink" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>

            {/* Venue switcher */}
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-sm bg-cream-200 text-body-s text-ink hover:bg-cream-300 transition-colors">
              WonderPlay
              <ChevronDown className="h-4 w-4 text-ink-secondary" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <button className="p-2 rounded-sm text-ink-secondary hover:bg-cream-200 hover:text-ink transition-colors">
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-sm text-ink-secondary hover:bg-cream-200 hover:text-ink transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-terracotta" />
            </button>

            {/* Staff avatar */}
            <div className="h-8 w-8 rounded-full bg-dusty-blue flex items-center justify-center">
              <span className="text-white text-caption font-medium">MT</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
