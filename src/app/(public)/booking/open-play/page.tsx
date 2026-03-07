"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, Input, Stepper, Accordion } from "@/components/ui";
import { Calendar, Clock, Users, ArrowRight, ArrowLeft, Check, CreditCard, QrCode } from "lucide-react";

const steps = ["Session", "Date & Time", "Guests", "Your Info", "Waiver", "Review", "Confirmed"];

const timeSlots = [
  { id: "1", time: "9:00 AM", spots: 12, price: 18 },
  { id: "2", time: "10:30 AM", spots: 8, price: 18 },
  { id: "3", time: "12:00 PM", spots: 15, price: 22 },
  { id: "4", time: "1:30 PM", spots: 3, price: 22 },
  { id: "5", time: "3:00 PM", spots: 0, price: 22 },
  { id: "6", time: "4:30 PM", spots: 10, price: 18 },
];

const faqs = [
  { id: "1", question: "How long is an open play session?", answer: "Each session is 90 minutes of play time. Please arrive 10 minutes early to check in and get wristbands." },
  { id: "2", question: "Do adults play for free?", answer: "Adults are free! Each child ticket includes admission for up to 2 accompanying adults." },
  { id: "3", question: "What should we bring?", answer: "Just socks for everyone (grip socks available for purchase). We provide everything else." },
  { id: "4", question: "Can I book same-day?", answer: "Yes! As long as spots are available, you can book up to 30 minutes before a session starts." },
];

export default function OpenPlayBookingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [childCount, setChildCount] = useState(1);

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
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Choose your session type</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="cursor-pointer border-terracotta ring-2 ring-terracotta/20">
                  <CardContent>
                    <h3 className="font-display text-h4 text-ink">Open Play</h3>
                    <p className="mt-1 text-body-s text-ink-secondary">90 minutes of free play for all ages</p>
                    <p className="mt-3 font-display text-h3 text-terracotta">$18–$22</p>
                    <p className="text-caption text-ink-secondary">per child</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer opacity-60">
                  <CardContent>
                    <h3 className="font-display text-h4 text-ink">Toddler Time</h3>
                    <p className="mt-1 text-body-s text-ink-secondary">Ages 0–3 only, calmer environment</p>
                    <p className="mt-3 font-display text-h3 text-ink-secondary">$15</p>
                    <p className="text-caption text-ink-secondary">per child · weekday mornings</p>
                  </CardContent>
                </Card>
              </div>
              <Button size="lg" className="w-full" onClick={() => setCurrentStep(1)}>
                Continue <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Pick a date and time</h2>
              {/* Date picker placeholder */}
              <div className="rounded-md border border-cream-300 bg-cream-50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-terracotta" />
                  <span className="font-medium text-ink">March 2026</span>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-body-s">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                    <div key={d} className="py-2 text-ink-secondary font-medium">{d}</div>
                  ))}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      className={`py-2 rounded-sm transition-colors ${
                        day === 15
                          ? "bg-terracotta text-white"
                          : day < 7
                          ? "text-cream-300 cursor-not-allowed"
                          : "hover:bg-cream-200 text-ink"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              {/* Time slots */}
              <div>
                <h3 className="text-label text-ink font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-terracotta" /> Available times
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      disabled={slot.spots === 0}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`rounded-sm border p-3 text-center transition-all ${
                        slot.spots === 0
                          ? "border-cream-300 bg-cream-200 text-ink-secondary/50 cursor-not-allowed"
                          : selectedSlot === slot.id
                          ? "border-terracotta bg-terracotta-light ring-2 ring-terracotta/20"
                          : "border-cream-300 bg-cream-50 hover:border-terracotta/50"
                      }`}
                    >
                      <p className="font-medium text-body-m">{slot.time}</p>
                      <p className="text-caption text-ink-secondary mt-1">
                        {slot.spots === 0 ? "Sold out" : `${slot.spots} spots · $${slot.price}`}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setCurrentStep(0)}>
                  <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <Button size="lg" className="flex-1" onClick={() => setCurrentStep(2)} disabled={!selectedSlot}>
                  Continue <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

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
                  −
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

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Your details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="First name" placeholder="Jane" />
                <Input label="Last name" placeholder="Smith" />
              </div>
              <Input label="Email" type="email" placeholder="jane@example.com" />
              <Input label="Phone" type="tel" placeholder="(555) 123-4567" />
              <p className="text-body-s text-ink-secondary">
                We&apos;ll send your confirmation and QR check-in code to this email.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <Button size="lg" className="flex-1" onClick={() => setCurrentStep(5)}>
                  Continue <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Review your booking</h2>
              <Card>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Session</span>
                    <span className="text-ink font-medium">Open Play</span>
                  </div>
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Date</span>
                    <span className="text-ink font-medium">Saturday, March 15</span>
                  </div>
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Time</span>
                    <span className="text-ink font-medium">12:00 PM – 1:30 PM</span>
                  </div>
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Children</span>
                    <span className="text-ink font-medium">{childCount}</span>
                  </div>
                  <hr className="border-cream-300" />
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Subtotal ({childCount} x $22)</span>
                    <span className="text-ink font-medium">${(childCount * 22).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-body-m">
                    <span className="text-ink-secondary">Tax</span>
                    <span className="text-ink font-medium">${(childCount * 22 * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-body-l font-medium">
                    <span className="text-ink">Total</span>
                    <span className="text-terracotta">${(childCount * 22 * 1.08).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <Button size="lg" className="flex-1" onClick={() => setCurrentStep(6)}>
                  <CreditCard className="h-5 w-5" /> Pay & confirm
                </Button>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="text-center py-8 space-y-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-success-light flex items-center justify-center">
                <Check className="h-8 w-8 text-success" />
              </div>
              <h2 className="font-display text-h2 text-ink">You&apos;re all set for Saturday at 12:00 PM!</h2>
              <p className="text-body-l text-ink-secondary max-w-md mx-auto">
                Confirmation sent to your email. Show your QR code at check-in.
              </p>
              <Card className="max-w-sm mx-auto">
                <CardContent className="text-center">
                  <div className="mx-auto h-32 w-32 rounded-md bg-cream-200 flex items-center justify-center mb-4">
                    <QrCode className="h-16 w-16 text-ink-secondary" />
                  </div>
                  <p className="text-label text-ink-secondary">Booking code</p>
                  <p className="font-display text-h3 text-ink">PG-ABC123</p>
                </CardContent>
              </Card>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="secondary">Add to calendar</Button>
                <Link href="/waivers/sign">
                  <Button>Sign waiver now</Button>
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
