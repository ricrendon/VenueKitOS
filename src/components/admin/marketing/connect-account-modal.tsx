"use client";

import { useState } from "react";
import { Button, Modal, Input } from "@/components/ui";
import { Instagram, Facebook, Loader2 } from "lucide-react";

type Platform = "instagram" | "facebook";

interface ConnectAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConnectAccountModal({ open, onClose, onSuccess }: ConnectAccountModalProps) {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!accessToken.trim()) {
      setError("Access token is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/social/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, accessToken: accessToken.trim() }),
      });

      const json = await res.json();

      if (res.ok) {
        resetForm();
        onClose();
        onSuccess();
      } else {
        setError(json.error || "Failed to connect account");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPlatform("instagram");
    setAccessToken("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Connect Account"
      description="Link your social media account to track performance."
      size="md"
    >
      <div className="space-y-4">
        {/* Platform selector */}
        <div>
          <label className="block text-label text-ink mb-1.5 font-medium">Platform</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPlatform("instagram")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-body-s transition-colors flex-1 ${
                platform === "instagram"
                  ? "bg-terracotta text-white font-medium"
                  : "bg-cream-200 text-ink-secondary hover:bg-cream-300"
              }`}
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </button>
            <button
              onClick={() => setPlatform("facebook")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-body-s transition-colors flex-1 ${
                platform === "facebook"
                  ? "bg-terracotta text-white font-medium"
                  : "bg-cream-200 text-ink-secondary hover:bg-cream-300"
              }`}
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </button>
          </div>
        </div>

        {/* Access token input */}
        <div>
          <Input
            label="Access Token"
            type="password"
            value={accessToken}
            onChange={(e) => {
              setAccessToken(e.target.value);
              if (error) setError("");
            }}
            placeholder="Paste your access token…"
            error={error || undefined}
          />
          <p className="mt-1.5 text-caption text-ink-secondary">
            {platform === "instagram"
              ? "Use an Instagram Business account token from the Meta Developer Portal."
              : "Use a Facebook Page token from the Meta Developer Portal."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!accessToken.trim() || loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Validating…
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
