"use client";

import Link from "next/link";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import {
  Calendar, FileCheck, Users, CreditCard,
  ArrowRight, QrCode, Plus,
} from "lucide-react";

export default function PortalDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-h1 text-ink">Welcome back, Jane!</h1>
        <p className="mt-1 text-body-l text-ink-secondary">Here&apos;s a quick look at your family&apos;s account.</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Book a visit", icon: Calendar, href: "/booking/open-play" },
          { label: "Sign waiver", icon: FileCheck, href: "/waivers/sign" },
          { label: "Manage kids", icon: Users, href: "/portal/children" },
          { label: "Membership", icon: CreditCard, href: "/portal/memberships" },
        ].map((action) => (
          <Link key={action.label} href={action.href}>
            <Card className="text-center hover:shadow-card-hover cursor-pointer h-full">
              <CardContent className="flex flex-col items-center py-4">
                <action.icon className="h-6 w-6 text-terracotta mb-2" />
                <span className="text-body-s font-medium text-ink">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Upcoming booking */}
      <div>
        <h2 className="font-display text-h3 text-ink mb-4">Upcoming bookings</h2>
        <Card>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-sm bg-terracotta-light flex items-center justify-center shrink-0">
                <QrCode className="h-7 w-7 text-terracotta" />
              </div>
              <div>
                <h3 className="font-display text-h4 text-ink">Open Play Session</h3>
                <p className="text-body-s text-ink-secondary">Saturday, March 15 at 12:00 PM</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="success">Confirmed</Badge>
                  <Badge variant="terracotta">2 children</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">View QR</Button>
              <Button variant="ghost" size="sm">Details</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children & waiver status */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-h3 text-ink">My children</h2>
          <Link href="/portal/children">
            <Button variant="tertiary" size="sm">View all <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: "Emma Smith", age: 7, waiver: "signed" as const, color: "#C96E4B" },
            { name: "Liam Smith", age: 4, waiver: "signed" as const, color: "#7F9BB3" },
          ].map((child) => (
            <Card key={child.name}>
              <CardContent className="flex items-center gap-4">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white font-display font-semibold"
                  style={{ backgroundColor: child.color }}
                >
                  {child.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <h3 className="text-body-m font-medium text-ink">{child.name}</h3>
                  <p className="text-body-s text-ink-secondary">Age {child.age}</p>
                </div>
                <Badge variant={child.waiver === "signed" ? "success" : "error"}>
                  Waiver {child.waiver}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Membership status */}
      <div>
        <h2 className="font-display text-h3 text-ink mb-4">Membership</h2>
        <Card className="bg-gradient-to-r from-terracotta to-coral text-white">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-h3 text-white">Family Plan</h3>
              <p className="text-body-m text-white/80">Unlimited open play for up to 3 children</p>
              <p className="text-body-s text-white/70 mt-1">Next billing: April 1, 2026 · $49/mo</p>
            </div>
            <Link href="/portal/memberships">
              <Button className="bg-white text-terracotta hover:bg-cream-50" size="sm">
                Manage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
