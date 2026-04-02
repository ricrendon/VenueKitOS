"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, type, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-label text-ink mb-1.5 font-medium"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            "flex h-[52px] w-full rounded-sm border bg-cream-50 px-4 text-body-m text-ink transition-colors",
            "placeholder:text-ink-secondary/60",
            "focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta",
            error
              ? "border-error focus:ring-error/30 focus:border-error"
              : "border-cream-300",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-caption text-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-caption text-ink-secondary">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
