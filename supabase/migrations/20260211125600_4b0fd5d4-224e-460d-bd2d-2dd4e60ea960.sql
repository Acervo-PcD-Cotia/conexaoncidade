
-- Update home_sections to add moduleKey "web_tv" to video_block section
UPDATE portal_templates
SET home_sections = (
  SELECT jsonb_agg(
    CASE
      WHEN elem->>'type' = 'video_block' THEN elem || '{"moduleKey": "web_tv"}'::jsonb
      ELSE elem
    END
    ORDER BY (elem->>'order')::int
  )
  FROM jsonb_array_elements(home_sections::jsonb) AS elem
)
WHERE key = 'journalist';
