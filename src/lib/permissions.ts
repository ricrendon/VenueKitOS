import type { PageKey, UserRole } from "@/lib/types";

// All admin pages with their metadata
export const ADMIN_PAGES: { key: PageKey; label: string; href: string }[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin/dashboard" },
  { key: "reservations", label: "Reservations", href: "/admin/reservations" },
  { key: "parties", label: "Parties", href: "/admin/parties" },
  { key: "waivers", label: "Waivers", href: "/admin/waivers" },
  { key: "families", label: "Families", href: "/admin/families" },
  { key: "memberships", label: "Memberships", href: "/admin/memberships" },
  { key: "check-in", label: "Check-In", href: "/admin/check-in" },
  { key: "time-clock", label: "Time Clock", href: "/admin/time-clock" },
  { key: "pos", label: "POS", href: "/admin/pos" },
  { key: "inventory", label: "Inventory", href: "/admin/inventory" },
  { key: "gift-cards", label: "Gift Cards", href: "/admin/gift-cards" },
  { key: "reports", label: "Reports", href: "/admin/reports" },
  { key: "marketing", label: "Marketing", href: "/admin/marketing" },
  { key: "incidents", label: "Incidents", href: "/admin/incidents" },
  { key: "settings", label: "Settings", href: "/admin/settings" },
];

// Map href → page key for quick lookups
export const HREF_TO_PAGE_KEY: Record<string, PageKey> = {};
for (const page of ADMIN_PAGES) {
  HREF_TO_PAGE_KEY[page.href] = page.key;
}

// All page keys for convenience
export const ALL_PAGE_KEYS: PageKey[] = ADMIN_PAGES.map((p) => p.key);

// Roles that have full access to everything
export const FULL_ACCESS_ROLES: UserRole[] = [
  "super_admin",
  "venue_owner",
  "venue_manager",
];

// Default page access per role
export const ROLE_DEFAULTS: Record<string, PageKey[]> = {
  super_admin: ALL_PAGE_KEYS,
  venue_owner: ALL_PAGE_KEYS,
  venue_manager: ALL_PAGE_KEYS,
  front_desk_staff: [
    "dashboard",
    "reservations",
    "check-in",
    "pos",
    "waivers",
    "families",
    "incidents",
  ],
  party_host: [
    "dashboard",
    "parties",
    "check-in",
    "waivers",
    "incidents",
  ],
};

/**
 * Get the default page keys for a given staff role.
 */
export function getDefaultPages(role: string): Set<PageKey> {
  const defaults = ROLE_DEFAULTS[role];
  if (!defaults) return new Set<PageKey>();
  return new Set(defaults);
}

/**
 * Check if a role has full access (no restrictions).
 */
export function isFullAccessRole(role: string): boolean {
  return FULL_ACCESS_ROLES.includes(role as UserRole);
}
