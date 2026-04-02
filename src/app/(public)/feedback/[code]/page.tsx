"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NPS_LABELS: Record<number, string> = {
  0: "Not at all likely",
  5: "Neutral",
  10: "Extremely likely",
};

export default function FeedbackPage() {
  const params = useParams();
  const code = typeof params.code === "string" ? params.code.toUpperCase() : "";

  const [nps, setNps] = useState<number | null>(null);
  const [stars, setStars] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nps === null || stars === null) {
      setError("Please complete the NPS score and star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingCode: code || null,
          npsScore: nps,
          starRating: stars,
          comment: comment.trim() || null,
          submitterName: name.trim() || null,
          submitterEmail: email.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission failed");
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-sage" />
          </div>
          <h1 className="font-display text-h2 text-ink">Thank you!</h1>
          <p className="text-body-m text-ink-secondary">
            Your feedback helps us improve the experience for every family.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-h2 text-ink">How was your visit?</h1>
          <p className="text-body-m text-ink-secondary mt-2">
            Takes less than a minute — your feedback means a lot.
          </p>
          {code && (
            <p className="text-caption text-ink-secondary mt-1">Booking: {code}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* NPS */}
          <div className="bg-white rounded-lg border border-cream-300 p-6 space-y-4">
            <p className="text-body-m font-medium text-ink">
              How likely are you to recommend us to a friend or family?
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: 11 }, (_, i) => {
                const isSelected = nps === i;
                const color =
                  i <= 6 ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200" :
                  i <= 8 ? "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200" :
                           "bg-green-100 text-green-700 border-green-200 hover:bg-green-200";
                const selectedColor =
                  i <= 6 ? "bg-red-500 text-white border-red-500" :
                  i <= 8 ? "bg-yellow-500 text-white border-yellow-500" :
                           "bg-green-500 text-white border-green-500";
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNps(i)}
                    className={cn(
                      "h-10 w-10 rounded-sm border text-body-s font-medium transition-colors",
                      isSelected ? selectedColor : color
                    )}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-caption text-ink-secondary">
              <span>{NPS_LABELS[0]}</span>
              <span>{NPS_LABELS[5]}</span>
              <span>{NPS_LABELS[10]}</span>
            </div>
          </div>

          {/* Star Rating */}
          <div className="bg-white rounded-lg border border-cream-300 p-6 space-y-4">
            <p className="text-body-m font-medium text-ink">Overall experience</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => {
                const filled = s <= (hoveredStar ?? stars ?? 0);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStars(s)}
                    onMouseEnter={() => setHoveredStar(s)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="transition-transform hover:scale-110"
                    aria-label={`${s} star${s !== 1 ? "s" : ""}`}
                  >
                    <Star
                      className={cn(
                        "h-9 w-9 transition-colors",
                        filled ? "fill-amber-400 text-amber-400" : "text-cream-300"
                      )}
                    />
                  </button>
                );
              })}
            </div>
            {stars && (
              <p className="text-caption text-ink-secondary">
                {["", "Poor", "Fair", "Good", "Great", "Excellent"][stars]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="bg-white rounded-lg border border-cream-300 p-6 space-y-3">
            <label className="text-body-m font-medium text-ink" htmlFor="comment">
              Anything you'd like to share? <span className="text-ink-secondary font-normal">(optional)</span>
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you love? What could be better?"
              className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-body-s text-ink placeholder:text-ink-secondary/60 resize-none focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition"
            />
          </div>

          {/* Optional contact */}
          <div className="bg-white rounded-lg border border-cream-300 p-6 space-y-4">
            <p className="text-body-m font-medium text-ink">
              Your name & email <span className="text-ink-secondary font-normal">(optional)</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name"
                className="rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-body-s text-ink placeholder:text-ink-secondary/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-body-s text-ink placeholder:text-ink-secondary/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition"
              />
            </div>
          </div>

          {error && (
            <p className="text-body-s text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || nps === null || stars === null}
            className="w-full bg-terracotta text-white rounded-sm py-3 text-body-m font-medium hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Submitting…" : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}
