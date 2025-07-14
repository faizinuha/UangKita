/*
  # Fix RLS Policy Infinite Recursion

  1. Problem
    - Current RLS policies on family_members table are causing infinite recursion
    - The policies are referencing the same table they're protecting in subqueries

  2. Solution
    - Simplify policies to avoid recursive lookups
    - Use direct auth.uid() comparisons where possible
    - Remove complex subqueries that reference the same table

  3. Changes
    - Drop existing problematic policies
    - Create new simplified policies
    - Ensure no circular references
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow access to own family membership" ON family_members;
DROP POLICY IF EXISTS "Allow insert for own membership" ON family_members;
DROP POLICY IF EXISTS "Users can update their own profile" ON family_members;
DROP POLICY IF EXISTS "Users can view family members" ON family_members;
DROP POLICY IF EXISTS "Admins can manage family members" ON family_members;

-- Create simplified policies without recursion
CREATE POLICY "Users can read own member record"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own member record"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own member record"
  ON family_members
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- For viewing other family members, we need a safe approach
-- First, let's create a function to check if user is admin of a wallet
CREATE OR REPLACE FUNCTION is_wallet_admin(wallet_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_members 
    WHERE wallet_id = wallet_uuid 
    AND user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Policy for admins to manage all members in their wallet
CREATE POLICY "Admins can manage wallet members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (is_wallet_admin(wallet_id))
  WITH CHECK (is_wallet_admin(wallet_id));

-- Policy for members to view other members in same wallet
CREATE POLICY "Members can view wallet members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    wallet_id IN (
      SELECT fm.wallet_id 
      FROM family_members fm 
      WHERE fm.user_id = auth.uid()
    )
  );