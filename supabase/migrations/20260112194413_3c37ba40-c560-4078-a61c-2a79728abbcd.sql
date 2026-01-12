-- Tabela para testes A/B de banners
CREATE TABLE public.banner_ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  banner_a_id uuid REFERENCES public.super_banners(id) ON DELETE CASCADE,
  banner_b_id uuid REFERENCES public.super_banners(id) ON DELETE CASCADE,
  traffic_split integer DEFAULT 50 CHECK (traffic_split >= 0 AND traffic_split <= 100),
  status text DEFAULT 'running' CHECK (status IN ('running', 'paused', 'completed')),
  winner_id uuid REFERENCES public.super_banners(id),
  confidence_level numeric(5,2),
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela para configurações de alertas de banners
CREATE TABLE public.banner_alerts_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id uuid REFERENCES public.super_banners(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('expiring', 'low_ctr')),
  threshold_days integer DEFAULT 3,
  threshold_ctr numeric(5,2) DEFAULT 1.0,
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Tabela para histórico de alertas de banners
CREATE TABLE public.banner_alerts_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id uuid REFERENCES public.super_banners(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Tabela para rastrear qual variante foi exibida em A/B tests
CREATE TABLE public.banner_ab_impressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES public.banner_ab_tests(id) ON DELETE CASCADE,
  banner_id uuid REFERENCES public.super_banners(id) ON DELETE CASCADE,
  session_id text,
  variant text CHECK (variant IN ('A', 'B')),
  converted boolean DEFAULT false,
  viewed_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_banner_ab_tests_status ON public.banner_ab_tests(status);
CREATE INDEX idx_banner_alerts_log_unread ON public.banner_alerts_log(is_read) WHERE is_read = false;
CREATE INDEX idx_banner_ab_impressions_test ON public.banner_ab_impressions(test_id);
CREATE INDEX idx_banner_ab_impressions_session ON public.banner_ab_impressions(session_id);

-- RLS para banner_ab_tests
ALTER TABLE public.banner_ab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read banner_ab_tests"
ON public.banner_ab_tests FOR SELECT USING (true);

CREATE POLICY "Allow admin insert banner_ab_tests"
ON public.banner_ab_tests FOR INSERT
WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Allow admin update banner_ab_tests"
ON public.banner_ab_tests FOR UPDATE
USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Allow admin delete banner_ab_tests"
ON public.banner_ab_tests FOR DELETE
USING (public.is_admin_or_editor(auth.uid()));

-- RLS para banner_alerts_config
ALTER TABLE public.banner_alerts_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin read banner_alerts_config"
ON public.banner_alerts_config FOR SELECT
USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Allow admin insert banner_alerts_config"
ON public.banner_alerts_config FOR INSERT
WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Allow admin update banner_alerts_config"
ON public.banner_alerts_config FOR UPDATE
USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Allow admin delete banner_alerts_config"
ON public.banner_alerts_config FOR DELETE
USING (public.is_admin_or_editor(auth.uid()));

-- RLS para banner_alerts_log
ALTER TABLE public.banner_alerts_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin read banner_alerts_log"
ON public.banner_alerts_log FOR SELECT
USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Allow admin update banner_alerts_log"
ON public.banner_alerts_log FOR UPDATE
USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Allow admin delete banner_alerts_log"
ON public.banner_alerts_log FOR DELETE
USING (public.is_admin_or_editor(auth.uid()));

-- RLS para banner_ab_impressions
ALTER TABLE public.banner_ab_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert banner_ab_impressions"
ON public.banner_ab_impressions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin read banner_ab_impressions"
ON public.banner_ab_impressions FOR SELECT
USING (public.is_admin_or_editor(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_banner_ab_tests_updated_at
BEFORE UPDATE ON public.banner_ab_tests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();