"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Legacy route redirect.
 * Old: /admin/inventory/[id] → New: /admin/inventory/items/[id]
 */
export default function LegacyItemRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/admin/inventory/items/${params.id}`);
  }, [params.id, router]);

  return null;
}
