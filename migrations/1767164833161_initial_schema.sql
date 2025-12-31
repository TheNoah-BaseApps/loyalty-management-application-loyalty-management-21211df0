CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  name text,
  password text NOT NULL,
  role text DEFAULT 'viewer' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  user_id uuid,
  member_number text NOT NULL UNIQUE,
  current_tier text,
  total_points integer DEFAULT 0 NOT NULL,
  available_points integer DEFAULT 0 NOT NULL,
  lifetime_points integer DEFAULT 0 NOT NULL,
  enrollment_date timestamp with time zone DEFAULT now() NOT NULL,
  segment text,
  status text DEFAULT 'Active' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_members_member_number ON members (member_number);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members (user_id);
CREATE INDEX IF NOT EXISTS idx_members_tier ON members (current_tier);
CREATE INDEX IF NOT EXISTS idx_members_segment ON members (segment);
CREATE INDEX IF NOT EXISTS idx_members_status ON members (status);

CREATE TABLE IF NOT EXISTS loyalty_costs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  cost_id text NOT NULL UNIQUE,
  cost_name text NOT NULL,
  product_id text,
  product_name text,
  points_required integer NOT NULL,
  points_cost integer NOT NULL,
  monetary_value decimal(10,2),
  cost_type text NOT NULL,
  validity_period integer,
  start_date date,
  end_date date,
  customer_segment text,
  redemption_limit integer,
  cost_status text DEFAULT 'Active' NOT NULL,
  channel_availability text,
  terms_conditions text,
  processing_fee decimal(10,2) DEFAULT 0,
  stock_quantity integer,
  minimum_balance integer,
  fulfillment_type text,
  partner_code text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_loyalty_costs_cost_id ON loyalty_costs (cost_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_costs_status ON loyalty_costs (cost_status);
CREATE INDEX IF NOT EXISTS idx_loyalty_costs_type ON loyalty_costs (cost_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_costs_product_id ON loyalty_costs (product_id);

CREATE TABLE IF NOT EXISTS loyalty_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  rule_id text NOT NULL UNIQUE,
  product_id text,
  product_name text,
  rule_name text NOT NULL,
  rule_type text NOT NULL,
  rule_condition text,
  point_value integer NOT NULL,
  start_date date,
  end_date date,
  applicable_tiers text,
  max_points integer,
  min_transaction decimal(10,2),
  frequency text,
  is_active boolean DEFAULT true NOT NULL,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  last_modified timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_loyalty_rules_rule_id ON loyalty_rules (rule_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_rules_type ON loyalty_rules (rule_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_rules_active ON loyalty_rules (is_active);
CREATE INDEX IF NOT EXISTS idx_loyalty_rules_product_id ON loyalty_rules (product_id);

CREATE TABLE IF NOT EXISTS point_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  member_id uuid NOT NULL,
  transaction_type text NOT NULL,
  points integer NOT NULL,
  balance_after integer NOT NULL,
  rule_id uuid,
  cost_id uuid,
  transaction_date timestamp with time zone DEFAULT now() NOT NULL,
  description text,
  reference_number text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_point_transactions_member_id ON point_transactions (member_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions (transaction_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_date ON point_transactions (transaction_date);
CREATE INDEX IF NOT EXISTS idx_point_transactions_reference ON point_transactions (reference_number);

CREATE TABLE IF NOT EXISTS redemptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  member_id uuid NOT NULL,
  cost_id uuid NOT NULL,
  points_redeemed integer NOT NULL,
  monetary_value decimal(10,2),
  redemption_date timestamp with time zone DEFAULT now() NOT NULL,
  fulfillment_status text DEFAULT 'Pending' NOT NULL,
  channel text,
  partner_code text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_redemptions_member_id ON redemptions (member_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_cost_id ON redemptions (cost_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON redemptions (fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_redemptions_date ON redemptions (redemption_date);

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  campaign_name text NOT NULL,
  campaign_type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  target_segment text,
  bonus_points integer,
  conditions text,
  status text DEFAULT 'Draft' NOT NULL,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns (status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns (campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns (start_date, end_date);

CREATE TABLE IF NOT EXISTS referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  referrer_id uuid NOT NULL,
  referee_id uuid,
  referral_code text NOT NULL UNIQUE,
  status text DEFAULT 'Pending' NOT NULL,
  points_awarded integer,
  referral_date timestamp with time zone DEFAULT now() NOT NULL,
  conversion_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON referrals (referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals (referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON referrals (referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals (status);

CREATE TABLE IF NOT EXISTS tiers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  tier_name text NOT NULL UNIQUE,
  min_points integer NOT NULL,
  max_points integer,
  benefits text,
  multiplier decimal(5,2) DEFAULT 1.00 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tiers_tier_name ON tiers (tier_name);
CREATE INDEX IF NOT EXISTS idx_tiers_points_range ON tiers (min_points, max_points);