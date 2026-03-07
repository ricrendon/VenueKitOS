"use client";

import Link from "next/link";
import { Button, Card, CardContent, Accordion } from "@/components/ui";
import { FileCheck, Clock, Shield, ArrowRight } from "lucide-react";

const faqs = [
  { id: "1", question: "Who needs to sign a waiver?", answer: "A parent or legal guardian must sign a waiver for each child who plays. One waiver covers all visits during the validity period." },
  { id: "2", question: "How long is the waiver valid?", answer: "Waivers are valid for 12 months from the date of signing. We'll send a reminder when it's time to renew." },
  { id: "3", question: "Can I sign for multiple children at once?", answer: "Yes! During the signing process, you can add all your children in a single session. Each child gets their own waiver record." },
  { id: "4", question: "What if I need to update my emergency contact?", answer: "Log into your parent portal and update your information anytime. Changes take effect immediately." },
];

export default function WaiversPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container-content">
        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="font-display text-h1 md:text-display-l text-ink">Digital waivers, done in seconds</h1>
          <p className="mt-3 text-body-l text-ink-secondary max-w-2xl mx-auto">
            Sign your waiver online before your visit. It takes less than 90 seconds and keeps your family safe and ready to play.
          </p>
          <Link href="/waivers/sign" className="inline-block mt-8">
            <Button size="lg">
              Sign waiver now <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
          <Card className="text-center">
            <CardContent>
              <Clock className="h-8 w-8 text-terracotta mx-auto mb-3" />
              <h3 className="font-display text-h4 text-ink">Under 90 seconds</h3>
              <p className="mt-2 text-body-s text-ink-secondary">Quick and simple. Complete from any device.</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent>
              <Shield className="h-8 w-8 text-terracotta mx-auto mb-3" />
              <h3 className="font-display text-h4 text-ink">Legally secure</h3>
              <p className="mt-2 text-body-s text-ink-secondary">Digital signature with timestamp and records.</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent>
              <FileCheck className="h-8 w-8 text-terracotta mx-auto mb-3" />
              <h3 className="font-display text-h4 text-ink">Valid for 12 months</h3>
              <p className="mt-2 text-body-s text-ink-secondary">Sign once and play all year. We&apos;ll remind you to renew.</p>
            </CardContent>
          </Card>
        </div>

        {/* Why sign section */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-h2 text-ink mb-4">Why we require waivers</h2>
          <p className="text-body-l text-ink-secondary leading-relaxed">
            Safety is our top priority. Waivers help us understand each child&apos;s needs,
            provide emergency contact information, and ensure everyone has a safe, fun experience.
            It&apos;s a standard practice at all play facilities and it protects both your family and ours.
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-h2 text-ink text-center mb-8">Waiver FAQs</h2>
          <Accordion items={faqs} />
        </div>
      </div>
    </div>
  );
}
