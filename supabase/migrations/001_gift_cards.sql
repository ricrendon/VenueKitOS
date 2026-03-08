-- ===================================
-- GIFT CARDS
-- ===================================
CREATE TABLE gift_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  initial_value DECIMAL(10,2) NOT NULL,
  current_balance DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'disabled')),
  purchaser_name TEXT,
  purchaser_email TEXT,
  recipient_name TEXT,
  recipient_email TEXT,
  message TEXT,
  payment_method TEXT DEFAULT 'in_store',
  stripe_payment_intent_id TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES staff_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gift_card_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_card_id UUID REFERENCES gift_cards(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'redemption', 'adjustment', 'refund')),
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  reference_type TEXT CHECK (reference_type IN ('booking', 'order', 'manual')),
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES staff_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view gift cards" ON gift_cards FOR SELECT USING (true);
CREATE POLICY "Service role full access gift cards" ON gift_cards FOR ALL USING (true);
CREATE POLICY "Public can view gift card transactions" ON gift_card_transactions FOR SELECT USING (true);
CREATE POLICY "Service role full access gift card transactions" ON gift_card_transactions FOR ALL USING (true);

-- Indexes
CREATE INDEX idx_gift_cards_venue ON gift_cards(venue_id);
CREATE INDEX idx_gift_cards_code ON gift_cards(code);
CREATE INDEX idx_gift_cards_status ON gift_cards(status);
CREATE INDEX idx_gift_card_transactions_card ON gift_card_transactions(gift_card_id);

-- Atomic redemption function (uses FOR UPDATE row lock to prevent concurrent overdraw)
CREATE OR REPLACE FUNCTION redeem_gift_card(
  p_gift_card_id UUID,
  p_amount DECIMAL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
) RETURNS TABLE(new_balance DECIMAL, new_status TEXT) AS $$
DECLARE
  v_balance DECIMAL;
BEGIN
  SELECT current_balance INTO v_balance
  FROM gift_cards
  WHERE id = p_gift_card_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'Gift card not found';
  END IF;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  UPDATE gift_cards
  SET current_balance = current_balance - p_amount,
      status = CASE WHEN current_balance - p_amount = 0 THEN 'redeemed' ELSE status END,
      updated_at = NOW()
  WHERE id = p_gift_card_id;

  INSERT INTO gift_card_transactions
    (gift_card_id, type, amount, balance_after, reference_type, reference_id, notes, created_by)
  VALUES
    (p_gift_card_id, 'redemption', p_amount, v_balance - p_amount,
     p_reference_type, p_reference_id, p_notes, p_created_by);

  RETURN QUERY SELECT v_balance - p_amount,
    CASE WHEN v_balance - p_amount = 0 THEN 'redeemed'::TEXT ELSE 'active'::TEXT END;
END;
$$ LANGUAGE plpgsql;
