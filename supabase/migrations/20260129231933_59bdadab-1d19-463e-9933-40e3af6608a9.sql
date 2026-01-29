-- Sprint 3 & 6: Adicionar colunas extras e índices na tabela regional_ingest_items
ALTER TABLE public.regional_ingest_items 
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_regional_items_status 
  ON public.regional_ingest_items(status);
CREATE INDEX IF NOT EXISTS idx_regional_items_source 
  ON public.regional_ingest_items(source_id);
CREATE INDEX IF NOT EXISTS idx_regional_items_created 
  ON public.regional_ingest_items(created_at DESC);