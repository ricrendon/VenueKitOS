"use client";

import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ title, value, change, changeType = "neutral", icon, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-cream-300 bg-cream-50 p-5 shadow-card",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label text-ink-secondary">{title}</p>
          <p className="mt-1 font-display text-h2 text-ink">{value}</p>
          {change && (
            <p
              className={cn(
                "mt-1 text-caption",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-error",
                changeType === "neutral" && "text-ink-secondary"
              )}
            >
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded-sm bg-cream-200 p-2.5 text-ink-secondary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
