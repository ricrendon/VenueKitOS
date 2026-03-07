"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/booking/open-play", label: "Play" },
  { href: "/booking/party", label: "Parties" },
  { href: "/memberships", label: "Memberships" },
  { href: "/waivers", label: "Waivers" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-cream/95 backdrop-blur-md border-b border-cream-300 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container-content">
        <nav className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-sm bg-terracotta flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" />
                <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.6" />
                <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.6" />
                <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.3" />
              </svg>
            </div>
            <span className="font-display font-semibold text-h4 text-ink hidden sm:block">
              VenueKit <span className="text-terracotta">OS</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-body-s text-ink-secondary hover:text-ink transition-colors rounded-sm hover:bg-cream-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden md:block">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/booking/open-play">
              <Button size="sm">Book Now</Button>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 text-ink hover:bg-cream-200 rounded-sm"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-cream border-t border-cream-300 animate-fade-in">
          <div className="container-content py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 text-body-m text-ink hover:bg-cream-200 rounded-sm"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-cream-300 my-2" />
            <Link href="/auth/login" className="px-4 py-3 text-body-m text-ink-secondary" onClick={() => setMobileOpen(false)}>
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
