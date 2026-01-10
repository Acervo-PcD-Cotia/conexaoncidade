-- Tabela de preferências de notificação para administradores
CREATE TABLE public.admin_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  notify_pending_news BOOLEAN DEFAULT true,
  notify_pending_factcheck BOOLEAN DEFAULT true,
  notify_community_reports BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de configurações do site
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID,
  UNIQUE(tenant_id, key)
);

-- Inserir configuração inicial de manutenção
INSERT INTO public.site_settings (key, value) VALUES (
  'maintenance',
  '{"enabled": false, "message": "Estamos em manutenção programada. Voltaremos em breve!", "estimated_end": null}'::jsonb
);

-- Enable RLS
ALTER TABLE public.admin_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_notification_preferences
CREATE POLICY "Users can view their own notification preferences"
ON public.admin_notification_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
ON public.admin_notification_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
ON public.admin_notification_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for site_settings
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_admin_notification_preferences_updated_at
  BEFORE UPDATE ON public.admin_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();