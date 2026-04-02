"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  LayoutDashboard, Calendar, FileCheck, Users, CreditCard, Settings,
} from "lucide-react";

const portalNav = [
  { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/bookings", label: "My Bookings", icon: Calendar },
  { href: "/portal/waivers", label: "My Waivers", icon: FileCheck },
  { href: "/portal/children", label: "My Children", icon: Users },
  { href: "/portal/memberships", label: "Memberships", icon: CreditCard },
  { href: "/portal/settings", label: "Settings", icon: Settings },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <Header />
      <div className="pt-24 pb-16">
        <div className="container-content">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
            {/* Sidebar */}
            <nav className="hidden lg:block">
              <ul className="space-y-1 sticky top-28">
                {portalNav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 rounded-sm text-body-s transition-colors",
                          isActive
                            ? "bg-terracotta text-white font-medium"
                            : "text-ink-secondary hover:text-ink hover:bg-cream-200"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Mobile nav */}
            <div className="lg:hidden overflow-x-auto -mx-4 px-4">
              <div className="flex gap-2 min-w-max">
                {portalNav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-pill text-body-s whitespace-nowrap transition-colors",
                        isActive
                          ? "bg-terracotta text-white font-medium"
                          : "bg-cream-200 text-ink-secondary"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <main>{children}</main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
