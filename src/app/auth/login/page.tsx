"use client";

import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-sm bg-terracotta flex items-center justify-center">
              <span className="text-white font-display font-bold text-body-l">P</span>
            </div>
            <span className="font-display font-semibold text-h3 text-ink">Playground OS</span>
          </Link>
        </div>

        <div className="rounded-lg border border-cream-300 bg-cream-50 p-8 shadow-card">
          <h1 className="font-display text-h2 text-ink text-center">Welcome back</h1>
          <p className="mt-2 text-body-m text-ink-secondary text-center">
            Sign in to manage your bookings and family.
          </p>

          <form className="mt-8 space-y-4">
            <Input label="Email" type="email" placeholder="jane@example.com" />
            <Input label="Password" type="password" placeholder="Enter your password" />

            <div className="flex items-center justify-between text-body-s">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-terracotta" />
                <span className="text-ink-secondary">Remember me</span>
              </label>
              <a href="#" className="text-terracotta hover:text-terracotta-hover transition-colors">
                Forgot password?
              </a>
            </div>

            <Button size="lg" className="w-full" type="submit">
              Sign in <ArrowRight className="h-5 w-5" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-body-s text-ink-secondary">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-terracotta hover:text-terracotta-hover font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-caption text-ink-secondary">
          <Link href="/" className="hover:text-ink transition-colors">Back to website</Link>
        </p>
      </div>
    </div>
  );
}
