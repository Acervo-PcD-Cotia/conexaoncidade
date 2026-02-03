-- =============================================
-- GUIA COMERCIAL - COMPLETE DATABASE SCHEMA
-- =============================================

-- Enum for business plans
CREATE TYPE business_plan AS ENUM ('free', 'pro', 'premium');

-- Enum for lead status
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'converted', 'lost');

-- Enum for verification status
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- =============================================
-- MAIN TABLES
-- =============================================

-- 1. Businesses (Main directory table)
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  tagline TEXT,
  description_short TEXT,
  description_full TEXT,
  
  -- Categories
  category_main TEXT NOT NULL,
  categories_secondary TEXT[] DEFAULT '{}',
  
  -- Location
  city TEXT NOT NULL,
  state TEXT DEFAULT 'SP',
  neighborhoods TEXT[] DEFAULT '{}',
  address TEXT,
  address_complement TEXT,
  cep TEXT,
  latitude FLOAT,
  longitude FLOAT,
  service_radius_km INT DEFAULT 10,
  
  -- Contact
  whatsapp TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  google_maps_url TEXT,
  
  -- Media
  logo_url TEXT,
  cover_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  video_url TEXT,
  
  -- Business details
  opening_hours JSONB DEFAULT '{}',
  payment_methods TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  -- Verification & Plan
  plan business_plan DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  verification_status verification_status DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  
  -- Stats
  views_count INT DEFAULT 0,
  whatsapp_clicks INT DEFAULT 0,
  phone_clicks INT DEFAULT 0,
  website_clicks INT DEFAULT 0,
  leads_count INT DEFAULT 0,
  
  -- Ratings
  avg_rating NUMERIC(2,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Unique constraint
  CONSTRAINT businesses_slug_tenant_unique UNIQUE (slug, tenant_id)
);

-- 2. Business Categories (Master list)
CREATE TABLE public.business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  parent_id UUID REFERENCES public.business_categories(id) ON DELETE SET NULL,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  page_content TEXT,
  
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT business_categories_slug_tenant_unique UNIQUE (slug, tenant_id)
);

-- 3. Business Reviews
CREATE TABLE public.business_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  author_name TEXT,
  author_email TEXT,
  
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  
  pros TEXT[],
  cons TEXT[],
  
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  reply TEXT,
  replied_at TIMESTAMPTZ,
  replied_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Business Leads (Contact requests)
CREATE TABLE public.business_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  -- Contact info
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  
  -- Request details
  service_needed TEXT,
  message TEXT,
  preferred_contact TEXT DEFAULT 'whatsapp',
  urgency TEXT DEFAULT 'normal',
  
  -- Source tracking
  source TEXT DEFAULT 'guia',
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Status
  status lead_status DEFAULT 'new',
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

-- 5. Business Click Tracking
CREATE TABLE public.business_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  click_type TEXT NOT NULL, -- whatsapp, phone, website, directions, instagram
  
  -- Context
  source_page TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Business Services (for detailed listing)
CREATE TABLE public.business_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  price_min NUMERIC(10,2),
  price_max NUMERIC(10,2),
  price_unit TEXT, -- hora, serviço, m², etc
  duration_minutes INT,
  
  is_highlighted BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Business FAQ
CREATE TABLE public.business_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Business Promotions
CREATE TABLE public.business_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT, -- percentage, fixed, freebie
  discount_value NUMERIC(10,2),
  
  code TEXT,
  
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. SEO Landing Pages (Programmatic)
CREATE TABLE public.guia_seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  
  -- URL structure
  page_type TEXT NOT NULL, -- category, city, neighborhood, service
  slug TEXT NOT NULL,
  
  -- Content
  title TEXT NOT NULL,
  h1_title TEXT,
  intro_text TEXT,
  content_html TEXT,
  
  -- Filters
  category_slug TEXT,
  city TEXT,
  neighborhood TEXT,
  service_type TEXT,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  
  -- Stats
  views_count INT DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT guia_seo_pages_slug_tenant_unique UNIQUE (slug, tenant_id)
);

-- 10. Plan Features
CREATE TABLE public.business_plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  plan business_plan NOT NULL,
  feature_key TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  feature_value TEXT,
  
  is_enabled BOOLEAN DEFAULT true,
  
  UNIQUE (plan, feature_key)
);

-- Insert default plan features
INSERT INTO public.business_plan_features (plan, feature_key, feature_name, feature_value, is_enabled) VALUES
  -- Free plan
  ('free', 'listing', 'Listagem básica', 'true', true),
  ('free', 'photos', 'Fotos', '3', true),
  ('free', 'reviews', 'Avaliações', 'true', true),
  ('free', 'position', 'Posição nos resultados', 'normal', true),
  ('free', 'badge', 'Selo verificado', 'false', false),
  ('free', 'analytics', 'Analytics básico', 'true', true),
  ('free', 'leads', 'Leads mensais', '5', true),
  -- Pro plan
  ('pro', 'listing', 'Listagem completa', 'true', true),
  ('pro', 'photos', 'Fotos', '10', true),
  ('pro', 'reviews', 'Avaliações', 'true', true),
  ('pro', 'position', 'Posição nos resultados', 'priority', true),
  ('pro', 'badge', 'Selo verificado', 'true', true),
  ('pro', 'analytics', 'Analytics completo', 'true', true),
  ('pro', 'leads', 'Leads mensais', 'unlimited', true),
  ('pro', 'services', 'Catálogo de serviços', 'true', true),
  ('pro', 'promotions', 'Promoções', '2', true),
  -- Premium plan
  ('premium', 'listing', 'Listagem premium', 'true', true),
  ('premium', 'photos', 'Fotos', 'unlimited', true),
  ('premium', 'reviews', 'Avaliações', 'true', true),
  ('premium', 'position', 'Posição nos resultados', 'top', true),
  ('premium', 'badge', 'Selo verificado', 'true', true),
  ('premium', 'analytics', 'Analytics avançado', 'true', true),
  ('premium', 'leads', 'Leads mensais', 'unlimited', true),
  ('premium', 'services', 'Catálogo de serviços', 'true', true),
  ('premium', 'promotions', 'Promoções', 'unlimited', true),
  ('premium', 'featured', 'Destaque em categorias', 'true', true),
  ('premium', 'news_integration', 'Integração com notícias', 'true', true),
  ('premium', 'video', 'Vídeo institucional', 'true', true);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_businesses_tenant ON public.businesses(tenant_id);
CREATE INDEX idx_businesses_city ON public.businesses(city);
CREATE INDEX idx_businesses_category ON public.businesses(category_main);
CREATE INDEX idx_businesses_plan ON public.businesses(plan);
CREATE INDEX idx_businesses_active ON public.businesses(is_active) WHERE is_active = true;
CREATE INDEX idx_businesses_verified ON public.businesses(verification_status) WHERE verification_status = 'verified';
CREATE INDEX idx_businesses_featured ON public.businesses(is_featured, featured_until) WHERE is_featured = true;
CREATE INDEX idx_businesses_location ON public.businesses(latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX idx_businesses_neighborhoods ON public.businesses USING GIN(neighborhoods);
CREATE INDEX idx_businesses_tags ON public.businesses USING GIN(tags);
CREATE INDEX idx_businesses_search ON public.businesses USING GIN(to_tsvector('portuguese', coalesce(name, '') || ' ' || coalesce(description_short, '') || ' ' || coalesce(category_main, '')));

CREATE INDEX idx_business_reviews_business ON public.business_reviews(business_id);
CREATE INDEX idx_business_reviews_approved ON public.business_reviews(is_approved) WHERE is_approved = true;

CREATE INDEX idx_business_leads_business ON public.business_leads(business_id);
CREATE INDEX idx_business_leads_status ON public.business_leads(status);

CREATE INDEX idx_business_clicks_business ON public.business_clicks(business_id);
CREATE INDEX idx_business_clicks_date ON public.business_clicks(created_at);

CREATE INDEX idx_guia_seo_pages_tenant ON public.guia_seo_pages(tenant_id);
CREATE INDEX idx_guia_seo_pages_type ON public.guia_seo_pages(page_type);

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated at trigger
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guia_seo_pages_updated_at
  BEFORE UPDATE ON public.guia_seo_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update business rating when review is added/updated
CREATE OR REPLACE FUNCTION public.update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.businesses SET
    avg_rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) 
      FROM public.business_reviews 
      WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
        AND is_approved = true
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM public.business_reviews 
      WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
        AND is_approved = true
    )
  WHERE id = COALESCE(NEW.business_id, OLD.business_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_business_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.business_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_business_rating();

-- Update click counts
CREATE OR REPLACE FUNCTION public.update_business_click_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.click_type = 'whatsapp' THEN
    UPDATE public.businesses SET whatsapp_clicks = whatsapp_clicks + 1 WHERE id = NEW.business_id;
  ELSIF NEW.click_type = 'phone' THEN
    UPDATE public.businesses SET phone_clicks = phone_clicks + 1 WHERE id = NEW.business_id;
  ELSIF NEW.click_type = 'website' THEN
    UPDATE public.businesses SET website_clicks = website_clicks + 1 WHERE id = NEW.business_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_business_click_counts_trigger
  AFTER INSERT ON public.business_clicks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_business_click_counts();

-- Update leads count
CREATE OR REPLACE FUNCTION public.update_business_leads_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.businesses SET
    leads_count = (
      SELECT COUNT(*) FROM public.business_leads WHERE business_id = NEW.business_id
    )
  WHERE id = NEW.business_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_business_leads_count_trigger
  AFTER INSERT ON public.business_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_business_leads_count();

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guia_seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_plan_features ENABLE ROW LEVEL SECURITY;

-- Businesses: Public read for active, owner/admin write
CREATE POLICY "Businesses are publicly readable" ON public.businesses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Business owners can manage their businesses" ON public.businesses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all businesses" ON public.businesses
  FOR ALL USING (public.is_admin_or_editor(auth.uid()));

-- Categories: Public read
CREATE POLICY "Categories are publicly readable" ON public.business_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.business_categories
  FOR ALL USING (public.is_admin_or_editor(auth.uid()));

-- Reviews: Public read approved, users can create
CREATE POLICY "Approved reviews are publicly readable" ON public.business_reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create reviews" ON public.business_reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage reviews" ON public.business_reviews
  FOR ALL USING (public.is_admin_or_editor(auth.uid()));

-- Leads: Only business owner and admins
CREATE POLICY "Business owners can view their leads" ON public.business_leads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid())
  );

CREATE POLICY "Anyone can create leads" ON public.business_leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Business owners can manage their leads" ON public.business_leads
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all leads" ON public.business_leads
  FOR ALL USING (public.is_admin_or_editor(auth.uid()));

-- Clicks: Insert only, admin read
CREATE POLICY "Anyone can log clicks" ON public.business_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view clicks" ON public.business_clicks
  FOR SELECT USING (public.is_admin_or_editor(auth.uid()));

-- Services: Public read, owner write
CREATE POLICY "Services are publicly readable" ON public.business_services
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND is_active = true)
  );

CREATE POLICY "Business owners can manage services" ON public.business_services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- FAQs: Public read, owner write
CREATE POLICY "FAQs are publicly readable" ON public.business_faqs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND is_active = true)
  );

CREATE POLICY "Business owners can manage FAQs" ON public.business_faqs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- Promotions: Public read active, owner write
CREATE POLICY "Active promotions are publicly readable" ON public.business_promotions
  FOR SELECT USING (
    is_active = true AND
    (starts_at IS NULL OR starts_at <= now()) AND
    (ends_at IS NULL OR ends_at >= now()) AND
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND is_active = true)
  );

CREATE POLICY "Business owners can manage promotions" ON public.business_promotions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- SEO Pages: Public read, admin write
CREATE POLICY "SEO pages are publicly readable" ON public.guia_seo_pages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage SEO pages" ON public.guia_seo_pages
  FOR ALL USING (public.is_admin_or_editor(auth.uid()));

-- Plan features: Public read
CREATE POLICY "Plan features are publicly readable" ON public.business_plan_features
  FOR SELECT USING (true);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Increment views
CREATE OR REPLACE FUNCTION public.increment_business_views(p_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.businesses SET views_count = views_count + 1 WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Log click
CREATE OR REPLACE FUNCTION public.log_business_click(
  p_business_id UUID,
  p_click_type TEXT,
  p_source_page TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.business_clicks (business_id, click_type, source_page)
  VALUES (p_business_id, p_click_type, p_source_page);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Get business stats for owner
CREATE OR REPLACE FUNCTION public.get_business_stats(
  p_business_id UUID,
  p_days INT DEFAULT 30
)
RETURNS TABLE (
  total_views BIGINT,
  total_whatsapp_clicks BIGINT,
  total_phone_clicks BIGINT,
  total_website_clicks BIGINT,
  total_leads BIGINT,
  period_views BIGINT,
  period_clicks BIGINT,
  period_leads BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.views_count::BIGINT,
    b.whatsapp_clicks::BIGINT,
    b.phone_clicks::BIGINT,
    b.website_clicks::BIGINT,
    b.leads_count::BIGINT,
    (SELECT COUNT(*) FROM public.business_clicks WHERE business_id = p_business_id AND created_at > now() - (p_days || ' days')::INTERVAL AND click_type = 'view')::BIGINT,
    (SELECT COUNT(*) FROM public.business_clicks WHERE business_id = p_business_id AND created_at > now() - (p_days || ' days')::INTERVAL AND click_type != 'view')::BIGINT,
    (SELECT COUNT(*) FROM public.business_leads WHERE business_id = p_business_id AND created_at > now() - (p_days || ' days')::INTERVAL)::BIGINT
  FROM public.businesses b
  WHERE b.id = p_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;