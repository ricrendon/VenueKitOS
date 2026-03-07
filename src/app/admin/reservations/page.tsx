"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Reservation {
  id: string;
  parentName: string;
  parentEmail: string;
  date: string;
  time: string;
  childCount: number;
  adultCount: number;
  type: string;
  status: string;
  paymentStatus: string;
  total: number;
  confirmationCode: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState<"all" | "today" | "upcoming">("upcoming");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/reservations?filter=${filter}`)
      .then((res) => res.json())
      .then((json) => {
        setReservations(json.reservations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-h1 text-ink">Reservations</h1>
          <p className="text-body-m text-ink-secondary">{reservations.length} booking{reservations.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["today", "upcoming", "all"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === "today" ? "Today" : f === "upcoming" ? "Upcoming" : "All"}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        </div>
      ) : (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-300">
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Date</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Time</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Family</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Code</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Type</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Guests</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Total</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Payment</th>
                    <th className="text-left text-label text-ink-secondary py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r.id} className="border-b border-cream-200 hover:bg-cream-200/50 cursor-pointer transition-colors">
                      <td className="py-3 text-body-s text-ink font-medium">
                        {format(new Date(r.date + "T12:00:00"), "MMM d")}
                      </td>
                      <td className="py-3 text-body-s text-ink">{r.time}</td>
                      <td className="py-3">
                        <div className="text-body-s text-ink">{r.parentName}</div>
                        <div className="text-caption text-ink-secondary">{r.parentEmail}</div>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-body-s text-terracotta font-medium">{r.confirmationCode}</span>
                      </td>
                      <td className="py-3 text-body-s text-ink-secondary">{r.type}</td>
                      <td className="py-3 text-body-s text-ink">{r.childCount + r.adultCount}</td>
                      <td className="py-3 text-body-s text-ink font-medium">${r.total.toFixed(2)}</td>
                      <td className="py-3">
                        <Badge
                          variant={r.paymentStatus === "paid" ? "success" : r.paymentStatus === "partial" ? "warning" : "error"}
                          className="text-[11px]"
                        >
                          {r.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge variant={r.status === "confirmed" ? "success" : "warning"} className="text-[11px]">
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reservations.length === 0 && (
              <div className="py-12 text-center">
                <Calendar className="h-8 w-8 text-ink-secondary mx-auto mb-3" />
                <p className="text-body-m text-ink-secondary">No reservations found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
