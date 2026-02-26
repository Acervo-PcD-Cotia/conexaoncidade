
-- Core Leads: formulários de captação e leads capturados
CREATE TABLE public.core_lead_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  thank_you_message TEXT DEFAULT 'Obrigado pelo contato!',
  redirect_url TEXT,
  notify_email TEXT,
  notify_whatsapp TEXT,
  is_active BOOLEAN DEFAULT true,
  submissions_count INTEGER DEFAULT 0,
  tenant_id UUID REFERENCES public.sites(id),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.core_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES public.core_lead_forms(id) ON DELETE SET NULL,
  form_name TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  source TEXT DEFAULT 'form',
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  tags TEXT[] DEFAULT '{}',
  segment TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','converted','lost')),
  score INTEGER DEFAULT 0,
  data JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  assigned_to UUID,
  tenant_id UUID REFERENCES public.sites(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_core_leads_form_id ON public.core_leads(form_id);
CREATE INDEX idx_core_leads_status ON public.core_leads(status);
CREATE INDEX idx_core_leads_created_at ON public.core_leads(created_at DESC);
CREATE INDEX idx_core_leads_segment ON public.core_leads(segment);
CREATE INDEX idx_core_lead_forms_slug ON public.core_lead_forms(slug);

-- RLS
ALTER TABLE public.core_lead_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_leads ENABLE ROW LEVEL SECURITY;

-- Forms: admins manage, public can read active
CREATE POLICY "Admins manage lead forms" ON public.core_lead_forms
  FOR ALL USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Public can view active forms" ON public.core_lead_forms
  FOR SELECT USING (is_active = true);

-- Leads: anyone can submit, admins can manage
CREATE POLICY "Anyone can submit leads" ON public.core_leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins manage leads" ON public.core_leads
  FOR ALL USING (public.is_admin_or_editor(auth.uid()));

-- Updated at trigger
CREATE TRIGGER update_core_lead_forms_updated_at
  BEFORE UPDATE ON public.core_lead_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_core_leads_updated_at
  BEFORE UPDATE ON public.core_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Increment submissions count
CREATE OR REPLACE FUNCTION public.increment_form_submissions()
  RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.form_id IS NOT NULL THEN
    UPDATE public.core_lead_forms SET submissions_count = submissions_count + 1 WHERE id = NEW.form_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER core_leads_increment_submissions
  AFTER INSERT ON public.core_leads
  FOR EACH ROW EXECUTE FUNCTION public.increment_form_submissions();
