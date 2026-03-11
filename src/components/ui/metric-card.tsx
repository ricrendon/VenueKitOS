"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

const ICON_BG: Record<string, string> = {
  terracotta: "bg-terracotta-light text-terracotta",
  sage: "bg-sage-light text-sage",
  "dusty-blue": "bg-dusty-blue-light text-dusty-blue",
  mustard: "bg-mustard-light text-mustard",
  coral: "bg-coral-light text-coral",
  info: "bg-info-light text-info",
};

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  iconColor?: "terracotta" | "sage" | "dusty-blue" | "mustard" | "coral" | "info";
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  iconColor,
  className,
}: MetricCardProps) {
  const iconBgClass = iconColor
    ? ICON_BG[iconColor] ?? "bg-cream-200 text-ink-secondary"
    : "bg-cream-200 text-ink-secondary";

  return (
    <div
      className={cn(
        "rounded-md border border-cream-300 bg-cream-50 p-5 shadow-card",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-label text-ink-secondary">{title}</p>
          <p className="mt-1 font-display text-[36px] leading-[44px] font-semibold text-ink tracking-tight">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                "mt-1.5 flex items-center gap-1 text-caption font-medium",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-error",
                changeType === "neutral" && "text-ink-secondary"
              )}
            >
              {changeType === "positive" && <TrendingUp className="h-3 w-3" />}
              {changeType === "negative" && <TrendingDown className="h-3 w-3" />}
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn("rounded-sm p-2.5 shrink-0", iconBgClass)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
