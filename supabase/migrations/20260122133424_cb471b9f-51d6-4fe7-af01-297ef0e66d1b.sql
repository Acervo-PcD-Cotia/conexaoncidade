-- Add profile_status column to profiles table for WebRadioTV access control
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_status TEXT DEFAULT 'pending';

-- Add check constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_status_check 
CHECK (profile_status IN ('pending', 'approved', 'rejected'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(profile_status);