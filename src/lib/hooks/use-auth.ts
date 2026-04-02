"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "staff" | "parent" | null;

interface AuthState {
  user: User | null;
  role: UserRole;
  loading: boolean;
  venueId: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
    venueId: null,
  });

  const supabase = createClient();

  const resolveRole = useCallback(
    async (user: User) => {
      // Check if user is staff/admin
      const { data: staffRow } = await supabase
        .from("staff_users")
        .select("role, venue_id")
        .eq("auth_user_id", user.id)
        .single();

      if (staffRow) {
        const role: UserRole =
          staffRow.role === "venue_owner" || staffRow.role === "manager"
            ? "admin"
            : "staff";
        setState({ user, role, loading: false, venueId: staffRow.venue_id });
        return;
      }

      // Check if user is a parent
      const { data: parentRow } = await supabase
        .from("parent_accounts")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (parentRow) {
        setState({ user, role: "parent", loading: false, venueId: null });
        return;
      }

      // Authenticated but no profile row yet
      setState({ user, role: null, loading: false, venueId: null });
    },
    [supabase]
  );

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        resolveRole(user);
      } else {
        setState({ user: null, role: null, loading: false, venueId: null });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        resolveRole(session.user);
      } else {
        setState({ user: null, role: null, loading: false, venueId: null });
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, resolveRole]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, role: null, loading: false, venueId: null });
  }, [supabase]);

  return { ...state, signOut };
}
