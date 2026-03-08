"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { VenueProvider } from "@/components/providers/venue-provider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <VenueProvider>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </VenueProvider>
  );
}
