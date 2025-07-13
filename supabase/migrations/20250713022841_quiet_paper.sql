/*
  # UangKita Family Wallet Database Schema

  1. New Tables
    - `family_wallets` - Main wallet for each family
    - `family_members` - Members of each family with roles and limits
    - `transactions` - All financial transactions
    - `dana_integrations` - Dana account connections
    - `dana_transactions` - Dana transaction history
    - `payment_methods` - Available payment methods
    - `top_up_sessions` - Top up payment sessions

  2. Security
    - Enable RLS on all tables
    - Add policies for family-based access control
    - Secure member data access

  3. Functions
    - Auto-update spending limits
    - Transaction validation
    - Balance calculations
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Family Wallets Table
CREATE TABLE IF NOT EXISTS family_wallets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  balance decimal(15,2) DEFAULT 0,
  currency text DEFAULT 'IDR',
  admin_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Family Members Table
CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id uuid REFERENCES family_wallets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  email text NOT NULL,
  role text CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  avatar_url text,
  daily_limit decimal(15,2) DEFAULT 100000,
  monthly_limit decimal(15,2) DEFAULT 2000000,
  current_daily_spent decimal(15,2) DEFAULT 0,
  current_monthly_spent decimal(15,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id uuid REFERENCES family_wallets(id) ON DELETE CASCADE,
  from_member_id uuid REFERENCES family_members(id),
  to_member_id uuid REFERENCES family_members(id),
  amount decimal(15,2) NOT NULL,
  type text CHECK (type IN ('payment', 'transfer', 'topup', 'expense')) NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  payment_method text,
  transaction_ref text,
  status text CHECK (status IN ('completed', 'pending', 'failed')) DEFAULT 'pending',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Dana Integrations Table
CREATE TABLE IF NOT EXISTS dana_integrations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id uuid REFERENCES family_wallets(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  account_name text NOT NULL,
  balance decimal(15,2) DEFAULT 0,
  is_connected boolean DEFAULT false,
  last_sync timestamptz DEFAULT now(),
  access_token text,
  refresh_token text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Dana Transactions Table
CREATE TABLE IF NOT EXISTS dana_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  dana_integration_id uuid REFERENCES dana_integrations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  amount decimal(15,2) NOT NULL,
  type text CHECK (type IN ('in', 'out')) NOT NULL,
  description text NOT NULL,
  merchant text,
  created_at timestamptz DEFAULT now()
);

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text CHECK (type IN ('bank', 'ewallet', 'card')) NOT NULL,
  icon text,
  fee decimal(15,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Top Up Sessions Table
CREATE TABLE IF NOT EXISTS top_up_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id uuid REFERENCES family_wallets(id) ON DELETE CASCADE,
  member_id uuid REFERENCES family_members(id),
  amount decimal(15,2) NOT NULL,
  payment_method_id uuid REFERENCES payment_methods(id),
  barcode_data text,
  status text CHECK (status IN ('pending', 'completed', 'failed', 'expired')) DEFAULT 'pending',
  expires_at timestamptz DEFAULT (now() + interval '30 minutes'),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE family_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dana_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dana_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_up_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Family Wallets
CREATE POLICY "Users can view their family wallet"
  ON family_wallets FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT wallet_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update their family wallet"
  ON family_wallets FOR UPDATE
  TO authenticated
  USING (
    admin_id = auth.uid() OR
    id IN (
      SELECT wallet_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Family Members
CREATE POLICY "Users can view family members"
  ON family_members FOR SELECT
  TO authenticated
  USING (
    wallet_id IN (
      SELECT wallet_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile"
  ON family_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage family members"
  ON family_members FOR ALL
  TO authenticated
  USING (
    wallet_id IN (
      SELECT wallet_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Transactions
CREATE POLICY "Users can view family transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    wallet_id IN (
      SELECT wallet_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    from_member_id IN (
      SELECT id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for Dana Integration
CREATE POLICY "Users can view family dana integration"
  ON dana_integrations FOR SELECT
  TO authenticated
  USING (
    wallet_id IN (
      SELECT wallet_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage dana integration"
  ON dana_integrations FOR ALL
  TO authenticated
  USING (
    wallet_id IN (
      SELECT wallet_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Dana Transactions
CREATE POLICY "Users can view dana transactions"
  ON dana_transactions FOR SELECT
  TO authenticated
  USING (
    dana_integration_id IN (
      SELECT di.id FROM dana_integrations di
      JOIN family_members fm ON di.wallet_id = fm.wallet_id
      WHERE fm.user_id = auth.uid()
    )
  );

-- RLS Policies for Payment Methods
CREATE POLICY "Anyone can view payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for Top Up Sessions
CREATE POLICY "Users can view their top up sessions"
  ON top_up_sessions FOR SELECT
  TO authenticated
  USING (
    member_id IN (
      SELECT id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create top up sessions"
  ON top_up_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    member_id IN (
      SELECT id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Insert default payment methods
INSERT INTO payment_methods (name, type, icon, fee) VALUES
('BCA', 'bank', 'Building', 0),
('Mandiri', 'bank', 'Building', 0),
('BRI', 'bank', 'Building', 0),
('BNI', 'bank', 'Building', 0),
('Dana', 'ewallet', 'Smartphone', 0),
('OVO', 'ewallet', 'Smartphone', 0),
('GoPay', 'ewallet', 'Smartphone', 0),
('ShopeePay', 'ewallet', 'Smartphone', 0),
('Kartu Kredit', 'card', 'CreditCard', 2500),
('Kartu Debit', 'card', 'CreditCard', 1500)
ON CONFLICT DO NOTHING;

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_family_wallets_updated_at BEFORE UPDATE ON family_wallets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_dana_integrations_updated_at BEFORE UPDATE ON dana_integrations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to update member spending
CREATE OR REPLACE FUNCTION update_member_spending()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND NEW.type IN ('payment', 'expense') THEN
        UPDATE family_members 
        SET 
            current_daily_spent = current_daily_spent + NEW.amount,
            current_monthly_spent = current_monthly_spent + NEW.amount
        WHERE id = NEW.from_member_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_spending_on_transaction 
    AFTER INSERT OR UPDATE ON transactions 
    FOR EACH ROW EXECUTE PROCEDURE update_member_spending();

-- Function to update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        IF NEW.type = 'topup' THEN
            UPDATE family_wallets 
            SET balance = balance + NEW.amount
            WHERE id = NEW.wallet_id;
        ELSE
            UPDATE family_wallets 
            SET balance = balance - NEW.amount
            WHERE id = NEW.wallet_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_balance_on_transaction 
    AFTER INSERT OR UPDATE ON transactions 
    FOR EACH ROW EXECUTE PROCEDURE update_wallet_balance();