"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Badge } from "@/components/ui";
import { Star, MessageSquare, TrendingUp, Users, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface FeedbackRow {
  id: string;
  booking_code: string | null;
  submitter_name: string | null;
  submitter_email: string | null;
  nps_score: number;
  star_rating: number;
  comment: string | null;
  submitted_at: string;
}

interface FeedbackStats {
  totalCount: number;
  avgStars: number;
  npsScore: number;
  promoters: number;
  detractors: number;
  passives: number;
  starDistribution: { stars: number; count: number }[];
}

function NpsCategory({ score }: { score: number }) {
  if (score >= 9) return <Badge variant="success" className="text-[11px]">Promoter</Badge>;
  if (score >= 7) return <Badge variant="warning" className="text-[11px]">Passive</Badge>;
  return <Badge variant="error" className="text-[11px]">Detractor</Badge>;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-cream-300"}`}
        />
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/feedback")
      .then((r) => r.json())
      .then((json) => {
        setFeedback(json.feedback ?? []);
        setStats(json.stats ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  const npsColor = !stats ? "text-ink" :
    stats.npsScore >= 50 ? "text-green-600" :
    stats.npsScore >= 0  ? "text-yellow-600" : "text-red-600";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-h1 text-ink">Guest Feedback</h1>
        <p className="text-body-m text-ink-secondary">NPS scores, star ratings, and guest comments</p>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-ink-secondary" />
                <span className="text-label text-ink-secondary">NPS Score</span>
              </div>
              <p className={`font-display text-h2 font-bold ${npsColor}`}>
                {stats.totalCount > 0 ? (stats.npsScore >= 0 ? `+${stats.npsScore}` : stats.npsScore) : "—"}
              </p>
              <p className="text-caption text-ink-secondary mt-0.5">
                {stats.promoters}P · {stats.passives}N · {stats.detractors}D
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-ink-secondary" />
                <span className="text-label text-ink-secondary">Avg Rating</span>
              </div>
              <p className="font-display text-h2 font-bold text-ink">
                {stats.totalCount > 0 ? stats.avgStars : "—"}
              </p>
              {stats.totalCount > 0 && (
                <StarDisplay rating={Math.round(stats.avgStars)} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-4 w-4 text-ink-secondary" />
                <span className="text-label text-ink-secondary">Responses</span>
              </div>
              <p className="font-display text-h2 font-bold text-ink">{stats.totalCount}</p>
              <p className="text-caption text-ink-secondary mt-0.5">total submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-ink-secondary" />
                <span className="text-label text-ink-secondary">Star Breakdown</span>
              </div>
              <div className="space-y-1">
                {[...stats.starDistribution].reverse().map(({ stars, count }) => {
                  const pct = stats.totalCount > 0 ? Math.round((count / stats.totalCount) * 100) : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-caption text-ink-secondary w-4">{stars}★</span>
                      <div className="flex-1 h-1.5 bg-cream-300 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-caption text-ink-secondary w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feedback Table */}
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-300">
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Guest</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Booking</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">NPS</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Stars</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Comment</th>
                  <th className="text-left text-label text-ink-secondary py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((f) => (
                  <tr key={f.id} className="border-b border-cream-200 hover:bg-cream-200/50 transition-colors">
                    <td className="py-3">
                      <div className="text-body-s text-ink font-medium">
                        {f.submitter_name ?? <span className="text-ink-secondary italic">Anonymous</span>}
                      </div>
                      {f.submitter_email && (
                        <div className="text-caption text-ink-secondary">{f.submitter_email}</div>
                      )}
                    </td>
                    <td className="py-3 text-body-s text-ink-secondary font-mono">
                      {f.booking_code ?? "—"}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-body-s font-medium text-ink">{f.nps_score}</span>
                        <NpsCategory score={f.nps_score} />
                      </div>
                    </td>
                    <td className="py-3">
                      <StarDisplay rating={f.star_rating} />
                    </td>
                    <td className="py-3 max-w-xs">
                      <p className="text-body-s text-ink-secondary truncate">
                        {f.comment ?? <span className="italic">No comment</span>}
                      </p>
                    </td>
                    <td className="py-3 text-body-s text-ink-secondary whitespace-nowrap">
                      {format(new Date(f.submitted_at), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {feedback.length === 0 && (
            <div className="py-12 text-center">
              <MessageSquare className="h-8 w-8 text-ink-secondary mx-auto mb-3" />
              <p className="text-body-m text-ink-secondary">No feedback yet</p>
              <p className="text-body-s text-ink-secondary mt-1">
                Share <code className="text-terracotta">/feedback/[booking-code]</code> with guests after their visit
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
