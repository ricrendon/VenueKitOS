"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, Badge, Input } from "@/components/ui";
import { Users, Loader2, Plus, X, Check, FileCheck, AlertCircle } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { format } from "date-fns";

interface ChildItem {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  allergies: string | null;
  specialNeeds: string | null;
  waiverStatus: string;
  waiverSignedAt: string | null;
  waiverExpiresAt: string | null;
}

const childColors = ["#C96E4B", "#7F9BB3", "#8EAA92", "#D9B25F", "#9B8BAE"];

export default function PortalChildrenPage() {
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    allergies: "",
    specialNeeds: "",
  });

  const fetchChildren = (userId: string) => {
    fetch(`/api/portal/children?authUserId=${userId}`)
      .then((res) => res.json())
      .then((json) => {
        setChildren(json.children || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        return;
      }
      setAuthUserId(user.id);
      fetchChildren(user.id);
    });
  }, []);

  const handleAddChild = async () => {
    if (!authUserId || !form.firstName || !form.lastName || !form.dateOfBirth) return;

    setSaving(true);
    try {
      const res = await fetch("/api/portal/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authUserId,
          firstName: form.firstName,
          lastName: form.lastName,
          dateOfBirth: form.dateOfBirth,
          allergies: form.allergies || null,
          specialNeeds: form.specialNeeds || null,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setForm({ firstName: "", lastName: "", dateOfBirth: "", allergies: "", specialNeeds: "" });
        fetchChildren(authUserId);
      }
    } catch {
      // Silent
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-h1 text-ink">My Children</h1>
          <p className="text-body-m text-ink-secondary">Manage your children&apos;s profiles and waiver status.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add child"}
        </Button>
      </div>

      {/* Add child form */}
      {showForm && (
        <Card>
          <CardContent className="space-y-4">
            <h3 className="font-display text-h4 text-ink">Add a child</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First name"
                placeholder="Emma"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
              <Input
                label="Last name"
                placeholder="Smith"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <Input
              label="Date of birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            />
            <Input
              label="Allergies (optional)"
              placeholder="e.g., Peanuts, Latex"
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            />
            <Input
              label="Special needs (optional)"
              placeholder="Any accommodations needed"
              value={form.specialNeeds}
              onChange={(e) => setForm({ ...form, specialNeeds: e.target.value })}
            />
            <Button
              onClick={handleAddChild}
              disabled={saving || !form.firstName || !form.lastName || !form.dateOfBirth}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "Saving..." : "Add child"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Children list */}
      {children.length > 0 ? (
        <div className="space-y-4">
          {children.map((child, i) => (
            <Card key={child.id}>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div
                    className="h-14 w-14 rounded-full flex items-center justify-center text-white font-display font-semibold text-body-l shrink-0"
                    style={{ backgroundColor: childColors[i % childColors.length] }}
                  >
                    {child.firstName[0]}{child.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-h4 text-ink">
                        {child.firstName} {child.lastName}
                      </h3>
                      <Badge variant={child.waiverStatus === "signed" ? "success" : "error"}>
                        {child.waiverStatus === "signed" ? "Waiver active" : "Waiver needed"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                      <div>
                        <p className="text-caption text-ink-secondary">Age</p>
                        <p className="text-body-s text-ink font-medium">{child.age} years old</p>
                      </div>
                      <div>
                        <p className="text-caption text-ink-secondary">Birthday</p>
                        <p className="text-body-s text-ink font-medium">
                          {format(new Date(child.dateOfBirth + "T12:00:00"), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-caption text-ink-secondary">Waiver expires</p>
                        <p className="text-body-s text-ink font-medium">
                          {child.waiverExpiresAt
                            ? format(new Date(child.waiverExpiresAt), "MMM d, yyyy")
                            : "Not signed"}
                        </p>
                      </div>
                    </div>
                    {(child.allergies || child.specialNeeds) && (
                      <div className="mt-3 pt-3 border-t border-cream-200 flex flex-wrap gap-3">
                        {child.allergies && (
                          <div className="flex items-center gap-1.5 text-body-s">
                            <AlertCircle className="h-3.5 w-3.5 text-warning" />
                            <span className="text-ink-secondary">Allergies: {child.allergies}</span>
                          </div>
                        )}
                        {child.specialNeeds && (
                          <div className="flex items-center gap-1.5 text-body-s">
                            <AlertCircle className="h-3.5 w-3.5 text-dusty-blue" />
                            <span className="text-ink-secondary">Needs: {child.specialNeeds}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {child.waiverStatus !== "signed" && (
                    <Link href="/waivers/sign">
                      <Button size="sm" variant="secondary">
                        <FileCheck className="h-4 w-4" /> Sign waiver
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
            <h3 className="font-display text-h4 text-ink mb-2">No children added yet</h3>
            <p className="text-body-s text-ink-secondary mb-4">
              Add your children to manage their waivers and bookings.
            </p>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" /> Add your first child
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
