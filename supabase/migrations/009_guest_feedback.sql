-- Guest Feedback
-- Stores post-visit NPS scores, star ratings, and comments from guests.
-- Optionally linked to a booking via booking_code or booking_id.

CREATE TABLE IF NOT EXISTS guest_feedback (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id        UUID NOT NULL,
  booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
  booking_code    TEXT,
  parent_id       UUID REFERENCES parent_accounts(id) ON DELETE SET NULL,
  submitter_name  TEXT,
  submitter_email TEXT,
  nps_score       INTEGER NOT NULL CHECK (nps_score >= 0 AND nps_score <= 10),
  star_rating     INTEGER NOT NULL CHECK (star_rating >= 1 AND star_rating <= 5),
  comment         TEXT,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guest_feedback_venue    ON guest_feedback(venue_id);
CREATE INDEX IF NOT EXISTS idx_guest_feedback_booking  ON guest_feedback(booking_id);
CREATE INDEX IF NOT EXISTS idx_guest_feedback_submitted ON guest_feedback(submitted_at DESC);
