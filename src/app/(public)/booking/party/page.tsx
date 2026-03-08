"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, Input, Stepper, Accordion } from "@/components/ui";
import { Check, ArrowRight, ArrowLeft, PartyPopper, Gift, CreditCard } from "lucide-react";
import { useVenue } from "@/components/providers/venue-provider";

const steps = ["Package", "Date & Time", "Party Info", "Add-Ons", "Your Info", "Review", "Confirmed"];

const defaultPackages = [
  {
    id: "classic",
    name: "Classic",
    price: 299,
    included_children: 10,
    duration_minutes: 120,
    room_type: "Standard Party Room",
    host_included: true,
    food_included: false,
    decor_included: false,
    best_for: "Simple celebrations",
    features: ["Dedicated host", "Paper goods", "Setup & cleanup", "Invitations template"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 449,
    included_children: 15,
    duration_minutes: 165,
    room_type: "Premium Suite",
    host_included: true,
    food_included: true,
    decor_included: true,
    best_for: "Most popular",
    features: ["Dedicated host", "Pizza & drinks", "Decor package", "Paper goods", "Setup & cleanup", "Invitations template"],
  },
  {
    id: "ultimate",
    name: "Ultimate",
    price: 599,
    included_children: 20,
    duration_minutes: 150,
    room_type: "Grand Suite",
    host_included: true,
    food_included: true,
    decor_included: true,
    best_for: "Go all out",
    features: ["2 dedicated hosts", "Catered food + cake", "Premium decor", "Photo station", "Goodie bags", "Full setup & cleanup"],
  },
];

const defaultAddOns = [
  { id: "1", name: "Extra children (each)", price: 25, category: "Guests" },
  { id: "2", name: "Pizza package (10 kids)", price: 65, category: "Food" },
  { id: "3", name: "Cupcake tower", price: 45, category: "Food" },
  { id: "4", name: "Premium decor upgrade", price: 75, category: "Decor" },
  { id: "5", name: "Themed tableware", price: 35, category: "Decor" },
  { id: "6", name: "Extra 30 minutes", price: 50, category: "Time" },
];

const faqs = [
  { id: "1", question: "How far in advance should I book?", answer: "We recommend booking at least 3–4 weeks in advance, especially for weekend parties. Popular dates fill quickly." },
  { id: "2", question: "Can I bring my own cake?", answer: "Absolutely! Outside cakes and cupcakes are welcome for all packages. We provide plates and utensils." },
  { id: "3", question: "What happens if guests don't show up?", answer: "The package price is based on the guaranteed guest count. No refunds for no-shows, but you're welcome to have fewer guests." },
  { id: "4", question: "Is a deposit required?", answer: "Yes, a 50% deposit is required to secure your reservation. The remaining balance is due 3 days before the party." },
];

export default function PartyBookingPage() {
  const { partyPackages: dbPackages } = useVenue();

  // Map DB packages to the shape this page expects, or fall back to defaults
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const packages: any[] = dbPackages.length
    ? dbPackages.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        included_children: p.included_children,
        duration_minutes: p.duration_minutes,
        room_type: p.room_type,
        host_included: p.host_included,
        food_included: p.food_included,
        decor_included: p.decor_included,
        best_for: p.best_for,
        features: Array.isArray(p.features) ? p.features : [],
      }))
    : defaultPackages;

  // TODO: fetch add-ons from API when party_add_ons endpoint is ready
  const addOns = defaultAddOns;

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);

  return (
    <div className="pt-24 pb-16">
      <div className="container-content">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-h1 md:text-display-l text-ink">Plan an unforgettable birthday</h1>
          <p className="mt-3 text-body-l text-ink-secondary">
            Choose a package, pick a date, and let us handle the rest.
          </p>
        </div>

        {/* Stepper */}
        <div className="max-w-3xl mx-auto mb-10">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Step 0: Package selection */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Choose your party package</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map((pkg: any) => {
                  const isPopular = pkg.best_for === "Most popular";
                  const featureList: string[] = Array.isArray(pkg.features) ? pkg.features : [];
                  const durationLabel = pkg.duration_minutes ? `${pkg.duration_minutes} min` : "";
                  return (
                    <Card
                      key={pkg.id}
                      className={`cursor-pointer relative transition-all ${
                        selectedPkg === pkg.id
                          ? "border-terracotta ring-2 ring-terracotta/20"
                          : "hover:shadow-card-hover"
                      }`}
                      onClick={() => setSelectedPkg(pkg.id)}
                    >
                      {isPopular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-terracotta text-white text-caption font-medium px-3 py-1 rounded-pill">
                          Most popular
                        </span>
                      )}
                      <CardContent className="pt-2">
                        <h3 className="font-display text-h3 text-ink">{pkg.name}</h3>
                        <p className="font-display text-h2 text-terracotta mt-1">${pkg.price}</p>
                        <p className="text-caption text-ink-secondary">{pkg.best_for}</p>

                        <div className="mt-4 space-y-2 text-body-s text-ink-secondary">
                          <p>Up to {pkg.included_children} kids</p>
                          {durationLabel && <p>{durationLabel}</p>}
                          {pkg.room_type && <p>{pkg.room_type}</p>}
                        </div>

                        <ul className="mt-4 space-y-2">
                          {featureList.map((f: string) => (
                            <li key={f} className="flex items-start gap-2 text-body-s text-ink-secondary">
                              <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <Button size="lg" className="w-full" disabled={!selectedPkg} onClick={() => setCurrentStep(1)}>
                Continue with {selectedPkg ? packages.find((p) => p.id === selectedPkg)?.name : "..."}{" "}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Step 1: Date & Time */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Choose your party date</h2>
              <div className="rounded-md border border-cream-300 bg-cream-50 p-6 text-center">
                <PartyPopper className="h-12 w-12 text-terracotta mx-auto mb-4" />
                <p className="text-body-m text-ink">Calendar widget integration goes here</p>
                <p className="text-body-s text-ink-secondary mt-2">Real-time room availability by date/time</p>
              </div>
              <Input label="Preferred time" type="time" defaultValue="14:00" />
              <Input label="Alternative date (optional)" type="date" />
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setCurrentStep(0)}>
                  <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <Button size="lg" className="flex-1" onClick={() => setCurrentStep(2)}>
                  Continue <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Party Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Tell us about the birthday child</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Child's first name" placeholder="Emma" />
                <Input label="Child's last name" placeholder="Smith" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Birthday date" type="date" />
                <Input label="Turning age" type="number" placeholder="7" />
              </div>
              <Input label="Estimated number of guests" type="number" placeholder="12" />
              <Input label="Special requests or notes" placeholder="Unicorn theme, one child has a nut allergy..." />
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <Button size="lg" className="flex-1" onClick={() => setCurrentStep(3)}>
                  Continue <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Add-ons */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Make it extra special</h2>
              <p className="text-body-m text-ink-secondary">Add-ons are optional. You can always add them later.</p>
              <div className="space-y-3">
                {addOns.map((ao) => (
                  <label
                    key={ao.id}
                    className="flex items-center justify-between rounded-sm border border-cream-300 bg-cream-50 p-4 cursor-pointer hover:border-terracotta/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="h-5 w-5 rounded accent-terracotta" />
                      <div>
                        <p className="text-body-m text-ink font-medium">{ao.name}</p>
                        <p className="text-caption text-ink-secondary">{ao.category}</p>
                      </div>
                    </div>
                    <span className="text-body-m font-medium text-terracotta">+${ao.price}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <Button size="lg" className="flex-1" onClick={() => setCurrentStep(4)}>
                  Continue <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Contact Info */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Your contact information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Your first name" placeholder="Jane" />
                <Input label="Your last name" placeholder="Smith" />
              </div>
              <Input label="Email" type="email" placeholder="jane@example.com" />
              <Input label="Phone" type="tel" placeholder="(555) 123-4567" />
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <Button size="lg" className="flex-1" onClick={() => setCurrentStep(5)}>
                  Review booking <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Review your party reservation</h2>
              <Card>
                <CardContent className="space-y-3">
                  <div className="flex justify-between"><span className="text-ink-secondary">Package</span><span className="font-medium">Premium</span></div>
                  <div className="flex justify-between"><span className="text-ink-secondary">Date</span><span className="font-medium">Sat, April 5, 2026</span></div>
                  <div className="flex justify-between"><span className="text-ink-secondary">Time</span><span className="font-medium">2:00 PM</span></div>
                  <div className="flex justify-between"><span className="text-ink-secondary">Birthday child</span><span className="font-medium">Emma, turning 7</span></div>
                  <div className="flex justify-between"><span className="text-ink-secondary">Estimated guests</span><span className="font-medium">12</span></div>
                  <hr className="border-cream-300" />
                  <div className="flex justify-between"><span className="text-ink-secondary">Package</span><span className="font-medium">$449.00</span></div>
                  <div className="flex justify-between"><span className="text-ink-secondary">Tax</span><span className="font-medium">$35.92</span></div>
                  <div className="flex justify-between text-body-l font-medium"><span>Total</span><span className="text-terracotta">$484.92</span></div>
                  <hr className="border-cream-300" />
                  <div className="flex justify-between"><span className="text-ink-secondary">Deposit due today (50%)</span><span className="font-medium text-terracotta">$242.46</span></div>
                </CardContent>
              </Card>
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setCurrentStep(4)}>
                  <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <Button size="lg" className="flex-1" onClick={() => setCurrentStep(6)}>
                  <CreditCard className="h-5 w-5" /> Pay deposit & reserve
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Confirmation */}
          {currentStep === 6 && (
            <div className="text-center py-8 space-y-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-success-light flex items-center justify-center">
                <Gift className="h-8 w-8 text-success" />
              </div>
              <h2 className="font-display text-h2 text-ink">Party reserved for April 5 at 2:00 PM!</h2>
              <p className="text-body-l text-ink-secondary max-w-md mx-auto">
                Confirmation details sent to your email. Here&apos;s what happens next.
              </p>
              <Card className="max-w-md mx-auto text-left">
                <CardContent className="space-y-3">
                  <h3 className="font-display text-h4 text-ink">What to expect</h3>
                  <ul className="space-y-2 text-body-s text-ink-secondary">
                    <li className="flex gap-2"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> Confirmation email with all details</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> Reminder 1 week before the party</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> Arrive 15 minutes early for setup</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> Balance due 3 days before event</li>
                  </ul>
                </CardContent>
              </Card>
              <p className="text-body-s text-ink-secondary">
                Your booking confirmation and ticket will be available after your reservation is confirmed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="secondary">Share waiver link with guests</Button>
                <Link href="/"><Button>Back to home</Button></Link>
              </div>
            </div>
          )}

          {/* FAQ */}
          {currentStep === 0 && (
            <div className="mt-16">
              <h3 className="font-display text-h3 text-ink mb-6">Party FAQs</h3>
              <Accordion items={faqs} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
