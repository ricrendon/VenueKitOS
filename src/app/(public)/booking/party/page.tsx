"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, Input, Stepper, Accordion } from "@/components/ui";
import {
  Check, ArrowRight, ArrowLeft, Calendar, Clock,
  Gift, Loader2, PartyPopper,
} from "lucide-react";
import { format, addDays, startOfToday } from "date-fns";
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

const partyTimeSlots = [
  { time: "10:00", label: "10:00 AM" },
  { time: "12:00", label: "12:00 PM" },
  { time: "14:00", label: "2:00 PM" },
  { time: "16:00", label: "4:00 PM" },
];

const faqs = [
  { id: "1", question: "How far in advance should I book?", answer: "We recommend booking at least 3–4 weeks in advance, especially for weekend parties. Popular dates fill quickly." },
  { id: "2", question: "Can I bring my own cake?", answer: "Absolutely! Outside cakes and cupcakes are welcome for all packages. We provide plates and utensils." },
  { id: "3", question: "What happens if guests don't show up?", answer: "The package price is based on the guaranteed guest count. No refunds for no-shows, but you're welcome to have fewer guests." },
  { id: "4", question: "Is a deposit required?", answer: "Yes, a 50% deposit is required to secure your reservation. The remaining balance is due 3 days before the party." },
];

function generateCalendarDays() {
  const today = startOfToday();
  return Array.from({ length: 35 }, (_, i) => addDays(today, i + 1));
}

interface ConfirmationResult {
  confirmationCode: string;
  packageName: string;
  date: string;
  startTime: string;
  childName: string;
  estimatedGuestCount: number;
  deposit: number;
  totalDue: number;
  balanceRemaining: number;
}

export default function PartyBookingPage() {
  const { partyPackages: dbPackages } = useVenue();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const packages: any[] = dbPackages.length
    ? dbPackages.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        included_children: p.included_children,
        duration_minutes: p.duration_minutes,
        room_type: p.room_type,
        best_for: p.best_for,
        features: Array.isArray(p.features) ? p.features : [],
      }))
    : defaultPackages;

  const addOns = defaultAddOns;
  const calendarDays = generateCalendarDays();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  // Step 0 — Package
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);

  // Step 1 — Date & Time
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Step 2 — Party Info
  const [partyInfo, setPartyInfo] = useState({
    childFirstName: "",
    childLastName: "",
    birthday: "",
    age: "",
    guestCount: "",
    notes: "",
  });

  // Step 3 — Add-ons
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, boolean>>({});

  // Step 4 — Contact
  const [contact, setContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const selectedPkg = packages.find((p) => p.id === selectedPkgId);
  const activeAddOns = addOns.filter((ao) => selectedAddOns[ao.id]);
  const addOnsTotal = activeAddOns.reduce((s, ao) => s + ao.price, 0);
  const pkgPrice = selectedPkg?.price ?? 0;
  const subtotal = pkgPrice + addOnsTotal;
  const tax = Number((subtotal * 0.08).toFixed(2));
  const totalDue = Number((subtotal + tax).toFixed(2));
  const deposit = Number((totalDue * 0.5).toFixed(2));

  const canContinueStep1 = selectedDate !== null && selectedTime !== null;
  const canContinueStep2 = partyInfo.childFirstName.trim().length > 0;
  const canContinueStep4 = contact.firstName.trim() && contact.email.trim();

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/party-reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedPkg?.id ?? null,
          packageName: selectedPkg?.name ?? "Package",
          packagePrice: pkgPrice,
          durationMinutes: selectedPkg?.duration_minutes ?? 120,
          date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
          startTime: selectedTime,
          childFirstName: partyInfo.childFirstName,
          childLastName: partyInfo.childLastName,
          childBirthday: partyInfo.birthday || null,
          childAge: partyInfo.age ? Number(partyInfo.age) : null,
          estimatedGuestCount: partyInfo.guestCount ? Number(partyInfo.guestCount) : 10,
          specialNotes: partyInfo.notes || null,
          addOns: activeAddOns.map((ao) => ({ id: ao.id, name: ao.name, price: ao.price, quantity: 1 })),
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit reservation.");
        return;
      }

      setConfirmation(data.reservation);
      setStep(6);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const timeLabel = partyTimeSlots.find((t) => t.time === selectedTime)?.label ?? selectedTime ?? "";

  return (
    <div className="pt-24 pb-16">
      <div className="container-content">
        <div className="text-center mb-10">
          <h1 className="font-display text-h1 md:text-display-l text-ink">Plan an unforgettable birthday</h1>
          <p className="mt-3 text-body-l text-ink-secondary">
            Choose a package, pick a date, and let us handle the rest.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-10">
          <Stepper steps={steps} currentStep={step} />
        </div>

        <div className="max-w-3xl mx-auto">

          {/* Step 0 — Package */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Choose your party package</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map((pkg: any) => {
                  const isPopular = pkg.best_for === "Most popular";
                  const featureList: string[] = Array.isArray(pkg.features) ? pkg.features : [];
                  return (
                    <Card
                      key={pkg.id}
                      className={`cursor-pointer relative transition-all ${
                        selectedPkgId === pkg.id
                          ? "border-terracotta ring-2 ring-terracotta/20"
                          : "hover:shadow-card-hover"
                      }`}
                      onClick={() => setSelectedPkgId(pkg.id)}
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
                        <div className="mt-4 space-y-1 text-body-s text-ink-secondary">
                          <p>Up to {pkg.included_children} kids</p>
                          {pkg.duration_minutes && <p>{pkg.duration_minutes} min</p>}
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
              <Button size="lg" className="w-full" disabled={!selectedPkgId} onClick={() => setStep(1)}>
                Continue with {selectedPkg?.name ?? "..."} <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Step 1 — Date & Time */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Choose your party date</h2>

              {/* Calendar */}
              <div className="rounded-md border border-cream-300 bg-cream-50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-terracotta" />
                  <span className="font-medium text-ink">Select a date</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-body-s">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={`${d}-${i}`} className="py-2 text-ink-secondary font-medium">{d}</div>
                  ))}
                  {/* Offset for first day of week */}
                  {Array.from({ length: calendarDays[0].getDay() }).map((_, i) => (
                    <div key={`off-${i}`} />
                  ))}
                  {calendarDays.map((day) => {
                    const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
                    return (
                      <button
                        key={format(day, "yyyy-MM-dd")}
                        onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                        className={`py-2 rounded-sm transition-colors ${
                          isSelected ? "bg-terracotta text-white" : "hover:bg-cream-200 text-ink"
                        }`}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
                {selectedDate && (
                  <p className="mt-3 text-body-s text-terracotta font-medium">
                    Selected: {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </p>
                )}
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-terracotta" />
                    <span className="text-label text-ink font-medium">Available start times</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {partyTimeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`rounded-sm border p-3 text-center transition-all ${
                          selectedTime === slot.time
                            ? "border-terracotta bg-terracotta-light ring-2 ring-terracotta/20"
                            : "border-cream-300 bg-cream-50 hover:border-terracotta/50"
                        }`}
                      >
                        <p className="font-medium text-body-m">{slot.label}</p>
                        <p className="text-caption text-ink-secondary mt-1">{selectedPkg?.duration_minutes ?? 120} min</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setStep(0)}>
                  <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <Button size="lg" className="flex-1" onClick={() => setStep(2)} disabled={!canContinueStep1}>
                  Continue <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 — Party Info */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Tell us about the birthday child</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Child's first name *"
                  placeholder="Emma"
                  value={partyInfo.childFirstName}
                  onChange={(e) => setPartyInfo((p) => ({ ...p, childFirstName: e.target.value }))}
                />
                <Input
                  label="Child's last name"
                  placeholder="Smith"
                  value={partyInfo.childLastName}
                  onChange={(e) => setPartyInfo((p) => ({ ...p, childLastName: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Birthday date"
                  type="date"
                  value={partyInfo.birthday}
                  onChange={(e) => setPartyInfo((p) => ({ ...p, birthday: e.target.value }))}
                />
                <Input
                  label="Turning age"
                  type="number"
                  placeholder="7"
                  value={partyInfo.age}
                  onChange={(e) => setPartyInfo((p) => ({ ...p, age: e.target.value }))}
                />
              </div>
              <Input
                label="Estimated number of guests"
                type="number"
                placeholder="12"
                value={partyInfo.guestCount}
                onChange={(e) => setPartyInfo((p) => ({ ...p, guestCount: e.target.value }))}
              />
              <Input
                label="Special requests or notes"
                placeholder="Unicorn theme, one child has a nut allergy..."
                value={partyInfo.notes}
                onChange={(e) => setPartyInfo((p) => ({ ...p, notes: e.target.value }))}
              />
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <Button size="lg" className="flex-1" onClick={() => setStep(3)} disabled={!canContinueStep2}>
                  Continue <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 — Add-Ons */}
          {step === 3 && (
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
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded accent-terracotta"
                        checked={!!selectedAddOns[ao.id]}
                        onChange={(e) =>
                          setSelectedAddOns((prev) => ({ ...prev, [ao.id]: e.target.checked }))
                        }
                      />
                      <div>
                        <p className="text-body-m text-ink font-medium">{ao.name}</p>
                        <p className="text-caption text-ink-secondary">{ao.category}</p>
                      </div>
                    </div>
                    <span className="text-body-m font-medium text-terracotta">+${ao.price}</span>
                  </label>
                ))}
              </div>
              {addOnsTotal > 0 && (
                <p className="text-body-s text-ink-secondary text-right">
                  Add-ons total: <span className="font-medium text-ink">${addOnsTotal.toFixed(2)}</span>
                </p>
              )}
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <Button size="lg" className="flex-1" onClick={() => setStep(4)}>
                  Continue <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4 — Contact Info */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Your contact information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your first name *"
                  placeholder="Jane"
                  value={contact.firstName}
                  onChange={(e) => setContact((c) => ({ ...c, firstName: e.target.value }))}
                />
                <Input
                  label="Your last name"
                  placeholder="Smith"
                  value={contact.lastName}
                  onChange={(e) => setContact((c) => ({ ...c, lastName: e.target.value }))}
                />
              </div>
              <Input
                label="Email *"
                type="email"
                placeholder="jane@example.com"
                value={contact.email}
                onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={contact.phone}
                onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
              />
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setStep(3)}>
                  <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <Button size="lg" className="flex-1" onClick={() => setStep(5)} disabled={!canContinueStep4}>
                  Review booking <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 5 — Review */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Review your party reservation</h2>

              {error && (
                <div className="px-4 py-3 rounded-md bg-error-light border border-error/30 text-body-s text-error">
                  {error}
                </div>
              )}

              <Card>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Package</span>
                    <span className="font-medium">{selectedPkg?.name}</span>
                  </div>
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Date</span>
                    <span className="font-medium">
                      {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Time</span>
                    <span className="font-medium">{timeLabel}</span>
                  </div>
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Birthday child</span>
                    <span className="font-medium">
                      {partyInfo.childFirstName}{partyInfo.childLastName ? ` ${partyInfo.childLastName}` : ""}
                      {partyInfo.age ? `, turning ${partyInfo.age}` : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Estimated guests</span>
                    <span className="font-medium">{partyInfo.guestCount || "10"}</span>
                  </div>
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Contact</span>
                    <span className="font-medium">{contact.firstName} {contact.lastName}</span>
                  </div>

                  {activeAddOns.length > 0 && (
                    <>
                      <hr className="border-cream-300" />
                      {activeAddOns.map((ao) => (
                        <div key={ao.id} className="flex justify-between text-body-s">
                          <span className="text-ink-secondary">{ao.name}</span>
                          <span className="font-medium">${ao.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </>
                  )}

                  <hr className="border-cream-300" />
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Package</span>
                    <span className="font-medium">${pkgPrice.toFixed(2)}</span>
                  </div>
                  {addOnsTotal > 0 && (
                    <div className="flex justify-between text-body-m">
                      <span className="text-ink-secondary">Add-ons</span>
                      <span className="font-medium">${addOnsTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Tax (8%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-body-l font-medium">
                    <span>Total</span>
                    <span className="text-terracotta">${totalDue.toFixed(2)}</span>
                  </div>
                  <hr className="border-cream-300" />
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Deposit due today (50%)</span>
                    <span className="font-medium text-terracotta">${deposit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-body-s">
                    <span className="text-ink-secondary">Balance due 3 days before</span>
                    <span className="font-medium">${(totalDue - deposit).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setStep(4)}>
                  <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <Button size="lg" className="flex-1" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Submitting…</>
                  ) : (
                    <><Check className="h-5 w-5" /> Confirm & Pay Deposit</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 6 — Confirmation */}
          {step === 6 && confirmation && (
            <div className="text-center py-8 space-y-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-success-light flex items-center justify-center">
                <Gift className="h-8 w-8 text-success" />
              </div>
              <h2 className="font-display text-h2 text-ink">
                Party reserved for {selectedDate ? format(selectedDate, "MMMM d") : ""} at {timeLabel}!
              </h2>
              <p className="text-body-l text-ink-secondary max-w-md mx-auto">
                We&apos;ll follow up with full details. Here&apos;s your confirmation.
              </p>

              <Card className="max-w-md mx-auto text-left">
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-body-s">
                    <span className="text-ink-secondary">Confirmation code</span>
                    <span className="font-display text-body-m font-bold text-terracotta tracking-wide">
                      {confirmation.confirmationCode}
                    </span>
                  </div>
                  <div className="flex justify-between text-body-s">
                    <span className="text-ink-secondary">Package</span>
                    <span className="font-medium">{confirmation.packageName}</span>
                  </div>
                  <div className="flex justify-between text-body-s">
                    <span className="text-ink-secondary">Birthday child</span>
                    <span className="font-medium">{confirmation.childName}</span>
                  </div>
                  <div className="flex justify-between text-body-s">
                    <span className="text-ink-secondary">Estimated guests</span>
                    <span className="font-medium">{confirmation.estimatedGuestCount}</span>
                  </div>
                  <hr className="border-cream-300" />
                  <div className="flex justify-between text-body-s">
                    <span className="text-ink-secondary">Deposit paid</span>
                    <span className="font-medium">${confirmation.deposit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-body-s">
                    <span className="text-ink-secondary">Balance remaining</span>
                    <span className="font-medium">${confirmation.balanceRemaining.toFixed(2)}</span>
                  </div>
                  <hr className="border-cream-300" />
                  <h3 className="font-display text-body-m text-ink font-medium">What to expect</h3>
                  <ul className="space-y-2 text-body-s text-ink-secondary">
                    <li className="flex gap-2"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> Confirmation email with all details</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> Reminder 1 week before the party</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> Arrive 15 minutes early for setup</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> Balance due 3 days before event</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/waivers/sign">
                  <Button variant="secondary">
                    <PartyPopper className="h-4 w-4" /> Sign waivers for guests
                  </Button>
                </Link>
                <Link href="/">
                  <Button>Back to home</Button>
                </Link>
              </div>
            </div>
          )}

          {/* FAQ */}
          {step === 0 && (
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
