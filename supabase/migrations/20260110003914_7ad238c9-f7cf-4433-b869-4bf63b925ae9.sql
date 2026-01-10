-- Adicionar campos de controle de acesso gamificado à tabela digital_editions
ALTER TABLE public.digital_editions 
ADD COLUMN IF NOT EXISTS acesso_livre_ate TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pontuacao_minima INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tipo_acesso TEXT DEFAULT 'comunidade' 
  CHECK (tipo_acesso IN ('comunidade', 'pontuacao'));

-- Comentários descritivos
COMMENT ON COLUMN public.digital_editions.acesso_livre_ate IS 
  'Data/hora até quando o acesso é livre para membros da comunidade';
COMMENT ON COLUMN public.digital_editions.pontuacao_minima IS 
  'Pontuação mínima necessária após o período de acesso livre';
COMMENT ON COLUMN public.digital_editions.tipo_acesso IS 
  'comunidade = apenas login, pontuacao = requer pontos após prazo';

-- Função para verificar acesso à edição
CREATE OR REPLACE FUNCTION public.check_edition_access(
  _user_id UUID,
  _edition_id UUID
)
RETURNS TABLE(
  has_access BOOLEAN,
  reason TEXT,
  user_points INTEGER,
  required_points INTEGER,
  free_until TIMESTAMPTZ
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_edition RECORD;
  v_member RECORD;
BEGIN
  -- Buscar edição
  SELECT * INTO v_edition FROM digital_editions WHERE id = _edition_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'edition_not_found'::TEXT, 0, 0, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  -- Buscar membro da comunidade
  SELECT * INTO v_member FROM community_members 
  WHERE user_id = _user_id AND access_granted_at IS NOT NULL;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'not_community_member'::TEXT, 0, 
      COALESCE(v_edition.pontuacao_minima, 0), v_edition.acesso_livre_ate;
    RETURN;
  END IF;
  
  -- Verificar se membro está suspenso
  IF v_member.is_suspended = true AND (v_member.suspended_until IS NULL OR v_member.suspended_until > now()) THEN
    RETURN QUERY SELECT false, 'member_suspended'::TEXT, COALESCE(v_member.points, 0), 
      COALESCE(v_edition.pontuacao_minima, 0), v_edition.acesso_livre_ate;
    RETURN;
  END IF;
  
  -- Verificar período de acesso livre
  IF v_edition.acesso_livre_ate IS NOT NULL AND now() <= v_edition.acesso_livre_ate THEN
    RETURN QUERY SELECT true, 'free_period'::TEXT, COALESCE(v_member.points, 0), 
      COALESCE(v_edition.pontuacao_minima, 0), v_edition.acesso_livre_ate;
    RETURN;
  END IF;
  
  -- Verificar pontuação (se tipo_acesso = 'pontuacao')
  IF v_edition.tipo_acesso = 'pontuacao' THEN
    IF COALESCE(v_member.points, 0) >= COALESCE(v_edition.pontuacao_minima, 0) THEN
      RETURN QUERY SELECT true, 'has_points'::TEXT, COALESCE(v_member.points, 0), 
        COALESCE(v_edition.pontuacao_minima, 0), v_edition.acesso_livre_ate;
    ELSE
      RETURN QUERY SELECT false, 'insufficient_points'::TEXT, COALESCE(v_member.points, 0), 
        COALESCE(v_edition.pontuacao_minima, 0), v_edition.acesso_livre_ate;
    END IF;
  ELSE
    -- tipo_acesso = 'comunidade', basta ser membro
    RETURN QUERY SELECT true, 'community_member'::TEXT, COALESCE(v_member.points, 0), 0, v_edition.acesso_livre_ate;
  END IF;
END;
$$;