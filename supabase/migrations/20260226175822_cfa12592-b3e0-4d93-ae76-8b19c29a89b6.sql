
-- Core Schema: configurações de dados estruturados (JSON-LD)
CREATE TABLE public.core_schema_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schema_type TEXT NOT NULL,
  label TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  auto_generate BOOLEAN DEFAULT true,
  default_data JSONB DEFAULT '{}'::jsonb,
  override_fields JSONB DEFAULT '{}'::jsonb,
  tenant_id UUID REFERENCES public.sites(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_core_schema_type ON public.core_schema_configs(schema_type, tenant_id);

ALTER TABLE public.core_schema_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage schema configs" ON public.core_schema_configs
  FOR ALL USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Public can read enabled schemas" ON public.core_schema_configs
  FOR SELECT USING (is_enabled = true);

CREATE TRIGGER update_core_schema_configs_updated_at
  BEFORE UPDATE ON public.core_schema_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
