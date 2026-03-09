"use client";

import { useEffect, useState } from "react";
import type { PageKey } from "@/lib/types";
import { ALL_PAGE_KEYS } from "@/lib/permissions";

interface PermissionsState {
  allowedPages: Set<PageKey>;
  loading: boolean;
}

/**
 * Client-side hook to fetch the current user's allowed pages.
 * Used by AdminShell to filter sidebar nav items.
 */
export function usePermissions(): PermissionsState {
  const [state, setState] = useState<PermissionsState>({
    allowedPages: new Set(ALL_PAGE_KEYS), // optimistic: show all until loaded
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchPermissions() {
      try {
        const res = await fetch("/api/admin/permissions/me");
        if (!res.ok) throw new Error("Failed to fetch permissions");
        const json = await res.json();
        if (!cancelled) {
          setState({
            allowedPages: new Set(json.allowedPages as PageKey[]),
            loading: false,
          });
        }
      } catch {
        // On error, keep showing all pages (fail open for UX)
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    fetchPermissions();
    return () => { cancelled = true; };
  }, []);

  return state;
}
