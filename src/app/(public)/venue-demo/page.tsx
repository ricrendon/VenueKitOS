"use client";

import Link from "next/link";
import { Button, Card, CardContent, Accordion } from "@/components/ui";
import {
  Shield, PartyPopper, FileCheck, Coffee,
  QrCode, Smartphone, Users, Star, ArrowRight,
  Check, Calendar, Heart,
} from "lucide-react";
import { useVenue } from "@/components/providers/venue-provider";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield, PartyPopper, FileCheck, Coffee, QrCode, Smartphone, Users, Star, Calendar, Heart, Check,
};

// ========================================
// HERO SECTION
// ========================================
function HeroSection() {
  const { venue } = useVenue();
  const wc = venue?.website_content as Record<string, unknown> | undefined;
  const hero = wc?.hero as { headline?: string; description?: string } | undefined;
  const trust = wc?.trustStats as { rating?: string; familiesServed?: string; reviews?: string } | undefined;

  const headline = hero?.headline || "Play beautifully.";
  const description = hero?.description || "Book open play, parties, memberships, and sign waivers in minutes. The best place for kids to play, celebrate, and explore.";
  const rating = trust?.rating || "4.9";
  const familiesServed = trust?.familiesServed || "2,400+";
  const reviews = trust?.reviews || "500+";

  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-30">
      <div className="container-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-terracotta/10 text-terracotta text-caption font-medium rounded-pill mb-4">
              Demo — Powered by VenueKit OS
            </div>
            <h1 className="font-display text-h1 md:text-display-l lg:text-display-xl text-ink text-balance">
              {headline}
            </h1>
            <p className="mt-4 text-body-l text-ink-secondary max-w-lg">
              {description}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/booking/open-play">
                <Button size="lg">
                  Book Open Play
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/booking/party">
                <Button variant="secondary" size="lg">Plan a Party</Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-4 text-body-s text-ink-secondary">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-mustard fill-mustard" />
                <span className="font-medium text-ink">{rating}</span>
                <span>from {reviews} families</span>
              </div>
              <span className="text-cream-300">|</span>
              <span>Safe, clean, and inspected daily</span>
            </div>
          </div>

          {/* Right */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-terracotta-light via-cream-200 to-sage-light flex items-center justify-center">
              <div className="text-center">
                <div className="h-20 w-20 mx-auto rounded-lg bg-cream-50/80 backdrop-blur flex items-center justify-center shadow-card">
                  <Heart className="h-10 w-10 text-terracotta" />
                </div>
                <p className="mt-4 text-body-s text-ink-secondary">Hero image / video</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-md bg-cream-50 p-4 shadow-card border border-cream-300">
              <p className="text-caption text-ink-secondary">Families served</p>
              <p className="font-display text-h3 text-ink">{familiesServed}</p>
            </div>
            <div className="absolute -top-4 -right-4 rounded-md bg-cream-50 p-4 shadow-card border border-cream-300">
              <p className="text-caption text-ink-secondary">5-star reviews</p>
              <p className="font-display text-h3 text-ink">{reviews}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const { venue } = useVenue();
  const wc = venue?.website_content as Record<string, unknown> | undefined;
  const trust = wc?.trustStats as { rating?: string; familiesServed?: string } | undefined;

  const items = [
    { icon: Star, label: `${trust?.rating || "4.9"} Rating` },
    { icon: Users, label: `${trust?.familiesServed || "2,400+"} Families` },
    { icon: Shield, label: "Safe Play Certified" },
    { icon: QrCode, label: "Easy Check-In" },
  ];

  return (
    <section className="border-y border-cream-300 bg-cream-50">
      <div className="container-content py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3 justify-center">
              <item.icon className="h-5 w-5 text-terracotta" />
              <span className="text-body-s font-medium text-ink">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValueCards() {
  const { venue } = useVenue();
  const wc = venue?.website_content as Record<string, unknown> | undefined;
  const vp = wc?.valueProps as { sectionTitle?: string; sectionSubtitle?: string; items?: { icon: string; title: string; description: string }[] } | undefined;

  const defaultValues = [
    { icon: "Shield", title: "Safe play spaces", description: "Clean, inspected daily, and designed for age-appropriate fun." },
    { icon: "PartyPopper", title: "Seamless parties", description: "Choose a package, pick a date, and we handle the rest." },
    { icon: "FileCheck", title: "Fast digital waivers", description: "Sign once, play all year. Complete in under 90 seconds." },
    { icon: "Coffee", title: "Parent-friendly spaces", description: "Comfortable seating, Wi-Fi, and a cozy cafe." },
  ];

  const sectionTitle = vp?.sectionTitle || "Why families choose us";
  const sectionSubtitle = vp?.sectionSubtitle || "Everything you need for a great visit.";
  const items = vp?.items?.length ? vp.items : defaultValues;

  return (
    <section className="section-padding-lg">
      <div className="container-content">
        <div className="text-center mb-12">
          <h2 className="font-display text-h2 md:text-h1 text-ink">{sectionTitle}</h2>
          <p className="mt-3 text-body-l text-ink-secondary max-w-2xl mx-auto">{sectionSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((v) => {
            const IconComp = ICON_MAP[v.icon] || Shield;
            return (
              <Card key={v.title} className="text-center hover:shadow-card-hover transition-shadow">
                <CardContent className="pt-2">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-md bg-terracotta-light flex items-center justify-center">
                    <IconComp className="h-6 w-6 text-terracotta" />
                  </div>
                  <h3 className="font-display text-h4 text-ink">{v.title}</h3>
                  <p className="mt-2 text-body-s text-ink-secondary">{v.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PartyPackages() {
  const { partyPackages } = useVenue();

  const defaultPackages = [
    { name: "Classic", price: 299, features: ["Up to 10 kids", "90 min play + 30 min room", "Paper goods", "Dedicated host"], best_for: "Simple celebrations" },
    { name: "Premium", price: 449, features: ["Up to 15 kids", "2hrs play + 45 min room", "Pizza + drinks", "Decor package", "Dedicated host"], best_for: "Most popular" },
    { name: "Ultimate", price: 599, features: ["Up to 20 kids", "Full venue 2.5hrs", "Catered food + cake", "Premium decor", "2 hosts"], best_for: "Go all out" },
  ];

  const pkgs = partyPackages.length ? partyPackages : defaultPackages;

  return (
    <section className="section-padding-lg bg-cream-50">
      <div className="container-content">
        <div className="text-center mb-12">
          <h2 className="font-display text-h2 md:text-h1 text-ink">Unforgettable birthday parties</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pkgs.map((pkg) => {
            const isPopular = pkg.best_for === "Most popular";
            const featureList: string[] = Array.isArray(pkg.features) ? pkg.features : [];
            return (
              <Card key={pkg.name} className={`relative ${isPopular ? "border-terracotta ring-2 ring-terracotta/20" : ""}`}>
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-terracotta text-white text-caption font-medium px-3 py-1 rounded-pill">
                    Most popular
                  </span>
                )}
                <CardContent className="pt-2">
                  <h3 className="font-display text-h3 text-ink">{pkg.name}</h3>
                  <p className="mt-1 font-display text-h1 text-terracotta">${pkg.price}</p>
                  <ul className="mt-5 space-y-3">
                    {featureList.map((f: string) => (
                      <li key={f} className="flex items-start gap-2 text-body-s text-ink-secondary">
                        <Check className="h-5 w-5 text-success shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/booking/party" className="block mt-6">
                    <Button variant={isPopular ? "primary" : "secondary"} className="w-full">Book this package</Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MembershipBlock() {
  const { membershipPlans } = useVenue();

  // Use the middle plan (Family) or fallback
  const featured = membershipPlans.length >= 2
    ? membershipPlans[1]
    : membershipPlans[0] || null;
  const price = featured?.monthly_price || 49;
  const featureList: string[] = Array.isArray(featured?.features) ? featured.features : [
    "Unlimited open play sessions", "10% off all party packages", "2 free guest passes per month", "Priority booking", "Skip the waiver line",
  ];

  return (
    <section className="section-padding-lg bg-ink text-cream-50">
      <div className="container-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-h2 md:text-h1 text-cream-50">Play more, save more</h2>
            <p className="mt-4 text-body-l text-cream-300">Membership gives your family unlimited visits, party discounts, and priority booking.</p>
            <ul className="mt-6 space-y-3">
              {featureList.map((item: string) => (
                <li key={item} className="flex items-center gap-3 text-body-m text-cream-200">
                  <Check className="h-5 w-5 text-sage shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/memberships">
                <Button size="lg">Join for ${price}/mo <ArrowRight className="h-5 w-5" /></Button>
              </Link>
            </div>
          </div>
          <div className="aspect-square rounded-xl bg-gradient-to-br from-terracotta/20 to-sage/20 flex items-center justify-center">
            <div className="text-center">
              <p className="font-display text-display-xl text-cream-50">${price}</p>
              <p className="text-body-l text-cream-300">per month</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DigitalConvenience() {
  const features = [
    { icon: QrCode, title: "QR check-in", description: "Scan at the door and skip the line." },
    { icon: FileCheck, title: "Digital waivers", description: "Sign once on any device." },
    { icon: Smartphone, title: "Parent portal", description: "Manage bookings, kids, and memberships." },
    { icon: Calendar, title: "Instant booking", description: "Real-time availability. Book in 2 minutes." },
  ];

  return (
    <section className="section-padding-lg">
      <div className="container-content">
        <div className="text-center mb-12">
          <h2 className="font-display text-h2 md:text-h1 text-ink">Everything digital, nothing complicated</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="text-center p-6">
              <div className="mx-auto mb-4 h-14 w-14 rounded-lg bg-dusty-blue-light flex items-center justify-center">
                <f.icon className="h-7 w-7 text-dusty-blue" />
              </div>
              <h3 className="font-display text-h4 text-ink">{f.title}</h3>
              <p className="mt-2 text-body-s text-ink-secondary">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQPreview() {
  const { venue } = useVenue();
  const wc = venue?.website_content as Record<string, unknown> | undefined;
  const faqData = wc?.faq as { categories?: { items: { id: string; question: string; answer: string }[] }[] } | undefined;

  const defaultFaqs = [
    { id: "1", question: "What ages is the playground designed for?", answer: "Our play spaces are designed for children ages 0–12, with a dedicated toddler zone (0–3) and larger structures for kids 3–12." },
    { id: "2", question: "Do I need to sign a waiver before visiting?", answer: "Yes, all children need a signed waiver on file. You can complete it online before your visit, or sign on our kiosk when you arrive." },
    { id: "3", question: "Can I modify or cancel a booking?", answer: "You can modify or cancel up to 24 hours before your session through your parent portal." },
    { id: "4", question: "What's included in a birthday party package?", answer: "Every package includes dedicated play time, a private party room, a party host, paper goods, and setup/cleanup." },
  ];

  // Grab the first 4 FAQs from all categories
  const allFaqs = faqData?.categories?.flatMap((c) => c.items) || [];
  const faqs = allFaqs.length ? allFaqs.slice(0, 4) : defaultFaqs;

  return (
    <section className="section-padding-lg bg-cream-50">
      <div className="container-content max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-h2 md:text-h1 text-ink">Common questions</h2>
        </div>
        <Accordion items={faqs} />
        <div className="text-center mt-8">
          <Link href="/faq"><Button variant="tertiary">View all FAQs <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="section-padding-lg">
      <div className="container-content">
        <div className="rounded-xl bg-gradient-to-r from-terracotta to-coral p-12 md:p-16 text-center text-white">
          <h2 className="font-display text-h2 md:text-h1 text-white">Ready to play?</h2>
          <p className="mt-3 text-body-l text-white/90 max-w-lg mx-auto">Book your first session and see why thousands of families love visiting us.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/booking/open-play">
              <Button size="lg" className="bg-white text-terracotta hover:bg-cream-50">Book open play</Button>
            </Link>
            <Link href="/booking/party">
              <Button size="lg" variant="secondary" className="border-white/30 text-white hover:bg-white/10">Plan a party</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function VenueDemoPage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <ValueCards />
      <PartyPackages />
      <MembershipBlock />
      <DigitalConvenience />
      <FAQPreview />
      <FinalCTA />
    </>
  );
}
