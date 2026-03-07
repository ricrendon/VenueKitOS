import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Platform", href: "/#platform" },
    { label: "Hardware", href: "/hardware" },
    { label: "Pricing", href: "/pricing" },
    { label: "How it Works", href: "/#how-it-works" },
  ],
  Operators: [
    { label: "Request a Demo", href: "/get-demo" },
    { label: "View Demo Dashboard", href: "/admin/dashboard" },
    { label: "View Client Site", href: "/venue-demo" },
    { label: "Hardware Leasing", href: "/hardware" },
    { label: "Setup Guide", href: "/#how-it-works" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="bg-ink text-white border-t border-white/8">
      <div className="container-wide py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
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
            <p className="text-body-s text-white/50 max-w-xs leading-relaxed">
              The complete operating system for modern venue operators. Bookings, check-in, POS, memberships, and more — all in one platform.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link
                href="/get-demo"
                className="px-5 py-2.5 bg-terracotta text-white text-body-s font-medium rounded-md hover:bg-terracotta-hover transition-colors"
              >
                Request a Demo
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-caption font-semibold text-white/40 uppercase tracking-widest mb-4">
                {group}
              </p>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-body-s text-white/55 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-white/8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-caption text-white/30">
            &copy; {new Date().getFullYear()} VenueKit OS. All rights reserved.
          </p>
          <p className="text-caption text-white/30">
            Built for playground operators, by operators.
          </p>
        </div>
      </div>
    </footer>
  );
}
