-- ===================================
-- INVENTORY MANAGEMENT SYSTEM v2
-- Full operations control system
-- ===================================

-- ===================================
-- ITEM CATEGORIES (replace hardcoded)
-- ===================================
CREATE TABLE IF NOT EXISTS item_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS item_subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES item_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- UNITS OF MEASURE
-- ===================================
CREATE TABLE IF NOT EXISTS units_of_measure (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  precision INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- INVENTORY LOCATIONS
-- ===================================
CREATE TABLE IF NOT EXISTS inventory_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location_type TEXT DEFAULT 'storage' CHECK (location_type IN ('storage', 'sales_floor', 'kitchen', 'bar', 'backstock', 'closet', 'room', 'display', 'other')),
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- VENDORS
-- ===================================
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  lead_time_days INTEGER DEFAULT 0,
  payment_terms TEXT,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  item_id UUID REFERENCES products(id) ON DELETE CASCADE,
  vendor_sku TEXT,
  pack_size INTEGER DEFAULT 1,
  pack_uom TEXT,
  min_order_qty INTEGER DEFAULT 1,
  last_price DECIMAL(10,2),
  preferred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- EXTEND PRODUCTS TABLE
-- ===================================
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS barcode TEXT,
  ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'standard' CHECK (item_type IN ('standard', 'ingredient', 'supply', 'equipment', 'service')),
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES item_categories(id),
  ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES item_subcategories(id),
  ADD COLUMN IF NOT EXISTS uom_id UUID REFERENCES units_of_measure(id),
  ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS track_expiration BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sellable BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS preferred_vendor_id UUID REFERENCES vendors(id),
  ADD COLUMN IF NOT EXISTS reorder_qty INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS par_level INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lead_time_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS count_frequency TEXT DEFAULT 'monthly' CHECK (count_frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annual', 'as_needed'));

-- Barcode unique index within venue
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_venue_barcode
  ON products(venue_id, barcode)
  WHERE barcode IS NOT NULL;

-- ===================================
-- INVENTORY LEDGER (source of truth)
-- ===================================
CREATE TABLE IF NOT EXISTS inventory_ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  location_id UUID REFERENCES inventory_locations(id),
  item_id UUID REFERENCES products(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'opening_balance', 'receive', 'sale', 'refund',
    'booking_reserve', 'booking_release', 'booking_consume',
    'usage', 'waste', 'spoilage', 'adjustment',
    'transfer_out', 'transfer_in', 'count_reconciliation',
    'return_to_vendor', 'production_build', 'production_consume'
  )),
  quantity_delta INTEGER NOT NULL,
  unit_cost DECIMAL(10,2),
  reference_type TEXT CHECK (reference_type IN ('purchase_order', 'receipt', 'order', 'booking', 'count_session', 'transfer', 'manual')),
  reference_id UUID,
  correlation_id TEXT,
  notes TEXT,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES staff_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- INVENTORY BALANCES (projection/cache)
-- ===================================
CREATE TABLE IF NOT EXISTS inventory_balances (
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  location_id UUID REFERENCES inventory_locations(id),
  item_id UUID REFERENCES products(id) ON DELETE CASCADE,
  on_hand_qty INTEGER DEFAULT 0,
  reserved_qty INTEGER DEFAULT 0,
  available_qty INTEGER GENERATED ALWAYS AS (on_hand_qty - reserved_qty) STORED,
  avg_unit_cost DECIMAL(10,2) DEFAULT 0,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (venue_id, COALESCE(location_id, '00000000-0000-0000-0000-000000000000'::uuid), item_id)
);

-- ===================================
-- INVENTORY RESERVATIONS
-- ===================================
CREATE TABLE IF NOT EXISTS inventory_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  item_id UUID REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID REFERENCES inventory_locations(id),
  reserved_qty INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'released', 'consumed', 'expired', 'canceled')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  released_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ
);

-- ===================================
-- PURCHASE ORDERS
-- ===================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id),
  po_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'partially_received', 'received', 'canceled')),
  ordered_at TIMESTAMPTZ,
  expected_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES staff_users(id),
  approved_by UUID REFERENCES staff_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_order_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES products(id) ON DELETE CASCADE,
  ordered_qty INTEGER NOT NULL,
  ordered_uom TEXT,
  unit_cost DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(10,2) GENERATED ALWAYS AS (ordered_qty * unit_cost) STORED,
  notes TEXT
);

-- ===================================
-- RECEIPTS (receiving against POs)
-- ===================================
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID REFERENCES purchase_orders(id),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  location_id UUID REFERENCES inventory_locations(id),
  received_at TIMESTAMPTZ DEFAULT NOW(),
  received_by UUID REFERENCES staff_users(id),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS receipt_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  purchase_order_line_id UUID REFERENCES purchase_order_lines(id),
  item_id UUID REFERENCES products(id) ON DELETE CASCADE,
  received_qty INTEGER NOT NULL,
  rejected_qty INTEGER DEFAULT 0,
  received_unit_cost DECIMAL(10,2),
  notes TEXT
);

-- ===================================
-- COUNT SESSIONS
-- ===================================
CREATE TABLE IF NOT EXISTS count_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  location_id UUID REFERENCES inventory_locations(id),
  session_name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'canceled')),
  count_mode TEXT DEFAULT 'full' CHECK (count_mode IN ('full', 'filtered', 'blind', 'spot_check')),
  assigned_to UUID REFERENCES staff_users(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES staff_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS count_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  count_session_id UUID REFERENCES count_sessions(id) ON DELETE CASCADE,
  item_id UUID REFERENCES products(id) ON DELETE CASCADE,
  expected_qty INTEGER DEFAULT 0,
  counted_qty INTEGER,
  variance_qty INTEGER GENERATED ALWAYS AS (COALESCE(counted_qty, 0) - expected_qty) STORED,
  variance_reason TEXT CHECK (variance_reason IN ('breakage', 'spoilage', 'theft', 'miscount', 'unrecorded_usage', 'transfer_error', 'unknown')),
  notes TEXT
);

-- ===================================
-- INVENTORY ALERTS
-- ===================================
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  item_id UUID REFERENCES products(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'booking_conflict', 'expiring_soon', 'count_due', 'usage_spike', 'po_overdue')),
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ,
  dismissed_by UUID REFERENCES staff_users(id)
);

-- ===================================
-- ROW-LEVEL SECURITY
-- ===================================
ALTER TABLE item_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE units_of_measure ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE count_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE count_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;

-- Service role full access for all inventory tables
CREATE POLICY "Service role full access item_categories" ON item_categories FOR ALL USING (true);
CREATE POLICY "Service role full access item_subcategories" ON item_subcategories FOR ALL USING (true);
CREATE POLICY "Service role full access units_of_measure" ON units_of_measure FOR ALL USING (true);
CREATE POLICY "Service role full access inventory_locations" ON inventory_locations FOR ALL USING (true);
CREATE POLICY "Service role full access vendors" ON vendors FOR ALL USING (true);
CREATE POLICY "Service role full access vendor_items" ON vendor_items FOR ALL USING (true);
CREATE POLICY "Service role full access inventory_ledger_entries" ON inventory_ledger_entries FOR ALL USING (true);
CREATE POLICY "Service role full access inventory_balances" ON inventory_balances FOR ALL USING (true);
CREATE POLICY "Service role full access inventory_reservations" ON inventory_reservations FOR ALL USING (true);
CREATE POLICY "Service role full access purchase_orders" ON purchase_orders FOR ALL USING (true);
CREATE POLICY "Service role full access purchase_order_lines" ON purchase_order_lines FOR ALL USING (true);
CREATE POLICY "Service role full access receipts" ON receipts FOR ALL USING (true);
CREATE POLICY "Service role full access receipt_lines" ON receipt_lines FOR ALL USING (true);
CREATE POLICY "Service role full access count_sessions" ON count_sessions FOR ALL USING (true);
CREATE POLICY "Service role full access count_lines" ON count_lines FOR ALL USING (true);
CREATE POLICY "Service role full access inventory_alerts" ON inventory_alerts FOR ALL USING (true);

-- ===================================
-- INDEXES
-- ===================================
CREATE INDEX IF NOT EXISTS idx_item_categories_venue ON item_categories(venue_id);
CREATE INDEX IF NOT EXISTS idx_inventory_locations_venue ON inventory_locations(venue_id);
CREATE INDEX IF NOT EXISTS idx_vendors_venue ON vendors(venue_id);
CREATE INDEX IF NOT EXISTS idx_vendor_items_vendor ON vendor_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_items_item ON vendor_items(item_id);
CREATE INDEX IF NOT EXISTS idx_ledger_item_venue ON inventory_ledger_entries(item_id, venue_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_ledger_event_type ON inventory_ledger_entries(event_type);
CREATE INDEX IF NOT EXISTS idx_ledger_reference ON inventory_ledger_entries(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_ledger_correlation ON inventory_ledger_entries(correlation_id);
CREATE INDEX IF NOT EXISTS idx_balances_venue_item ON inventory_balances(venue_id, item_id);
CREATE INDEX IF NOT EXISTS idx_reservations_booking ON inventory_reservations(booking_id);
CREATE INDEX IF NOT EXISTS idx_reservations_item ON inventory_reservations(item_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON inventory_reservations(status);
CREATE INDEX IF NOT EXISTS idx_po_venue_status ON purchase_orders(venue_id, status);
CREATE INDEX IF NOT EXISTS idx_po_vendor ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_po_lines_po ON purchase_order_lines(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_receipts_po ON receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_receipt_lines_receipt ON receipt_lines(receipt_id);
CREATE INDEX IF NOT EXISTS idx_count_sessions_venue ON count_sessions(venue_id);
CREATE INDEX IF NOT EXISTS idx_count_lines_session ON count_lines(count_session_id);
CREATE INDEX IF NOT EXISTS idx_alerts_venue ON inventory_alerts(venue_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_item ON inventory_alerts(item_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_preferred_vendor ON products(preferred_vendor_id);

-- ===================================
-- SEED DATA (default venue)
-- ===================================
DO $$
DECLARE
  v_venue_id UUID := 'a1b2c3d4-0001-4000-8000-000000000001';
BEGIN
  -- Default categories
  INSERT INTO item_categories (venue_id, name, sort_order) VALUES
    (v_venue_id, 'Food & Beverage', 1),
    (v_venue_id, 'Merchandise', 2),
    (v_venue_id, 'Party Supplies', 3),
    (v_venue_id, 'Socks', 4),
    (v_venue_id, 'Janitorial', 5),
    (v_venue_id, 'Maintenance', 6),
    (v_venue_id, 'Operational', 7)
  ON CONFLICT DO NOTHING;

  -- Default UOMs
  INSERT INTO units_of_measure (venue_id, name, code, precision) VALUES
    (v_venue_id, 'Each', 'ea', 0),
    (v_venue_id, 'Pair', 'pr', 0),
    (v_venue_id, 'Pack', 'pk', 0),
    (v_venue_id, 'Case', 'cs', 0),
    (v_venue_id, 'Box', 'bx', 0),
    (v_venue_id, 'Bag', 'bg', 0),
    (v_venue_id, 'Bottle', 'bt', 0),
    (v_venue_id, 'Pound', 'lb', 2),
    (v_venue_id, 'Ounce', 'oz', 2),
    (v_venue_id, 'Gallon', 'gal', 2)
  ON CONFLICT DO NOTHING;

  -- Default locations
  INSERT INTO inventory_locations (venue_id, name, location_type) VALUES
    (v_venue_id, 'Front Desk', 'sales_floor'),
    (v_venue_id, 'Café Line', 'kitchen'),
    (v_venue_id, 'Café Backstock', 'backstock'),
    (v_venue_id, 'Party Closet', 'closet'),
    (v_venue_id, 'Janitorial Closet', 'closet'),
    (v_venue_id, 'Storage Room', 'storage'),
    (v_venue_id, 'Lobby Retail Display', 'display'),
    (v_venue_id, 'Room A Supplies', 'room'),
    (v_venue_id, 'Room B Supplies', 'room')
  ON CONFLICT DO NOTHING;
END $$;
