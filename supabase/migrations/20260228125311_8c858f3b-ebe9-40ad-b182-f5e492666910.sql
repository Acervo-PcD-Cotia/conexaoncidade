-- Add missing columns to businesses table
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS cnpj TEXT,
  ADD COLUMN IF NOT EXISTS year_founded INTEGER,
  ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'physical',
  ADD COLUMN IF NOT EXISTS service_areas TEXT[],
  ADD COLUMN IF NOT EXISTS services TEXT[],
  ADD COLUMN IF NOT EXISTS holiday_hours JSONB,
  ADD COLUMN IF NOT EXISTS number TEXT,
  ADD COLUMN IF NOT EXISTS complement TEXT;

-- Fix the owner policy to include WITH CHECK for INSERT
DROP POLICY IF EXISTS "Business owners can manage their businesses" ON public.businesses;

CREATE POLICY "Business owners can manage their businesses"
ON public.businesses
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);