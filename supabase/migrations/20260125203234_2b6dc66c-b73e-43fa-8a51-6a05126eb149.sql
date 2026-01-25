-- Associar super_admin ao site principal
INSERT INTO site_users (user_id, site_id, status, created_at)
SELECT 
  ur.user_id,
  s.id,
  'active',
  now()
FROM user_roles ur
CROSS JOIN (SELECT id FROM sites LIMIT 1) s
WHERE ur.role = 'super_admin'
AND NOT EXISTS (
  SELECT 1 FROM site_users 
  WHERE user_id = ur.user_id 
  AND site_id = s.id
);