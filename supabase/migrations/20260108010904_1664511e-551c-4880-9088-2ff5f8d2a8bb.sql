-- 1. Função de verificação de duplicatas
CREATE OR REPLACE FUNCTION public.check_duplicate_news(
  p_slug TEXT,
  p_source_url TEXT,
  p_title TEXT
) RETURNS TABLE(is_duplicate BOOLEAN, existing_id UUID, match_type TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Check exact slug
  RETURN QUERY
  SELECT true, n.id, 'slug'::TEXT
  FROM news n WHERE n.slug = p_slug AND n.deleted_at IS NULL
  LIMIT 1;
  
  IF FOUND THEN RETURN; END IF;
  
  -- Check source URL
  IF p_source_url IS NOT NULL AND p_source_url != '' THEN
    RETURN QUERY
    SELECT true, n.id, 'source_url'::TEXT
    FROM news n WHERE n.source = p_source_url AND n.deleted_at IS NULL
    LIMIT 1;
    
    IF FOUND THEN RETURN; END IF;
  END IF;
  
  -- Check similar title (85% similarity)
  RETURN QUERY
  SELECT true, n.id, 'title_similarity'::TEXT
  FROM news n
  WHERE similarity(n.title, p_title) > 0.85 AND n.deleted_at IS NULL
  ORDER BY similarity(n.title, p_title) DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT;
  END IF;
END;
$$;

-- 2. Criar helper function para super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role = 'super_admin'
  );
$$;