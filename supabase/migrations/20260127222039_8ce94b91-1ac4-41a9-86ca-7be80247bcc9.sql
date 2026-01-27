-- =============================================
-- PUBLIDOOR PARTNER - Database Migration
-- Add user_id to advertisers + RLS policies for partner isolation
-- =============================================

-- 1. Add user_id column to publidoor_advertisers
ALTER TABLE publidoor_advertisers
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_publidoor_advertisers_user_id 
ON publidoor_advertisers(user_id);

-- 2. Create security definer function to check if user is a partner
CREATE OR REPLACE FUNCTION public.is_publidoor_partner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM publidoor_advertisers
    WHERE user_id = _user_id
      AND status = 'active'
  )
$$;

-- 3. Create security definer function to get partner's advertiser_id
CREATE OR REPLACE FUNCTION public.get_partner_advertiser_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM publidoor_advertisers
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 4. Create security definer function to check if user owns a publidoor item
CREATE OR REPLACE FUNCTION public.owns_publidoor_item(_user_id uuid, _publidoor_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM publidoor_items pi
    JOIN publidoor_advertisers pa ON pi.advertiser_id = pa.id
    WHERE pi.id = _publidoor_id
      AND pa.user_id = _user_id
  )
$$;

-- 5. Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Partners can view own advertiser" ON publidoor_advertisers;
DROP POLICY IF EXISTS "Partners can update own advertiser" ON publidoor_advertisers;
DROP POLICY IF EXISTS "Partners can view own publidoor items" ON publidoor_items;
DROP POLICY IF EXISTS "Partners can insert own publidoor items" ON publidoor_items;
DROP POLICY IF EXISTS "Partners can update own publidoor items" ON publidoor_items;
DROP POLICY IF EXISTS "Partners can view own metrics" ON publidoor_metrics;
DROP POLICY IF EXISTS "Partners can view own schedules" ON publidoor_schedules;

-- 6. RLS Policy: Partners can view their own advertiser profile
CREATE POLICY "Partners can view own advertiser"
ON publidoor_advertisers FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'commercial')
);

-- 7. RLS Policy: Partners can update their own advertiser profile
CREATE POLICY "Partners can update own advertiser"
ON publidoor_advertisers FOR UPDATE
USING (auth.uid() = user_id);

-- 8. RLS Policy: Partners can view their own publidoor items
CREATE POLICY "Partners can view own publidoor items"
ON publidoor_items FOR SELECT
USING (
  advertiser_id = public.get_partner_advertiser_id(auth.uid())
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'commercial')
);

-- 9. RLS Policy: Partners can insert their own publidoor items
CREATE POLICY "Partners can insert own publidoor items"
ON publidoor_items FOR INSERT
WITH CHECK (
  advertiser_id = public.get_partner_advertiser_id(auth.uid())
);

-- 10. RLS Policy: Partners can update their own publidoor items
CREATE POLICY "Partners can update own publidoor items"
ON publidoor_items FOR UPDATE
USING (
  advertiser_id = public.get_partner_advertiser_id(auth.uid())
);

-- 11. RLS Policy: Partners can view their own metrics (read-only)
CREATE POLICY "Partners can view own metrics"
ON publidoor_metrics FOR SELECT
USING (
  public.owns_publidoor_item(auth.uid(), publidoor_id)
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'commercial')
);

-- 12. RLS Policy: Partners can view their own schedules (read-only)
CREATE POLICY "Partners can view own schedules"
ON publidoor_schedules FOR SELECT
USING (
  public.owns_publidoor_item(auth.uid(), publidoor_id)
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'commercial')
);