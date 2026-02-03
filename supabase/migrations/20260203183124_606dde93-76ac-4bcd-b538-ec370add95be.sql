-- =====================================================
-- MÓDULO: COMPROVANTES DE CAMPANHA
-- Tabelas para documentação comprobatória de veiculação
-- =====================================================

-- 1. Tabela principal: campaign_proofs
CREATE TABLE public.campaign_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  insertion_order TEXT NOT NULL,
  internal_number TEXT,
  internal_code TEXT,
  site_name TEXT NOT NULL DEFAULT 'Jornal Conexão na Cidade',
  site_domain TEXT NOT NULL DEFAULT 'www.conexaonacidade.com.br',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'sent')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para busca
CREATE INDEX idx_campaign_proofs_client ON public.campaign_proofs(client_name);
CREATE INDEX idx_campaign_proofs_insertion_order ON public.campaign_proofs(insertion_order);
CREATE INDEX idx_campaign_proofs_status ON public.campaign_proofs(status);
CREATE INDEX idx_campaign_proofs_dates ON public.campaign_proofs(start_date, end_date);

-- 2. Canais de veiculação
CREATE TABLE public.campaign_proof_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_proof_id UUID NOT NULL REFERENCES public.campaign_proofs(id) ON DELETE CASCADE,
  channel_name TEXT NOT NULL,
  channel_value TEXT,
  channel_metric TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_proof_channels_campaign ON public.campaign_proof_channels(campaign_proof_id);

-- 3. Assets (prints e imagens)
CREATE TABLE public.campaign_proof_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_proof_id UUID NOT NULL REFERENCES public.campaign_proofs(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('VEICULACAO_PRINT', 'ANALYTICS_PRINT', 'CAPA_IMAGEM')),
  file_path TEXT NOT NULL,
  file_url TEXT,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_proof_assets_campaign ON public.campaign_proof_assets(campaign_proof_id);
CREATE INDEX idx_proof_assets_type ON public.campaign_proof_assets(asset_type);

-- 4. Métricas manuais do Analytics (1:1 com campaign_proofs)
CREATE TABLE public.campaign_proof_analytics (
  campaign_proof_id UUID PRIMARY KEY REFERENCES public.campaign_proofs(id) ON DELETE CASCADE,
  users INT,
  new_users INT,
  pageviews INT,
  unique_pageviews INT,
  sessions INT,
  bounce_rate NUMERIC(5,2),
  avg_time TEXT,
  entrances INT,
  show_on_pdf BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Documentos gerados (PDFs)
CREATE TABLE public.campaign_proof_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_proof_id UUID NOT NULL REFERENCES public.campaign_proofs(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('VEICULACAO', 'ANALYTICS', 'BOTH_ZIP')),
  version INT NOT NULL DEFAULT 1,
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_proof_documents_campaign ON public.campaign_proof_documents(campaign_proof_id);
CREATE INDEX idx_proof_documents_type ON public.campaign_proof_documents(doc_type);

-- =====================================================
-- RLS POLICIES (Admin/Editor only)
-- =====================================================

-- Enable RLS
ALTER TABLE public.campaign_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_proof_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_proof_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_proof_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_proof_documents ENABLE ROW LEVEL SECURITY;

-- campaign_proofs policies
CREATE POLICY "Admin/Editor can view campaign_proofs"
  ON public.campaign_proofs FOR SELECT
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admin/Editor can insert campaign_proofs"
  ON public.campaign_proofs FOR INSERT
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admin/Editor can update campaign_proofs"
  ON public.campaign_proofs FOR UPDATE
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admin/Editor can delete campaign_proofs"
  ON public.campaign_proofs FOR DELETE
  USING (public.is_admin_or_editor(auth.uid()));

-- campaign_proof_channels policies
CREATE POLICY "Admin/Editor can manage proof_channels"
  ON public.campaign_proof_channels FOR ALL
  USING (public.is_admin_or_editor(auth.uid()));

-- campaign_proof_assets policies
CREATE POLICY "Admin/Editor can manage proof_assets"
  ON public.campaign_proof_assets FOR ALL
  USING (public.is_admin_or_editor(auth.uid()));

-- campaign_proof_analytics policies
CREATE POLICY "Admin/Editor can manage proof_analytics"
  ON public.campaign_proof_analytics FOR ALL
  USING (public.is_admin_or_editor(auth.uid()));

-- campaign_proof_documents policies
CREATE POLICY "Admin/Editor can manage proof_documents"
  ON public.campaign_proof_documents FOR ALL
  USING (public.is_admin_or_editor(auth.uid()));

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at
CREATE TRIGGER update_campaign_proofs_updated_at
  BEFORE UPDATE ON public.campaign_proofs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_proof_analytics_updated_at
  BEFORE UPDATE ON public.campaign_proof_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- STORAGE BUCKET: campaign-proofs (private)
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-proofs',
  'campaign-proofs',
  false,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/zip']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Admin/Editor can upload to campaign-proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'campaign-proofs' 
    AND public.is_admin_or_editor(auth.uid())
  );

CREATE POLICY "Admin/Editor can view campaign-proofs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'campaign-proofs' 
    AND public.is_admin_or_editor(auth.uid())
  );

CREATE POLICY "Admin/Editor can update campaign-proofs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'campaign-proofs' 
    AND public.is_admin_or_editor(auth.uid())
  );

CREATE POLICY "Admin/Editor can delete campaign-proofs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'campaign-proofs' 
    AND public.is_admin_or_editor(auth.uid())
  );