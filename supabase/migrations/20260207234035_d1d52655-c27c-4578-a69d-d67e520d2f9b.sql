-- Create composite indices on news_clicks if they don't exist
CREATE INDEX IF NOT EXISTS idx_news_clicks_news_id_clicked_at ON public.news_clicks (news_id, clicked_at);
CREATE INDEX IF NOT EXISTS idx_news_clicks_ref_code_clicked_at ON public.news_clicks (ref_code, clicked_at);
CREATE INDEX IF NOT EXISTS idx_news_clicks_src_clicked_at ON public.news_clicks (src, clicked_at);