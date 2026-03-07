import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { TrustBar } from "@/components/marketing/trust-bar";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { PlatformPreview } from "@/components/marketing/platform-preview";
import { HardwareTeaser } from "@/components/marketing/hardware-teaser";
import { PlugAndPlay } from "@/components/marketing/plug-and-play";
import { FeatureAccordion } from "@/components/marketing/feature-accordion";
import { PricingSection } from "@/components/marketing/pricing-section";
import { Testimonials } from "@/components/marketing/testimonials";
import { FinalCta } from "@/components/marketing/final-cta";

export const metadata: Metadata = {
  title: "VenueKit OS — The Operating System for Modern Venues",
  description:
    "VenueKit OS gives playground and entertainment venue operators a complete, cloud-based management platform — bookings, check-in, POS, memberships, parties, and real-time reporting.",
};

export default function MarketingHomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <FeaturesGrid />
      <PlatformPreview />
      <HardwareTeaser />
      <PlugAndPlay />
      <FeatureAccordion />
      <PricingSection />
      <Testimonials />
      <FinalCta />
    </>
  );
}
