"use client";

import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-sm bg-terracotta flex items-center justify-center">
              <span className="text-white font-display font-bold text-body-l">P</span>
            </div>
            <span className="font-display font-semibold text-h3 text-ink">Playground OS</span>
          </Link>
        </div>

        <div className="rounded-lg border border-cream-300 bg-cream-50 p-8 shadow-card">
          <h1 className="font-display text-h2 text-ink text-center">Create your account</h1>
          <p className="mt-2 text-body-m text-ink-secondary text-center">
            Join to book sessions, sign waivers, and manage your family.
          </p>

          <form className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First name" placeholder="Jane" />
              <Input label="Last name" placeholder="Smith" />
            </div>
            <Input label="Email" type="email" placeholder="jane@example.com" />
            <Input label="Phone" type="tel" placeholder="(555) 123-4567" />
            <Input label="Password" type="password" placeholder="Create a password" helperText="At least 8 characters" />

            <Button size="lg" className="w-full" type="submit">
              Create account <ArrowRight className="h-5 w-5" />
            </Button>
          </form>

          <p className="mt-4 text-caption text-ink-secondary text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>

          <div className="mt-6 text-center">
            <p className="text-body-s text-ink-secondary">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-terracotta hover:text-terracotta-hover font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
