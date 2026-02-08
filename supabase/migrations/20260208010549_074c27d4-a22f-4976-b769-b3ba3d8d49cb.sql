
-- View 1: Agregada por news_id + src + ref_code (30 dias)
CREATE OR REPLACE VIEW public.vw_news_clicks_aggregated_30d AS
SELECT
  news_id,
  src,
  ref_code,
  COUNT(*)::int AS click_count
FROM public.news_clicks
WHERE clicked_at >= now() - interval '30 days'
GROUP BY news_id, src, ref_code;

-- View 2: Total por matéria (30 dias)
CREATE OR REPLACE VIEW public.vw_news_clicks_by_news_30d AS
SELECT
  news_id,
  COUNT(*)::int AS total_clicks
FROM public.news_clicks
WHERE clicked_at >= now() - interval '30 days'
GROUP BY news_id;

-- View 3: Territorial (30 dias)
CREATE OR REPLACE VIEW public.vw_news_clicks_by_neighborhood_30d AS
SELECT
  cm.neighborhood,
  cm.city,
  COUNT(*)::int AS total_clicks,
  COUNT(DISTINCT nc.ref_code)::int AS unique_refs
FROM public.news_clicks nc
JOIN public.community_members cm ON cm.ref_code = nc.ref_code
WHERE nc.clicked_at >= now() - interval '30 days'
  AND cm.neighborhood IS NOT NULL
GROUP BY cm.neighborhood, cm.city;

-- View 4: Territorial por matéria (30 dias)
CREATE OR REPLACE VIEW public.vw_news_clicks_by_neighborhood_news_30d AS
SELECT
  nc.news_id,
  cm.neighborhood,
  cm.city,
  COUNT(*)::int AS total_clicks,
  COUNT(DISTINCT nc.ref_code)::int AS unique_refs
FROM public.news_clicks nc
JOIN public.community_members cm ON cm.ref_code = nc.ref_code
WHERE nc.clicked_at >= now() - interval '30 days'
  AND cm.neighborhood IS NOT NULL
GROUP BY nc.news_id, cm.neighborhood, cm.city;
