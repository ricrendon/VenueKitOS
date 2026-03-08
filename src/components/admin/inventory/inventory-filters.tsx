"use client";

import { Input, Select } from "@/components/ui";
import { Search } from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "Socks", label: "Socks" },
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Merchandise", label: "Merchandise" },
  { value: "Party Supplies", label: "Party Supplies" },
  { value: "Operational", label: "Operational" },
];

const STOCK_STATUS_OPTIONS = [
  { value: "", label: "All Stock Levels" },
  { value: "low", label: "Low Stock" },
  { value: "out", label: "Out of Stock" },
];

interface InventoryFiltersProps {
  search: string;
  category: string;
  stockStatus: string;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onStockStatusChange: (stockStatus: string) => void;
}

export function InventoryFilters({
  search,
  category,
  stockStatus,
  onSearchChange,
  onCategoryChange,
  onStockStatusChange,
}: InventoryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, SKU, or supplier..."
          className="pl-9"
        />
      </div>
      <div className="w-full sm:w-48">
        <Select
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-44">
        <Select
          options={STOCK_STATUS_OPTIONS}
          value={stockStatus}
          onChange={(e) => onStockStatusChange(e.target.value)}
        />
      </div>
    </div>
  );
}
