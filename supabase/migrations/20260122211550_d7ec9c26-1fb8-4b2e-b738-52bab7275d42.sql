-- Add home_sections column to portal_templates
ALTER TABLE portal_templates 
ADD COLUMN IF NOT EXISTS home_sections JSONB DEFAULT '[]'::jsonb;

-- Populate home_sections for Journalist template
UPDATE portal_templates SET home_sections = '[
  {"type": "market_data", "order": 0, "enabled": true},
  {"type": "super_banner", "order": 1, "enabled": true},
  {"type": "video_block", "order": 2, "enabled": true},
  {"type": "stories_bar", "order": 3, "enabled": true, "moduleKey": "stories"},
  {"type": "ad_slot_top", "order": 4, "enabled": true},
  {"type": "hero_headlines", "order": 5, "enabled": true},
  {"type": "live_broadcast", "order": 6, "enabled": true, "moduleKey": "lives"},
  {"type": "agora_na_cidade", "order": 7, "enabled": true},
  {"type": "latest_news", "order": 8, "enabled": true},
  {"type": "quick_notes", "order": 9, "enabled": true},
  {"type": "most_read", "order": 10, "enabled": true},
  {"type": "category_section", "order": 11, "enabled": true, "props": {"title": "Política", "slug": "politica"}},
  {"type": "category_section", "order": 12, "enabled": true, "props": {"title": "Esportes", "slug": "esportes"}},
  {"type": "category_section", "order": 13, "enabled": true, "props": {"title": "Polícia", "slug": "policia"}}
]'::jsonb WHERE key = 'journalist';

-- Populate home_sections for Church template
UPDATE portal_templates SET home_sections = '[
  {"type": "live_broadcast", "order": 0, "enabled": true, "moduleKey": "lives"},
  {"type": "radio_player", "order": 1, "enabled": true, "moduleKey": "web_radio"},
  {"type": "hero_headlines", "order": 2, "enabled": true},
  {"type": "donations_cta", "order": 3, "enabled": true, "moduleKey": "donations"},
  {"type": "members_cta", "order": 4, "enabled": true, "moduleKey": "members"},
  {"type": "latest_news", "order": 5, "enabled": true},
  {"type": "video_block", "order": 6, "enabled": true}
]'::jsonb WHERE key = 'church';

-- Populate home_sections for Influencer template
UPDATE portal_templates SET home_sections = '[
  {"type": "hero_headlines", "order": 0, "enabled": true},
  {"type": "video_block", "order": 1, "enabled": true},
  {"type": "members_cta", "order": 2, "enabled": true, "moduleKey": "members"},
  {"type": "latest_news", "order": 3, "enabled": true},
  {"type": "stories_bar", "order": 4, "enabled": true, "moduleKey": "stories"},
  {"type": "live_broadcast", "order": 5, "enabled": true, "moduleKey": "lives"}
]'::jsonb WHERE key = 'influencer';

-- Populate home_sections for Corporate template
UPDATE portal_templates SET home_sections = '[
  {"type": "hero_headlines", "order": 0, "enabled": true},
  {"type": "super_banner", "order": 1, "enabled": true},
  {"type": "latest_news", "order": 2, "enabled": true},
  {"type": "video_block", "order": 3, "enabled": true},
  {"type": "live_broadcast", "order": 4, "enabled": true, "moduleKey": "lives"},
  {"type": "newsletter_cta", "order": 5, "enabled": true}
]'::jsonb WHERE key = 'corporate';