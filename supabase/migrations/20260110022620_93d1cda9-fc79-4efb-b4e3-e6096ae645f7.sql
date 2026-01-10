-- Add quiz tracking fields to community_members
ALTER TABLE public.community_members 
ADD COLUMN IF NOT EXISTS quiz_completed BOOLEAN DEFAULT false;

ALTER TABLE public.community_members 
ADD COLUMN IF NOT EXISTS quiz_completed_at TIMESTAMPTZ;