"use client";

import { useState } from "react";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { Loader2, Check, Plus, Trash2 } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  items: FaqItem[];
}

interface FaqData {
  categories: FaqCategory[];
}

interface FaqEditorProps {
  data: FaqData;
  onSave: (faq: FaqData) => void;
  saving: boolean;
}

export function FaqEditor({ data, onSave, saving }: FaqEditorProps) {
  const [categories, setCategories] = useState<FaqCategory[]>(
    data.categories.map((cat) => ({
      title: cat.title,
      items: cat.items.map((item) => ({ ...item })),
    }))
  );

  const updateCategoryTitle = (catIndex: number, title: string) => {
    setCategories((prev) =>
      prev.map((cat, i) => (i === catIndex ? { ...cat, title } : cat))
    );
  };

  const updateItem = (
    catIndex: number,
    itemIndex: number,
    field: "question" | "answer",
    value: string
  ) => {
    setCategories((prev) =>
      prev.map((cat, ci) =>
        ci === catIndex
          ? {
              ...cat,
              items: cat.items.map((item, ii) =>
                ii === itemIndex ? { ...item, [field]: value } : item
              ),
            }
          : cat
      )
    );
  };

  const removeItem = (catIndex: number, itemIndex: number) => {
    setCategories((prev) =>
      prev.map((cat, ci) =>
        ci === catIndex
          ? { ...cat, items: cat.items.filter((_, ii) => ii !== itemIndex) }
          : cat
      )
    );
  };

  const addItem = (catIndex: number) => {
    setCategories((prev) =>
      prev.map((cat, ci) =>
        ci === catIndex
          ? {
              ...cat,
              items: [
                ...cat.items,
                {
                  id: crypto.randomUUID(),
                  question: "",
                  answer: "",
                },
              ],
            }
          : cat
      )
    );
  };

  const addCategory = () => {
    setCategories((prev) => [
      ...prev,
      { title: "New Category", items: [] },
    ]);
  };

  return (
    <div className="space-y-8">
      <h3 className="font-display text-h4 text-ink mb-4">
        Frequently Asked Questions
      </h3>

      {categories.map((category, catIndex) => (
        <div key={catIndex} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-body-s font-medium text-ink mb-1">
              Category Title
            </label>
            <Input
              value={category.title}
              onChange={(e) => updateCategoryTitle(catIndex, e.target.value)}
              placeholder="Category name"
            />
          </div>

          {category.items.map((item, itemIndex) => (
            <Card key={item.id}>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="space-y-1">
                        <label className="block text-body-s font-medium text-ink mb-1">
                          Question
                        </label>
                        <Input
                          value={item.question}
                          onChange={(e) =>
                            updateItem(
                              catIndex,
                              itemIndex,
                              "question",
                              e.target.value
                            )
                          }
                          placeholder="Enter question"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-body-s font-medium text-ink mb-1">
                          Answer
                        </label>
                        <textarea
                          value={item.answer}
                          onChange={(e) =>
                            updateItem(
                              catIndex,
                              itemIndex,
                              "answer",
                              e.target.value
                            )
                          }
                          placeholder="Enter answer"
                          className="flex w-full rounded-md border border-cream-300 bg-white px-3 py-2 text-body-s text-ink placeholder:text-ink-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta min-h-[80px] resize-y"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(catIndex, itemIndex)}
                      className="mt-7 shrink-0 rounded-md p-2 text-ink-secondary hover:text-error hover:bg-error/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => addItem(catIndex)}
          >
            <Plus className="h-4 w-4" /> Add Question
          </Button>
        </div>
      ))}

      <Button variant="secondary" onClick={addCategory}>
        <Plus className="h-4 w-4" /> Add Category
      </Button>

      <div className="flex justify-end pt-4">
        <Button onClick={() => onSave({ categories })} disabled={saving}>
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
