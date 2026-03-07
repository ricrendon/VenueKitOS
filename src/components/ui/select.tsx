"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-label text-ink mb-1.5 font-medium">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "flex h-[52px] w-full appearance-none rounded-sm border bg-cream-50 px-4 pr-10 text-body-m text-ink transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta",
              error ? "border-error" : "border-cream-300",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>{placeholder}</option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-secondary" />
        </div>
        {error && <p className="mt-1.5 text-caption text-error">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-caption text-ink-secondary">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
