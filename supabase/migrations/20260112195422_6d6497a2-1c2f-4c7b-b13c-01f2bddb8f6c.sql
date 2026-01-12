-- Insert 3 sample banners for testing
INSERT INTO public.super_banners (image_url, link_url, title, alt_text, is_active, sort_order)
VALUES 
  ('https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&h=400&fit=crop', 
   'https://example.com/promo1', 
   'Banner Promocional 1', 
   'Promoção especial de janeiro', 
   true, 1),
  ('https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1920&h=400&fit=crop', 
   'https://example.com/promo2', 
   'Banner Notícias', 
   'Últimas notícias da cidade', 
   true, 2),
  ('https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=1920&h=400&fit=crop', 
   'https://example.com/promo3', 
   'Banner Eventos', 
   'Eventos da semana', 
   true, 3);

-- Add coordinate columns to banner_clicks for heatmap
ALTER TABLE public.banner_clicks
ADD COLUMN IF NOT EXISTS click_x integer,
ADD COLUMN IF NOT EXISTS click_y integer,
ADD COLUMN IF NOT EXISTS banner_width integer,
ADD COLUMN IF NOT EXISTS banner_height integer;

-- Create banner_campaigns table
CREATE TABLE public.banner_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  banner_id uuid REFERENCES public.super_banners(id) ON DELETE CASCADE,
  budget_total numeric(12,2) NOT NULL DEFAULT 0,
  budget_spent numeric(12,2) NOT NULL DEFAULT 0,
  cost_per_click numeric(8,4) DEFAULT 0,
  cost_per_impression numeric(8,4) DEFAULT 0,
  billing_type text NOT NULL DEFAULT 'cpc' CHECK (billing_type IN ('cpc', 'cpm', 'fixed')),
  starts_at timestamptz,
  ends_at timestamptz,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'depleted')),
  advertiser_name text,
  advertiser_email text,
  targeting_categories text[] DEFAULT '{}',
  targeting_locations text[] DEFAULT '{}',
  targeting_devices text[] DEFAULT ARRAY['desktop', 'mobile', 'tablet'],
  max_daily_spend numeric(10,2),
  daily_spent numeric(10,2) NOT NULL DEFAULT 0,
  daily_reset_at date DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create banner_campaign_spend_log table
CREATE TABLE public.banner_campaign_spend_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.banner_campaigns(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('click', 'impression')),
  amount numeric(8,4) NOT NULL,
  click_id uuid REFERENCES public.banner_clicks(id),
  impression_id uuid REFERENCES public.banner_impressions(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.banner_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_campaign_spend_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for banner_campaigns
CREATE POLICY "Anyone can view active campaigns"
ON public.banner_campaigns FOR SELECT
USING (status = 'active' OR EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor')
));

CREATE POLICY "Admins can manage campaigns"
ON public.banner_campaigns FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor')
));

-- RLS policies for banner_campaign_spend_log
CREATE POLICY "Admins can view spend logs"
ON public.banner_campaign_spend_log FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor')
));

CREATE POLICY "System can insert spend logs"
ON public.banner_campaign_spend_log FOR INSERT
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_banner_campaigns_banner_id ON public.banner_campaigns(banner_id);
CREATE INDEX idx_banner_campaigns_status ON public.banner_campaigns(status);
CREATE INDEX idx_banner_campaigns_dates ON public.banner_campaigns(starts_at, ends_at);
CREATE INDEX idx_banner_campaign_spend_log_campaign_id ON public.banner_campaign_spend_log(campaign_id);
CREATE INDEX idx_banner_campaign_spend_log_created_at ON public.banner_campaign_spend_log(created_at);
CREATE INDEX idx_banner_clicks_coordinates ON public.banner_clicks(banner_id, click_x, click_y);

-- Trigger to update updated_at
CREATE TRIGGER update_banner_campaigns_updated_at
BEFORE UPDATE ON public.banner_campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();