// ===================================
// Inventory Management System — Constants
// ===================================

export const EVENT_TYPE_LABELS: Record<string, string> = {
  opening_balance: "Opening Balance",
  receive: "Received",
  sale: "Sold",
  refund: "Refunded",
  booking_reserve: "Reserved for Booking",
  booking_release: "Released from Booking",
  booking_consume: "Consumed by Booking",
  usage: "Used",
  waste: "Waste",
  spoilage: "Spoilage",
  adjustment: "Adjustment",
  transfer_out: "Transfer Out",
  transfer_in: "Transfer In",
  count_reconciliation: "Count Reconciliation",
  return_to_vendor: "Returned to Vendor",
  production_build: "Production Build",
  production_consume: "Production Consume",
};

export const PO_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  partially_received: "Partially Received",
  received: "Received",
  canceled: "Canceled",
};

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  released: "Released",
  consumed: "Consumed",
  expired: "Expired",
  canceled: "Canceled",
};

export const COUNT_MODE_LABELS: Record<string, string> = {
  full: "Full Count",
  filtered: "Filtered Count",
  blind: "Blind Count",
  spot_check: "Spot Check",
};

export const COUNT_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  completed: "Completed",
  canceled: "Canceled",
};

export const VARIANCE_REASON_LABELS: Record<string, string> = {
  breakage: "Breakage",
  spoilage: "Spoilage",
  theft: "Theft",
  miscount: "Miscount",
  unrecorded_usage: "Unrecorded Usage",
  transfer_error: "Transfer Error",
  unknown: "Unknown",
};

export const ALERT_TYPE_LABELS: Record<string, string> = {
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
  booking_conflict: "Booking Conflict",
  expiring_soon: "Expiring Soon",
  count_due: "Count Due",
  usage_spike: "Usage Spike",
  po_overdue: "PO Overdue",
};

export const ITEM_TYPE_LABELS: Record<string, string> = {
  standard: "Standard",
  ingredient: "Ingredient",
  supply: "Supply",
  equipment: "Equipment",
  service: "Service",
};

export const LOCATION_TYPE_LABELS: Record<string, string> = {
  storage: "Storage",
  sales_floor: "Sales Floor",
  kitchen: "Kitchen",
  bar: "Bar",
  backstock: "Backstock",
  closet: "Closet",
  room: "Room",
  display: "Display",
  other: "Other",
};

export const COUNT_FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
  as_needed: "As Needed",
};

export const ITEM_TYPE_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "ingredient", label: "Ingredient" },
  { value: "supply", label: "Supply" },
  { value: "equipment", label: "Equipment" },
  { value: "service", label: "Service" },
];

export const LOCATION_TYPE_OPTIONS = [
  { value: "storage", label: "Storage" },
  { value: "sales_floor", label: "Sales Floor" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bar", label: "Bar" },
  { value: "backstock", label: "Backstock" },
  { value: "closet", label: "Closet" },
  { value: "room", label: "Room" },
  { value: "display", label: "Display" },
  { value: "other", label: "Other" },
];

export const COUNT_FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "as_needed", label: "As Needed" },
];

// Badge variant mapping for categories
export const CATEGORY_BADGE_VARIANT: Record<string, "sage" | "mustard" | "dusty" | "terracotta" | "default"> = {
  "Food & Beverage": "mustard",
  "Merchandise": "dusty",
  "Party Supplies": "terracotta",
  "Socks": "sage",
  "Janitorial": "default",
  "Maintenance": "default",
  "Operational": "default",
};

// Badge variants for alert severity
export const ALERT_SEVERITY_VARIANT: Record<string, "warning" | "error" | "default"> = {
  info: "default",
  warning: "warning",
  critical: "error",
};

// Badge variants for PO status
export const PO_STATUS_VARIANT: Record<string, "sage" | "mustard" | "dusty" | "terracotta" | "default" | "success" | "warning" | "error"> = {
  draft: "default",
  submitted: "dusty",
  partially_received: "mustard",
  received: "sage",
  canceled: "error",
};
