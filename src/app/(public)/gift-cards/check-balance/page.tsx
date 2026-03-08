"use client";

import { useState } from "react";
import { Card, CardContent, Button, Input, Badge } from "@/components/ui";
import { Loader2, Gift, Search } from "lucide-react";
import Link from "next/link";

interface BalanceResult {
  code: string;
  initialValue: number;
  currentBalance: number;
  status: string;
  expiresAt: string | null;
}

const STATUS_VARIANT: Record<string, "success" | "default" | "warning" | "error"> = {
  active: "success",
  redeemed: "default",
  expired: "warning",
  disabled: "error",
};

export default function CheckBalancePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BalanceResult | null>(null);

  const handleCheck = async () => {
    if (!code.trim()) return;
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/gift-cards?code=${encodeURIComponent(code.trim())}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gift card not found");
      }

      setResult(json.giftCard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCheck();
  };

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container-content max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-terracotta/10 mb-4">
            <Gift className="h-7 w-7 text-terracotta" />
          </div>
          <h1 className="font-display text-h2 text-ink">Check Gift Card Balance</h1>
          <p className="text-body-m text-ink-secondary mt-2">
            Enter your gift card code to check your remaining balance.
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardContent className="space-y-4">
            <div>
              <label className="text-label text-ink-secondary font-medium mb-1 block">Gift Card Code</label>
              <div className="flex gap-2">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  placeholder="GC-XXXXXX"
                  className="font-mono"
                />
                <Button onClick={handleCheck} disabled={loading || !code.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-error/10 text-error text-body-s rounded-md p-3">{error}</div>
            )}

            {result && (
              <div className="border border-cream-300 rounded-md p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-body-m text-ink font-medium">{result.code}</p>
                  <Badge variant={STATUS_VARIANT[result.status] || "default"} className="capitalize">
                    {result.status}
                  </Badge>
                </div>

                <div className="text-center py-4">
                  <p className="text-caption text-ink-secondary mb-1">Current Balance</p>
                  <p className="font-display text-h1 text-terracotta">
                    ${result.currentBalance.toFixed(2)}
                  </p>
                  <p className="text-caption text-ink-secondary mt-1">
                    of ${result.initialValue.toFixed(2)} original value
                  </p>
                </div>

                {/* Balance bar */}
                <div>
                  <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sage rounded-full transition-all"
                      style={{
                        width: `${result.initialValue > 0 ? (result.currentBalance / result.initialValue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {result.expiresAt && (
                  <p className="text-caption text-ink-secondary text-center">
                    Expires: {new Date(result.expiresAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/gift-cards" className="text-body-s text-terracotta hover:underline">
            Purchase a Gift Card
          </Link>
        </div>
      </div>
    </div>
  );
}
