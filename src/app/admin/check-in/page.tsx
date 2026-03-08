"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button, Card, CardContent, Badge, Input } from "@/components/ui";
import { ClipboardCheck, Search, Loader2, CheckCircle2, Users, QrCode, X } from "lucide-react";

const QrScannerModal = dynamic(
  () =>
    import("@/components/admin/check-in/qr-scanner-modal").then(
      (m) => m.QrScannerModal
    ),
  { ssr: false }
);

interface BookingRow {
  id: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  time: string;
  childCount: number;
  adultCount: number;
  type: string;
  status: string;
  confirmationCode: string;
  checkedIn: boolean;
  checkedInAt: string | null;
}

interface Capacity {
  current: number;
  max: number;
}

export default function CheckInPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [capacity, setCapacity] = useState<Capacity>({ current: 0, max: 200 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const fetchData = useCallback((searchTerm?: string) => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);

    fetch(`/api/admin/check-in?${params}`)
      .then((res) => res.json())
      .then((json) => {
        setBookings(json.bookings || []);
        setCapacity(json.capacity || { current: 0, max: 200 });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setScanResult(null);
    fetchData(search);
  };

  const handleCheckIn = async (bookingId: string) => {
    setCheckingIn(bookingId);
    try {
      const res = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      if (res.ok) {
        setScanResult(null);
        fetchData(search || undefined);
      }
    } catch (err) {
      console.error("Check-in failed:", err);
    } finally {
      setCheckingIn(null);
    }
  };

  const handleScan = (code: string) => {
    setScannerOpen(false);
    setScanResult(code);
    setSearch(code);
    fetchData(code);
  };

  const clearScanResult = () => {
    setScanResult(null);
    setSearch("");
    fetchData();
  };

  const capacityPct = capacity.max > 0 ? (capacity.current / capacity.max) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  const scanMatch = scanResult
    ? bookings.find((b) => b.confirmationCode === scanResult)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-h1 text-ink">Check-In</h1>
          <p className="text-body-m text-ink-secondary">Today&apos;s arrivals</p>
        </div>
        <Button onClick={() => setScannerOpen(true)}>
          <QrCode className="h-4 w-4" /> Scan QR
        </Button>
      </div>

      {/* Capacity bar */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-terracotta" />
              <span className="text-body-m font-medium text-ink">Venue Capacity</span>
            </div>
            <span className="text-body-m font-semibold text-ink">
              {capacity.current} / {capacity.max}
            </span>
          </div>
          <div className="h-3 bg-cream-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                capacityPct > 90 ? "bg-error" : capacityPct > 70 ? "bg-warning" : "bg-success"
              }`}
              style={{ width: `${Math.min(capacityPct, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scan result banner */}
      {scanResult && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-sm border ${
            scanMatch
              ? "bg-sage/10 border-sage/30"
              : "bg-error/10 border-error/30"
          }`}
        >
          <div className="flex items-center gap-2 text-body-s">
            {scanMatch ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-ink">
                  Scanned: <span className="font-mono font-medium">{scanResult}</span> — {scanMatch.parentName}
                </span>
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4 text-error" />
                <span className="text-ink">
                  Scanned: <span className="font-mono font-medium">{scanResult}</span> — No match found for today
                </span>
              </>
            )}
          </div>
          <button
            onClick={clearScanResult}
            className="text-ink-secondary hover:text-ink transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name, confirmation code, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">
          <Search className="h-4 w-4" /> Search
        </Button>
      </form>

      {/* Bookings list */}
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-300">
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Time</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Family</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Code</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Kids</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Type</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Status</th>
                  <th className="text-right text-label text-ink-secondary py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const isScanned =
                    scanResult && b.confirmationCode === scanResult && !b.checkedIn;
                  return (
                    <tr
                      key={b.id}
                      className={`border-b border-cream-200 hover:bg-cream-200/50 transition-colors ${
                        isScanned ? "ring-2 ring-terracotta/30 bg-terracotta/5" : ""
                      }`}
                    >
                      <td className="py-3 text-body-s text-ink font-medium">{b.time}</td>
                      <td className="py-3">
                        <div className="text-body-s text-ink">{b.parentName}</div>
                        <div className="text-caption text-ink-secondary">{b.parentPhone}</div>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-body-s text-terracotta font-medium">{b.confirmationCode}</span>
                      </td>
                      <td className="py-3 text-body-s text-ink">{b.childCount}</td>
                      <td className="py-3 text-body-s text-ink-secondary">{b.type}</td>
                      <td className="py-3">
                        {b.checkedIn ? (
                          <span className="flex items-center gap-1 text-body-s text-success font-medium">
                            <CheckCircle2 className="h-4 w-4" /> Checked in
                          </span>
                        ) : (
                          <Badge variant={b.status === "confirmed" ? "success" : "warning"} className="text-[11px]">
                            {b.status}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {!b.checkedIn && b.status === "confirmed" && (
                          <Button
                            size="sm"
                            onClick={() => handleCheckIn(b.id)}
                            disabled={checkingIn === b.id}
                          >
                            {checkingIn === b.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <ClipboardCheck className="h-4 w-4" /> Check in
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {bookings.length === 0 && (
            <div className="py-12 text-center">
              <ClipboardCheck className="h-8 w-8 text-ink-secondary mx-auto mb-3" />
              <p className="text-body-m text-ink-secondary">
                {search ? "No bookings match your search" : "No bookings for today"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Scanner Modal */}
      <QrScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />
    </div>
  );
}
