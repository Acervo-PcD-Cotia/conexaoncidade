-- =====================================================
-- FASE 1: NOTIFICAÇÕES PUSH E TRACKING DE INTERESSE
-- =====================================================

-- Tabela para rastrear cliques de interesse em classificados
CREATE TABLE public.classified_interest_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classified_id UUID NOT NULL REFERENCES public.classifieds(id) ON DELETE CASCADE,
  click_type TEXT NOT NULL CHECK (click_type IN ('whatsapp', 'phone', 'email')),
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_hash TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices para performance
CREATE INDEX idx_classified_interest_clicks_classified ON public.classified_interest_clicks(classified_id);
CREATE INDEX idx_classified_interest_clicks_date ON public.classified_interest_clicks(clicked_at);

-- RLS
ALTER TABLE public.classified_interest_clicks ENABLE ROW LEVEL SECURITY;

-- Permitir inserção por qualquer um (registrar interesse)
CREATE POLICY "Anyone can register interest clicks"
  ON public.classified_interest_clicks
  FOR INSERT
  WITH CHECK (true);

-- Donos do anúncio podem ver os cliques
CREATE POLICY "Classified owners can view their interest clicks"
  ON public.classified_interest_clicks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.classifieds c
      WHERE c.id = classified_id
      AND c.user_id = auth.uid()
    )
  );

-- Admins podem ver todos
CREATE POLICY "Admins can view all interest clicks"
  ON public.classified_interest_clicks
  FOR SELECT
  USING (public.is_admin_or_editor(auth.uid()));

-- =====================================================
-- Tabela para preferências de alertas de vagas
-- =====================================================

CREATE TABLE public.job_alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categories TEXT[] DEFAULT '{}',
  job_types TEXT[] DEFAULT '{}',
  work_modes TEXT[] DEFAULT '{}',
  neighborhoods TEXT[] DEFAULT '{}',
  min_salary NUMERIC,
  keywords TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS
ALTER TABLE public.job_alert_preferences ENABLE ROW LEVEL SECURITY;

-- Usuários podem gerenciar suas próprias preferências
CREATE POLICY "Users can manage their own job alert preferences"
  ON public.job_alert_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todas
CREATE POLICY "Admins can view all job alert preferences"
  ON public.job_alert_preferences
  FOR SELECT
  USING (public.is_admin_or_editor(auth.uid()));

-- =====================================================
-- Adicionar colunas de contagem aos classificados
-- =====================================================

ALTER TABLE public.classifieds 
  ADD COLUMN IF NOT EXISTS whatsapp_clicks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS phone_clicks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS email_clicks INTEGER DEFAULT 0;

-- =====================================================
-- Adicionar colunas de contagem aos empregos
-- =====================================================

ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS application_clicks INTEGER DEFAULT 0;

-- =====================================================
-- FASE 2: DESTAQUES PAGOS
-- =====================================================

-- Tabela de destaques pagos
CREATE TABLE public.paid_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('classified', 'job')),
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_payment_id TEXT,
  stripe_checkout_session_id TEXT,
  amount_cents INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_paid_highlights_entity ON public.paid_highlights(entity_type, entity_id);
CREATE INDEX idx_paid_highlights_status ON public.paid_highlights(status);
CREATE INDEX idx_paid_highlights_expires ON public.paid_highlights(expires_at) WHERE status = 'active';

-- RLS
ALTER TABLE public.paid_highlights ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios destaques
CREATE POLICY "Users can view their own highlights"
  ON public.paid_highlights
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar destaques para si
CREATE POLICY "Users can create their own highlights"
  ON public.paid_highlights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins podem gerenciar todos
CREATE POLICY "Admins can manage all highlights"
  ON public.paid_highlights
  FOR ALL
  USING (public.is_admin_or_editor(auth.uid()));

-- Service role para webhooks (bypass RLS via service key)

-- =====================================================
-- Adicionar colunas de destaque aos classificados e empregos
-- =====================================================

ALTER TABLE public.classifieds 
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

-- =====================================================
-- Função para incrementar cliques de interesse
-- =====================================================

CREATE OR REPLACE FUNCTION public.increment_classified_interest(
  p_classified_id UUID,
  p_click_type TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_click_type = 'whatsapp' THEN
    UPDATE public.classifieds SET whatsapp_clicks = whatsapp_clicks + 1 WHERE id = p_classified_id;
  ELSIF p_click_type = 'phone' THEN
    UPDATE public.classifieds SET phone_clicks = phone_clicks + 1 WHERE id = p_classified_id;
  ELSIF p_click_type = 'email' THEN
    UPDATE public.classifieds SET email_clicks = email_clicks + 1 WHERE id = p_classified_id;
  END IF;
END;
$$;

-- =====================================================
-- Função para verificar se deve enviar notificação (rate limit)
-- =====================================================

CREATE OR REPLACE FUNCTION public.should_notify_classified_interest(
  p_classified_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  last_notification TIMESTAMPTZ;
BEGIN
  SELECT MAX(clicked_at) INTO last_notification
  FROM public.classified_interest_clicks
  WHERE classified_id = p_classified_id
    AND clicked_at > now() - INTERVAL '1 hour';
  
  RETURN last_notification IS NULL;
END;
$$;