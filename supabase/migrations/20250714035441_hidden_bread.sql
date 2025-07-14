/*
  # Fix All RLS Policies - Remove Infinite Recursion

  1. Complete Reset
    - Drop all existing policies that cause recursion
    - Disable RLS temporarily for clean slate
    - Re-enable with simple, non-recursive policies

  2. Simple Policy Strategy
    - Use direct auth.uid() comparisons only
    - Avoid any subqueries that reference the same table
    - Use security definer functions for complex checks

  3. Tables Fixed
    - family_members (main issue)
    - family_wallets
    - transactions
    - All related tables
*/

-- Disable RLS temporarily to clean up
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE dana_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE dana_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE top_up_sessions DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own member record" ON family_members;
DROP POLICY IF EXISTS "Users can insert own member record" ON family_members;
DROP POLICY IF EXISTS "Users can update own member record" ON family_members;
DROP POLICY IF EXISTS "Allow family member access" ON family_members;
DROP POLICY IF EXISTS "Admins can manage family members" ON family_members;

DROP POLICY IF EXISTS "Users can view their family wallet" ON family_wallets;
DROP POLICY IF EXISTS "Admins can update their family wallet" ON family_wallets;

DROP POLICY IF EXISTS "Users can view family transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON transactions;

DROP POLICY IF EXISTS "Users can view family dana integration" ON dana_integrations;
DROP POLICY IF EXISTS "Admins can manage dana integration" ON dana_integrations;

DROP POLICY IF EXISTS "Users can view dana transactions" ON dana_transactions;

DROP POLICY IF EXISTS "Users can view their top up sessions" ON top_up_sessions;
DROP POLICY IF EXISTS "Users can create top up sessions" ON top_up_sessions;

-- Create security definer function to safely check wallet membership
CREATE OR REPLACE FUNCTION auth.user_wallet_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT wallet_id 
  FROM family_members 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_wallet_admin(check_wallet_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM family_wallets 
    WHERE id = check_wallet_id 
    AND admin_id = auth.uid()
  );
$$;

-- Re-enable RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dana_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dana_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_up_sessions ENABLE ROW LEVEL SECURITY;

-- FAMILY_MEMBERS: Simple policies without recursion
CREATE POLICY "family_members_select_own"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "family_members_insert_own"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "family_members_update_own"
  ON family_members
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- FAMILY_WALLETS: Simple policies
CREATE POLICY "family_wallets_select"
  ON family_wallets
  FOR SELECT
  TO authenticated
  USING (
    admin_id = auth.uid() 
    OR id = auth.user_wallet_id()
  );

CREATE POLICY "family_wallets_update_admin"
  ON family_wallets
  FOR UPDATE
  TO authenticated
  USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

-- TRANSACTIONS: Simple policies
CREATE POLICY "transactions_select"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (wallet_id = auth.user_wallet_id());

CREATE POLICY "transactions_insert"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (wallet_id = auth.user_wallet_id());

-- DANA_INTEGRATIONS: Simple policies
CREATE POLICY "dana_integrations_select"
  ON dana_integrations
  FOR SELECT
  TO authenticated
  USING (wallet_id = auth.user_wallet_id());

CREATE POLICY "dana_integrations_all_admin"
  ON dana_integrations
  FOR ALL
  TO authenticated
  USING (auth.is_wallet_admin(wallet_id))
  WITH CHECK (auth.is_wallet_admin(wallet_id));

-- DANA_TRANSACTIONS: Simple policies
CREATE POLICY "dana_transactions_select"
  ON dana_transactions
  FOR SELECT
  TO authenticated
  USING (
    dana_integration_id IN (
      SELECT id 
      FROM dana_integrations 
      WHERE wallet_id = auth.user_wallet_id()
    )
  );

-- TOP_UP_SESSIONS: Simple policies
CREATE POLICY "top_up_sessions_select"
  ON top_up_sessions
  FOR SELECT
  TO authenticated
  USING (wallet_id = auth.user_wallet_id());

CREATE POLICY "top_up_sessions_insert"
  ON top_up_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (wallet_id = auth.user_wallet_id());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.user_wallet_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_wallet_admin(uuid) TO authenticated;