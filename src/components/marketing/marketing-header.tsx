"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Hardware", href: "/hardware" },
  { label: "Pricing", href: "/pricing" },
  { label: "How it Works", href: "/#how-it-works" },
];

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-ink/95 backdrop-blur-md border-b border-white/8 shadow-lg"
          : "bg-transparent"
      )}
    >
      <div className="container-wide">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-md bg-terracotta flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" />
                <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.6" />
                <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.6" />
                <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.3" />
              </svg>
            </div>
            <span className="font-display font-semibold text-white text-[17px] tracking-tight">
              VenueKit <span className="text-terracotta">OS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-body-s font-medium text-white/70 hover:text-white rounded-md hover:bg-white/8 transition-all duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-body-s font-medium text-white/70 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/venue-demo"
              className="px-4 py-2 text-body-s font-medium text-white/70 hover:text-white rounded-md border border-white/16 hover:border-white/30 transition-all"
            >
              View Demo
            </Link>
            <Link
              href="/get-demo"
              className="px-5 py-2.5 bg-terracotta text-white text-body-s font-medium rounded-md hover:bg-terracotta-hover transition-colors shadow-sm"
            >
              Request a Demo
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-ink/98 backdrop-blur-md border-t border-white/8">
          <div className="container-wide py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-body-m text-white/70 hover:text-white hover:bg-white/6 rounded-md transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/8">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-body-m text-white hover:bg-white/6 rounded-md transition-all"
              >
                Log In
              </Link>
              <Link
                href="/venue-demo"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-body-m text-white/70 hover:text-white text-center rounded-md border border-white/16 hover:border-white/30 transition-all"
              >
                View Demo
              </Link>
              <Link
                href="/get-demo"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 bg-terracotta text-white text-body-m font-medium text-center rounded-md hover:bg-terracotta-hover transition-colors"
              >
                Request a Demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
