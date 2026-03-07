"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import {
  Calendar, FileCheck, Users, CreditCard,
  ArrowRight, QrCode, Loader2,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { format } from "date-fns";

interface DashboardData {
  parent: { id: string; firstName: string; lastName: string; email: string } | null;
  upcomingBookings: {
    id: string;
    type: string;
    status: string;
    payment_status: string;
    date: string;
    start_time: string;
    child_count: number;
    total: number;
    confirmation_code: string;
  }[];
  children: {
    id: string;
    first_name: string;
    last_name: string;
    age: number;
    waiverStatus: string;
  }[];
  membership: {
    id: string;
    status: string;
    nextBillingDate: string;
    plan: {
      name: string;
      monthlyPrice: number;
      maxChildren: number;
      includesOpenPlay: boolean;
    } | null;
  } | null;
}

const childColors = ["#C96E4B", "#7F9BB3", "#8EAA92", "#D9B25F", "#9B8BAE"];

export default function PortalDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        return;
      }

      fetch(`/api/portal/dashboard?authUserId=${user.id}`)
        .then((res) => res.json())
        .then((json) => {
          setData(json);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  const firstName = data?.parent?.firstName || "there";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-h1 text-ink">Welcome back, {firstName}!</h1>
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

      {/* Upcoming bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-h3 text-ink">Upcoming bookings</h2>
          <Link href="/portal/bookings">
            <Button variant="tertiary" size="sm">View all <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>

        {data?.upcomingBookings && data.upcomingBookings.length > 0 ? (
          <div className="space-y-3">
            {data.upcomingBookings.slice(0, 3).map((booking) => (
              <Card key={booking.id}>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-sm bg-terracotta-light flex items-center justify-center shrink-0">
                      <QrCode className="h-7 w-7 text-terracotta" />
                    </div>
                    <div>
                      <h3 className="font-display text-h4 text-ink">
                        {booking.type === "open_play" ? "Open Play Session" : "Party Booking"}
                      </h3>
                      <p className="text-body-s text-ink-secondary">
                        {format(new Date(booking.date + "T12:00:00"), "EEEE, MMMM d")}
                        {booking.start_time && ` at ${booking.start_time.slice(0, 5)}`}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={booking.status === "confirmed" ? "success" : "default"}>
                          {booking.status}
                        </Badge>
                        <Badge variant="terracotta">
                          {booking.child_count} child{booking.child_count !== 1 ? "ren" : ""}
                        </Badge>
                        {booking.payment_status === "unpaid" && (
                          <Badge variant="warning">Pay at venue</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="font-display text-h4 text-terracotta">${booking.total?.toFixed(2)}</p>
                    <p className="text-caption text-ink-secondary">{booking.confirmation_code}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-body-m text-ink-secondary mb-4">No upcoming bookings</p>
              <Link href="/booking/open-play">
                <Button size="sm">Book a session</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Children & waiver status */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-h3 text-ink">My children</h2>
          <Link href="/portal/children">
            <Button variant="tertiary" size="sm">View all <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>

        {data?.children && data.children.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.children.map((child, i) => (
              <Card key={child.id}>
                <CardContent className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-white font-display font-semibold"
                    style={{ backgroundColor: childColors[i % childColors.length] }}
                  >
                    {child.first_name[0]}{child.last_name[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-body-m font-medium text-ink">
                      {child.first_name} {child.last_name}
                    </h3>
                    <p className="text-body-s text-ink-secondary">Age {child.age}</p>
                  </div>
                  <Badge variant={child.waiverStatus === "signed" ? "success" : "error"}>
                    Waiver {child.waiverStatus}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-body-m text-ink-secondary mb-4">No children added yet</p>
              <Link href="/portal/children">
                <Button size="sm">Add a child</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Membership status */}
      <div>
        <h2 className="font-display text-h3 text-ink mb-4">Membership</h2>
        {data?.membership?.plan ? (
          <Card className="bg-gradient-to-r from-terracotta to-coral text-white">
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-h3 text-white">{data.membership.plan.name}</h3>
                <p className="text-body-m text-white/80">
                  {data.membership.plan.includesOpenPlay
                    ? `Unlimited open play for up to ${data.membership.plan.maxChildren} children`
                    : `Up to ${data.membership.plan.maxChildren} children`}
                </p>
                <p className="text-body-s text-white/70 mt-1">
                  Next billing: {data.membership.nextBillingDate
                    ? format(new Date(data.membership.nextBillingDate + "T12:00:00"), "MMMM d, yyyy")
                    : "N/A"} &middot; ${data.membership.plan.monthlyPrice}/mo
                </p>
              </div>
              <Link href="/portal/memberships">
                <Button className="bg-white text-terracotta hover:bg-cream-50" size="sm">
                  Manage
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-h4 text-ink">No active membership</h3>
                <p className="text-body-s text-ink-secondary">
                  Save on visits with a monthly membership plan.
                </p>
              </div>
              <Link href="/memberships">
                <Button size="sm">View plans</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
