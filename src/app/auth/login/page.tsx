"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Get user ID
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    // Resolve role via server-side API (bypasses RLS)
    try {
      const roleRes = await fetch("/api/auth/resolve-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (roleRes.ok) {
        const { redirect } = await roleRes.json();
        router.push(redirect || "/");
        return;
      }
    } catch {
      // Fallback if API fails
    }

    // Fallback
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-sm bg-terracotta flex items-center justify-center">
              <span className="text-white font-display font-bold text-body-l">V</span>
            </div>
            <span className="font-display font-semibold text-h3 text-ink">VenueKit OS</span>
          </Link>
        </div>

        <div className="rounded-lg border border-cream-300 bg-cream-50 p-8 shadow-card">
          <h1 className="font-display text-h2 text-ink text-center">Welcome back</h1>
          <p className="mt-2 text-body-m text-ink-secondary text-center">
            Sign in to manage your venue or family account.
          </p>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-md bg-error-light border border-error/30 text-body-s text-error">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              placeholder="admin@wonderplay.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-body-s">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-terracotta" />
                <span className="text-ink-secondary">Remember me</span>
              </label>
              <a href="#" className="text-terracotta hover:text-terracotta-hover transition-colors">
                Forgot password?
              </a>
            </div>

            <Button size="lg" className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="h-5 w-5" />
                </>
              )}
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

        <p className="mt-4 text-center text-caption text-ink-secondary/60">
          Demo: <span className="font-mono text-ink-secondary">admin@wonderplay.com</span> / <span className="font-mono text-ink-secondary">WonderPlay2026!</span>
        </p>

        <p className="mt-2 text-center text-caption text-ink-secondary">
          <Link href="/" className="hover:text-ink transition-colors">Back to website</Link>
        </p>
      </div>
    </div>
  );
}
