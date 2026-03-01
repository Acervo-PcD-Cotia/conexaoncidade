
CREATE TABLE public.relatorio_txt_saved (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Sem título',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  report_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.relatorio_txt_saved ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports" ON public.relatorio_txt_saved FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports" ON public.relatorio_txt_saved FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON public.relatorio_txt_saved FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reports" ON public.relatorio_txt_saved FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_relatorio_txt_saved_updated_at
  BEFORE UPDATE ON public.relatorio_txt_saved
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
