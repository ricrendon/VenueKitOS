"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Badge } from "@/components/ui";
import { Users, Loader2 } from "lucide-react";
import { format, differenceInYears } from "date-fns";

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  allergies: string | null;
  avatarColor: string;
}

interface Family {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  hasAuth: boolean;
  createdAt: string;
  children: Child[];
}

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/families")
      .then((res) => res.json())
      .then((json) => {
        setFamilies(json.families || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  const totalChildren = families.reduce((sum, f) => sum + f.children.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-h1 text-ink">Families</h1>
          <p className="text-body-m text-ink-secondary">
            {families.length} famil{families.length !== 1 ? "ies" : "y"} · {totalChildren} child{totalChildren !== 1 ? "ren" : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {families.map((f) => (
          <Card key={f.id} className="hover:shadow-card-hover transition-shadow">
            <CardContent>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-h4 text-ink">
                    {f.firstName} {f.lastName}
                  </h3>
                  <p className="text-body-s text-ink-secondary">{f.email}</p>
                  {f.phone && <p className="text-body-s text-ink-secondary">{f.phone}</p>}
                </div>
                <div className="flex gap-2">
                  {f.hasAuth && (
                    <Badge variant="success" className="text-[11px]">Has Account</Badge>
                  )}
                  <Badge variant="default" className="text-[11px]">
                    {f.children.length} child{f.children.length !== 1 ? "ren" : ""}
                  </Badge>
                </div>
              </div>

              {f.children.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {f.children.map((c) => {
                    const age = c.dateOfBirth
                      ? differenceInYears(new Date(), new Date(c.dateOfBirth))
                      : null;
                    return (
                      <div
                        key={c.id}
                        className="flex items-center gap-2 px-3 py-2 bg-cream-100 rounded-md border border-cream-300"
                      >
                        <div
                          className="h-7 w-7 rounded-full flex items-center justify-center text-white text-caption font-medium shrink-0"
                          style={{ backgroundColor: c.avatarColor || "#C96E4B" }}
                        >
                          {c.firstName[0]}
                        </div>
                        <div>
                          <p className="text-body-s font-medium text-ink">
                            {c.firstName} {c.lastName}
                          </p>
                          <p className="text-caption text-ink-secondary">
                            {age !== null ? `Age ${age}` : ""}
                            {c.allergies ? ` · ⚠️ ${c.allergies}` : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {families.length === 0 && (
          <div className="py-12 text-center">
            <Users className="h-8 w-8 text-ink-secondary mx-auto mb-3" />
            <p className="text-body-m text-ink-secondary">No families found</p>
          </div>
        )}
      </div>
    </div>
  );
}
