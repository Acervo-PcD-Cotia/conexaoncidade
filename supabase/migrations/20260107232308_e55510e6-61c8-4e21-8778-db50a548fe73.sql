-- Create ads table for professional advertising system
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  advertiser TEXT,
  slot_type TEXT NOT NULL,
  size TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_target TEXT DEFAULT '_blank',
  alt_text TEXT,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  impression_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Public can view active ads
CREATE POLICY "Active ads are publicly readable"
ON public.ads
FOR SELECT
USING (is_active = true);

-- Admins/editors can manage ads
CREATE POLICY "Admins can manage ads"
ON public.ads
FOR ALL
USING (is_admin_or_editor(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();