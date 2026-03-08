"use client";

import { Button, Card, CardContent, Input } from "@/components/ui";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useVenue } from "@/components/providers/venue-provider";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hr = h % 12 || 12;
  return m === 0 ? `${hr}${ampm}` : `${hr}:${m.toString().padStart(2, "0")}${ampm}`;
}

function formatOperatingHours(hours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[]) {
  if (!hours || hours.length === 0) return "Mon\u2013Fri: 9am\u20136pm\nSat\u2013Sun: 9am\u20137pm";

  const sorted = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  // Group consecutive days with same hours
  const lines: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    const current = sorted[i];
    if (current.isClosed) {
      lines.push(`${DAY_NAMES[current.dayOfWeek]}: Closed`);
      i++;
      continue;
    }
    let j = i + 1;
    while (
      j < sorted.length &&
      !sorted[j].isClosed &&
      sorted[j].openTime === current.openTime &&
      sorted[j].closeTime === current.closeTime
    ) {
      j++;
    }
    const startDay = DAY_NAMES[current.dayOfWeek];
    const endDay = DAY_NAMES[sorted[j - 1].dayOfWeek];
    const timeStr = `${formatTime(current.openTime)}\u2013${formatTime(current.closeTime)}`;
    lines.push(j - i > 1 ? `${startDay}\u2013${endDay}: ${timeStr}` : `${startDay}: ${timeStr}`);
    i = j;
  }
  return lines.join("\n");
}

export default function ContactPage() {
  const { venue } = useVenue();

  const address = venue ? `${venue.address || ""}` : "123 Play Street";
  const cityLine = venue ? `${venue.city || "City"}, ${venue.state || "ST"} ${venue.zip || "12345"}` : "City, ST 12345";
  const phone = venue?.phone || "(555) 123-4567";
  const email = venue?.email || "hello@yourplayground.com";
  const hoursText = formatOperatingHours(venue?.operating_hours || []);
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
                    <p className="text-body-s text-ink-secondary">{address}<br />{cityLine}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-terracotta shrink-0 mt-0.5" />
                  <div>
                    <p className="text-label font-medium text-ink">Phone</p>
                    <p className="text-body-s text-ink-secondary">{phone}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-terracotta shrink-0 mt-0.5" />
                  <div>
                    <p className="text-label font-medium text-ink">Email</p>
                    <p className="text-body-s text-ink-secondary">{email}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-terracotta shrink-0 mt-0.5" />
                  <div>
                    <p className="text-label font-medium text-ink">Hours</p>
                    <p className="text-body-s text-ink-secondary whitespace-pre-line">{hoursText}</p>
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
