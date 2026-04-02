// ===================================
// Inventory Management System — Types
// ===================================

// --- Enums ---

export type ItemType = "standard" | "ingredient" | "supply" | "equipment" | "service";

export type LocationType = "storage" | "sales_floor" | "kitchen" | "bar" | "backstock" | "closet" | "room" | "display" | "other";

export type LedgerEventType =
  | "opening_balance" | "receive" | "sale" | "refund"
  | "booking_reserve" | "booking_release" | "booking_consume"
  | "usage" | "waste" | "spoilage" | "adjustment"
  | "transfer_out" | "transfer_in" | "count_reconciliation"
  | "return_to_vendor" | "production_build" | "production_consume";

export type LedgerReferenceType = "purchase_order" | "receipt" | "order" | "booking" | "count_session" | "transfer" | "manual";

export type ReservationStatus = "active" | "released" | "consumed" | "expired" | "canceled";

export type POStatus = "draft" | "submitted" | "partially_received" | "received" | "canceled";

export type CountSessionStatus = "draft" | "in_progress" | "completed" | "canceled";

export type CountMode = "full" | "filtered" | "blind" | "spot_check";

export type VarianceReason = "breakage" | "spoilage" | "theft" | "miscount" | "unrecorded_usage" | "transfer_error" | "unknown";

export type AlertType = "low_stock" | "out_of_stock" | "booking_conflict" | "expiring_soon" | "count_due" | "usage_spike" | "po_overdue";

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertStatus = "active" | "dismissed" | "resolved";

export type CountFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "annual" | "as_needed";

// --- Core Entities ---

export interface ItemCategory {
  id: string;
  venueId: string;
  name: string;
  sortOrder: number;
  active: boolean;
}

export interface ItemSubcategory {
  id: string;
  categoryId: string;
  name: string;
  sortOrder: number;
  active: boolean;
}

export interface UnitOfMeasure {
  id: string;
  venueId: string;
  name: string;
  code: string;
  precision: number;
}

export interface InventoryLocation {
  id: string;
  venueId: string;
  name: string;
  locationType: LocationType;
  active: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Computed
  itemCount?: number;
}

export interface Vendor {
  id: string;
  venueId: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  leadTimeDays: number;
  paymentTerms: string | null;
  active: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Computed
  itemCount?: number;
}

export interface VendorItem {
  id: string;
  vendorId: string;
  itemId: string;
  vendorSku: string | null;
  packSize: number;
  packUom: string | null;
  minOrderQty: number;
  lastPrice: number | null;
  preferred: boolean;
  // Joined
  itemName?: string;
  itemSku?: string;
}

export interface InventoryItem {
  id: string;
  venueId: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  category: string;
  categoryId: string | null;
  subcategoryId: string | null;
  itemType: ItemType;
  description: string | null;
  price: number;
  cost: number | null;
  unit: string;
  uomId: string | null;
  imageUrl: string | null;
  active: boolean;
  sellable: boolean;
  trackInventory: boolean;
  trackExpiration: boolean;
  preferredVendorId: string | null;
  reorderLevel: number;
  reorderQty: number;
  parLevel: number;
  leadTimeDays: number;
  countFrequency: CountFrequency;
  supplier: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined balance data
  onHand?: number;
  reserved?: number;
  available?: number;
  avgUnitCost?: number;
  // Joined names
  vendorName?: string;
  categoryName?: string;
  locationName?: string;
}

// --- Ledger & Balances ---

export interface LedgerEntry {
  id: string;
  venueId: string;
  locationId: string | null;
  itemId: string;
  eventType: LedgerEventType;
  quantityDelta: number;
  unitCost: number | null;
  referenceType: LedgerReferenceType | null;
  referenceId: string | null;
  correlationId: string | null;
  notes: string | null;
  occurredAt: string;
  createdBy: string | null;
  createdAt: string;
  // Joined
  itemName?: string;
  itemSku?: string;
  locationName?: string;
  createdByName?: string;
}

export interface InventoryBalance {
  venueId: string;
  locationId: string | null;
  itemId: string;
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  avgUnitCost: number;
  lastUpdatedAt: string;
  // Joined
  itemName?: string;
  locationName?: string;
}

// --- Reservations ---

export interface InventoryReservation {
  id: string;
  venueId: string;
  bookingId: string | null;
  itemId: string;
  locationId: string | null;
  reservedQty: number;
  status: ReservationStatus;
  expiresAt: string | null;
  createdAt: string;
  releasedAt: string | null;
  consumedAt: string | null;
}

// --- Purchasing ---

export interface PurchaseOrder {
  id: string;
  venueId: string;
  vendorId: string;
  poNumber: string;
  status: POStatus;
  orderedAt: string | null;
  expectedAt: string | null;
  notes: string | null;
  createdBy: string | null;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined
  vendorName?: string;
  lineCount?: number;
  totalAmount?: number;
}

export interface PurchaseOrderLine {
  id: string;
  purchaseOrderId: string;
  itemId: string;
  orderedQty: number;
  orderedUom: string | null;
  unitCost: number;
  lineTotal: number;
  notes: string | null;
  // Joined
  itemName?: string;
  itemSku?: string;
  receivedQty?: number;
}

export interface Receipt {
  id: string;
  purchaseOrderId: string | null;
  venueId: string;
  locationId: string | null;
  receivedAt: string;
  receivedBy: string | null;
  notes: string | null;
}

export interface ReceiptLine {
  id: string;
  receiptId: string;
  purchaseOrderLineId: string | null;
  itemId: string;
  receivedQty: number;
  rejectedQty: number;
  receivedUnitCost: number | null;
  notes: string | null;
}

// --- Counts ---

export interface CountSession {
  id: string;
  venueId: string;
  locationId: string | null;
  sessionName: string;
  status: CountSessionStatus;
  countMode: CountMode;
  assignedTo: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  // Computed
  locationName?: string;
  assignedToName?: string;
  totalVariance?: number;
  lineCount?: number;
}

export interface CountLine {
  id: string;
  countSessionId: string;
  itemId: string;
  expectedQty: number;
  countedQty: number | null;
  varianceQty: number;
  varianceReason: VarianceReason | null;
  notes: string | null;
  // Joined
  itemName?: string;
  itemSku?: string;
}

// --- Alerts ---

export interface InventoryAlert {
  id: string;
  venueId: string;
  itemId: string;
  alertType: AlertType;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
  dismissedAt: string | null;
  dismissedBy: string | null;
  // Joined
  itemName?: string;
  itemSku?: string;
}

// --- Overview KPIs ---

export interface InventoryOverviewKPIs {
  totalInventoryValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  openPurchaseOrders: number;
  reservedForBookings: number;
  wasteThisMonth: number;
}
