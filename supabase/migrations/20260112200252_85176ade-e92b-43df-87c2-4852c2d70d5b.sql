-- Tabela para faturas de campanhas de banners
CREATE TABLE public.banner_campaign_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.banner_campaigns(id) ON DELETE CASCADE,
  receivable_id uuid REFERENCES public.receivables(id),
  invoice_period_start date NOT NULL,
  invoice_period_end date NOT NULL,
  impressions_count integer DEFAULT 0,
  clicks_count integer DEFAULT 0,
  amount_impressions numeric(10,2) DEFAULT 0,
  amount_clicks numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date date,
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indices para performance
CREATE INDEX idx_campaign_invoices_campaign ON public.banner_campaign_invoices(campaign_id);
CREATE INDEX idx_campaign_invoices_status ON public.banner_campaign_invoices(status);

-- RLS para faturas
ALTER TABLE public.banner_campaign_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invoices"
ON public.banner_campaign_invoices FOR ALL
USING (public.is_admin_or_editor(auth.uid()));

-- Adicionar campos de localizacao em banner_impressions
ALTER TABLE public.banner_impressions
ADD COLUMN IF NOT EXISTS country_code text,
ADD COLUMN IF NOT EXISTS region_code text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS ip_hash text;

-- Adicionar campos em banner_clicks (alguns ja existem da migracao anterior)
ALTER TABLE public.banner_clicks
ADD COLUMN IF NOT EXISTS country_code text,
ADD COLUMN IF NOT EXISTS region_code text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS ip_hash text;

-- Tabela para regras de geo-targeting
CREATE TABLE public.banner_geo_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id uuid NOT NULL REFERENCES public.super_banners(id) ON DELETE CASCADE,
  rule_type text NOT NULL CHECK (rule_type IN ('include', 'exclude')),
  country_codes text[] DEFAULT '{}',
  region_codes text[] DEFAULT '{}',
  cities text[] DEFAULT '{}',
  priority integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Indice para performance
CREATE INDEX idx_geo_rules_banner ON public.banner_geo_rules(banner_id);
CREATE INDEX idx_geo_rules_active ON public.banner_geo_rules(is_active) WHERE is_active = true;

-- RLS para regras geo
ALTER TABLE public.banner_geo_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active geo rules"
ON public.banner_geo_rules FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage geo rules"
ON public.banner_geo_rules FOR ALL
USING (public.is_admin_or_editor(auth.uid()));