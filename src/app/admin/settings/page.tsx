"use client";

import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";
import {
  Building2, Clock, Globe, PartyPopper, CreditCard,
  HelpCircle, FileText, Settings, Link2, Shield,
} from "lucide-react";
import { VenueInfoForm } from "@/components/admin/settings/venue-info-form";
import { OperatingHoursForm } from "@/components/admin/settings/operating-hours-form";
import { WebsiteContentForm } from "@/components/admin/settings/website-content-form";
import { FaqEditor } from "@/components/admin/settings/faq-editor";
import { PoliciesForm } from "@/components/admin/settings/policies-form";
import { OperationsForm } from "@/components/admin/settings/operations-form";
import { IntegrationsSection } from "@/components/admin/settings/integrations-section";
import { StaffPermissionsForm } from "@/components/admin/settings/staff-permissions-form";

interface VenueData {
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  timezone: string;
  logo_url: string | null;
  hero_image_url: string | null;
  settings: Record<string, unknown>;
  operating_hours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[];
  website_content: Record<string, unknown>;
}

const tabs = [
  { id: "venue", label: "Venue Info", icon: Building2 },
  { id: "hours", label: "Hours", icon: Clock },
  { id: "website", label: "Website", icon: Globe },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "policies", label: "Policies", icon: FileText },
  { id: "operations", label: "Operations", icon: Settings },
  { id: "integrations", label: "Integrations", icon: Link2 },
  { id: "permissions", label: "Permissions", icon: Shield },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function SettingsPage() {
  const [venue, setVenue] = useState<VenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("venue");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchVenue = () => {
    setLoading(true);
    fetch("/api/admin/venue")
      .then((res) => res.json())
      .then((json) => {
        setVenue(json.venue || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchVenue();
  }, []);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleSave = async (payload: any) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/venue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "Failed to save changes.");
        setSaving(false);
        return;
      }

      setVenue(body.venue);
      setSuccess("Changes saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !venue) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  const wc = (venue.website_content || {}) as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-h1 text-ink">Settings</h1>
        <p className="text-body-m text-ink-secondary">Manage your venue, website content, and integrations.</p>
      </div>

      {/* Success/Error messages */}
      {success && (
        <div className="px-4 py-3 rounded-md bg-success-light border border-success/30 text-body-s text-success flex items-center gap-2">
          <Check className="h-4 w-4" /> {success}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-md bg-error-light border border-error/30 text-body-s text-error">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 border-b border-cream-300 pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setError(""); setSuccess(""); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-body-s font-medium rounded-t-md transition-colors ${
                isActive
                  ? "bg-white text-terracotta border border-cream-300 border-b-white -mb-px"
                  : "text-ink-secondary hover:text-ink hover:bg-cream-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "venue" && (
          <VenueInfoForm
            data={{
              name: venue.name,
              address: venue.address,
              city: venue.city,
              state: venue.state,
              zip: venue.zip,
              phone: venue.phone,
              email: venue.email,
              timezone: venue.timezone,
            }}
            onSave={(fields) => handleSave(fields)}
            saving={saving}
          />
        )}

        {activeTab === "hours" && (
          <OperatingHoursForm
            data={venue.operating_hours || []}
            onSave={(hours) => handleSave({ operating_hours: hours })}
            saving={saving}
          />
        )}

        {activeTab === "website" && (
          <WebsiteContentForm
            data={{
              hero: (wc.hero as any) || { headline: "", description: "" },
              trustStats: (wc.trustStats as any) || { rating: "", ratingSource: "", familiesServed: "", reviews: "" },
              valueProps: (wc.valueProps as { sectionTitle: string; sectionSubtitle: string; items: { icon: string; title: string; description: string }[] }) || { sectionTitle: "", sectionSubtitle: "", items: [] },
              about: (wc.about as { description: string }) || { description: "" },
            }}
            onSave={(content) => handleSave({ website_content: content })}
            saving={saving}
          />
        )}

        {activeTab === "faq" && (
          <FaqEditor
            data={(wc.faq as { categories: { title: string; items: { id: string; question: string; answer: string }[] }[] }) || { categories: [] }}
            onSave={(faq) => handleSave({ website_content: { faq } })}
            saving={saving}
          />
        )}

        {activeTab === "policies" && (
          <PoliciesForm
            data={(wc.policies as { cancellationHours: number; cancellationText: string; waiverPolicyText: string; depositPercentage: number; depositPolicyText: string }) || {
              cancellationHours: 24,
              cancellationText: "",
              waiverPolicyText: "",
              depositPercentage: 50,
              depositPolicyText: "",
            }}
            onSave={(policies) => handleSave({ website_content: { policies } })}
            saving={saving}
          />
        )}

        {activeTab === "operations" && (
          <OperationsForm
            data={(venue.settings as {
              requireWaiverBeforeBooking: boolean;
              waiverExpirationDays: number;
              maxCapacity: number;
              sessionDurationMinutes: number;
              bookingLeadTimeHours: number;
              cancellationPolicyHours: number;
              taxRate: number;
            }) || {
              requireWaiverBeforeBooking: true,
              waiverExpirationDays: 365,
              maxCapacity: 200,
              sessionDurationMinutes: 90,
              bookingLeadTimeHours: 0.5,
              cancellationPolicyHours: 24,
              taxRate: 0.08,
            }}
            onSave={(settings) => handleSave({ settings })}
            saving={saving}
          />
        )}

        {activeTab === "integrations" && (
          <IntegrationsSection />
        )}

        {activeTab === "permissions" && (
          <StaffPermissionsForm />
        )}
      </div>
    </div>
  );
}
