-- Incident Reporting
-- Employees report incidents; managers add resolution details later.

CREATE TABLE IF NOT EXISTS incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL,
  reported_by UUID NOT NULL REFERENCES staff_users(id),
  type TEXT NOT NULL CHECK (type IN (
    'injury', 'property_damage', 'behavioral', 'equipment_failure',
    'safety_hazard', 'medical', 'theft', 'other'
  )),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  affected_area TEXT NOT NULL CHECK (affected_area IN (
    'play_area', 'party_rooms', 'lobby', 'restrooms',
    'kitchen', 'outdoor', 'parking', 'other'
  )),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  resolution_notes TEXT,
  resolution_cost NUMERIC(10,2) DEFAULT 0,
  operational_impact TEXT CHECK (operational_impact IN ('none', 'minor', 'moderate', 'severe')),
  outcome TEXT,
  resolved_by UUID REFERENCES staff_users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incidents_venue ON incidents(venue_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created ON incidents(created_at DESC);
