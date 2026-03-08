-- ===================================
-- INVENTORY MANAGEMENT
-- ===================================

-- Extend products table with inventory columns
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS quantity_on_hand INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reorder_level INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'each',
  ADD COLUMN IF NOT EXISTS supplier TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- SKU must be unique within a venue (composite unique, partial — only when sku IS NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_venue_sku
  ON products(venue_id, sku)
  WHERE sku IS NOT NULL;

-- Stock transactions audit log
CREATE TABLE IF NOT EXISTS stock_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('received', 'sold', 'adjustment', 'return', 'damaged', 'initial')),
  quantity_change INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reference_type TEXT CHECK (reference_type IN ('order', 'manual', 'pos')),
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES staff_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view stock transactions" ON stock_transactions FOR SELECT USING (true);
CREATE POLICY "Service role full access stock transactions" ON stock_transactions FOR ALL USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_venue_category ON products(venue_id, category);
CREATE INDEX IF NOT EXISTS idx_products_venue_active ON products(venue_id, active);
CREATE INDEX IF NOT EXISTS idx_products_quantity ON products(quantity_on_hand);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_product ON stock_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_type ON stock_transactions(type);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_created ON stock_transactions(created_at);
