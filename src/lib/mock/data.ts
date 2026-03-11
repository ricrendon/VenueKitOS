// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

// ─── Constants ────────────────────────────────────────────────────────────────
export const DEMO_VENUE_NAME = "Adventure Play Co.";
export const DEMO_VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function mockDashboard(period = "30d") {
  const trendDays = period === "today" ? 1 : period === "7d" ? 7 : 30;
  const revenueLast30 = Array.from({ length: trendDays }, (_, i) => ({
    date: daysAgo(trendDays - 1 - i),
    revenue: Math.round((900 + Math.sin(i * 0.6) * 350 + (i % 7 < 2 ? 400 : 0)) * 100) / 100,
  }));
  const visitorsLast14 = Array.from({ length: 14 }, (_, i) => ({
    date: daysAgo(13 - i),
    visitors: 30 + Math.round(Math.sin(i * 0.7) * 12) + (i % 7 < 2 ? 25 : 0),
  }));
  return {
    kpis: {
      guestsToday: 47,
      checkedIn: 31,
      revenueToday: 1243.50,
      partiesToday: 2,
      activeMemberships: 84,
      signedWaivers: 312,
      guestsTrend: 12,
      revenueTrend: 8,
    },
    trends: {
      revenueLast30,
      revenueBreakdown: { openPlay: 4820, parties: 3200, cafe: 1150, memberships: 1680 },
      visitorsLast14,
    },
    bookings: [
      { id: "b001", name: "Jessica Martinez", time: "10:00 AM", children: 3, type: "Open Play", status: "confirmed", paymentStatus: "paid", confirmationCode: "OPL-9821", checkedIn: true },
      { id: "b002", name: "David Kim", time: "11:00 AM", children: 2, type: "Open Play", status: "confirmed", paymentStatus: "paid", confirmationCode: "OPL-9822", checkedIn: true },
      { id: "b003", name: "Sarah Johnson", time: "1:00 PM", children: 4, type: "Open Play", status: "confirmed", paymentStatus: "paid", confirmationCode: "OPL-9823", checkedIn: false },
      { id: "b004", name: "Michael Torres", time: "2:00 PM", children: 2, type: "Open Play", status: "confirmed", paymentStatus: "paid", confirmationCode: "OPL-9824", checkedIn: false },
      { id: "b005", name: "Emily Chen", time: "3:30 PM", children: 5, type: "Party", status: "confirmed", paymentStatus: "partial", confirmationCode: "PTY-1105", checkedIn: false },
    ],
    parties: [
      { id: "p001", name: "Lily's Birthday", time: "2:00 PM", package: "Deluxe Party", guests: 20, room: "Safari Room", status: "confirmed", balanceRemaining: 150.00 },
      { id: "p002", name: "Noah's Birthday", time: "5:00 PM", package: "Classic Party", guests: 15, room: "Adventure Room", status: "confirmed", balanceRemaining: 0 },
    ],
    alerts: [
      { type: "warning", message: "2 confirmed booking(s) not yet checked in", action: "View check-in" },
    ],
  };
}

// ─── Reservations ─────────────────────────────────────────────────────────────
export function mockReservations() {
  const t = todayStr();
  return {
    reservations: [
      { id: "b001", parentName: "Jessica Martinez", parentEmail: "jessica@example.com", date: t, time: "10:00 AM", childCount: 3, adultCount: 2, type: "Open Play", status: "confirmed", paymentStatus: "paid", total: 54.00, confirmationCode: "OPL-9821" },
      { id: "b002", parentName: "David Kim", parentEmail: "david@example.com", date: t, time: "11:00 AM", childCount: 2, adultCount: 1, type: "Open Play", status: "confirmed", paymentStatus: "paid", total: 36.00, confirmationCode: "OPL-9822" },
      { id: "b003", parentName: "Sarah Johnson", parentEmail: "sarah@example.com", date: t, time: "1:00 PM", childCount: 4, adultCount: 2, type: "Open Play", status: "confirmed", paymentStatus: "paid", total: 72.00, confirmationCode: "OPL-9823" },
      { id: "b004", parentName: "Michael Torres", parentEmail: "michael@example.com", date: t, time: "2:00 PM", childCount: 2, adultCount: 1, type: "Open Play", status: "confirmed", paymentStatus: "paid", total: 36.00, confirmationCode: "OPL-9824" },
      { id: "b005", parentName: "Emily Chen", parentEmail: "emily@example.com", date: t, time: "3:30 PM", childCount: 5, adultCount: 3, type: "Party", status: "confirmed", paymentStatus: "partial", total: 450.00, confirmationCode: "PTY-1105" },
      { id: "b006", parentName: "Ryan Patel", parentEmail: "ryan@example.com", date: daysAgo(1), time: "10:00 AM", childCount: 2, adultCount: 2, type: "Open Play", status: "confirmed", paymentStatus: "paid", total: 36.00, confirmationCode: "OPL-9820" },
      { id: "b007", parentName: "Amanda Wilson", parentEmail: "amanda@example.com", date: daysAgo(1), time: "2:00 PM", childCount: 3, adultCount: 1, type: "Open Play", status: "confirmed", paymentStatus: "paid", total: 54.00, confirmationCode: "OPL-9819" },
      { id: "b008", parentName: "Brandon Lee", parentEmail: "brandon@example.com", date: daysAgo(2), time: "11:00 AM", childCount: 1, adultCount: 1, type: "Open Play", status: "confirmed", paymentStatus: "paid", total: 18.00, confirmationCode: "OPL-9818" },
    ],
  };
}

// ─── Check-in ─────────────────────────────────────────────────────────────────
export function mockCheckIn() {
  return {
    bookings: [
      { id: "b001", parentName: "Jessica Martinez", parentEmail: "jessica@example.com", parentPhone: "(555) 210-0001", time: "10:00 AM", childCount: 3, adultCount: 2, type: "Open Play", status: "confirmed", confirmationCode: "OPL-9821", checkedIn: true, checkedInAt: new Date().toISOString() },
      { id: "b002", parentName: "David Kim", parentEmail: "david@example.com", parentPhone: "(555) 210-0002", time: "11:00 AM", childCount: 2, adultCount: 1, type: "Open Play", status: "confirmed", confirmationCode: "OPL-9822", checkedIn: true, checkedInAt: new Date().toISOString() },
      { id: "b003", parentName: "Sarah Johnson", parentEmail: "sarah@example.com", parentPhone: "(555) 210-0003", time: "1:00 PM", childCount: 4, adultCount: 2, type: "Open Play", status: "confirmed", confirmationCode: "OPL-9823", checkedIn: false, checkedInAt: null },
      { id: "b004", parentName: "Michael Torres", parentEmail: "michael@example.com", parentPhone: "(555) 210-0004", time: "2:00 PM", childCount: 2, adultCount: 1, type: "Open Play", status: "confirmed", confirmationCode: "OPL-9824", checkedIn: false, checkedInAt: null },
      { id: "b005", parentName: "Emily Chen", parentEmail: "emily@example.com", parentPhone: "(555) 210-0005", time: "3:30 PM", childCount: 5, adultCount: 3, type: "Party", status: "confirmed", confirmationCode: "PTY-1105", checkedIn: false, checkedInAt: null },
    ],
    capacity: { current: 31, max: 200 },
  };
}

// ─── Families ─────────────────────────────────────────────────────────────────
export const mockFamilies = {
  families: [
    { id: "f001", firstName: "Jessica", lastName: "Martinez", email: "jessica@example.com", phone: "(555) 210-0001", hasAuth: true, createdAt: daysAgo(120), children: [{ id: "c001", firstName: "Sophia", lastName: "Martinez", dateOfBirth: "2019-05-14", allergies: null, avatarColor: "#C96E4B" }, { id: "c002", firstName: "Lucas", lastName: "Martinez", dateOfBirth: "2021-09-03", allergies: "Peanuts", avatarColor: "#8EAA92" }] },
    { id: "f002", firstName: "David", lastName: "Kim", email: "david@example.com", phone: "(555) 210-0002", hasAuth: true, createdAt: daysAgo(90), children: [{ id: "c003", firstName: "Ethan", lastName: "Kim", dateOfBirth: "2020-01-22", allergies: null, avatarColor: "#D9B25F" }, { id: "c004", firstName: "Mia", lastName: "Kim", dateOfBirth: "2022-07-11", allergies: null, avatarColor: "#7F9BB3" }] },
    { id: "f003", firstName: "Sarah", lastName: "Johnson", email: "sarah@example.com", phone: "(555) 210-0003", hasAuth: true, createdAt: daysAgo(60), children: [{ id: "c005", firstName: "Olivia", lastName: "Johnson", dateOfBirth: "2018-11-30", allergies: null, avatarColor: "#C96E4B" }, { id: "c006", firstName: "Noah", lastName: "Johnson", dateOfBirth: "2020-04-17", allergies: "Dairy", avatarColor: "#8EAA92" }, { id: "c007", firstName: "Emma", lastName: "Johnson", dateOfBirth: "2022-12-05", allergies: null, avatarColor: "#D9B25F" }] },
    { id: "f004", firstName: "Michael", lastName: "Torres", email: "michael@example.com", phone: "(555) 210-0004", hasAuth: true, createdAt: daysAgo(45), children: [{ id: "c008", firstName: "Ava", lastName: "Torres", dateOfBirth: "2021-03-08", allergies: null, avatarColor: "#7F9BB3" }] },
    { id: "f005", firstName: "Emily", lastName: "Chen", email: "emily@example.com", phone: "(555) 210-0005", hasAuth: false, createdAt: daysAgo(30), children: [{ id: "c009", firstName: "Lily", lastName: "Chen", dateOfBirth: "2019-08-25", allergies: null, avatarColor: "#C96E4B" }, { id: "c010", firstName: "William", lastName: "Chen", dateOfBirth: "2021-06-14", allergies: null, avatarColor: "#8EAA92" }] },
    { id: "f006", firstName: "Ryan", lastName: "Patel", email: "ryan@example.com", phone: "(555) 210-0006", hasAuth: true, createdAt: daysAgo(20), children: [{ id: "c011", firstName: "Arjun", lastName: "Patel", dateOfBirth: "2020-10-02", allergies: "Tree nuts", avatarColor: "#D9B25F" }] },
  ],
};

// ─── Memberships ──────────────────────────────────────────────────────────────
export const mockMemberships = {
  plans: [
    { id: "pl001", name: "Starter", description: "Perfect for occasional visitors", monthly_price: 29.99, annual_price: 299.99, max_children: 1, includes_open_play: true, party_discount: 10, guest_passes: 0, features: ["Unlimited open play for 1 child", "10% party discount"] },
    { id: "pl002", name: "Family", description: "Great for families with multiple kids", monthly_price: 49.99, annual_price: 499.99, max_children: 3, includes_open_play: true, party_discount: 15, guest_passes: 2, features: ["Unlimited open play for up to 3 children", "15% party discount", "2 guest passes/month"] },
    { id: "pl003", name: "Premium", description: "Ultimate experience for the whole family", monthly_price: 79.99, annual_price: 799.99, max_children: 5, includes_open_play: true, party_discount: 20, guest_passes: 4, features: ["Unlimited open play for up to 5 children", "20% party discount", "4 guest passes/month", "Priority party booking"] },
  ],
  memberships: [
    { id: "m001", status: "active", startDate: daysAgo(180), nextBillingDate: daysAgo(-15), parentName: "Jessica Martinez", parentEmail: "jessica@example.com", planName: "Family", monthlyPrice: 49.99 },
    { id: "m002", status: "active", startDate: daysAgo(90), nextBillingDate: daysAgo(-5), parentName: "David Kim", parentEmail: "david@example.com", planName: "Starter", monthlyPrice: 29.99 },
    { id: "m003", status: "active", startDate: daysAgo(60), nextBillingDate: daysAgo(-10), parentName: "Sarah Johnson", parentEmail: "sarah@example.com", planName: "Premium", monthlyPrice: 79.99 },
    { id: "m004", status: "active", startDate: daysAgo(45), nextBillingDate: daysAgo(-20), parentName: "Ryan Patel", parentEmail: "ryan@example.com", planName: "Family", monthlyPrice: 49.99 },
    { id: "m005", status: "active", startDate: daysAgo(30), nextBillingDate: daysAgo(-1), parentName: "Amanda Wilson", parentEmail: "amanda@example.com", planName: "Starter", monthlyPrice: 29.99 },
  ],
  kpis: { activeMembers: 84, pausedMembers: 3, monthlyRecurringRevenue: 3829.16, totalPlans: 3 },
};

// ─── Staff ────────────────────────────────────────────────────────────────────
export const mockStaff = {
  staff: [
    { id: "s001", auth_user_id: "auth-001", first_name: "Marcus", last_name: "Johnson", role: "venue_manager", email: "marcus@adventureplayco.com", phone: "(555) 300-0001", active: true, created_at: daysAgo(365) },
    { id: "s002", auth_user_id: "auth-002", first_name: "Priya", last_name: "Sharma", role: "front_desk_staff", email: "priya@adventureplayco.com", phone: "(555) 300-0002", active: true, created_at: daysAgo(200) },
    { id: "s003", auth_user_id: "auth-003", first_name: "Tyler", last_name: "Brooks", role: "party_host", email: "tyler@adventureplayco.com", phone: "(555) 300-0003", active: true, created_at: daysAgo(150) },
    { id: "s004", auth_user_id: "auth-004", first_name: "Chloe", last_name: "Davis", role: "front_desk_staff", email: "chloe@adventureplayco.com", phone: "(555) 300-0004", active: true, created_at: daysAgo(100) },
    { id: "s005", auth_user_id: "auth-005", first_name: "Jordan", last_name: "Reed", role: "party_host", email: "jordan@adventureplayco.com", phone: "(555) 300-0005", active: false, created_at: daysAgo(250) },
  ],
  kpis: { totalStaff: 5, activeStaff: 4, terminatedStaff: 1, byRole: { venue_manager: 1, front_desk_staff: 2, party_host: 1 } },
};

// ─── Permissions ──────────────────────────────────────────────────────────────
export const mockPermissions = {
  allowedPages: [
    "dashboard", "reservations", "check-in", "families", "memberships",
    "staff", "reports", "venue", "waivers", "gift-cards",
    "incidents", "inventory", "menu", "social", "time-clock",
  ],
};

// ─── Venue ────────────────────────────────────────────────────────────────────
export const mockVenue = {
  venue: {
    id: DEMO_VENUE_ID,
    name: DEMO_VENUE_NAME,
    slug: "adventure-play-co",
    address: "123 Fun Street",
    city: "Austin",
    state: "TX",
    zip: "78701",
    phone: "(512) 555-0100",
    email: "hello@adventureplayco.com",
    timezone: "America/Chicago",
    logo_url: null,
    hero_image_url: null,
    settings: { maxCapacity: 200, openingTime: "09:00", closingTime: "19:00" },
    operating_hours: [
      { day: "Monday", open: "09:00", close: "19:00", closed: false },
      { day: "Tuesday", open: "09:00", close: "19:00", closed: false },
      { day: "Wednesday", open: "09:00", close: "19:00", closed: false },
      { day: "Thursday", open: "09:00", close: "19:00", closed: false },
      { day: "Friday", open: "09:00", close: "20:00", closed: false },
      { day: "Saturday", open: "09:00", close: "20:00", closed: false },
      { day: "Sunday", open: "10:00", close: "18:00", closed: false },
    ],
    website_content: { tagline: "Where Little Adventures Begin", description: "Adventure Play Co. is Austin's premier indoor playground for children ages 0-12." },
    created_at: daysAgo(400),
    updated_at: daysAgo(5),
  },
};

// ─── Waivers ──────────────────────────────────────────────────────────────────
export const mockWaivers = {
  waivers: [
    { id: "w001", parentName: "Jessica Martinez", parentEmail: "jessica@example.com", childName: "Sophia Martinez", status: "signed", signedAt: daysAgo(120), expiresAt: daysAgo(-245), emergencyContact: "Carlos Martinez", emergencyPhone: "(555) 210-1001" },
    { id: "w002", parentName: "Jessica Martinez", parentEmail: "jessica@example.com", childName: "Lucas Martinez", status: "signed", signedAt: daysAgo(120), expiresAt: daysAgo(-245), emergencyContact: "Carlos Martinez", emergencyPhone: "(555) 210-1001" },
    { id: "w003", parentName: "David Kim", parentEmail: "david@example.com", childName: "Ethan Kim", status: "signed", signedAt: daysAgo(90), expiresAt: daysAgo(-275), emergencyContact: "Grace Kim", emergencyPhone: "(555) 210-1002" },
    { id: "w004", parentName: "Sarah Johnson", parentEmail: "sarah@example.com", childName: "Olivia Johnson", status: "signed", signedAt: daysAgo(60), expiresAt: daysAgo(-305), emergencyContact: "Tom Johnson", emergencyPhone: "(555) 210-1003" },
    { id: "w005", parentName: "Michael Torres", parentEmail: "michael@example.com", childName: "Ava Torres", status: "signed", signedAt: daysAgo(45), expiresAt: daysAgo(-320), emergencyContact: "Maria Torres", emergencyPhone: "(555) 210-1004" },
    { id: "w006", parentName: "Emily Chen", parentEmail: "emily@example.com", childName: "Lily Chen", status: "signed", signedAt: daysAgo(30), expiresAt: daysAgo(-335), emergencyContact: "James Chen", emergencyPhone: "(555) 210-1005" },
    { id: "w007", parentName: "Ryan Patel", parentEmail: "ryan@example.com", childName: "Arjun Patel", status: "expired", signedAt: daysAgo(400), expiresAt: daysAgo(35), emergencyContact: "Priya Patel", emergencyPhone: "(555) 210-1006" },
  ],
};

// ─── Gift Cards ────────────────────────────────────────────────────────────────
export const mockGiftCards = {
  giftCards: [
    { id: "gc001", code: "GC-A8KP3M", initialValue: 50, currentBalance: 50, status: "active", purchaserName: "Karen White", purchaserEmail: "karen@example.com", recipientName: "Anna White", recipientEmail: "anna@example.com", message: "Happy Birthday!", paymentMethod: "card", purchasedAt: daysAgo(5), expiresAt: daysAgo(-360), createdAt: daysAgo(5) },
    { id: "gc002", code: "GC-B7NQ4X", initialValue: 100, currentBalance: 75, status: "active", purchaserName: "Tom Bradley", purchaserEmail: "tom@example.com", recipientName: null, recipientEmail: null, message: null, paymentMethod: "cash", purchasedAt: daysAgo(15), expiresAt: daysAgo(-350), createdAt: daysAgo(15) },
    { id: "gc003", code: "GC-C3ZR7Y", initialValue: 25, currentBalance: 0, status: "redeemed", purchaserName: "Lisa Green", purchaserEmail: "lisa@example.com", recipientName: "Emma Green", recipientEmail: "emma@example.com", message: null, paymentMethod: "card", purchasedAt: daysAgo(60), expiresAt: daysAgo(-305), createdAt: daysAgo(60) },
  ],
  kpis: { totalActive: 18, activeBalance: 1240.50, totalRedeemed: 42, totalIssued: 63 },
};

// ─── Incidents ────────────────────────────────────────────────────────────────
export const mockIncidents = {
  incidents: [
    { id: "i001", venue_id: DEMO_VENUE_ID, type: "minor_injury", title: "Child scraped knee on climbing structure", description: "A 4-year-old scraped their knee on the edge of the climbing wall. Minor scrape treated on-site.", severity: "low", affected_area: "Climbing Zone", status: "resolved", reported_by: "s002", resolved_by: "s001", resolved_at: daysAgo(5), resolution_cost: 0, reporter_name: "Priya Sharma", resolver_name: "Marcus Johnson", created_at: daysAgo(5) },
    { id: "i002", venue_id: DEMO_VENUE_ID, type: "equipment", title: "Trampoline spring came loose", description: "One spring on the mini trampoline became detached. Area cordoned off pending repair.", severity: "medium", affected_area: "Trampoline Zone", status: "resolved", reported_by: "s003", resolved_by: "s001", resolved_at: daysAgo(10), resolution_cost: 85, reporter_name: "Tyler Brooks", resolver_name: "Marcus Johnson", created_at: daysAgo(12) },
    { id: "i003", venue_id: DEMO_VENUE_ID, type: "behavior", title: "Altercation between two children", description: "Two children had a brief conflict in the ball pit area. Parents were notified and situation de-escalated.", severity: "low", affected_area: "Ball Pit", status: "closed", reported_by: "s004", resolved_by: "s004", resolved_at: daysAgo(20), resolution_cost: 0, reporter_name: "Chloe Davis", resolver_name: "Chloe Davis", created_at: daysAgo(20) },
    { id: "i004", venue_id: DEMO_VENUE_ID, type: "safety", title: "Wet floor near cafe — slip hazard", description: "A spilled drink was not cleaned up promptly creating a slip hazard near the cafe entrance.", severity: "medium", affected_area: "Cafe", status: "open", reported_by: "s001", resolved_by: null, resolved_at: null, resolution_cost: 0, reporter_name: "Marcus Johnson", resolver_name: null, created_at: daysAgo(1) },
  ],
  kpis: { total: 4, open: 1, resolvedThisMonth: 2, avgResolutionCost: 28.33 },
  charts: {
    byType: [{ type: "minor_injury", count: 1 }, { type: "equipment", count: 1 }, { type: "behavior", count: 1 }, { type: "safety", count: 1 }],
    bySeverity: [{ severity: "low", count: 2 }, { severity: "medium", count: 2 }],
  },
};

// ─── Inventory ────────────────────────────────────────────────────────────────
export const MOCK_INVENTORY_ITEMS = [
  { id: "inv001", venueId: DEMO_VENUE_ID, name: "Foam Block Set (Large)", sku: "FBS-001", barcode: null, category: "Play Equipment", categoryId: null, subcategoryId: null, itemType: "standard", description: "Large foam blocks for toddler play area", price: 0, cost: 120, unit: "set", uomId: null, imageUrl: null, active: true, sellable: false, trackInventory: true, trackExpiration: false, preferredVendorId: "v001", reorderLevel: 2, reorderQty: 5, parLevel: 4, leadTimeDays: 7, countFrequency: "monthly", supplier: "PlaySafe Supplies", createdAt: daysAgo(200), updatedAt: daysAgo(30), onHand: 6, reserved: 0, available: 6, avgUnitCost: 120, vendorName: "PlaySafe Supplies" },
  { id: "inv002", venueId: DEMO_VENUE_ID, name: "Hand Sanitizer (1L)", sku: "HS-001", barcode: "8901234567890", category: "Cleaning & Safety", categoryId: null, subcategoryId: null, itemType: "consumable", description: "Hospital-grade hand sanitizer for stations", price: 0, cost: 8.50, unit: "bottle", uomId: null, imageUrl: null, active: true, sellable: false, trackInventory: true, trackExpiration: true, preferredVendorId: "v002", reorderLevel: 10, reorderQty: 24, parLevel: 20, leadTimeDays: 3, countFrequency: "weekly", supplier: "CleanPro Inc.", createdAt: daysAgo(180), updatedAt: daysAgo(7), onHand: 8, reserved: 0, available: 8, avgUnitCost: 8.50, vendorName: "CleanPro Inc." },
  { id: "inv003", venueId: DEMO_VENUE_ID, name: "Party Balloon Pack (100ct)", sku: "PBP-100", barcode: null, category: "Party Supplies", categoryId: null, subcategoryId: null, itemType: "consumable", description: "Assorted color balloons for party rooms", price: 0, cost: 12.00, unit: "pack", uomId: null, imageUrl: null, active: true, sellable: false, trackInventory: true, trackExpiration: false, preferredVendorId: "v001", reorderLevel: 5, reorderQty: 10, parLevel: 8, leadTimeDays: 5, countFrequency: "weekly", supplier: "PlaySafe Supplies", createdAt: daysAgo(150), updatedAt: daysAgo(14), onHand: 4, reserved: 2, available: 2, avgUnitCost: 12.00, vendorName: "PlaySafe Supplies" },
  { id: "inv004", venueId: DEMO_VENUE_ID, name: "Juice Box (Apple, 200ml)", sku: "JBX-APL", barcode: "0012345678901", category: "Cafe", categoryId: null, subcategoryId: null, itemType: "consumable", description: "Individually packaged apple juice boxes", price: 2.50, cost: 0.85, unit: "each", uomId: null, imageUrl: null, active: true, sellable: true, trackInventory: true, trackExpiration: true, preferredVendorId: "v003", reorderLevel: 48, reorderQty: 96, parLevel: 72, leadTimeDays: 2, countFrequency: "daily", supplier: "Bevco Foods", createdAt: daysAgo(120), updatedAt: daysAgo(1), onHand: 35, reserved: 0, available: 35, avgUnitCost: 0.85, vendorName: "Bevco Foods" },
  { id: "inv005", venueId: DEMO_VENUE_ID, name: "Wristband (Daily Entry)", sku: "WRB-DAY", barcode: null, category: "Admission", categoryId: null, subcategoryId: null, itemType: "consumable", description: "Color-coded daily entry wristbands", price: 0, cost: 0.15, unit: "each", uomId: null, imageUrl: null, active: true, sellable: false, trackInventory: true, trackExpiration: false, preferredVendorId: "v002", reorderLevel: 200, reorderQty: 500, parLevel: 300, leadTimeDays: 5, countFrequency: "daily", supplier: "CleanPro Inc.", createdAt: daysAgo(100), updatedAt: daysAgo(1), onHand: 180, reserved: 0, available: 180, avgUnitCost: 0.15, vendorName: "CleanPro Inc." },
];

export const mockInventoryOverview = {
  kpis: {
    totalInventoryValue: 4218.75,
    lowStockItems: 3,
    outOfStockItems: 0,
    openPurchaseOrders: 2,
    reservedForBookings: 2,
    wasteThisMonth: 45.50,
  },
  lowStockAlerts: [
    { id: "inv002", name: "Hand Sanitizer (1L)", sku: "HS-001", category: "Cleaning & Safety", quantityOnHand: 8, reorderLevel: 10 },
    { id: "inv003", name: "Party Balloon Pack (100ct)", sku: "PBP-100", category: "Party Supplies", quantityOnHand: 4, reorderLevel: 5 },
    { id: "inv004", name: "Juice Box (Apple, 200ml)", sku: "JBX-APL", category: "Cafe", quantityOnHand: 35, reorderLevel: 48 },
  ],
  recentActivity: [
    { id: "la001", itemId: "inv004", itemName: "Juice Box (Apple, 200ml)", itemSku: "JBX-APL", eventType: "sale", quantityDelta: -12, notes: "POS sale", occurredAt: new Date().toISOString() },
    { id: "la002", itemId: "inv005", itemName: "Wristband (Daily Entry)", itemSku: "WRB-DAY", eventType: "issue", quantityDelta: -47, notes: "Daily check-in", occurredAt: new Date().toISOString() },
    { id: "la003", itemId: "inv002", itemName: "Hand Sanitizer (1L)", itemSku: "HS-001", eventType: "receipt", quantityDelta: 12, notes: "PO received", occurredAt: new Date(Date.now() - 86400000).toISOString() },
  ],
  alerts: [],
};

export function mockInventoryItems() {
  return {
    items: MOCK_INVENTORY_ITEMS,
    kpis: { totalItems: 5, lowStock: 3, totalValue: 4218.75, outOfStock: 0 },
  };
}

export const mockInventoryCategories = {
  categories: [
    { id: "cat001", name: "Play Equipment", description: "Soft play structures and interactive equipment", itemCount: 1 },
    { id: "cat002", name: "Cleaning & Safety", description: "Sanitizers, PPE, and safety gear", itemCount: 1 },
    { id: "cat003", name: "Party Supplies", description: "Balloons, decorations, and party consumables", itemCount: 1 },
    { id: "cat004", name: "Cafe", description: "Food and beverage items", itemCount: 1 },
    { id: "cat005", name: "Admission", description: "Wristbands and entry items", itemCount: 1 },
  ],
};

export const mockInventoryLocations = {
  locations: [
    { id: "loc001", name: "Main Storage Room", description: "Primary storage for large items", type: "storage" },
    { id: "loc002", name: "Front Desk", description: "Items used at check-in", type: "active" },
    { id: "loc003", name: "Cafe Storage", description: "Cafe supplies and food items", type: "storage" },
    { id: "loc004", name: "Party Room Storage", description: "Party supplies and decorations", type: "storage" },
  ],
};

export const mockInventoryVendors = {
  vendors: [
    { id: "v001", venueId: DEMO_VENUE_ID, name: "PlaySafe Supplies", contactName: "Jennifer Walsh", email: "jennifer@playsafe.com", phone: "(800) 555-0101", leadTimeDays: 5, paymentTerms: "Net 30", active: true, notes: "Preferred supplier for play equipment", createdAt: daysAgo(300), updatedAt: daysAgo(30), itemCount: 2 },
    { id: "v002", venueId: DEMO_VENUE_ID, name: "CleanPro Inc.", contactName: "Bob Hayes", email: "bob@cleanpro.com", phone: "(800) 555-0102", leadTimeDays: 3, paymentTerms: "Net 15", active: true, notes: "Cleaning and safety supplies", createdAt: daysAgo(280), updatedAt: daysAgo(14), itemCount: 2 },
    { id: "v003", venueId: DEMO_VENUE_ID, name: "Bevco Foods", contactName: "Sandra Lee", email: "sandra@bevcofoods.com", phone: "(800) 555-0103", leadTimeDays: 2, paymentTerms: "COD", active: true, notes: "Cafe beverages and snacks", createdAt: daysAgo(200), updatedAt: daysAgo(7), itemCount: 1 },
  ],
};

export const mockInventoryTransactions = {
  transactions: [
    { id: "tx001", itemId: "inv004", itemName: "Juice Box (Apple, 200ml)", type: "sale", quantityChange: -12, quantityAfter: 35, referenceType: "pos", notes: "POS sale", occurredAt: new Date().toISOString() },
    { id: "tx002", itemId: "inv005", itemName: "Wristband (Daily Entry)", type: "issue", quantityChange: -47, quantityAfter: 180, referenceType: "manual", notes: "Daily check-in issue", occurredAt: new Date().toISOString() },
    { id: "tx003", itemId: "inv002", itemName: "Hand Sanitizer (1L)", type: "receipt", quantityChange: 12, quantityAfter: 8, referenceType: "purchase_order", notes: "PO #2024-011 received", occurredAt: new Date(Date.now() - 86400000).toISOString() },
  ],
};

// ─── Menu ─────────────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { id: "mi001", venueId: DEMO_VENUE_ID, name: "Apple Juice Box", description: "200ml juice box", price: 2.50, category: "Beverages", imageUrl: null, available: true, displayOrder: 1, createdAt: daysAgo(100), updatedAt: daysAgo(10) },
  { id: "mi002", venueId: DEMO_VENUE_ID, name: "Water Bottle", description: "16oz still water", price: 1.50, category: "Beverages", imageUrl: null, available: true, displayOrder: 2, createdAt: daysAgo(100), updatedAt: daysAgo(10) },
  { id: "mi003", venueId: DEMO_VENUE_ID, name: "Coffee (Small)", description: "12oz drip coffee", price: 3.00, category: "Beverages", imageUrl: null, available: true, displayOrder: 3, createdAt: daysAgo(100), updatedAt: daysAgo(10) },
  { id: "mi004", venueId: DEMO_VENUE_ID, name: "Goldfish Crackers", description: "Snack size bag", price: 1.50, category: "Snacks", imageUrl: null, available: true, displayOrder: 1, createdAt: daysAgo(100), updatedAt: daysAgo(10) },
  { id: "mi005", venueId: DEMO_VENUE_ID, name: "String Cheese", description: "1oz mozzarella stick", price: 1.25, category: "Snacks", imageUrl: null, available: true, displayOrder: 2, createdAt: daysAgo(100), updatedAt: daysAgo(10) },
  { id: "mi006", venueId: DEMO_VENUE_ID, name: "Fruit Snacks", description: "Mixed fruit gummy snacks", price: 1.75, category: "Snacks", imageUrl: null, available: true, displayOrder: 3, createdAt: daysAgo(100), updatedAt: daysAgo(10) },
  { id: "mi007", venueId: DEMO_VENUE_ID, name: "PB&J Half Sandwich", description: "Peanut butter and jelly on white bread", price: 3.50, category: "Meals", imageUrl: null, available: true, displayOrder: 1, createdAt: daysAgo(100), updatedAt: daysAgo(10) },
  { id: "mi008", venueId: DEMO_VENUE_ID, name: "Turkey Wrap", description: "Turkey and cheese in a flour tortilla", price: 5.50, category: "Meals", imageUrl: null, available: true, displayOrder: 2, createdAt: daysAgo(100), updatedAt: daysAgo(10) },
  { id: "mi009", venueId: DEMO_VENUE_ID, name: "Party Platter (Serves 10)", description: "Assorted finger foods for party guests", price: 45.00, category: "Party Add-ons", imageUrl: null, available: true, displayOrder: 1, createdAt: daysAgo(100), updatedAt: daysAgo(10) },
];

export const mockMenu = {
  items: MENU_ITEMS,
  grouped: {
    Beverages: MENU_ITEMS.filter((i) => i.category === "Beverages"),
    Snacks: MENU_ITEMS.filter((i) => i.category === "Snacks"),
    Meals: MENU_ITEMS.filter((i) => i.category === "Meals"),
    "Party Add-ons": MENU_ITEMS.filter((i) => i.category === "Party Add-ons"),
  },
};

// ─── Social ───────────────────────────────────────────────────────────────────
export const mockSocialAccounts = {
  accounts: [
    { id: "sa001", platform: "instagram", account_name: "adventureplayco", account_id: "ig-123", profile_picture_url: null, followers_count: 3240, connected_at: daysAgo(90), last_synced_at: daysAgo(1), status: "active" },
    { id: "sa002", platform: "facebook", account_name: "Adventure Play Co.", account_id: "fb-456", profile_picture_url: null, followers_count: 1850, connected_at: daysAgo(90), last_synced_at: daysAgo(1), status: "active" },
  ],
};

export const mockSocialMetrics = {
  hasAccounts: true,
  kpis: { totalFollowers: 5090, engagementRate: 4.2, messagesThisWeek: 28, profileViewsThisWeek: 842 },
  accounts: [
    { id: "sa001", platform: "instagram", accountName: "adventureplayco", followers: 3240, profilePicture: null, lastSynced: daysAgo(1) },
    { id: "sa002", platform: "facebook", accountName: "Adventure Play Co.", followers: 1850, profilePicture: null, lastSynced: daysAgo(1) },
  ],
  dailyMetrics: Array.from({ length: 7 }, (_, i) => ({
    date: daysAgo(6 - i),
    impressions: 800 + Math.round(Math.sin(i) * 200),
    reach: 600 + Math.round(Math.sin(i * 0.8) * 150),
    engagement_rate: 3.8 + Math.sin(i * 0.5) * 0.8,
    messages: 3 + Math.round(Math.sin(i * 1.2)),
  })),
};

// ─── Time Clock ───────────────────────────────────────────────────────────────
export function mockTimeClock() {
  const now = new Date();
  const clockInTime = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();
  const clockInTime2 = new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString();
  return {
    entries: [
      { id: "te001", venueId: DEMO_VENUE_ID, staffId: "s001", staffName: "Marcus Johnson", staffRole: "venue_manager", clockIn: clockInTime2, clockOut: null, breakMinutes: 0, notes: null, status: "active", hoursWorked: null },
      { id: "te002", venueId: DEMO_VENUE_ID, staffId: "s002", staffName: "Priya Sharma", staffRole: "front_desk_staff", clockIn: clockInTime, clockOut: null, breakMinutes: 0, notes: null, status: "active", hoursWorked: null },
      { id: "te003", venueId: DEMO_VENUE_ID, staffId: "s003", staffName: "Tyler Brooks", staffRole: "party_host", clockIn: new Date(now.getTime() - 28 * 60 * 60 * 1000).toISOString(), clockOut: new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString(), breakMinutes: 30, notes: null, status: "completed", hoursWorked: 7.5 },
    ],
    kpis: { staffOnClock: 2, hoursToday: 8.0, totalStaff: 4, weeklyHours: 62.5 },
    staff: [
      { id: "s001", name: "Marcus Johnson", role: "venue_manager", isClockedIn: true },
      { id: "s002", name: "Priya Sharma", role: "front_desk_staff", isClockedIn: true },
      { id: "s003", name: "Tyler Brooks", role: "party_host", isClockedIn: false },
      { id: "s004", name: "Chloe Davis", role: "front_desk_staff", isClockedIn: false },
    ],
  };
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export function mockReports(tab: string, period: string) {
  const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "12m" ? 365 : 30;
  const revenueTrend = Array.from({ length: days }, (_, i) => ({
    date: daysAgo(days - 1 - i),
    revenue: Math.round((900 + Math.sin(i * 0.6) * 350 + (i % 7 < 2 ? 400 : 0)) * 100) / 100,
  }));

  if (tab === "revenue") {
    return {
      dailyBySource: revenueTrend.map((d) => ({ date: d.date, openPlay: Math.round(d.revenue * 0.45 * 100) / 100, parties: Math.round(d.revenue * 0.30 * 100) / 100, cafe: Math.round(d.revenue * 0.10 * 100) / 100, memberships: Math.round(d.revenue * 0.15 * 100) / 100 })),
      comparison: { current: 32850, previous: 29400, changePercent: 12 },
      topDays: [
        { date: daysAgo(6), revenue: 2140.50, bookings: 24 },
        { date: daysAgo(13), revenue: 1980.00, bookings: 21 },
        { date: daysAgo(20), revenue: 1875.25, bookings: 19 },
        { date: daysAgo(7), revenue: 1820.00, bookings: 20 },
        { date: daysAgo(14), revenue: 1750.75, bookings: 18 },
      ],
      avgTransactionTrend: revenueTrend.map((d) => ({ date: d.date, avgValue: Math.round((d.revenue / 12) * 100) / 100 })),
    };
  }

  if (tab === "occupancy") {
    return {
      heatmap: Array.from({ length: 7 }, (_, dow) =>
        [10, 11, 12, 13, 14, 15, 16, 17].map((hour) => ({
          dayOfWeek: dow,
          hour,
          utilization: dow < 2 ? Math.min(100, 20 + Math.round(Math.random() * 30)) : Math.min(100, 45 + Math.round(Math.random() * 40)),
        }))
      ).flat(),
      fillRate: [10, 11, 12, 13, 14, 15, 16, 17].map((h) => ({ timeSlot: `${h}:00`, fillPercent: 30 + Math.round(Math.sin(h - 10) * 20) + 10 })),
      capacityTrend: revenueTrend.map((d) => ({ date: d.date, utilization: 30 + Math.round(Math.sin(revenueTrend.indexOf(d) * 0.5) * 15) })),
      busiestDays: [
        { date: daysAgo(6), dayName: "Sat", guests: 187 },
        { date: daysAgo(7), dayName: "Sun", guests: 162 },
        { date: daysAgo(13), dayName: "Sat", guests: 154 },
        { date: daysAgo(1), dayName: "Mon", guests: 98 },
        { date: daysAgo(4), dayName: "Thu", guests: 86 },
      ],
    };
  }

  if (tab === "customers") {
    return {
      newVsReturning: revenueTrend.map((d, i) => ({ date: d.date, new: 3 + Math.round(Math.sin(i) * 2), returning: 8 + Math.round(Math.sin(i * 0.7) * 3) })),
      memberSplit: { members: 142, nonMembers: 318 },
      membersByTier: [{ tier: "Family", count: 38 }, { tier: "Starter", count: 31 }, { tier: "Premium", count: 15 }],
      mrrTrend: Array.from({ length: 6 }, (_, i) => ({ month: `2025-${String(9 + i).padStart(2, "0")}`, mrr: 2800 + i * 180 })),
      churnRate: 4,
    };
  }

  // Default: overview
  return {
    kpis: {
      totalRevenue: 32850.00,
      revenueChange: 12,
      totalVisitors: 1240,
      visitorsChange: 8,
      avgRevenuePerVisitor: 26.49,
      avgRevenueChange: 4,
      bookingsCount: 460,
      bookingsChange: 6,
    },
    revenueTrend,
    revenueBreakdown: { openPlay: 14782.50, parties: 9855.00, cafe: 3285.00, memberships: 4927.50 },
    dailyVisitors: revenueTrend.map((d) => ({ date: d.date, visitors: 35 + Math.round(Math.sin(revenueTrend.indexOf(d) * 0.5) * 12) })),
  };
}
