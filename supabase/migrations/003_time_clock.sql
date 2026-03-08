-- ===================================
-- EMPLOYEE TIME CLOCK
-- ===================================

-- Time entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  clock_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clock_out TIMESTAMPTZ,
  break_minutes INTEGER DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_by UUID REFERENCES staff_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view time entries" ON time_entries FOR SELECT USING (true);
CREATE POLICY "Service role full access time entries" ON time_entries FOR ALL USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_venue_staff ON time_entries(venue_id, staff_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_venue_status ON time_entries(venue_id, status);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_in ON time_entries(venue_id, clock_in DESC);
CREATE INDEX IF NOT EXISTS idx_time_entries_staff_status ON time_entries(staff_id, status);
