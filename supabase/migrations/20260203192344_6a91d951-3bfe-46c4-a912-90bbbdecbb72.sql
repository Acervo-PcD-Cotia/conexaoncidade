-- =====================================================
-- MÓDULO: EMISSÃO DE NFS-e (Notas Fiscais de Serviço)
-- =====================================================

-- 1. Tabela: billing_clients (Tomadores de Serviço)
CREATE TABLE public.billing_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  legal_name TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  im TEXT,
  address_line TEXT,
  city TEXT,
  state TEXT,
  email TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_billing_clients_user ON public.billing_clients(user_id);
CREATE INDEX idx_billing_clients_default ON public.billing_clients(user_id, is_default) WHERE is_default = true;

-- RLS
ALTER TABLE public.billing_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own billing clients"
ON public.billing_clients FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own billing clients"
ON public.billing_clients FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own billing clients"
ON public.billing_clients FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own billing clients"
ON public.billing_clients FOR DELETE
USING (auth.uid() = user_id);

-- Trigger: Garantir apenas 1 default por user_id
CREATE OR REPLACE FUNCTION public.ensure_single_default_billing_client()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.billing_clients
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_ensure_single_default_billing_client
BEFORE INSERT OR UPDATE ON public.billing_clients
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_default_billing_client();

-- 2. Tabela: billing_client_defaults (Configurações por Cliente)
CREATE TABLE public.billing_client_defaults (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.billing_clients(id) ON DELETE CASCADE,
  service_code TEXT NOT NULL DEFAULT '107',
  cnae TEXT NOT NULL DEFAULT '6209100',
  iss_rate NUMERIC(5,2) NOT NULL DEFAULT 2.00,
  service_description_short TEXT,
  invoice_text_template TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_billing_client_defaults_client ON public.billing_client_defaults(client_id);

-- RLS (herda do billing_clients via join)
ALTER TABLE public.billing_client_defaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view defaults of their clients"
ON public.billing_client_defaults FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.billing_clients bc
  WHERE bc.id = client_id AND bc.user_id = auth.uid()
));

CREATE POLICY "Users can create defaults for their clients"
ON public.billing_client_defaults FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.billing_clients bc
  WHERE bc.id = client_id AND bc.user_id = auth.uid()
));

CREATE POLICY "Users can update defaults of their clients"
ON public.billing_client_defaults FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.billing_clients bc
  WHERE bc.id = client_id AND bc.user_id = auth.uid()
));

CREATE POLICY "Users can delete defaults of their clients"
ON public.billing_client_defaults FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.billing_clients bc
  WHERE bc.id = client_id AND bc.user_id = auth.uid()
));

-- 3. Tabela: billing_provider_profile (Prestador de Serviço)
CREATE TABLE public.billing_provider_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  legal_name TEXT NOT NULL,
  trade_name TEXT,
  cnpj TEXT NOT NULL,
  im TEXT,
  address_line TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_billing_provider_user ON public.billing_provider_profile(user_id);

-- RLS
ALTER TABLE public.billing_provider_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own provider profile"
ON public.billing_provider_profile FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own provider profile"
ON public.billing_provider_profile FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider profile"
ON public.billing_provider_profile FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER trg_billing_provider_updated_at
BEFORE UPDATE ON public.billing_provider_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Tabela: campaign_proof_invoices (NFS-e vinculada ao comprovante)
CREATE TABLE public.campaign_proof_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_proof_id UUID REFERENCES public.campaign_proofs(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES public.billing_clients(id),
  pi_number TEXT NOT NULL,
  description_final TEXT NOT NULL,
  service_code TEXT,
  cnae TEXT,
  iss_rate NUMERIC(5,2),
  service_description_short TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued')),
  nf_number TEXT,
  nf_verification_code TEXT,
  nf_issue_datetime TIMESTAMPTZ,
  nf_pdf_url TEXT,
  client_snapshot JSONB,
  provider_snapshot JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_proof_invoices_user ON public.campaign_proof_invoices(user_id);
CREATE INDEX idx_proof_invoices_proof ON public.campaign_proof_invoices(campaign_proof_id);
CREATE INDEX idx_proof_invoices_status ON public.campaign_proof_invoices(status);
CREATE INDEX idx_proof_invoices_client ON public.campaign_proof_invoices(client_id);

-- RLS
ALTER TABLE public.campaign_proof_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoices"
ON public.campaign_proof_invoices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own invoices"
ON public.campaign_proof_invoices FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
ON public.campaign_proof_invoices FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
ON public.campaign_proof_invoices FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER trg_proof_invoices_updated_at
BEFORE UPDATE ON public.campaign_proof_invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Tabela: campaign_proof_invoice_files (Arquivos anexos)
CREATE TABLE public.campaign_proof_invoice_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.campaign_proof_invoices(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('pi_pdf', 'evidence', 'nf_pdf', 'other')),
  file_url TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoice_files_invoice ON public.campaign_proof_invoice_files(invoice_id);

-- RLS (herda do campaign_proof_invoices via join)
ALTER TABLE public.campaign_proof_invoice_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files of their invoices"
ON public.campaign_proof_invoice_files FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.campaign_proof_invoices inv
  WHERE inv.id = invoice_id AND inv.user_id = auth.uid()
));

CREATE POLICY "Users can create files for their invoices"
ON public.campaign_proof_invoice_files FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.campaign_proof_invoices inv
  WHERE inv.id = invoice_id AND inv.user_id = auth.uid()
));

CREATE POLICY "Users can delete files of their invoices"
ON public.campaign_proof_invoice_files FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.campaign_proof_invoices inv
  WHERE inv.id = invoice_id AND inv.user_id = auth.uid()
));

-- 6. Tabela: campaign_proof_invoice_audit (Auditoria)
CREATE TABLE public.campaign_proof_invoice_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.campaign_proof_invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoice_audit_invoice ON public.campaign_proof_invoice_audit(invoice_id);
CREATE INDEX idx_invoice_audit_user ON public.campaign_proof_invoice_audit(user_id);

-- RLS
ALTER TABLE public.campaign_proof_invoice_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit of their invoices"
ON public.campaign_proof_invoice_audit FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.campaign_proof_invoices inv
  WHERE inv.id = invoice_id AND inv.user_id = auth.uid()
));

CREATE POLICY "Users can create audit for their invoices"
ON public.campaign_proof_invoice_audit FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 7. Storage bucket para notas fiscais
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-invoices',
  'campaign-invoices',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Policies para o bucket
CREATE POLICY "Users can view their own invoice files"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaign-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own invoice files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'campaign-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own invoice files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'campaign-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own invoice files"
ON storage.objects FOR DELETE
USING (bucket_id = 'campaign-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);