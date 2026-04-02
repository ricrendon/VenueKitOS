-- =====================================================
-- WonderClubCo — Playground OS Setup SQL
-- Run this in your Supabase SQL Editor (project: vmgdsriozavqmoktxwsc)
-- =====================================================
-- IMPORTANT: Run each section one at a time, top to bottom.
-- =====================================================

-- =====================================================
-- STEP 1: Create the Venue
-- =====================================================
INSERT INTO venues (
  id,
  name,
  slug,
  address,
  city,
  state,
  zip,
  phone,
  email,
  timezone,
  settings,
  operating_hours,
  website_content
) VALUES (
  gen_random_uuid(),
  'Wonder Club & Co',
  'wonder-club-co',
  '',
  '',
  '',
  '',
  '',
  'hello@wonderclubco.com',
  'America/Chicago',
  '{
    "tax_rate": 0.08,
    "currency": "USD",
    "booking_lead_time_hours": 2,
    "max_party_guests": 50,
    "waiver_expiry_days": 365
  }'::jsonb,
  '[
    {"day": "Monday",    "open": "09:00", "close": "18:00", "closed": false},
    {"day": "Tuesday",   "open": "09:00", "close": "18:00", "closed": false},
    {"day": "Wednesday", "open": "09:00", "close": "18:00", "closed": false},
    {"day": "Thursday",  "open": "09:00", "close": "18:00", "closed": false},
    {"day": "Friday",    "open": "09:00", "close": "20:00", "closed": false},
    {"day": "Saturday",  "open": "09:00", "close": "20:00", "closed": false},
    {"day": "Sunday",    "open": "10:00", "close": "18:00", "closed": false}
  ]'::jsonb,
  '{
    "hero_headline": "The best place for kids to play, explore.",
    "hero_subheadline": "Book open play, parties, memberships, and waivers in minutes.",
    "trust_stats": {
      "families_served": "500+",
      "star_rating": "4.9",
      "years_open": "3"
    }
  }'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Capture the venue ID for use in subsequent steps
-- (run this separately and note the UUID)
SELECT id, name, slug FROM venues WHERE slug = 'wonder-club-co';


-- =====================================================
-- STEP 2: Party Packages
-- Replace <VENUE_ID> with the UUID returned above
-- =====================================================

INSERT INTO party_packages (venue_id, name, description, price, included_children, duration_minutes, room_type, host_included, food_included, decor_included, best_for, features, active, sort_order)
SELECT
  v.id,
  pkg.name,
  pkg.description,
  pkg.price,
  pkg.included_children,
  pkg.duration_minutes,
  pkg.room_type,
  pkg.host_included,
  pkg.food_included,
  pkg.decor_included,
  pkg.best_for,
  pkg.features::jsonb,
  true,
  pkg.sort_order
FROM venues v,
(VALUES
  ('Sprout Package',    'Perfect for smaller gatherings — 90 minutes of play, a private party room, and everything you need for a memorable celebration.',  249.00, 10, 90,  'Toddler Room',  false, false, false, 'Ages 1–4',       '["Private party room", "90 min play time", "Plates & napkins", "Invitations"]', 1),
  ('Explorer Package',  'Our most popular package — 2 hours of open play with a dedicated party host and welcome décor included.',                          399.00, 15, 120, 'Main Play Area', true,  false, true,  'Ages 2–8',       '["Dedicated party host", "2 hr play time", "Welcome décor", "Party favors", "Invitations"]', 2),
  ('Adventure Package', 'Go all-out with 2.5 hours, food included, premium décor, and an exclusive birthday room experience.',                            599.00, 20, 150, 'Birthday Suite', true,  true,  true,  'All ages',       '["Exclusive birthday suite", "2.5 hr play time", "Food package", "Premium décor", "Party host", "Party favors", "Cake cutting service"]', 3)
) AS pkg(name, description, price, included_children, duration_minutes, room_type, host_included, food_included, decor_included, best_for, features, sort_order)
WHERE v.slug = 'wonder-club-co'
ON CONFLICT DO NOTHING;


-- =====================================================
-- STEP 3: Membership Plans
-- =====================================================

INSERT INTO membership_plans (venue_id, name, description, price_monthly, price_annual, included_visits, max_children, perks, active, sort_order)
SELECT
  v.id,
  plan.name,
  plan.description,
  plan.price_monthly,
  plan.price_annual,
  plan.included_visits,
  plan.max_children,
  plan.perks::jsonb,
  true,
  plan.sort_order
FROM venues v,
(VALUES
  ('Explorer',   'Great for families who visit a few times a month.',          49.00,  490.00,  8,  2, '["8 open play visits/month", "10% off parties", "Early booking access"]', 1),
  ('Adventure',  'For the families who practically live here — unlimited fun.', 89.00,  890.00,  -1, 4, '["Unlimited open play", "15% off parties", "1 free guest pass/month", "Priority booking", "Member-only events"]', 2)
) AS plan(name, description, price_monthly, price_annual, included_visits, max_children, perks, sort_order)
WHERE v.slug = 'wonder-club-co'
ON CONFLICT DO NOTHING;


-- =====================================================
-- STEP 4: Create Admin / Owner Staff User
-- Do this AFTER creating the auth user in Supabase Auth
-- Replace <AUTH_USER_ID> with the UUID of the auth user
-- =====================================================

-- INSERT INTO staff_users (auth_user_id, venue_id, role, first_name, last_name, email)
-- SELECT
--   '<AUTH_USER_ID>'::uuid,
--   v.id,
--   'venue_owner',
--   'Ricardo',
--   'Rendon',
--   'your-email@example.com'
-- FROM venues v
-- WHERE v.slug = 'wonder-club-co';


-- =====================================================
-- STEP 5: Verify setup
-- =====================================================
SELECT
  v.id        AS venue_id,
  v.name      AS venue_name,
  v.slug,
  COUNT(DISTINCT pp.id) AS party_packages,
  COUNT(DISTINCT mp.id) AS membership_plans
FROM venues v
LEFT JOIN party_packages pp ON pp.venue_id = v.id AND pp.active = true
LEFT JOIN membership_plans mp ON mp.venue_id = v.id AND mp.active = true
WHERE v.slug = 'wonder-club-co'
GROUP BY v.id, v.name, v.slug;
