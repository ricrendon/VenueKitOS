"use client";

import { useEffect, useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, Badge } from "@/components/ui";
import {
  QrCode, Search, RefreshCw, Download, Loader2,
  CheckCircle, XCircle, Wifi,
} from "lucide-react";
import { format } from "date-fns";

interface PassItem {
  id: string;
  passCode: string;
  passType: "qr" | "nfc";
  active: boolean;
  createdAt: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  membership: { planName: string; discount: number } | null;
}

export default function PassesPage() {
  const [passes, setPasses] = useState<PassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPass, setSelectedPass] = useState<PassItem | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "active" | "inactive">("all");

  const fetchPasses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/passes");
      const json = await res.json();
      setPasses(json.passes || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPasses();
  }, [fetchPasses]);

  const generatePass = async (parentId: string, passType: "qr" | "nfc" = "qr") => {
    setGenerating(parentId);
    try {
      const res = await fetch("/api/admin/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId, passType }),
      });
      if (res.ok) await fetchPasses();
    } finally {
      setGenerating(null);
    }
  };

  const toggleActive = async (pass: PassItem) => {
    try {
      await fetch(`/api/admin/passes/${pass.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !pass.active }),
      });
      await fetchPasses();
      if (selectedPass?.id === pass.id) {
        setSelectedPass((prev) => prev ? { ...prev, active: !prev.active } : null);
      }
    } catch {
      // silent
    }
  };

  const downloadQR = (pass: PassItem) => {
    const svg = document.getElementById(`qr-${pass.id}`);
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pass.passCode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = passes.filter((p) => {
    const matchSearch =
      !search ||
      p.parentName.toLowerCase().includes(search.toLowerCase()) ||
      p.parentEmail.toLowerCase().includes(search.toLowerCase()) ||
      p.passCode.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filterType === "all" ||
      (filterType === "active" && p.active) ||
      (filterType === "inactive" && !p.active);
    return matchSearch && matchFilter;
  });

  const activeCount = passes.filter((p) => p.active).length;
  const memberCount = passes.filter((p) => p.membership).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-h1 text-ink">Member Passes</h1>
          <p className="text-body-m text-ink-secondary">
            QR codes and NFC cards for member check-in and POS discounts.
          </p>
        </div>
        <button
          onClick={fetchPasses}
          className="flex items-center gap-2 px-4 py-2 rounded-sm bg-cream-200 text-ink text-body-s hover:bg-cream-300 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
          <span className="text-caption text-green-700 font-medium">{activeCount} active passes</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dusty-blue/10 border border-dusty-blue/20">
          <QrCode className="h-3.5 w-3.5 text-dusty-blue" />
          <span className="text-caption text-dusty-blue font-medium">{memberCount} with memberships</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-200 border border-cream-300">
          <span className="text-caption text-ink-secondary font-medium">{passes.length} total</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary" />
          <input
            type="text"
            placeholder="Search by name, email, or pass code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-sm border border-cream-300 bg-cream-50 text-body-s text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30"
          />
        </div>
        <div className="flex gap-1 bg-cream-200 rounded-sm p-1">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1 rounded-sm text-body-s capitalize transition-colors ${
                filterType === f
                  ? "bg-white text-ink font-medium shadow-sm"
                  : "text-ink-secondary hover:text-ink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <QrCode className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
            <h3 className="font-display text-h4 text-ink mb-2">No passes found</h3>
            <p className="text-body-s text-ink-secondary max-w-xs mx-auto">
              Passes are generated per member. Go to the Families page and generate a pass for a parent account.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pass list */}
          <div className="space-y-2">
            {filtered.map((pass) => (
              <button
                key={pass.id}
                onClick={() => setSelectedPass(pass)}
                className={`w-full text-left p-4 rounded-sm border transition-colors ${
                  selectedPass?.id === pass.id
                    ? "border-terracotta bg-terracotta/5"
                    : "border-cream-300 bg-white hover:border-terracotta/40 hover:bg-cream-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-body-s text-ink truncate">{pass.parentName}</p>
                    <p className="text-caption text-ink-secondary truncate">{pass.parentEmail}</p>
                    <p className="text-caption text-ink font-mono mt-1">{pass.passCode}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge
                      variant={pass.active ? "success" : "error"}
                      className="text-[10px]"
                    >
                      {pass.active ? "Active" : "Inactive"}
                    </Badge>
                    {pass.passType === "nfc" ? (
                      <span className="flex items-center gap-1 text-[10px] text-ink-secondary">
                        <Wifi className="h-3 w-3" /> NFC
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-ink-secondary">
                        <QrCode className="h-3 w-3" /> QR
                      </span>
                    )}
                    {pass.membership && (
                      <Badge variant="default" className="text-[10px]">
                        {pass.membership.planName}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail / QR panel */}
          <div className="sticky top-4">
            {selectedPass ? (
              <Card>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-h4 text-ink">{selectedPass.parentName}</h3>
                      <p className="text-body-s text-ink-secondary">{selectedPass.parentEmail}</p>
                    </div>
                    <Badge
                      variant={selectedPass.active ? "success" : "error"}
                    >
                      {selectedPass.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* QR Code */}
                  {selectedPass.passType === "qr" && (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <div className="p-4 bg-white border border-cream-300 rounded-sm inline-block">
                        <QRCodeSVG
                          id={`qr-${selectedPass.id}`}
                          value={`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/member/verify?code=${selectedPass.passCode}`}
                          size={180}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                      <p className="font-mono text-body-s text-ink font-medium tracking-widest">
                        {selectedPass.passCode}
                      </p>
                      <button
                        onClick={() => downloadQR(selectedPass)}
                        className="flex items-center gap-2 px-4 py-2 text-body-s text-ink-secondary border border-cream-300 rounded-sm hover:bg-cream-100 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download SVG
                      </button>
                    </div>
                  )}

                  {selectedPass.passType === "nfc" && (
                    <div className="flex flex-col items-center gap-3 py-6">
                      <div className="p-5 rounded-full bg-dusty-blue/10 border-2 border-dusty-blue/30">
                        <Wifi className="h-10 w-10 text-dusty-blue" />
                      </div>
                      <p className="font-mono text-body-s text-ink font-medium tracking-widest">
                        {selectedPass.passCode}
                      </p>
                      <p className="text-caption text-ink-secondary text-center">
                        Program this code to your NFC card via your NFC writer app.
                      </p>
                    </div>
                  )}

                  {/* Membership info */}
                  {selectedPass.membership && (
                    <div className="pt-3 border-t border-cream-200 space-y-1.5">
                      <p className="text-label text-ink-secondary font-medium uppercase tracking-wide text-[10px]">Membership</p>
                      <p className="text-body-s text-ink font-medium">{selectedPass.membership.planName}</p>
                      {selectedPass.membership.discount > 0 && (
                        <p className="text-caption text-ink-secondary">
                          {selectedPass.membership.discount}% party discount
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-cream-200 space-y-1.5">
                    <p className="text-label text-ink-secondary font-medium uppercase tracking-wide text-[10px]">Pass Info</p>
                    <p className="text-caption text-ink-secondary">
                      Issued {selectedPass.createdAt ? format(new Date(selectedPass.createdAt), "MMM d, yyyy") : "—"}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => generatePass(selectedPass.parentId, selectedPass.passType)}
                      disabled={generating === selectedPass.parentId}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-terracotta text-white text-body-s rounded-sm hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
                    >
                      {generating === selectedPass.parentId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Regenerate
                    </button>
                    <button
                      onClick={() => toggleActive(selectedPass)}
                      className={`flex items-center gap-2 px-4 py-2 text-body-s rounded-sm border transition-colors ${
                        selectedPass.active
                          ? "border-red-200 text-red-600 hover:bg-red-50"
                          : "border-green-200 text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {selectedPass.active ? (
                        <><XCircle className="h-4 w-4" /> Deactivate</>
                      ) : (
                        <><CheckCircle className="h-4 w-4" /> Activate</>
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <QrCode className="h-12 w-12 text-ink-secondary/40 mb-4" />
                  <p className="text-body-s text-ink-secondary">Select a pass to view its QR code</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
