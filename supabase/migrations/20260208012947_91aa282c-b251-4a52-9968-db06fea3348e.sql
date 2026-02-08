
-- View: aggregated 7d
CREATE OR REPLACE VIEW public.vw_news_clicks_aggregated_7d AS
SELECT news_id, src, ref_code, COUNT(*)::int AS click_count
FROM public.news_clicks
WHERE clicked_at >= now() - interval '7 days'
GROUP BY news_id, src, ref_code;

-- View: aggregated 14d
CREATE OR REPLACE VIEW public.vw_news_clicks_aggregated_14d AS
SELECT news_id, src, ref_code, COUNT(*)::int AS click_count
FROM public.news_clicks
WHERE clicked_at >= now() - interval '14 days'
GROUP BY news_id, src, ref_code;

-- View: by news 7d
CREATE OR REPLACE VIEW public.vw_news_clicks_by_news_7d AS
SELECT news_id, COUNT(*)::int AS total_clicks
FROM public.news_clicks
WHERE clicked_at >= now() - interval '7 days'
GROUP BY news_id;

-- View: by news 14d
CREATE OR REPLACE VIEW public.vw_news_clicks_by_news_14d AS
SELECT news_id, COUNT(*)::int AS total_clicks
FROM public.news_clicks
WHERE clicked_at >= now() - interval '14 days'
GROUP BY news_id;

-- View: neighborhood 7d
CREATE OR REPLACE VIEW public.vw_news_clicks_by_neighborhood_7d AS
SELECT cm.neighborhood, cm.city, COUNT(*)::int AS total_clicks, COUNT(DISTINCT nc.ref_code)::int AS unique_refs
FROM public.news_clicks nc
JOIN public.community_members cm ON cm.ref_code = nc.ref_code
WHERE nc.clicked_at >= now() - interval '7 days' AND cm.neighborhood IS NOT NULL
GROUP BY cm.neighborhood, cm.city;

-- View: neighborhood 14d
CREATE OR REPLACE VIEW public.vw_news_clicks_by_neighborhood_14d AS
SELECT cm.neighborhood, cm.city, COUNT(*)::int AS total_clicks, COUNT(DISTINCT nc.ref_code)::int AS unique_refs
FROM public.news_clicks nc
JOIN public.community_members cm ON cm.ref_code = nc.ref_code
WHERE nc.clicked_at >= now() - interval '14 days' AND cm.neighborhood IS NOT NULL
GROUP BY cm.neighborhood, cm.city;

-- View: neighborhood by news 7d
CREATE OR REPLACE VIEW public.vw_news_clicks_by_neighborhood_news_7d AS
SELECT nc.news_id, cm.neighborhood, cm.city, COUNT(*)::int AS total_clicks, COUNT(DISTINCT nc.ref_code)::int AS unique_refs
FROM public.news_clicks nc
JOIN public.community_members cm ON cm.ref_code = nc.ref_code
WHERE nc.clicked_at >= now() - interval '7 days' AND cm.neighborhood IS NOT NULL
GROUP BY nc.news_id, cm.neighborhood, cm.city;

-- View: neighborhood by news 14d
CREATE OR REPLACE VIEW public.vw_news_clicks_by_neighborhood_news_14d AS
SELECT nc.news_id, cm.neighborhood, cm.city, COUNT(*)::int AS total_clicks, COUNT(DISTINCT nc.ref_code)::int AS unique_refs
FROM public.news_clicks nc
JOIN public.community_members cm ON cm.ref_code = nc.ref_code
WHERE nc.clicked_at >= now() - interval '14 days' AND cm.neighborhood IS NOT NULL
GROUP BY nc.news_id, cm.neighborhood, cm.city;
