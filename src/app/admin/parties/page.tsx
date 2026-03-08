"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Badge, MetricCard } from "@/components/ui";
import { PartyPopper, Loader2, Clock, MapPin, DollarSign, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

interface Party {
  id: string;
  childName: string;
  childAge: number | null;
  date: string;
  startTime: string;
  endTime: string;
  packageName: string;
  guestCount: number;
  room: string;
  status: string;
  paymentStatus: string;
  deposit: number;
  totalDue: number;
  balanceRemaining: number;
  parentName: string;
}

export default function PartiesPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchParties = async () => {
      const { data, error } = await supabase
        .from("party_reservations")
        .select("*, parent:parent_accounts(first_name, last_name), package:party_packages(name)")
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (!error && data) {
        const formatted = data.map((p) => {
          const parent = p.parent as { first_name: string; last_name: string } | null;
          const pkg = p.package as { name: string } | null;
          const startTime = p.start_time
            ? new Date(p.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
            : "";
          const endTime = p.end_time
            ? new Date(p.end_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
            : "";

          return {
            id: p.id,
            childName: p.child_name || "Unknown",
            childAge: p.child_age,
            date: p.date,
            startTime,
            endTime,
            packageName: pkg?.name || "Unknown",
            guestCount: p.estimated_guest_count || 0,
            room: p.room || "TBD",
            status: p.status,
            paymentStatus: p.payment_status,
            deposit: p.deposit || 0,
            totalDue: p.total_due || 0,
            balanceRemaining: p.balance_remaining || 0,
            parentName: parent ? `${parent.first_name} ${parent.last_name}` : "Unknown",
          };
        });
        setParties(formatted);
      }
      setLoading(false);
    };

    fetchParties();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  // Use en-CA locale to get YYYY-MM-DD in venue timezone
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
  const todayParties = parties.filter((p) => p.date === today);
  const upcomingParties = parties.filter((p) => p.date > today);
  const totalRevenue = parties.reduce((sum, p) => sum + p.totalDue, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-h1 text-ink">Parties</h1>
        <p className="text-body-m text-ink-secondary">{parties.length} reservation{parties.length !== 1 ? "s" : ""}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today"
          value={String(todayParties.length)}
          change={todayParties.length > 0 ? "Confirmed" : "None scheduled"}
          changeType="neutral"
          icon={<Calendar className="h-5 w-5" />}
        />
        <MetricCard
          title="Upcoming"
          value={String(upcomingParties.length)}
          change="This week"
          changeType="neutral"
          icon={<PartyPopper className="h-5 w-5" />}
        />
        <MetricCard
          title="Total revenue"
          value={`$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          change="From all parties"
          changeType="positive"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard
          title="Avg guests"
          value={parties.length > 0 ? String(Math.round(parties.reduce((s, p) => s + p.guestCount, 0) / parties.length)) : "0"}
          change="Per party"
          changeType="neutral"
          icon={<PartyPopper className="h-5 w-5" />}
        />
      </div>

      {/* Party list */}
      <div className="grid gap-4">
        {parties.map((p) => (
          <Card key={p.id} className="hover:shadow-card-hover transition-shadow">
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-h4 text-ink">
                    {p.childName}&apos;s {p.childAge ? `${p.childAge}th ` : ""}Birthday
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-4 text-body-s text-ink-secondary">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(p.date + "T12:00:00"), "EEE, MMM d")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {p.startTime} – {p.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {p.room}
                    </span>
                  </div>
                  <p className="mt-1 text-body-s text-ink-secondary">
                    {p.packageName} package · {p.guestCount} guests · Booked by {p.parentName}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={p.status === "confirmed" ? "success" : "warning"} className="text-[11px]">
                    {p.status}
                  </Badge>
                  <div className="text-right">
                    <p className="text-body-s font-semibold text-ink">${p.totalDue.toFixed(2)}</p>
                    {p.balanceRemaining > 0 && (
                      <p className="text-caption text-warning">Balance: ${p.balanceRemaining.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {parties.length === 0 && (
          <div className="py-12 text-center">
            <PartyPopper className="h-8 w-8 text-ink-secondary mx-auto mb-3" />
            <p className="text-body-m text-ink-secondary">No party reservations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
