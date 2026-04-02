-- =====================================================
-- Migration 010: Member Passes
-- Adds member_passes table for QR/NFC card generation
-- =====================================================

CREATE TABLE IF NOT EXISTS member_passes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id    UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  parent_id   UUID NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
  pass_code   TEXT NOT NULL UNIQUE,
  pass_type   TEXT NOT NULL DEFAULT 'qr' CHECK (pass_type IN ('qr', 'nfc')),
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (venue_id, parent_id)
);

CREATE INDEX IF NOT EXISTS idx_member_passes_venue_id   ON member_passes(venue_id);
CREATE INDEX IF NOT EXISTS idx_member_passes_parent_id  ON member_passes(parent_id);
CREATE INDEX IF NOT EXISTS idx_member_passes_pass_code  ON member_passes(pass_code);

ALTER TABLE member_passes ENABLE ROW LEVEL SECURITY;
