-- Add columns for social media images to news table
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS social_image_1x1 TEXT,
ADD COLUMN IF NOT EXISTS social_image_9x16 TEXT,
ADD COLUMN IF NOT EXISTS social_images_generated_at TIMESTAMPTZ;