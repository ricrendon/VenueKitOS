"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface VenueContextValue {
  venue: Record<string, any> | null;
  partyPackages: Record<string, any>[];
  membershipPlans: Record<string, any>[];
  loading: boolean;
}

const VenueContext = createContext<VenueContextValue>({
  venue: null,
  partyPackages: [],
  membershipPlans: [],
  loading: true,
});

export function VenueProvider({ children }: { children: ReactNode }) {
  const [venue, setVenue] = useState<Record<string, any> | null>(null);
  const [partyPackages, setPartyPackages] = useState<Record<string, any>[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/venue")
      .then((res) => res.json())
      .then((data) => {
        setVenue(data.venue || null);
        setPartyPackages(data.partyPackages || []);
        setMembershipPlans(data.membershipPlans || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <VenueContext.Provider value={{ venue, partyPackages, membershipPlans, loading }}>
      {children}
    </VenueContext.Provider>
  );
}

export function useVenue() {
  return useContext(VenueContext);
}
