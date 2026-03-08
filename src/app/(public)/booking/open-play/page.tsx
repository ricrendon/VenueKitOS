"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, Input, Stepper, Accordion } from "@/components/ui";
import {
  Calendar, Clock, Users, ArrowRight, ArrowLeft, Check,
  Loader2, QrCode, MapPin, Wallet,
} from "lucide-react";
import { format, addDays, startOfToday } from "date-fns";
import { useVenue } from "@/components/providers/venue-provider";

const steps = ["Session", "Date & Time", "Guests", "Your Info", "Review", "Confirmed"];

const defaultSessions = [
  {
    id: "open_play",
    name: "Open Play",
    description: "90 minutes of free play for all ages",
    priceRange: "$18–$22",
    perLabel: "per child",
  },
  {
    id: "toddler_time",
    name: "Toddler Time",
    description: "Ages 0–3 only, calmer environment",
    priceRange: "$15",
    perLabel: "per child · weekday mornings",
    disabled: true,
  },
];

const defaultTimeSlotDefs = [
  { time: "09:00", label: "9:00 AM", endTime: "10:30", price: 18 },
  { time: "10:30", label: "10:30 AM", endTime: "12:00", price: 18 },
  { time: "12:00", label: "12:00 PM", endTime: "13:30", price: 22 },
  { time: "13:30", label: "1:30 PM", endTime: "15:00", price: 22 },
  { time: "15:00", label: "3:00 PM", endTime: "16:30", price: 22 },
  { time: "16:30", label: "4:30 PM", endTime: "18:00", price: 18 },
];

function generateTimeSlots(slotDefs?: { time: string; label: string; endTime: string; price: number }[]) {
  const slots = slotDefs?.length ? slotDefs : defaultTimeSlotDefs;
  return slots.map((s) => ({
    time: s.time,
    label: s.label,
    end: s.endTime,
    price: s.price,
    spots: Math.floor(Math.random() * 15) + 1,
  }));
}

function generateCalendarDays() {
  const today = startOfToday();
  const days: { date: Date; available: boolean }[] = [];
  for (let i = 0; i < 28; i++) {
    const d = addDays(today, i);
    days.push({ date: d, available: true });
  }
  return days;
}

const faqs = [
  { id: "1", question: "How long is an open play session?", answer: "Each session is 90 minutes of play time. Please arrive 10 minutes early to check in and get wristbands." },
  { id: "2", question: "Do adults play for free?", answer: "Adults are free! Each child ticket includes admission for up to 2 accompanying adults." },
  { id: "3", question: "What should we bring?", answer: "Just socks for everyone (grip socks available for purchase). We provide everything else." },
  { id: "4", question: "Can I book same-day?", answer: "Yes! As long as spots are available, you can book up to 30 minutes before a session starts." },
];

export default function OpenPlayBookingPage() {
  const { venue } = useVenue();
  const wc = venue?.website_content as Record<string, unknown> | undefined;
  const venueSettings = venue?.settings as Record<string, unknown> | undefined;
  const taxRate = typeof venueSettings?.taxRate === "number" ? venueSettings.taxRate : 0.08;
  const venueName = venue?.name || "WonderPlay";
  const venueAddress = venue ? `${venue.address || "4521 Fun Avenue"}, ${venue.city || "Austin"}, ${venue.state || "TX"} ${venue.zip || "78701"}` : "4521 Fun Avenue, Austin, TX 78701";

  // Dynamic sessions from website_content
  const dbSessions = wc?.openPlaySessions as typeof defaultSessions | undefined;
  const sessions = dbSessions?.length ? dbSessions : defaultSessions;

  // Dynamic time slots from website_content
  const dbTimeSlots = wc?.openPlayTimeSlots as typeof defaultTimeSlotDefs | undefined;

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSession, setSelectedSession] = useState("open_play");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    time: string;
    label: string;
    end: string;
    price: number;
    spots: number;
  } | null>(null);
  const [childCount, setChildCount] = useState(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    confirmationCode: string;
    date: string;
    startTime: string;
    endTime: string;
    total: number;
    childCount: number;
  } | null>(null);
  const [error, setError] = useState("");

  const [timeSlots] = useState(() => generateTimeSlots(dbTimeSlots));
  const [calendarDays] = useState(generateCalendarDays);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
          startTime: selectedSlot?.time || "",
          endTime: selectedSlot?.end || "",
          childCount,
          adultCount: 0,
          sessionType: selectedSession,
          pricePerChild: selectedSlot?.price || 22,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create booking.");
        setSubmitting(false);
        return;
      }

      setBookingResult({
        confirmationCode: data.booking.confirmationCode,
        date: data.booking.date,
        startTime: data.booking.startTime,
        endTime: data.booking.endTime,
        total: data.booking.total,
        childCount: data.booking.childCount,
      });
      setCurrentStep(5);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const pricePerChild = selectedSlot?.price || 22;
  const subtotal = childCount * pricePerChild;
  const tax = Number((subtotal * taxRate).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  const canContinueInfo =
    form.firstName.trim() && form.lastName.trim() && form.email.trim();

  return (
    <div className="pt-24 pb-16">
      <div className="container-content">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-h1 md:text-display-l text-ink">Reserve your play session</h1>
          <p className="mt-3 text-body-l text-ink-secondary">
            Pick a time, bring the kids, and enjoy 90 minutes of play.
          </p>
        </div>

        {/* Stepper */}
        <div className="max-w-3xl mx-auto mb-10">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Step content */}
        <div className="max-w-2xl mx-auto">
          {/* Step 0: Session type */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Choose your session type</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    disabled={s.disabled}
                    onClick={() => setSelectedSession(s.id)}
                    className="text-left"
                  >
                    <Card
                      className={`transition-all ${
                        s.disabled
                          ? "opacity-60 cursor-not-allowed"
                          : selectedSession === s.id
                          ? "border-terracotta ring-2 ring-terracotta/20 cursor-pointer"
                          : "cursor-pointer hover:border-terracotta/50"
                      }`}
                    >
                      <CardContent>
                        <h3 className="font-display text-h4 text-ink">{s.name}</h3>
                        <p className="mt-1 text-body-s text-ink-secondary">{s.description}</p>
                        <p className="mt-3 font-display text-h3 text-terracotta">{s.priceRange}</p>
                        <p className="text-caption text-ink-secondary">{s.perLabel}</p>
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>
              <Button size="lg" className="w-full" onClick={() => setCurrentStep(1)}>
                Continue <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Step 1: Date & Time */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Pick a date and time</h2>

              {/* Date picker */}
              <div className="rounded-md border border-cream-300 bg-cream-50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-terracotta" />
                  <span className="font-medium text-ink">Select a date</span>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-body-s">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={`${d}-${i}`} className="py-2 text-ink-secondary font-medium">
                      {d}
                    </div>
                  ))}
                  {calendarDays.length > 0 &&
                    Array.from({ length: calendarDays[0].date.getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                  {calendarDays.map((day) => {
                    const isSelected =
                      selectedDate && format(selectedDate, "yyyy-MM-dd") === format(day.date, "yyyy-MM-dd");
                    return (
                      <button
                        key={format(day.date, "yyyy-MM-dd")}
                        onClick={() => setSelectedDate(day.date)}
                        className={`py-2 rounded-sm transition-colors ${
                          isSelected
                            ? "bg-terracotta text-white"
                            : "hover:bg-cream-200 text-ink"
                        }`}
                      >
                        {day.date.getDate()}
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
                  <h3 className="text-label text-ink font-medium mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-terracotta" /> Available times
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-sm border p-3 text-center transition-all ${
                          selectedSlot?.time === slot.time
                            ? "border-terracotta bg-terracotta-light ring-2 ring-terracotta/20"
                            : "border-cream-300 bg-cream-50 hover:border-terracotta/50"
                        }`}
                      >
                        <p className="font-medium text-body-m">{slot.label}</p>
                        <p className="text-caption text-ink-secondary mt-1">
                          {slot.spots} spots &middot; ${slot.price}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setCurrentStep(0)}>
                  <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedDate || !selectedSlot}
                >
                  Continue <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Guests */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Who&apos;s playing?</h2>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-terracotta" />
                <span className="text-body-m text-ink">Number of children</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setChildCount(Math.max(1, childCount - 1))}
                  className="h-12 w-12 rounded-sm border border-cream-300 flex items-center justify-center text-h4 hover:bg-cream-200"
                >
                  -
                </button>
                <span className="font-display text-h2 text-ink w-12 text-center">{childCount}</span>
                <button
                  onClick={() => setChildCount(Math.min(10, childCount + 1))}
                  className="h-12 w-12 rounded-sm border border-cream-300 flex items-center justify-center text-h4 hover:bg-cream-200"
                >
                  +
                </button>
              </div>
              <p className="text-body-s text-ink-secondary">Adults enter free (max 2 per child).</p>
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

          {/* Step 3: Your Info */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Your details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First name"
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={(e) => updateForm("firstName", e.target.value)}
                />
                <Input
                  label="Last name"
                  placeholder="Smith"
                  value={form.lastName}
                  onChange={(e) => updateForm("lastName", e.target.value)}
                />
              </div>
              <Input
                label="Email"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
              />
              <Input
                label="Phone (optional)"
                type="tel"
                placeholder="(555) 123-4567"
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
              />
              <p className="text-body-s text-ink-secondary">
                We&apos;ll send your confirmation and booking code to this email.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => setCurrentStep(4)}
                  disabled={!canContinueInfo}
                >
                  Continue <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Review your booking</h2>

              {error && (
                <div className="px-4 py-3 rounded-md bg-error-light border border-error/30 text-body-s text-error">
                  {error}
                </div>
              )}

              <Card>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Session</span>
                    <span className="text-ink font-medium">
                      {sessions.find((s) => s.id === selectedSession)?.name || "Open Play"}
                    </span>
                  </div>
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Date</span>
                    <span className="text-ink font-medium">
                      {selectedDate ? format(selectedDate, "EEEE, MMMM d") : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Time</span>
                    <span className="text-ink font-medium">
                      {selectedSlot?.label || ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Children</span>
                    <span className="text-ink font-medium">{childCount}</span>
                  </div>
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Guest</span>
                    <span className="text-ink font-medium">{form.firstName} {form.lastName}</span>
                  </div>
                  <hr className="border-cream-300" />
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">
                      Subtotal ({childCount} x ${pricePerChild})
                    </span>
                    <span className="text-ink font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Tax</span>
                    <span className="text-ink font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-body-l font-medium">
                    <span className="text-ink">Total</span>
                    <span className="text-terracotta">${total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Pay at venue notice */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-md bg-cream-100 border border-cream-300">
                <Wallet className="h-5 w-5 text-terracotta mt-0.5 shrink-0" />
                <div>
                  <p className="text-body-s font-medium text-ink">Pay at venue</p>
                  <p className="text-body-s text-ink-secondary">
                    No payment needed now. Pay when you arrive at {venueName}.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleSubmitBooking}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Check className="h-5 w-5" />
                  )}
                  {submitting ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Confirmed */}
          {currentStep === 5 && bookingResult && (
            <div className="text-center py-8 space-y-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-success-light flex items-center justify-center">
                <Check className="h-8 w-8 text-success" />
              </div>
              <h2 className="font-display text-h2 text-ink">
                You&apos;re all set for{" "}
                {selectedDate ? format(selectedDate, "EEEE") : ""} at {selectedSlot?.label}!
              </h2>
              <p className="text-body-l text-ink-secondary max-w-md mx-auto">
                Show your booking code at check-in. No payment needed until you arrive.
              </p>

              <Card className="max-w-sm mx-auto">
                <CardContent className="text-center space-y-3">
                  <div className="mx-auto h-32 w-32 rounded-md bg-cream-200 flex items-center justify-center mb-4">
                    <QrCode className="h-16 w-16 text-ink-secondary" />
                  </div>
                  <p className="text-label text-ink-secondary">Booking code</p>
                  <p className="font-display text-h3 text-ink">{bookingResult.confirmationCode}</p>
                  <hr className="border-cream-300" />
                  <div className="text-left space-y-2">
                    <div className="flex justify-between text-body-s">
                      <span className="text-ink-secondary">Date</span>
                      <span className="text-ink font-medium">
                        {selectedDate ? format(selectedDate, "MMM d, yyyy") : bookingResult.date}
                      </span>
                    </div>
                    <div className="flex justify-between text-body-s">
                      <span className="text-ink-secondary">Time</span>
                      <span className="text-ink font-medium">{selectedSlot?.label}</span>
                    </div>
                    <div className="flex justify-between text-body-s">
                      <span className="text-ink-secondary">Children</span>
                      <span className="text-ink font-medium">{bookingResult.childCount}</span>
                    </div>
                    <div className="flex justify-between text-body-s">
                      <span className="text-ink-secondary">Total due</span>
                      <span className="text-terracotta font-medium">${bookingResult.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-center gap-2 text-body-s text-ink-secondary">
                <MapPin className="h-4 w-4" />
                <span>{venueName} &middot; {venueAddress}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/waivers/sign">
                  <Button>Sign waiver now</Button>
                </Link>
                <Link href="/">
                  <Button variant="secondary">Back to home</Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* FAQ below flow */}
        {currentStep === 0 && (
          <div className="max-w-2xl mx-auto mt-16">
            <h3 className="font-display text-h3 text-ink mb-6">Common questions</h3>
            <Accordion items={faqs} />
          </div>
        )}
      </div>
    </div>
  );
}
