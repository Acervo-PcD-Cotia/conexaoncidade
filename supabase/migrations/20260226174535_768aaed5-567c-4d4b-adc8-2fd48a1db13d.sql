
-- Tabela de métricas Core Web Vitals por página
CREATE TABLE public.core_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  lcp REAL,
  fid REAL,
  cls REAL,
  ttfb REAL,
  inp REAL,
  device_type TEXT DEFAULT 'desktop',
  connection_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de alertas de degradação
CREATE TABLE public.core_performance_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric TEXT NOT NULL,
  page_path TEXT,
  threshold REAL NOT NULL,
  current_value REAL NOT NULL,
  severity TEXT DEFAULT 'warning',
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.core_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_performance_alerts ENABLE ROW LEVEL SECURITY;

-- Métricas: qualquer um insere (tracking), admins leem
CREATE POLICY "Anyone can insert metrics" ON public.core_performance_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read metrics" ON public.core_performance_metrics FOR SELECT USING (true);

-- Alertas: apenas admins
CREATE POLICY "Admins manage alerts" ON public.core_performance_alerts FOR ALL USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Anyone can read alerts" ON public.core_performance_alerts FOR SELECT USING (true);

-- Índices
CREATE INDEX idx_perf_metrics_created ON public.core_performance_metrics (created_at);
CREATE INDEX idx_perf_metrics_page ON public.core_performance_metrics (page_path);
CREATE INDEX idx_perf_alerts_resolved ON public.core_performance_alerts (is_resolved);
