"use client";

import { Button, Card, CardContent, Input } from "@/components/ui";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container-content">
        <div className="text-center mb-14">
          <h1 className="font-display text-h1 md:text-display-l text-ink">Get in touch</h1>
          <p className="mt-3 text-body-l text-ink-secondary max-w-lg mx-auto">
            Questions about bookings, parties, or anything else? We&apos;re here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact form */}
          <div>
            <h2 className="font-display text-h3 text-ink mb-6">Send us a message</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="First name" placeholder="Jane" />
                <Input label="Last name" placeholder="Smith" />
              </div>
              <Input label="Email" type="email" placeholder="jane@example.com" />
              <Input label="Phone (optional)" type="tel" placeholder="(555) 123-4567" />
              <div>
                <label className="block text-label text-ink mb-1.5 font-medium">Subject</label>
                <select className="flex h-[52px] w-full rounded-sm border border-cream-300 bg-cream-50 px-4 text-body-m text-ink">
                  <option>General question</option>
                  <option>Party inquiry</option>
                  <option>Membership question</option>
                  <option>Booking help</option>
                  <option>Feedback</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-label text-ink mb-1.5 font-medium">Message</label>
                <textarea
                  rows={5}
                  placeholder="Tell us how we can help..."
                  className="flex w-full rounded-sm border border-cream-300 bg-cream-50 px-4 py-3 text-body-m text-ink placeholder:text-ink-secondary/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta resize-none"
                />
              </div>
              <Button size="lg" type="submit">
                <Send className="h-5 w-5" /> Send message
              </Button>
            </form>
          </div>

          {/* Contact info */}
          <div className="space-y-6">
            <h2 className="font-display text-h3 text-ink mb-6">Visit us</h2>
            {/* Map placeholder */}
            <div className="aspect-[4/3] rounded-lg bg-cream-200 flex items-center justify-center">
              <p className="text-body-s text-ink-secondary">Map embed</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-terracotta shrink-0 mt-0.5" />
                  <div>
                    <p className="text-label font-medium text-ink">Address</p>
                    <p className="text-body-s text-ink-secondary">123 Play Street<br />City, ST 12345</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-terracotta shrink-0 mt-0.5" />
                  <div>
                    <p className="text-label font-medium text-ink">Phone</p>
                    <p className="text-body-s text-ink-secondary">(555) 123-4567</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-terracotta shrink-0 mt-0.5" />
                  <div>
                    <p className="text-label font-medium text-ink">Email</p>
                    <p className="text-body-s text-ink-secondary">hello@yourplayground.com</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-terracotta shrink-0 mt-0.5" />
                  <div>
                    <p className="text-label font-medium text-ink">Hours</p>
                    <p className="text-body-s text-ink-secondary">Mon–Fri: 9am–6pm<br />Sat–Sun: 9am–7pm</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
