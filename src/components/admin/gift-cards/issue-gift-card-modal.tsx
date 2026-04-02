"use client";

import { useState } from "react";
import { Button, Input, Select, Modal } from "@/components/ui";
import { useToast } from "@/components/ui";
import { Loader2 } from "lucide-react";

const PRESET_AMOUNTS = [25, 50, 75, 100];

const PAYMENT_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "card_in_store", label: "Card (in-store)" },
  { value: "other", label: "Other" },
];

interface IssueGiftCardModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function IssueGiftCardModal({ open, onClose, onSuccess }: IssueGiftCardModalProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const amount = selectedPreset || Number(customAmount) || 0;

  const handlePresetClick = (preset: number) => {
    setSelectedPreset(preset);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedPreset(null);
  };

  const handleSubmit = async () => {
    if (amount < 1) {
      toast("error", "Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialValue: amount,
          purchaserName: purchaserName || null,
          purchaserEmail: purchaserEmail || null,
          recipientName: recipientName || null,
          recipientEmail: recipientEmail || null,
          message: message || null,
          expiresAt: expiresAt || null,
          paymentMethod,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create");

      toast("success", `Gift card ${json.giftCard.code} created!`);
      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to create gift card");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedPreset(50);
    setCustomAmount("");
    setPurchaserName("");
    setPurchaserEmail("");
    setRecipientName("");
    setRecipientEmail("");
    setMessage("");
    setExpiresAt("");
    setPaymentMethod("cash");
  };

  return (
    <Modal open={open} onClose={onClose} title="Issue Gift Card" description="Create a new gift card for a customer." size="md">
      <div className="space-y-5">
        {/* Amount Selection */}
        <div>
          <label className="text-label text-ink-secondary font-medium mb-2 block">Amount</label>
          <div className="flex gap-2 mb-2">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`flex-1 py-2.5 rounded-sm text-body-s font-medium transition-colors ${
                  selectedPreset === preset
                    ? "bg-terracotta text-white"
                    : "bg-cream-200 text-ink hover:bg-cream-300"
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>
          <Input
            type="number"
            placeholder="Custom amount"
            value={customAmount}
            onChange={handleCustomChange}
            min={1}
            max={1000}
          />
        </div>

        {/* Purchaser Info */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Purchaser Name</label>
            <Input value={purchaserName} onChange={(e) => setPurchaserName(e.target.value)} placeholder="John Doe" />
          </div>
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Purchaser Email</label>
            <Input type="email" value={purchaserEmail} onChange={(e) => setPurchaserEmail(e.target.value)} placeholder="john@email.com" />
          </div>
        </div>

        {/* Recipient Info */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Recipient Name <span className="text-ink-secondary/60">(optional)</span></label>
            <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Recipient Email <span className="text-ink-secondary/60">(optional)</span></label>
            <Input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="jane@email.com" />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="text-label text-ink-secondary font-medium mb-1 block">Message <span className="text-ink-secondary/60">(optional)</span></label>
          <textarea
            className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-body-s text-ink placeholder:text-ink-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30 resize-none"
            rows={2}
            maxLength={200}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Happy Birthday! Enjoy your visit."
          />
        </div>

        {/* Expiration & Payment */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Expires <span className="text-ink-secondary/60">(optional)</span></label>
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
          <div>
            <label className="text-label text-ink-secondary font-medium mb-1 block">Payment Method</label>
            <Select options={PAYMENT_OPTIONS} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || amount < 1} className="flex-1">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : `Issue $${amount} Gift Card`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
