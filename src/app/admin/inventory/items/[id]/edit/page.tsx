"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ItemForm } from "@/components/admin/inventory/item-form";

export default function EditItemPage() {
  const params = useParams();
  const [item, setItem] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/inventory/items/${params.id}`)
      .then((r) => r.json())
      .then((json) => {
        setItem(json.item || null);
      })
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-20">
        <h2 className="font-display text-h3 text-ink">Item not found</h2>
      </div>
    );
  }

  return <ItemForm editItem={item} />;
}
