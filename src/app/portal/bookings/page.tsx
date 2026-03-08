"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { Calendar, QrCode, Loader2, Plus } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { format, isBefore, startOfToday } from "date-fns";

interface BookingItem {
  id: string;
  type: string;
  status: string;
  payment_status: string;
  date: string;
  start_time: string;
  end_time: string;
  child_count: number;
  adult_count: number;
  total: number;
  confirmation_code: string;
  notes: string;
  created_at: string;
}

export default function PortalBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

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

      fetch(`/api/portal/bookings?authUserId=${user.id}`)
        .then((res) => res.json())
        .then((json) => {
          setBookings(json.bookings || []);
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

  const today = startOfToday();
  const filtered = bookings.filter((b) => {
    const bookingDate = new Date(b.date + "T12:00:00");
    if (filter === "upcoming") return !isBefore(bookingDate, today);
    if (filter === "past") return isBefore(bookingDate, today);
    return true;
  });

  const statusVariant = (status: string) => {
    if (status === "confirmed") return "success" as const;
    if (status === "cancelled") return "error" as const;
    if (status === "completed") return "default" as const;
    return "warning" as const;
  };

  const paymentVariant = (status: string) => {
    if (status === "paid") return "success" as const;
    if (status === "unpaid") return "warning" as const;
    return "default" as const;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-h1 text-ink">My Bookings</h1>
          <p className="text-body-m text-ink-secondary">View all your upcoming and past visits.</p>
        </div>
        <Link href="/booking/open-play">
          <Button size="sm">
            <Plus className="h-4 w-4" /> Book a visit
          </Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "upcoming", "past"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-pill text-body-s capitalize transition-colors ${
              filter === f
                ? "bg-terracotta text-white font-medium"
                : "bg-cream-200 text-ink-secondary hover:bg-cream-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((booking) => {
            const isPast = isBefore(new Date(booking.date + "T12:00:00"), today);
            return (
              <Card key={booking.id} className={isPast ? "opacity-75" : ""}>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-14 w-14 rounded-sm flex items-center justify-center shrink-0 ${
                      isPast ? "bg-cream-200" : "bg-terracotta-light"
                    }`}>
                      <QrCode className={`h-7 w-7 ${isPast ? "text-ink-secondary" : "text-terracotta"}`} />
                    </div>
                    <div>
                      <h3 className="font-display text-h4 text-ink">
                        {booking.type === "open_play" ? "Open Play" : booking.type === "party" ? "Party" : "Booking"}
                      </h3>
                      <p className="text-body-s text-ink-secondary">
                        {format(new Date(booking.date + "T12:00:00"), "EEE, MMM d, yyyy")}
                        {booking.start_time && ` at ${booking.start_time.slice(0, 5)}`}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant={statusVariant(booking.status)}>
                          {booking.status}
                        </Badge>
                        <Badge variant={paymentVariant(booking.payment_status)}>
                          {booking.payment_status === "unpaid" ? "Pay at venue" : booking.payment_status}
                        </Badge>
                        <Badge variant="default">
                          {booking.child_count} child{booking.child_count !== 1 ? "ren" : ""}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-h4 text-terracotta">${booking.total?.toFixed(2)}</p>
                    <p className="text-caption text-ink-secondary font-mono">{booking.confirmation_code}</p>
                    {!isPast && booking.status === "confirmed" && (
                      <Link
                        href={`/ticket/${booking.confirmation_code}`}
                        className="text-terracotta hover:underline text-caption font-medium"
                      >
                        View Ticket →
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
            <h3 className="font-display text-h4 text-ink mb-2">
              {filter === "upcoming" ? "No upcoming bookings" : filter === "past" ? "No past bookings" : "No bookings yet"}
            </h3>
            <p className="text-body-s text-ink-secondary mb-4">
              Book your first play session to get started!
            </p>
            <Link href="/booking/open-play">
              <Button size="sm">Book a session</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
