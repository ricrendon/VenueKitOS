"use client";

import { useState } from "react";
import { Card, CardContent, Button, Input, Stepper } from "@/components/ui";
import { Loader2, Gift, Wallet, Check, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

const STEPS = ["Amount", "Details", "Confirm"];
const PRESET_AMOUNTS = [25, 50, 75, 100];

interface GiftCardResult {
  code: string;
  initialValue: number;
  expiresAt: string;
}

export default function GiftCardsPublicPage() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GiftCardResult | null>(null);

  // Form state
  const [selectedPreset, setSelectedPreset] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");

  const amount = selectedPreset || Number(customAmount) || 0;

  const handlePresetClick = (preset: number) => {
    setSelectedPreset(preset);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedPreset(null);
  };

  const canProceedStep0 = amount >= 10 && amount <= 500;
  const canProceedStep1 = purchaserName.trim() !== "" && purchaserEmail.trim() !== "";

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          purchaserName,
          purchaserEmail,
          recipientName: isGift ? recipientName : undefined,
          recipientEmail: isGift ? recipientEmail : undefined,
          message: isGift ? message : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to purchase");

      setResult(json.giftCard);
      setStep(3); // confirmation
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container-content max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-terracotta/10 mb-4">
            <Gift className="h-7 w-7 text-terracotta" />
          </div>
          <h1 className="font-display text-h1 text-ink">Gift Cards</h1>
          <p className="text-body-m text-ink-secondary mt-2">
            Give the gift of play! Perfect for birthdays, holidays, and every occasion.
          </p>
        </div>

        {/* Stepper (hidden on confirmation) */}
        {step < 3 && <Stepper steps={STEPS} currentStep={step} className="mb-8" />}

        {/* Step 0: Choose Amount */}
        {step === 0 && (
          <Card>
            <CardContent className="space-y-6">
              <h2 className="font-display text-h3 text-ink">Choose an Amount</h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetClick(preset)}
                    className={`py-6 rounded-md text-center transition-all border-2 ${
                      selectedPreset === preset
                        ? "border-terracotta bg-terracotta/5 ring-2 ring-terracotta/20"
                        : "border-cream-300 hover:border-cream-400 bg-cream-50"
                    }`}
                  >
                    <p className={`font-display text-h2 ${selectedPreset === preset ? "text-terracotta" : "text-ink"}`}>
                      ${preset}
                    </p>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-body-s text-ink-secondary mb-1.5 block">Or enter a custom amount ($10 – $500)</label>
                <Input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={handleCustomChange}
                  min={10}
                  max={500}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep(1)} disabled={!canProceedStep0}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <Card>
            <CardContent className="space-y-5">
              <h2 className="font-display text-h3 text-ink">Your Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-label text-ink-secondary font-medium mb-1 block">Your Name *</label>
                  <Input
                    value={purchaserName}
                    onChange={(e) => setPurchaserName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-label text-ink-secondary font-medium mb-1 block">Your Email *</label>
                  <Input
                    type="email"
                    value={purchaserEmail}
                    onChange={(e) => setPurchaserEmail(e.target.value)}
                    placeholder="john@email.com"
                  />
                </div>
              </div>

              {/* Gift toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="h-4 w-4 rounded border-cream-300 text-terracotta focus:ring-terracotta"
                />
                <span className="text-body-s text-ink">This is a gift for someone else</span>
              </label>

              {isGift && (
                <div className="space-y-3 pl-7">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-label text-ink-secondary font-medium mb-1 block">Recipient Name</label>
                      <Input
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="text-label text-ink-secondary font-medium mb-1 block">Recipient Email</label>
                      <Input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="jane@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-label text-ink-secondary font-medium mb-1 block">Personal Message</label>
                    <textarea
                      className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-body-s text-ink placeholder:text-ink-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30 resize-none"
                      rows={3}
                      maxLength={200}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Happy Birthday! Hope you enjoy your visit!"
                    />
                    <p className="text-caption text-ink-secondary mt-1">{message.length}/200 characters</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Back
                </Button>
                <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Review & Confirm */}
        {step === 2 && (
          <Card>
            <CardContent className="space-y-5">
              <h2 className="font-display text-h3 text-ink">Review & Confirm</h2>

              <div className="bg-cream-100 rounded-md p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-body-s text-ink-secondary">Gift Card Amount</span>
                  <span className="text-body-m text-ink font-display font-semibold">${amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-s text-ink-secondary">From</span>
                  <span className="text-body-s text-ink">{purchaserName}</span>
                </div>
                {isGift && recipientName && (
                  <div className="flex justify-between">
                    <span className="text-body-s text-ink-secondary">To</span>
                    <span className="text-body-s text-ink">{recipientName}</span>
                  </div>
                )}
                {isGift && message && (
                  <div className="pt-2 border-t border-cream-300">
                    <p className="text-caption text-ink-secondary mb-1">Message</p>
                    <p className="text-body-s text-ink italic">&ldquo;{message}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* Pay at venue notice */}
              <div className="flex items-start gap-3 bg-mustard/10 rounded-md p-4">
                <Wallet className="h-5 w-5 text-mustard shrink-0 mt-0.5" />
                <div>
                  <p className="text-body-s text-ink font-medium">Pay at Venue</p>
                  <p className="text-caption text-ink-secondary">
                    Complete your gift card purchase at the front desk. Your gift card code will be displayed after confirmation.
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-error/10 text-error text-body-s rounded-md p-3">{error}</div>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Gift className="h-4 w-4 mr-1.5" />
                      Get Gift Card
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && result && (
          <Card>
            <CardContent className="text-center space-y-6 py-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-sage/10">
                <Check className="h-8 w-8 text-sage" />
              </div>

              <div>
                <h2 className="font-display text-h2 text-ink mb-2">Gift Card Created!</h2>
                <p className="text-body-m text-ink-secondary">
                  Save this code and present it at the venue to complete your purchase.
                </p>
              </div>

              <div className="bg-cream-100 rounded-md p-6 inline-block">
                <p className="text-caption text-ink-secondary mb-1">Your Gift Card Code</p>
                <p className="font-mono text-h1 text-terracotta tracking-wider">{result.code}</p>
                <p className="text-body-m text-ink font-display mt-2">${result.initialValue.toFixed(2)}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link href="/gift-cards/check-balance">
                  <Button variant="secondary">Check Balance</Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost">Back to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
