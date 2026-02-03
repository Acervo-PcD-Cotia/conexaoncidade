-- ============================================
-- PostSocial Module - Complete Schema
-- ============================================

-- Drop existing tables if they exist (to rebuild properly)
DROP TABLE IF EXISTS public.social_post_logs CASCADE;
DROP TABLE IF EXISTS public.social_post_targets CASCADE;
DROP TABLE IF EXISTS public.social_posts CASCADE;
DROP TABLE IF EXISTS public.social_accounts CASCADE;

-- Create enum for social platforms
DO $$ BEGIN
  CREATE TYPE social_platform AS ENUM (
    'instagram', 'facebook', 'x', 'linkedin', 
    'tiktok', 'youtube', 'pinterest', 'whatsapp', 'telegram'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for account types
DO $$ BEGIN
  CREATE TYPE social_account_type AS ENUM ('page', 'business', 'creator', 'channel', 'personal');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for post status
DO $$ BEGIN
  CREATE TYPE social_post_status AS ENUM ('draft', 'scheduled', 'processing', 'done', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for target status
DO $$ BEGIN
  CREATE TYPE social_target_status AS ENUM ('draft', 'scheduled', 'queued', 'processing', 'done', 'failed', 'assisted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for origin type
DO $$ BEGIN
  CREATE TYPE social_origin_type AS ENUM ('news', 'ad', 'publidoor', 'campaign360', 'manual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 1. social_accounts - Connected social accounts
-- ============================================
CREATE TABLE public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  display_name TEXT NOT NULL,
  username TEXT,
  account_type social_account_type DEFAULT 'page',
  provider_account_id TEXT,
  token_ref TEXT, -- Secure reference, never raw token
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  default_enabled BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform, provider_account_id)
);

-- ============================================
-- 2. social_posts - Master posts
-- ============================================
CREATE TABLE public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  origin_type social_origin_type DEFAULT 'manual',
  origin_id UUID, -- Reference to news/ad/campaign
  title TEXT NOT NULL,
  base_caption TEXT,
  link_url TEXT,
  media_json JSONB DEFAULT '[]', -- Array of {url, type, alt}
  status_global social_post_status DEFAULT 'draft',
  template_id UUID,
  hashtags TEXT[],
  utm_params JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. social_post_targets - One per network
-- ============================================
CREATE TABLE public.social_post_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE NOT NULL,
  social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE CASCADE NOT NULL,
  caption_override TEXT,
  media_override JSONB, -- Override media for this network
  scheduled_at TIMESTAMPTZ,
  status social_target_status DEFAULT 'draft',
  provider_post_id TEXT, -- ID from the social network
  provider_post_url TEXT, -- URL to the published post
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  error_message TEXT,
  assisted_at TIMESTAMPTZ, -- When marked as assisted
  posted_at TIMESTAMPTZ, -- When actually posted
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. social_post_logs - Audit trail
-- ============================================
CREATE TABLE public.social_post_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID REFERENCES public.social_post_targets(id) ON DELETE CASCADE NOT NULL,
  event TEXT NOT NULL, -- queued, sent, error, retry, assisted, manual_complete
  level TEXT DEFAULT 'info', -- info, warn, error
  message TEXT,
  payload_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. social_templates - Reusable templates
-- ============================================
CREATE TABLE public.social_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  origin_type social_origin_type DEFAULT 'manual',
  caption_template TEXT NOT NULL,
  hashtags TEXT[],
  platforms social_platform[],
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_social_accounts_user ON public.social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON public.social_accounts(platform);
CREATE INDEX idx_social_accounts_active ON public.social_accounts(is_active) WHERE is_active = true;

CREATE INDEX idx_social_posts_user ON public.social_posts(user_id);
CREATE INDEX idx_social_posts_origin ON public.social_posts(origin_type, origin_id);
CREATE INDEX idx_social_posts_status ON public.social_posts(status_global);
CREATE INDEX idx_social_posts_created ON public.social_posts(created_at DESC);

CREATE INDEX idx_social_targets_post ON public.social_post_targets(post_id);
CREATE INDEX idx_social_targets_account ON public.social_post_targets(social_account_id);
CREATE INDEX idx_social_targets_status ON public.social_post_targets(status);
CREATE INDEX idx_social_targets_scheduled ON public.social_post_targets(scheduled_at) 
  WHERE status IN ('scheduled', 'queued');
CREATE INDEX idx_social_targets_retry ON public.social_post_targets(next_retry_at) 
  WHERE status = 'failed' AND attempts < max_attempts;

CREATE INDEX idx_social_logs_target ON public.social_post_logs(target_id);
CREATE INDEX idx_social_logs_created ON public.social_post_logs(created_at DESC);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_templates ENABLE ROW LEVEL SECURITY;

-- social_accounts policies
CREATE POLICY "Users can view own accounts" ON public.social_accounts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON public.social_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON public.social_accounts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON public.social_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- social_posts policies
CREATE POLICY "Users can view own posts" ON public.social_posts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own posts" ON public.social_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.social_posts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.social_posts
  FOR DELETE USING (auth.uid() = user_id);

-- social_post_targets policies (via post ownership)
CREATE POLICY "Users can view own targets" ON public.social_post_targets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.social_posts WHERE id = post_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can insert own targets" ON public.social_post_targets
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.social_posts WHERE id = post_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can update own targets" ON public.social_post_targets
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.social_posts WHERE id = post_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can delete own targets" ON public.social_post_targets
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.social_posts WHERE id = post_id AND user_id = auth.uid())
  );

-- social_post_logs policies (via target->post ownership)
CREATE POLICY "Users can view own logs" ON public.social_post_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.social_post_targets t
      JOIN public.social_posts p ON t.post_id = p.id
      WHERE t.id = target_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own logs" ON public.social_post_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.social_post_targets t
      JOIN public.social_posts p ON t.post_id = p.id
      WHERE t.id = target_id AND p.user_id = auth.uid()
    )
  );

-- social_templates policies
CREATE POLICY "Users can view own templates" ON public.social_templates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON public.social_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON public.social_templates
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON public.social_templates
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_targets_updated_at
  BEFORE UPDATE ON public.social_post_targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_templates_updated_at
  BEFORE UPDATE ON public.social_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function to update global post status
-- ============================================
CREATE OR REPLACE FUNCTION update_post_global_status()
RETURNS TRIGGER AS $$
DECLARE
  total_count INTEGER;
  done_count INTEGER;
  failed_count INTEGER;
  processing_count INTEGER;
  scheduled_count INTEGER;
  new_status social_post_status;
BEGIN
  -- Count targets by status
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'done'),
    COUNT(*) FILTER (WHERE status IN ('failed', 'assisted')),
    COUNT(*) FILTER (WHERE status IN ('processing', 'queued')),
    COUNT(*) FILTER (WHERE status = 'scheduled')
  INTO total_count, done_count, failed_count, processing_count, scheduled_count
  FROM public.social_post_targets
  WHERE post_id = COALESCE(NEW.post_id, OLD.post_id);
  
  -- Determine global status
  IF total_count = 0 THEN
    new_status := 'draft';
  ELSIF done_count = total_count THEN
    new_status := 'done';
  ELSIF failed_count = total_count THEN
    new_status := 'failed';
  ELSIF processing_count > 0 THEN
    new_status := 'processing';
  ELSIF scheduled_count > 0 THEN
    new_status := 'scheduled';
  ELSE
    new_status := 'draft';
  END IF;
  
  -- Update parent post
  UPDATE public.social_posts
  SET status_global = new_status
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_post_global_status
  AFTER INSERT OR UPDATE OR DELETE ON public.social_post_targets
  FOR EACH ROW EXECUTE FUNCTION update_post_global_status();