"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // 1) Sign up via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2) Create parent_accounts row via API route
    if (authData.user) {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authUserId: authData.user.id,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Failed to create account profile.");
        setLoading(false);
        return;
      }
    }

    // 3) Redirect to portal
    router.push("/portal");
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-sm bg-terracotta flex items-center justify-center">
              <span className="text-white font-display font-bold text-body-l">V</span>
            </div>
            <span className="font-display font-semibold text-h3 text-ink">VenueKit OS</span>
          </Link>
        </div>

        <div className="rounded-lg border border-cream-300 bg-cream-50 p-8 shadow-card">
          <h1 className="font-display text-h2 text-ink text-center">Create your account</h1>
          <p className="mt-2 text-body-m text-ink-secondary text-center">
            Join to book sessions, sign waivers, and manage your family.
          </p>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-md bg-error-light border border-error/30 text-body-s text-error">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <Input label="First name" placeholder="Jane" value={form.firstName} onChange={update("firstName")} required />
              <Input label="Last name" placeholder="Smith" value={form.lastName} onChange={update("lastName")} required />
            </div>
            <Input label="Email" type="email" placeholder="jane@example.com" value={form.email} onChange={update("email")} required />
            <Input label="Phone" type="tel" placeholder="(555) 123-4567" value={form.phone} onChange={update("phone")} />
            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              helperText="At least 8 characters"
              value={form.password}
              onChange={update("password")}
              required
            />

            <Button size="lg" className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Creating account…
                </>
              ) : (
                <>
                  Create account <ArrowRight className="h-5 w-5" />
                </>
              )}
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
