-- ============================================
-- White Label Dashboard: Perfis e Módulos
-- ============================================

-- 1. Tabela de configuração de perfis por tenant
CREATE TABLE public.tenant_profiles_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  default_profile TEXT NOT NULL DEFAULT 'JORNALISTA',
  allowed_profiles TEXT[] NOT NULL DEFAULT ARRAY['JORNALISTA', 'INFLUENCER', 'RADIO_TV', 'IGREJA', 'EDUCADOR', 'GERACAO_COTIA'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);

-- 2. Tabela de módulos por tenant (feature flags)
CREATE TABLE public.tenant_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, module_key)
);

-- 3. Tabela de preferências do usuário por tenant
CREATE TABLE public.user_tenant_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  active_profile TEXT NOT NULL DEFAULT 'JORNALISTA',
  dismissed_onboarding BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Índices para performance
CREATE INDEX idx_tenant_profiles_config_tenant ON public.tenant_profiles_config(tenant_id);
CREATE INDEX idx_tenant_modules_tenant ON public.tenant_modules(tenant_id);
CREATE INDEX idx_tenant_modules_key ON public.tenant_modules(module_key);
CREATE INDEX idx_user_tenant_preferences_tenant ON public.user_tenant_preferences(tenant_id);
CREATE INDEX idx_user_tenant_preferences_user ON public.user_tenant_preferences(user_id);

-- Triggers para updated_at
CREATE TRIGGER update_tenant_profiles_config_updated_at
  BEFORE UPDATE ON public.tenant_profiles_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenant_modules_updated_at
  BEFORE UPDATE ON public.tenant_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_tenant_preferences_updated_at
  BEFORE UPDATE ON public.user_tenant_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Row Level Security
-- ============================================

-- tenant_profiles_config
ALTER TABLE public.tenant_profiles_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_profiles_config_select" ON public.tenant_profiles_config
  FOR SELECT USING (
    tenant_id IN (SELECT site_id FROM public.site_users WHERE user_id = auth.uid() AND status = 'active')
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "tenant_profiles_config_insert" ON public.tenant_profiles_config
  FOR INSERT WITH CHECK (
    public.is_site_admin(auth.uid(), tenant_id) OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "tenant_profiles_config_update" ON public.tenant_profiles_config
  FOR UPDATE USING (
    public.is_site_admin(auth.uid(), tenant_id) OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "tenant_profiles_config_delete" ON public.tenant_profiles_config
  FOR DELETE USING (
    public.is_super_admin(auth.uid())
  );

-- tenant_modules
ALTER TABLE public.tenant_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_modules_select" ON public.tenant_modules
  FOR SELECT USING (
    tenant_id IN (SELECT site_id FROM public.site_users WHERE user_id = auth.uid() AND status = 'active')
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "tenant_modules_insert" ON public.tenant_modules
  FOR INSERT WITH CHECK (
    public.is_site_admin(auth.uid(), tenant_id) OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "tenant_modules_update" ON public.tenant_modules
  FOR UPDATE USING (
    public.is_site_admin(auth.uid(), tenant_id) OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "tenant_modules_delete" ON public.tenant_modules
  FOR DELETE USING (
    public.is_super_admin(auth.uid())
  );

-- user_tenant_preferences
ALTER TABLE public.user_tenant_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_tenant_preferences_select" ON public.user_tenant_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_tenant_preferences_insert" ON public.user_tenant_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_tenant_preferences_update" ON public.user_tenant_preferences
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_tenant_preferences_delete" ON public.user_tenant_preferences
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- Função helper para verificar módulo habilitado
-- ============================================

CREATE OR REPLACE FUNCTION public.is_module_enabled(_tenant_id uuid, _module_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_modules
    WHERE tenant_id = _tenant_id
      AND module_key = _module_key
      AND enabled = true
  )
$$;