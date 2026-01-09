-- Create enum for news origin
CREATE TYPE public.news_origin AS ENUM ('manual', 'ai');

-- Add origin column to news table
ALTER TABLE public.news 
  ADD COLUMN IF NOT EXISTS origin public.news_origin DEFAULT 'manual';