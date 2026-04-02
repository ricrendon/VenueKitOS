"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, Badge, Input } from "@/components/ui";
import {
  Instagram,
  Facebook,
  Loader2,
  Check,
  X,
  Link2,
  Unlink,
  Eye,
  EyeOff,
} from "lucide-react";

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  account_id: string;
  profile_picture_url: string;
  followers_count: number;
  connected_at: string;
  last_synced_at: string;
  status: string;
}

const platformConfig = {
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
    description:
      "Connect your Instagram Business account to track followers, engagement, and inquiries.",
    helpUrl:
      "https://developers.facebook.com/docs/instagram-api/getting-started",
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-600",
    description:
      "Connect your Facebook Page to track fans, page views, and messages.",
    helpUrl: "https://developers.facebook.com/docs/pages/getting-started",
  },
  tiktok: {
    name: "TikTok",
    icon: null,
    color: "bg-black",
    description: "TikTok integration coming soon.",
    helpUrl: "",
  },
};

export function IntegrationsSection() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(
    null
  );
  const [tokenInput, setTokenInput] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAccounts = () => {
    fetch("/api/admin/social/accounts")
      .then((res) => res.json())
      .then((json) => {
        setAccounts(
          (json.accounts || []).filter(
            (a: SocialAccount) => a.status === "active"
          )
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleConnect = async (platform: string) => {
    if (!tokenInput.trim()) {
      setError("Please paste your access token.");
      return;
    }

    setConnecting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/social/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, accessToken: tokenInput.trim() }),
      });

      const body = await res.json();

      if (!res.ok) {
        setError(body.error || "Failed to connect account.");
        setConnecting(false);
        return;
      }

      setSuccess(
        `${
          platformConfig[platform as keyof typeof platformConfig]?.name ||
          platform
        } connected successfully!`
      );
      setConnectingPlatform(null);
      setTokenInput("");
      fetchAccounts();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    setDisconnecting(accountId);
    try {
      await fetch(`/api/admin/social/accounts?id=${accountId}`, {
        method: "DELETE",
      });
      fetchAccounts();
    } catch {
      // Silently fail
    } finally {
      setDisconnecting(null);
    }
  };

  const getConnectedAccount = (platform: string) =>
    accounts.find((a) => a.platform === platform);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-display text-h4 text-ink mb-4 flex items-center gap-2">
        <Link2 className="h-5 w-5 text-terracotta" /> Social Media Integrations
      </h3>
      <p className="text-body-s text-ink-secondary mb-6">
        Connect your venue&apos;s social media accounts to track engagement,
        follower growth, and incoming inquiries directly from VenueKit OS.
      </p>

      {/* Success/Error messages */}
      {success && (
        <div className="px-4 py-3 rounded-md bg-success-light border border-success/30 text-body-s text-success flex items-center gap-2">
          <Check className="h-4 w-4" /> {success}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-md bg-error-light border border-error/30 text-body-s text-error">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {(["instagram", "facebook", "tiktok"] as const).map((platform) => {
          const config = platformConfig[platform];
          const connected = getConnectedAccount(platform);
          const isExpanded = connectingPlatform === platform;
          const PlatformIcon = config.icon;

          return (
            <Card key={platform} className="overflow-hidden">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-lg ${config.color} flex items-center justify-center`}
                    >
                      {PlatformIcon ? (
                        <PlatformIcon className="h-6 w-6 text-white" />
                      ) : (
                        <span className="text-white font-bold text-body-m">
                          T
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-h4 text-ink">
                          {config.name}
                        </h3>
                        {connected ? (
                          <Badge variant="success" className="text-[11px]">
                            Connected
                          </Badge>
                        ) : platform === "tiktok" ? (
                          <Badge variant="default" className="text-[11px]">
                            Coming Soon
                          </Badge>
                        ) : null}
                      </div>
                      {connected ? (
                        <p className="text-body-s text-ink-secondary">
                          @{connected.account_name} ·{" "}
                          {connected.followers_count?.toLocaleString()} followers
                        </p>
                      ) : (
                        <p className="text-body-s text-ink-secondary">
                          {config.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    {connected ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDisconnect(connected.id)}
                        disabled={disconnecting === connected.id}
                      >
                        {disconnecting === connected.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Unlink className="h-4 w-4" /> Disconnect
                          </>
                        )}
                      </Button>
                    ) : platform !== "tiktok" ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setConnectingPlatform(isExpanded ? null : platform);
                          setTokenInput("");
                          setError("");
                          setShowToken(false);
                        }}
                      >
                        <Link2 className="h-4 w-4" /> Connect
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/* Token input panel */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-cream-300">
                    <p className="text-body-s text-ink-secondary mb-3">
                      Paste your {config.name} Page Access Token below. You can
                      generate one from{" "}
                      <a
                        href="https://developers.facebook.com/tools/explorer/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-terracotta hover:underline"
                      >
                        Meta Graph API Explorer
                      </a>
                      .
                    </p>

                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Input
                          type={showToken ? "text" : "password"}
                          placeholder="Paste your access token here..."
                          value={tokenInput}
                          onChange={(e) => setTokenInput(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-ink"
                          onClick={() => setShowToken(!showToken)}
                        >
                          {showToken ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <Button
                        onClick={() => handleConnect(platform)}
                        disabled={connecting}
                      >
                        {connecting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4" /> Connect
                          </>
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setConnectingPlatform(null);
                          setTokenInput("");
                          setError("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
