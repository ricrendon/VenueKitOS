import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="bg-cream section-padding-lg">
      <div className="container-wide">
        <div className="relative bg-ink rounded-2xl overflow-hidden px-8 py-16 md:px-16 text-center">
          {/* Background effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-terracotta/8 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[200px] bg-sage/6 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative">
            <p className="text-caption font-semibold text-terracotta uppercase tracking-widest mb-4">
              Get started today
            </p>
            <h2 className="font-display font-semibold text-white leading-tight text-[36px] md:text-[48px] mb-5 max-w-2xl mx-auto">
              Ready to modernize your venue?
            </h2>
            <p className="text-body-l text-white/55 max-w-xl mx-auto mb-10">
              Join the operators running smarter, faster venues with VenueKit OS. Get a personalized demo and be live within the week.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/get-demo"
                className="inline-flex items-center gap-2 px-8 py-4 bg-terracotta text-white font-medium rounded-md hover:bg-terracotta-hover transition-all duration-200 shadow-lg shadow-terracotta/20 hover:-translate-y-0.5 text-body-m"
              >
                Request a Demo
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 text-white/70 hover:text-white font-medium rounded-md border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-200 text-body-m"
              >
                See Pricing
              </Link>
            </div>

            <p className="text-body-s text-white/30 mt-8">
              30-day free trial · No credit card required · Setup in under 24 hours
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
