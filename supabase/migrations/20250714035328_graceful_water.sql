/*
  # Fix RLS Policy Infinite Recursion

  This migration completely removes and recreates all RLS policies for family_members
  to eliminate the infinite recursion error.

  ## Changes Made
  1. Drop all existing policies on family_members
  2. Create simple, non-recursive policies
  3. Use direct auth.uid() comparisons only
  4. Avoid any subqueries that reference family_members table
*/

-- Drop all existing policies on family_members to start fresh
DROP POLICY IF EXISTS "Admins can manage wallet members" ON family_members;
DROP POLICY IF EXISTS "Members can view wallet members" ON family_members;
DROP POLICY IF EXISTS "Users can insert own member record" ON family_members;
DROP POLICY IF EXISTS "Users can read own member record" ON family_members;
DROP POLICY IF EXISTS "Users can update own member record" ON family_members;

-- Create simple, non-recursive policies
-- Policy 1: Users can read their own member record
CREATE POLICY "Users can read own member record" ON family_members
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can update their own member record
CREATE POLICY "Users can update own member record" ON family_members
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can insert their own member record
CREATE POLICY "Users can insert own member record" ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow reading family members for wallet access
-- This uses a simple approach without recursion
CREATE POLICY "Allow family member access" ON family_members
  FOR SELECT
  TO authenticated
  USING (
    -- Either it's the user's own record
    auth.uid() = user_id
    OR
    -- Or the user is an admin of a wallet that contains this member
    EXISTS (
      SELECT 1 FROM family_wallets fw
      WHERE fw.id = family_members.wallet_id
      AND fw.admin_id = auth.uid()
    )
  );

-- Policy 5: Allow admins to manage family members
CREATE POLICY "Admins can manage family members" ON family_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_wallets fw
      WHERE fw.id = family_members.wallet_id
      AND fw.admin_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_wallets fw
      WHERE fw.id = family_members.wallet_id
      AND fw.admin_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;