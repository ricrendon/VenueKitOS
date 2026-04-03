-- ============================================================
-- 011_security_hardening.sql
-- Fixes all Supabase Security Advisor warnings:
--   1. RLS Policy Always True  (9 tables)
--   2. Function Search Path Mutable  (redeem_gift_card)
--   3. Note: Leaked Password Protection must be enabled manually
--            in Supabase Dashboard → Authentication → Password Protection
-- ============================================================
-- Strategy: every API route uses the service_role key (admin client),
-- which bypasses RLS entirely. These policies gate direct authenticated
-- (anon key + JWT) access and lock out unauthenticated writes.
-- ============================================================

-- ─── Helper: venue_id for the current authenticated user ────────────────────
-- We resolve venue via staff_users.auth_user_id = auth.uid().
-- Wrapped in a SECURITY DEFINER function so the lookup runs as the owner,
-- avoiding a recursive RLS check on staff_users itself.

CREATE OR REPLACE FUNCTION public.current_user_venue_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT venue_id
  FROM public.staff_users
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- ─── 1. gift_cards ──────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Public can view gift cards" ON public.gift_cards;
DROP POLICY IF EXISTS "Service role full access gift cards" ON public.gift_cards;

-- Staff of the same venue can read/write; service_role bypasses RLS
CREATE POLICY "venue_staff_select" ON public.gift_cards
  FOR SELECT TO authenticated
  USING (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_insert" ON public.gift_cards
  FOR INSERT TO authenticated
  WITH CHECK (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_update" ON public.gift_cards
  FOR UPDATE TO authenticated
  USING (venue_id = public.current_user_venue_id())
  WITH CHECK (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_delete" ON public.gift_cards
  FOR DELETE TO authenticated
  USING (venue_id = public.current_user_venue_id());

-- ─── 2. gift_card_transactions ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Public can view gift card transactions" ON public.gift_card_transactions;
DROP POLICY IF EXISTS "Service role full access gift card transactions" ON public.gift_card_transactions;

CREATE POLICY "venue_staff_select" ON public.gift_card_transactions
  FOR SELECT TO authenticated
  USING (
    gift_card_id IN (
      SELECT id FROM public.gift_cards
      WHERE venue_id = public.current_user_venue_id()
    )
  );

CREATE POLICY "venue_staff_insert" ON public.gift_card_transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    gift_card_id IN (
      SELECT id FROM public.gift_cards
      WHERE venue_id = public.current_user_venue_id()
    )
  );

-- Transactions are append-only; no UPDATE or DELETE policies intentionally

-- ─── 3. incidents ───────────────────────────────────────────────────────────
-- No existing named policies to drop; RLS was enabled with no policies.
-- Adding them now.

CREATE POLICY "venue_staff_select" ON public.incidents
  FOR SELECT TO authenticated
  USING (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_insert" ON public.incidents
  FOR INSERT TO authenticated
  WITH CHECK (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_update" ON public.incidents
  FOR UPDATE TO authenticated
  USING (venue_id = public.current_user_venue_id())
  WITH CHECK (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_delete" ON public.incidents
  FOR DELETE TO authenticated
  USING (venue_id = public.current_user_venue_id());

-- ─── 4. menu_items ──────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Public can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Service role full access menu items" ON public.menu_items;

CREATE POLICY "venue_staff_select" ON public.menu_items
  FOR SELECT TO authenticated
  USING (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_insert" ON public.menu_items
  FOR INSERT TO authenticated
  WITH CHECK (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_update" ON public.menu_items
  FOR UPDATE TO authenticated
  USING (venue_id = public.current_user_venue_id())
  WITH CHECK (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_delete" ON public.menu_items
  FOR DELETE TO authenticated
  USING (venue_id = public.current_user_venue_id());

-- ─── 5. party_add_ons ───────────────────────────────────────────────────────
-- No RLS policies existed; ensure RLS is on and add proper policies.

ALTER TABLE public.party_add_ons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "venue_staff_select" ON public.party_add_ons
  FOR SELECT TO authenticated
  USING (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_insert" ON public.party_add_ons
  FOR INSERT TO authenticated
  WITH CHECK (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_update" ON public.party_add_ons
  FOR UPDATE TO authenticated
  USING (venue_id = public.current_user_venue_id())
  WITH CHECK (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_delete" ON public.party_add_ons
  FOR DELETE TO authenticated
  USING (venue_id = public.current_user_venue_id());

-- ─── 6. social_accounts ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Public can view social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Service role full access social accounts" ON public.social_accounts;

CREATE POLICY "venue_staff_select" ON public.social_accounts
  FOR SELECT TO authenticated
  USING (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_insert" ON public.social_accounts
  FOR INSERT TO authenticated
  WITH CHECK (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_update" ON public.social_accounts
  FOR UPDATE TO authenticated
  USING (venue_id = public.current_user_venue_id())
  WITH CHECK (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_delete" ON public.social_accounts
  FOR DELETE TO authenticated
  USING (venue_id = public.current_user_venue_id());

-- ─── 7. social_metrics ──────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Public can view social metrics" ON public.social_metrics;
DROP POLICY IF EXISTS "Service role full access social metrics" ON public.social_metrics;

CREATE POLICY "venue_staff_select" ON public.social_metrics
  FOR SELECT TO authenticated
  USING (
    social_account_id IN (
      SELECT id FROM public.social_accounts
      WHERE venue_id = public.current_user_venue_id()
    )
  );

CREATE POLICY "venue_staff_insert" ON public.social_metrics
  FOR INSERT TO authenticated
  WITH CHECK (
    social_account_id IN (
      SELECT id FROM public.social_accounts
      WHERE venue_id = public.current_user_venue_id()
    )
  );

-- ─── 8. stock_transactions ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "Public can view stock transactions" ON public.stock_transactions;
DROP POLICY IF EXISTS "Service role full access stock transactions" ON public.stock_transactions;

CREATE POLICY "venue_staff_select" ON public.stock_transactions
  FOR SELECT TO authenticated
  USING (
    product_id IN (
      SELECT id FROM public.products
      WHERE venue_id = public.current_user_venue_id()
    )
  );

CREATE POLICY "venue_staff_insert" ON public.stock_transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    product_id IN (
      SELECT id FROM public.products
      WHERE venue_id = public.current_user_venue_id()
    )
  );

-- Transactions are append-only; no UPDATE or DELETE policies intentionally

-- ─── 9. time_entries ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Public can view time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Service role full access time entries" ON public.time_entries;

CREATE POLICY "venue_staff_select" ON public.time_entries
  FOR SELECT TO authenticated
  USING (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_insert" ON public.time_entries
  FOR INSERT TO authenticated
  WITH CHECK (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_update" ON public.time_entries
  FOR UPDATE TO authenticated
  USING (venue_id = public.current_user_venue_id())
  WITH CHECK (venue_id = public.current_user_venue_id());

CREATE POLICY "venue_staff_delete" ON public.time_entries
  FOR DELETE TO authenticated
  USING (venue_id = public.current_user_venue_id());

-- ─── 10. Fix: redeem_gift_card — Function Search Path Mutable ───────────────
-- Add SET search_path = '' and fully qualify all table references.

CREATE OR REPLACE FUNCTION public.redeem_gift_card(
  p_gift_card_id UUID,
  p_amount DECIMAL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS TABLE(new_balance DECIMAL, new_status TEXT)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_balance DECIMAL;
BEGIN
  SELECT current_balance INTO v_balance
  FROM public.gift_cards
  WHERE id = p_gift_card_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'Gift card not found';
  END IF;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  UPDATE public.gift_cards
  SET current_balance = current_balance - p_amount,
      status = CASE WHEN current_balance - p_amount = 0 THEN 'redeemed' ELSE status END,
      updated_at = NOW()
  WHERE id = p_gift_card_id;

  INSERT INTO public.gift_card_transactions
    (gift_card_id, type, amount, balance_after, reference_type, reference_id, notes, created_by)
  VALUES
    (p_gift_card_id, 'redemption', p_amount, v_balance - p_amount,
     p_reference_type, p_reference_id, p_notes, p_created_by);

  RETURN QUERY
    SELECT
      v_balance - p_amount,
      CASE WHEN v_balance - p_amount = 0 THEN 'redeemed'::TEXT ELSE 'active'::TEXT END;
END;
$$;

-- ─── Done ────────────────────────────────────────────────────────────────────
-- Remaining action (manual, in Supabase Dashboard):
--   Authentication → Password Protection → Enable "Leaked password protection"
