"use client";

import { useState } from "react";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { Loader2, Check } from "lucide-react";

interface ValuePropItem {
  icon: string;
  title: string;
  description: string;
}

interface WebsiteContentData {
  hero: {
    headline: string;
    description: string;
  };
  trustStats: {
    rating: string;
    ratingSource: string;
    familiesServed: string;
    reviews: string;
  };
  valueProps: {
    sectionTitle: string;
    sectionSubtitle: string;
    items: ValuePropItem[];
  };
  about: {
    description: string;
  };
}

interface WebsiteContentFormProps {
  data: WebsiteContentData;
  onSave: (content: WebsiteContentData) => void;
  saving: boolean;
}

export function WebsiteContentForm({
  data,
  onSave,
  saving,
}: WebsiteContentFormProps) {
  const [hero, setHero] = useState({ ...data.hero });
  const [trustStats, setTrustStats] = useState({ ...data.trustStats });
  const [about, setAbout] = useState({ ...data.about });
  const [valueProps, setValueProps] = useState({
    sectionTitle: data.valueProps.sectionTitle,
    sectionSubtitle: data.valueProps.sectionSubtitle,
    items: data.valueProps.items.map((item) => ({ ...item })),
  });

  const updateValueProp = (
    index: number,
    field: keyof ValuePropItem,
    value: string
  ) => {
    setValueProps((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSave = () => {
    onSave({ hero, trustStats, valueProps, about });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div>
        <h3 className="font-display text-h4 text-ink mb-4">Hero Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-body-s font-medium text-ink mb-1">
              Headline
            </label>
            <Input
              value={hero.headline}
              onChange={(e) =>
                setHero((prev) => ({ ...prev, headline: e.target.value }))
              }
              placeholder="Main headline text"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-body-s font-medium text-ink mb-1">
              Description
            </label>
            <textarea
              value={hero.description}
              onChange={(e) =>
                setHero((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Hero description text"
              className="flex w-full rounded-md border border-cream-300 bg-white px-3 py-2 text-body-s text-ink placeholder:text-ink-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta min-h-[80px] resize-y"
            />
          </div>
        </div>
      </div>

      {/* Trust Statistics */}
      <div>
        <h3 className="font-display text-h4 text-ink mb-4">
          Trust Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-body-s font-medium text-ink mb-1">
              Rating
            </label>
            <Input
              value={trustStats.rating}
              onChange={(e) =>
                setTrustStats((prev) => ({ ...prev, rating: e.target.value }))
              }
              placeholder="4.9"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-body-s font-medium text-ink mb-1">
              Rating Source
            </label>
            <Input
              value={trustStats.ratingSource}
              onChange={(e) =>
                setTrustStats((prev) => ({
                  ...prev,
                  ratingSource: e.target.value,
                }))
              }
              placeholder="Google Reviews"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-body-s font-medium text-ink mb-1">
              Families Served
            </label>
            <Input
              value={trustStats.familiesServed}
              onChange={(e) =>
                setTrustStats((prev) => ({
                  ...prev,
                  familiesServed: e.target.value,
                }))
              }
              placeholder="10,000+"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-body-s font-medium text-ink mb-1">
              Reviews
            </label>
            <Input
              value={trustStats.reviews}
              onChange={(e) =>
                setTrustStats((prev) => ({ ...prev, reviews: e.target.value }))
              }
              placeholder="500+"
            />
          </div>
        </div>
      </div>

      {/* About */}
      <div>
        <h3 className="font-display text-h4 text-ink mb-4">About</h3>
        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink mb-1">
            Description
          </label>
          <textarea
            value={about.description}
            onChange={(e) =>
              setAbout((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="About your venue"
            className="flex w-full rounded-md border border-cream-300 bg-white px-3 py-2 text-body-s text-ink placeholder:text-ink-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta min-h-[80px] resize-y"
          />
        </div>
      </div>

      {/* Value Propositions */}
      <div>
        <h3 className="font-display text-h4 text-ink mb-4">
          Value Propositions
        </h3>
        <div className="space-y-4">
          {valueProps.items.map((item, index) => (
            <Card key={index}>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-body-s font-medium text-ink mb-1">
                      Icon
                    </label>
                    <Input
                      value={item.icon}
                      onChange={(e) =>
                        updateValueProp(index, "icon", e.target.value)
                      }
                      placeholder="Icon name (e.g. Shield)"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-body-s font-medium text-ink mb-1">
                      Title
                    </label>
                    <Input
                      value={item.title}
                      onChange={(e) =>
                        updateValueProp(index, "title", e.target.value)
                      }
                      placeholder="Value prop title"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-body-s font-medium text-ink mb-1">
                      Description
                    </label>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateValueProp(index, "description", e.target.value)
                      }
                      placeholder="Value prop description"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}{" "}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
