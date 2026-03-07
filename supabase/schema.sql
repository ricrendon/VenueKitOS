-- ===================================
-- Playground OS — Database Schema
-- ===================================
-- Run this in your Supabase SQL editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- VENUES
-- ===================================
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  email TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  logo_url TEXT,
  hero_image_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- USERS & STAFF
-- ===================================
CREATE TABLE staff_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'venue_owner', 'venue_manager', 'front_desk_staff', 'party_host')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- PARENT ACCOUNTS & FAMILIES
-- ===================================
CREATE TABLE parent_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parent_accounts(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  allergies TEXT,
  special_needs TEXT,
  avatar_color TEXT DEFAULT '#7F9BB3',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- WAIVERS
-- ===================================
CREATE TABLE waivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES parent_accounts(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  parent_name TEXT NOT NULL,
  child_name TEXT NOT NULL,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  signature_data_url TEXT NOT NULL,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'signed' CHECK (status IN ('signed', 'unsigned', 'expired'))
);

-- ===================================
-- BOOKINGS
-- ===================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES parent_accounts(id),
  type TEXT NOT NULL CHECK (type IN ('open_play', 'party', 'private_event')),
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed', 'no_show')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'partial', 'unpaid', 'refunded')),
  date DATE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  child_count INTEGER DEFAULT 1,
  adult_count INTEGER DEFAULT 1,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  confirmation_code TEXT UNIQUE NOT NULL,
  notes TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE booking_guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id),
  child_name TEXT NOT NULL,
  age INTEGER,
  waiver_status TEXT DEFAULT 'unsigned'
);

-- ===================================
-- PARTY PACKAGES & RESERVATIONS
-- ===================================
CREATE TABLE party_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  included_children INTEGER DEFAULT 10,
  duration_minutes INTEGER DEFAULT 120,
  room_type TEXT,
  host_included BOOLEAN DEFAULT false,
  food_included BOOLEAN DEFAULT false,
  decor_included BOOLEAN DEFAULT false,
  best_for TEXT,
  features JSONB DEFAULT '[]',
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE party_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES parent_accounts(id),
  package_id UUID REFERENCES party_packages(id),
  booking_id UUID REFERENCES bookings(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed')),
  payment_status TEXT DEFAULT 'unpaid',
  date DATE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  child_name TEXT NOT NULL,
  child_birthday DATE,
  child_age INTEGER,
  estimated_guest_count INTEGER DEFAULT 10,
  room TEXT,
  deposit DECIMAL(10,2) DEFAULT 0,
  total_due DECIMAL(10,2) DEFAULT 0,
  balance_remaining DECIMAL(10,2) DEFAULT 0,
  special_notes TEXT,
  timeline JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE party_add_ons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  active BOOLEAN DEFAULT true
);

CREATE TABLE party_reservation_add_ons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES party_reservations(id) ON DELETE CASCADE,
  add_on_id UUID REFERENCES party_add_ons(id),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2)
);

-- ===================================
-- MEMBERSHIPS
-- ===================================
CREATE TABLE membership_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10,2) NOT NULL,
  annual_price DECIMAL(10,2),
  features JSONB DEFAULT '[]',
  max_children INTEGER DEFAULT 3,
  includes_open_play BOOLEAN DEFAULT true,
  party_discount INTEGER DEFAULT 0,
  guest_passes INTEGER DEFAULT 0,
  stripe_price_id TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parent_accounts(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES membership_plans(id),
  venue_id UUID REFERENCES venues(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'past_due')),
  start_date DATE NOT NULL,
  next_billing_date DATE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- CHECK-INS
-- ===================================
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES parent_accounts(id),
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  checked_in_by UUID REFERENCES staff_users(id),
  child_count INTEGER DEFAULT 1,
  wristbands_printed BOOLEAN DEFAULT false
);

-- ===================================
-- POS / PRODUCTS / ORDERS
-- ===================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES parent_accounts(id),
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'completed', 'voided', 'refunded')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL
);

-- ===================================
-- ROW-LEVEL SECURITY
-- ===================================

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Public read access for packages and plans (customer-facing)
CREATE POLICY "Public can view active party packages" ON party_packages FOR SELECT USING (active = true);
CREATE POLICY "Public can view active membership plans" ON membership_plans FOR SELECT USING (active = true);
CREATE POLICY "Public can view venue info" ON venues FOR SELECT USING (true);

-- Parents can only access their own data
CREATE POLICY "Parents see own account" ON parent_accounts FOR ALL USING (auth.uid() = auth_user_id);
CREATE POLICY "Parents see own children" ON children FOR ALL USING (parent_id IN (SELECT id FROM parent_accounts WHERE auth_user_id = auth.uid()));
CREATE POLICY "Parents see own waivers" ON waivers FOR ALL USING (parent_id IN (SELECT id FROM parent_accounts WHERE auth_user_id = auth.uid()));
CREATE POLICY "Parents see own bookings" ON bookings FOR ALL USING (parent_id IN (SELECT id FROM parent_accounts WHERE auth_user_id = auth.uid()));
CREATE POLICY "Parents see own memberships" ON memberships FOR ALL USING (parent_id IN (SELECT id FROM parent_accounts WHERE auth_user_id = auth.uid()));

-- Staff access (via service role or custom RLS based on staff_users role)
-- Note: Extend these policies based on your specific role requirements

-- ===================================
-- INDEXES
-- ===================================
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_venue ON bookings(venue_id);
CREATE INDEX idx_bookings_parent ON bookings(parent_id);
CREATE INDEX idx_bookings_confirmation ON bookings(confirmation_code);
CREATE INDEX idx_waivers_parent ON waivers(parent_id);
CREATE INDEX idx_waivers_child ON waivers(child_id);
CREATE INDEX idx_waivers_status ON waivers(status);
CREATE INDEX idx_children_parent ON children(parent_id);
CREATE INDEX idx_party_reservations_date ON party_reservations(date);
CREATE INDEX idx_memberships_parent ON memberships(parent_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_check_ins_booking ON check_ins(booking_id);
CREATE INDEX idx_orders_venue ON orders(venue_id);
