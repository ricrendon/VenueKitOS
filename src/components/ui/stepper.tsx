"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => (
        <div key={step} className="flex items-center flex-1 last:flex-initial">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-caption font-medium transition-all",
                index < currentStep && "bg-terracotta text-white",
                index === currentStep && "bg-terracotta text-white ring-4 ring-terracotta/20",
                index > currentStep && "bg-cream-200 text-ink-secondary"
              )}
            >
              {index < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-caption whitespace-nowrap",
                index <= currentStep ? "text-ink font-medium" : "text-ink-secondary"
              )}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "mx-3 h-0.5 flex-1 transition-colors",
                index < currentStep ? "bg-terracotta" : "bg-cream-300"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
