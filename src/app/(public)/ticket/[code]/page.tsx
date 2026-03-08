"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import {
  Loader2,
  MapPin,
  CheckCircle2,
  Printer,
  FileCheck,
  Calendar,
  Clock,
  Users,
  Ticket,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";

interface TicketBooking {
  confirmationCode: string;
  type: string;
  status: string;
  paymentStatus: string;
  date: string;
  startTime: string;
  endTime: string;
  childCount: number;
  adultCount: number;
  total: number;
  parentName: string;
  checkedIn: boolean;
  checkedInAt: string | null;
}

interface TicketVenue {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

export default function TicketPage() {
  const params = useParams();
  const code = params.code as string;
  const [booking, setBooking] = useState<TicketBooking | null>(null);
  const [venue, setVenue] = useState<TicketVenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!code) return;

    fetch(`/api/ticket/${code}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((json) => {
        setBooking(json.booking);
        setVenue(json.venue);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-sm mx-auto py-16 text-center">
        <Card>
          <CardContent className="py-12">
            <Ticket className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
            <h2 className="font-display text-h3 text-ink mb-2">
              Ticket not found
            </h2>
            <p className="text-body-s text-ink-secondary mb-6">
              The booking code &ldquo;{code}&rdquo; was not found. Please check
              your confirmation email and try again.
            </p>
            <Link href="/">
              <Button variant="secondary" size="sm">
                Back to home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formattedDate = (() => {
    try {
      return format(new Date(booking.date + "T12:00:00"), "EEE, MMM d, yyyy");
    } catch {
      return booking.date;
    }
  })();

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          header, footer, nav, .no-print { display: none !important; }
          body { background: white !important; }
          .print-only { break-inside: avoid; }
        }
      `}</style>

      <div className="max-w-sm mx-auto py-8 space-y-6">
        {/* Ticket card */}
        <Card className="print-only overflow-hidden">
          {/* Dashed top border */}
          <div className="border-b-2 border-dashed border-cream-300" />

          <CardContent className="text-center space-y-4 pt-6">
            {/* Venue name */}
            {venue && (
              <p className="text-label text-ink-secondary uppercase tracking-wider">
                {venue.name}
              </p>
            )}

            {/* QR Code */}
            <div className="flex justify-center">
              <QRCodeSVG
                value={booking.confirmationCode}
                size={180}
                level="M"
                fgColor="#1F1D1A"
                bgColor="#F7F3EE"
              />
            </div>

            {/* Confirmation code */}
            <div>
              <p className="text-caption text-ink-secondary">Booking Code</p>
              <p className="font-mono text-h3 text-ink font-semibold tracking-wider">
                {booking.confirmationCode}
              </p>
            </div>

            {/* Checked-in status */}
            {booking.checkedIn && (
              <div className="flex items-center justify-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-body-s font-medium">Checked in</span>
              </div>
            )}

            <hr className="border-cream-300" />

            {/* Booking details */}
            <div className="text-left space-y-3">
              <div className="flex items-center justify-between text-body-s">
                <span className="flex items-center gap-2 text-ink-secondary">
                  <Calendar className="h-4 w-4" /> Date
                </span>
                <span className="text-ink font-medium">{formattedDate}</span>
              </div>
              <div className="flex items-center justify-between text-body-s">
                <span className="flex items-center gap-2 text-ink-secondary">
                  <Clock className="h-4 w-4" /> Time
                </span>
                <span className="text-ink font-medium">
                  {booking.startTime}
                  {booking.endTime ? ` – ${booking.endTime}` : ""}
                </span>
              </div>
              <div className="flex items-center justify-between text-body-s">
                <span className="flex items-center gap-2 text-ink-secondary">
                  <Ticket className="h-4 w-4" /> Session
                </span>
                <Badge
                  variant={booking.type === "Party" ? "terracotta" : "sage"}
                  className="text-[11px]"
                >
                  {booking.type}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-body-s">
                <span className="flex items-center gap-2 text-ink-secondary">
                  <Users className="h-4 w-4" /> Children
                </span>
                <span className="text-ink font-medium">
                  {booking.childCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-body-s">
                <span className="flex items-center gap-2 text-ink-secondary">
                  <DollarSign className="h-4 w-4" /> Total due
                </span>
                <span className="text-terracotta font-semibold">
                  ${booking.total.toFixed(2)}
                </span>
              </div>
            </div>

            <hr className="border-cream-300" />

            {/* Parent name */}
            <p className="text-body-s text-ink-secondary">
              Booked by{" "}
              <span className="text-ink font-medium">{booking.parentName}</span>
            </p>

            {/* Status badges */}
            <div className="flex items-center justify-center gap-2">
              <Badge
                variant={
                  booking.status === "confirmed"
                    ? "success"
                    : booking.status === "cancelled"
                      ? "error"
                      : "warning"
                }
              >
                {booking.status}
              </Badge>
              <Badge
                variant={
                  booking.paymentStatus === "paid"
                    ? "success"
                    : booking.paymentStatus === "unpaid"
                      ? "warning"
                      : "default"
                }
              >
                {booking.paymentStatus === "unpaid"
                  ? "Pay at venue"
                  : booking.paymentStatus}
              </Badge>
            </div>
          </CardContent>

          {/* Dashed bottom border */}
          <div className="border-t-2 border-dashed border-cream-300" />

          {/* Venue address */}
          {venue && (
            <div className="px-6 py-4 text-center">
              <div className="flex items-center justify-center gap-2 text-body-s text-ink-secondary">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>
                  {venue.address}
                  {venue.city && `, ${venue.city}`}
                  {venue.state && `, ${venue.state}`}
                  {venue.zip && ` ${venue.zip}`}
                </span>
              </div>
              {venue.phone && (
                <p className="text-caption text-ink-secondary mt-1">
                  {venue.phone}
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center no-print">
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print Ticket
          </Button>
          <Link href="/waivers/sign">
            <Button>
              <FileCheck className="h-4 w-4" /> Sign Waiver
            </Button>
          </Link>
        </div>

        {/* Help text */}
        <p className="text-center text-caption text-ink-secondary no-print">
          Show this ticket at the front desk when you arrive.
          <br />
          No payment needed until check-in.
        </p>
      </div>
    </>
  );
}
