-- Staff Permissions (role-based with per-employee overrides)
-- Only override rows are stored. If no row exists for a staff+page, the role default applies.

CREATE TABLE IF NOT EXISTS staff_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  page_key TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(staff_id, page_key)
);

CREATE INDEX IF NOT EXISTS idx_staff_permissions_staff ON staff_permissions(staff_id);
