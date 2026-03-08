// ===================================
// Playground OS — Core Type Definitions
// ===================================

// Auth & Users
export type UserRole =
  | "super_admin"
  | "venue_owner"
  | "venue_manager"
  | "front_desk_staff"
  | "party_host"
  | "parent_customer";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

// Venue
export interface Venue {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  timezone: string;
  logoUrl?: string;
  heroImageUrl?: string;
  operatingHours: OperatingHours[];
  settings: VenueSettings;
  websiteContent: WebsiteContent;
}

export interface OperatingHours {
  dayOfWeek: number; // 0=Sun, 6=Sat
  openTime: string;  // "09:00"
  closeTime: string; // "18:00"
  isClosed: boolean;
}

export interface VenueSettings {
  requireWaiverBeforeBooking: boolean;
  waiverExpirationDays: number;
  maxCapacity: number;
  sessionDurationMinutes: number;
  bookingLeadTimeHours: number;
  cancellationPolicyHours: number;
  taxRate: number;
}

// Website CMS Content (stored in venues.website_content JSONB)
export interface WebsiteContent {
  hero: {
    headline: string;
    description: string;
    imageUrl?: string | null;
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
    items: { icon: string; title: string; description: string }[];
  };
  about: {
    description: string;
  };
  faq: {
    categories: {
      title: string;
      items: { id: string; question: string; answer: string }[];
    }[];
  };
  policies: {
    cancellationHours: number;
    cancellationText: string;
    waiverPolicyText: string;
    depositPercentage: number;
    depositPolicyText: string;
  };
  openPlaySessions: {
    id: string;
    name: string;
    description: string;
    priceRange: string;
    perLabel: string;
  }[];
  openPlayTimeSlots: {
    time: string;
    label: string;
    endTime: string;
    price: number;
  }[];
}

// Families & Children
export interface ParentAccount {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  children: Child[];
  membershipId?: string;
  createdAt: string;
}

export interface Child {
  id: string;
  parentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  allergies?: string;
  specialNeeds?: string;
  waiverStatus: WaiverStatus;
  avatarColor?: string;
}

// Waivers
export type WaiverStatus = "signed" | "unsigned" | "expired";

export interface Waiver {
  id: string;
  parentId: string;
  childId: string;
  venueId: string;
  signedAt: string;
  expiresAt: string;
  status: WaiverStatus;
  signatureDataUrl: string;
  parentName: string;
  childName: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

// Bookings
export type BookingType = "open_play" | "party" | "private_event";
export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed" | "no_show";
export type PaymentStatus = "paid" | "partial" | "unpaid" | "refunded";

export interface Booking {
  id: string;
  venueId: string;
  parentId: string;
  type: BookingType;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  date: string;
  startTime: string;
  endTime: string;
  childCount: number;
  adultCount: number;
  subtotal: number;
  tax: number;
  total: number;
  confirmationCode: string;
  notes?: string;
  children: BookingGuest[];
  createdAt: string;
}

export interface BookingGuest {
  childId: string;
  childName: string;
  age: number;
  waiverStatus: WaiverStatus;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  available: number;
  price: number;
}

// Parties
export interface PartyPackage {
  id: string;
  venueId: string;
  name: string;
  description: string;
  price: number;
  includedChildren: number;
  durationMinutes: number;
  roomType: string;
  hostIncluded: boolean;
  foodIncluded: boolean;
  decorIncluded: boolean;
  bestFor?: string;
  features: string[];
  imageUrl?: string;
}

export interface PartyReservation {
  id: string;
  venueId: string;
  parentId: string;
  packageId: string;
  package: PartyPackage;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  date: string;
  startTime: string;
  endTime: string;
  childName: string;
  childBirthday: string;
  childAge: number;
  estimatedGuestCount: number;
  room?: string;
  addOns: PartyAddOn[];
  deposit: number;
  totalDue: number;
  balanceRemaining: number;
  specialNotes?: string;
  timeline: PartyTimelineItem[];
  createdAt: string;
}

export interface PartyAddOn {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface PartyTimelineItem {
  id: string;
  label: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

// Memberships
export type MembershipStatus = "active" | "paused" | "cancelled" | "past_due";

export interface MembershipPlan {
  id: string;
  venueId: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice?: number;
  features: string[];
  maxChildren: number;
  includesOpenPlay: boolean;
  partyDiscount?: number;
  guestPasses?: number;
}

export interface Membership {
  id: string;
  parentId: string;
  planId: string;
  plan: MembershipPlan;
  status: MembershipStatus;
  startDate: string;
  nextBillingDate: string;
  stripeSubscriptionId?: string;
  children: string[]; // child IDs
}

// Check-In
export interface CheckIn {
  id: string;
  bookingId: string;
  venueId: string;
  parentId: string;
  checkedInAt: string;
  checkedInBy: string;
  childCount: number;
  wristbandsPrinted: boolean;
}

// POS & Inventory
export type ProductCategory = 'Socks' | 'Food & Beverage' | 'Merchandise' | 'Party Supplies' | 'Operational';
export type StockTransactionType = 'received' | 'sold' | 'adjustment' | 'return' | 'damaged' | 'initial';

export interface Product {
  id: string;
  venueId: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  active: boolean;
  sku?: string;
  description?: string;
  cost?: number;
  quantityOnHand: number;
  reorderLevel: number;
  unit: string;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransaction {
  id: string;
  productId: string;
  type: StockTransactionType;
  quantityChange: number;
  quantityAfter: number;
  referenceType?: 'order' | 'manual' | 'pos';
  referenceId?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  venueId: string;
  parentId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: "open" | "completed" | "voided" | "refunded";
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Gift Cards
export type GiftCardStatus = "active" | "redeemed" | "expired" | "disabled";
export type GiftCardTransactionType = "purchase" | "redemption" | "adjustment" | "refund";

export interface GiftCard {
  id: string;
  venueId: string;
  code: string;
  initialValue: number;
  currentBalance: number;
  status: GiftCardStatus;
  purchaserName?: string;
  purchaserEmail?: string;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
  paymentMethod: string;
  purchasedAt: string;
  expiresAt?: string;
  createdAt: string;
}

export interface GiftCardTransaction {
  id: string;
  giftCardId: string;
  type: GiftCardTransactionType;
  amount: number;
  balanceAfter: number;
  referenceType?: "booking" | "order" | "manual";
  referenceId?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

// Dashboard KPIs
export interface DashboardKPIs {
  guestsToday: number;
  revenueToday: number;
  partiesToday: number;
  activeMemberships: number;
}
