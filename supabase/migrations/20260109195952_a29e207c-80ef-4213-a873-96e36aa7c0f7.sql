-- =====================================================
-- COMUNIDADE GAMIFICADA - SCHEMA COMPLETO
-- =====================================================

-- 1. ENUM: Níveis de usuário na comunidade
CREATE TYPE public.community_level AS ENUM (
  'supporter',     -- Apoiador (nível inicial)
  'collaborator',  -- Colaborador
  'ambassador',    -- Embaixador
  'leader'         -- Líder da Comunidade
);

-- 2. TABELA: Membros da Comunidade
CREATE TABLE public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  level public.community_level DEFAULT 'supporter',
  points INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  access_granted_at TIMESTAMPTZ,
  access_method TEXT CHECK (access_method IN ('invite', 'challenge')),
  invited_by UUID,
  badges TEXT[] DEFAULT '{}',
  bio TEXT,
  terms_accepted_at TIMESTAMPTZ,
  is_suspended BOOLEAN DEFAULT false,
  suspended_reason TEXT,
  suspended_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA: Convites da Comunidade
CREATE TABLE public.community_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL,
  used_by UUID,
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired', 'cancelled')),
  max_uses INTEGER DEFAULT 1,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABELA: Compartilhamentos Rastreados
CREATE TABLE public.community_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('news', 'project', 'campaign', 'story')),
  content_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'facebook', 'instagram', 'x', 'linkedin', 'copy')),
  link_id UUID REFERENCES public.links(id),
  points_earned INTEGER DEFAULT 10,
  shared_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABELA: Grupos Temáticos (criar antes de posts)
CREATE TABLE public.community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#6B7280',
  cover_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TABELA: Posts/Publicações da Comunidade
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'poll', 'announcement', 'question')),
  group_id UUID REFERENCES public.community_groups(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT false,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false,
  hidden_reason TEXT,
  moderated_by UUID,
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. TABELA: Comentários
CREATE TABLE public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  like_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false,
  hidden_reason TEXT,
  moderated_by UUID,
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. TABELA: Reações (Curtidas)
CREATE TABLE public.community_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'celebrate', 'insightful', 'support')),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT reaction_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Índice único para evitar reações duplicadas
CREATE UNIQUE INDEX community_reactions_post_unique ON public.community_reactions(user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX community_reactions_comment_unique ON public.community_reactions(user_id, comment_id) WHERE comment_id IS NOT NULL;

-- 9. TABELA: Membros dos Grupos
CREATE TABLE public.community_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- 10. TABELA: Enquetes
CREATE TABLE public.community_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  total_votes INTEGER DEFAULT 0,
  ends_at TIMESTAMPTZ,
  is_multiple_choice BOOLEAN DEFAULT false,
  show_results_before_vote BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. TABELA: Votos em Enquetes
CREATE TABLE public.community_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.community_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  option_ids TEXT[] NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- 12. TABELA: Denúncias
CREATE TABLE public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  reported_user_id UUID,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE SET NULL,
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. TABELA: Penalidades
CREATE TABLE public.community_penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  penalty_type TEXT NOT NULL CHECK (penalty_type IN ('warning', 'mute', 'suspension', 'ban')),
  reason TEXT NOT NULL,
  applied_by UUID NOT NULL,
  report_id UUID REFERENCES public.community_reports(id),
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  lifted_by UUID,
  lifted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. TABELA: Histórico de Pontos
CREATE TABLE public.community_points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('share_news', 'share_project', 'comment', 'like_received', 'invite_member', 'post_featured', 'badge_earned', 'penalty', 'bonus')),
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- FUNÇÕES DE GAMIFICAÇÃO
-- =====================================================

-- Função para verificar acesso à comunidade
CREATE OR REPLACE FUNCTION public.has_community_access(_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.community_members
    WHERE user_id = _user_id
      AND access_granted_at IS NOT NULL
      AND (is_suspended = false OR (suspended_until IS NOT NULL AND suspended_until < now()))
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Função para calcular nível baseado em pontos
CREATE OR REPLACE FUNCTION public.calculate_community_level(_points INTEGER)
RETURNS public.community_level AS $$
BEGIN
  IF _points >= 5000 THEN RETURN 'leader';
  ELSIF _points >= 2000 THEN RETURN 'ambassador';
  ELSIF _points >= 500 THEN RETURN 'collaborator';
  ELSE RETURN 'supporter';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para verificar se pode convidar
CREATE OR REPLACE FUNCTION public.can_invite_to_community(_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  member_level public.community_level;
  invite_count INTEGER;
BEGIN
  SELECT level INTO member_level FROM public.community_members WHERE user_id = _user_id;
  
  IF member_level IS NULL THEN RETURN false; END IF;
  IF member_level = 'leader' THEN RETURN true; END IF;
  
  -- Embaixadores podem convidar 5 por mês
  IF member_level = 'ambassador' THEN
    SELECT COUNT(*) INTO invite_count 
    FROM public.community_invites 
    WHERE created_by = _user_id 
      AND created_at > date_trunc('month', now());
    RETURN invite_count < 5;
  END IF;
  
  -- Colaboradores podem convidar 2 por mês
  IF member_level = 'collaborator' THEN
    SELECT COUNT(*) INTO invite_count 
    FROM public.community_invites 
    WHERE created_by = _user_id 
      AND created_at > date_trunc('month', now());
    RETURN invite_count < 2;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Trigger para atualizar nível automaticamente
CREATE OR REPLACE FUNCTION public.update_community_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := public.calculate_community_level(NEW.points);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_community_points_change
  BEFORE UPDATE OF points ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.update_community_level();

-- Trigger para liberar acesso ao completar 12 compartilhamentos
CREATE OR REPLACE FUNCTION public.check_community_unlock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_count >= 12 AND OLD.share_count < 12 THEN
    NEW.access_granted_at := now();
    NEW.access_method := 'challenge';
    NEW.badges := array_append(NEW.badges, 'founding_member');
    NEW.points := NEW.points + 100; -- Bônus por completar desafio
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_share_count_change
  BEFORE UPDATE OF share_count ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.check_community_unlock();

-- Trigger para atualizar contadores de reações
CREATE OR REPLACE FUNCTION public.update_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE public.community_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.comment_id IS NOT NULL THEN
      UPDATE public.community_comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE public.community_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.post_id;
    ELSIF OLD.comment_id IS NOT NULL THEN
      UPDATE public.community_comments SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_reaction_change
  AFTER INSERT OR DELETE ON public.community_reactions
  FOR EACH ROW EXECUTE FUNCTION public.update_reaction_counts();

-- Trigger para atualizar contador de comentários
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_count();

-- =====================================================
-- DADOS INICIAIS: GRUPOS TEMÁTICOS
-- =====================================================
INSERT INTO public.community_groups (name, slug, description, icon, color, sort_order) VALUES
  ('Geral', 'geral', 'Discussões gerais da comunidade', 'message-circle', '#3B82F6', 0),
  ('Cidades', 'cidades', 'Discussões sobre desenvolvimento urbano e mobilidade', 'building-2', '#10B981', 1),
  ('Educação', 'educacao', 'Pautas educacionais e formação profissional', 'graduation-cap', '#8B5CF6', 2),
  ('Acessibilidade', 'acessibilidade', 'Inclusão e direitos das pessoas com deficiência', 'accessibility', '#F59E0B', 3),
  ('Economia', 'economia', 'Finanças, empreendedorismo e economia local', 'trending-up', '#EF4444', 4),
  ('Cultura', 'cultura', 'Arte, eventos culturais e entretenimento', 'palette', '#EC4899', 5);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_points_history ENABLE ROW LEVEL SECURITY;

-- COMMUNITY_MEMBERS
CREATE POLICY "Users can view their own membership"
  ON public.community_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Members can view other members"
  ON public.community_members FOR SELECT
  USING (has_community_access(auth.uid()) AND access_granted_at IS NOT NULL);

CREATE POLICY "Users can create their own membership record"
  ON public.community_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own membership"
  ON public.community_members FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all members"
  ON public.community_members FOR ALL
  USING (is_admin_or_editor(auth.uid()));

-- COMMUNITY_INVITES
CREATE POLICY "Users can view invites they created or used"
  ON public.community_invites FOR SELECT
  USING (created_by = auth.uid() OR used_by = auth.uid());

CREATE POLICY "Members can create invites if allowed"
  ON public.community_invites FOR INSERT
  WITH CHECK (can_invite_to_community(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Anyone can use an invite"
  ON public.community_invites FOR UPDATE
  USING (status = 'pending' AND (expires_at IS NULL OR expires_at > now()))
  WITH CHECK (used_by = auth.uid());

CREATE POLICY "Admins can manage all invites"
  ON public.community_invites FOR ALL
  USING (is_admin_or_editor(auth.uid()));

-- COMMUNITY_SHARES
CREATE POLICY "Users can view their own shares"
  ON public.community_shares FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own shares"
  ON public.community_shares FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all shares"
  ON public.community_shares FOR SELECT
  USING (is_admin_or_editor(auth.uid()));

-- COMMUNITY_GROUPS
CREATE POLICY "Anyone can view active groups"
  ON public.community_groups FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage groups"
  ON public.community_groups FOR ALL
  USING (is_admin_or_editor(auth.uid()));

-- COMMUNITY_POSTS
CREATE POLICY "Members can view posts"
  ON public.community_posts FOR SELECT
  USING (has_community_access(auth.uid()) AND is_hidden = false);

CREATE POLICY "Members can create posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (has_community_access(auth.uid()) AND author_id = auth.uid());

CREATE POLICY "Authors can update their own posts"
  ON public.community_posts FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can delete their own posts"
  ON public.community_posts FOR DELETE
  USING (author_id = auth.uid());

CREATE POLICY "Admins can manage all posts"
  ON public.community_posts FOR ALL
  USING (is_admin_or_editor(auth.uid()));

-- COMMUNITY_COMMENTS
CREATE POLICY "Members can view approved comments"
  ON public.community_comments FOR SELECT
  USING (has_community_access(auth.uid()) AND is_hidden = false);

CREATE POLICY "Members can create comments"
  ON public.community_comments FOR INSERT
  WITH CHECK (has_community_access(auth.uid()) AND author_id = auth.uid());

CREATE POLICY "Authors can update their own comments"
  ON public.community_comments FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can delete their own comments"
  ON public.community_comments FOR DELETE
  USING (author_id = auth.uid());

CREATE POLICY "Admins can manage all comments"
  ON public.community_comments FOR ALL
  USING (is_admin_or_editor(auth.uid()));

-- COMMUNITY_REACTIONS
CREATE POLICY "Members can view reactions"
  ON public.community_reactions FOR SELECT
  USING (has_community_access(auth.uid()));

CREATE POLICY "Members can create reactions"
  ON public.community_reactions FOR INSERT
  WITH CHECK (has_community_access(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions"
  ON public.community_reactions FOR DELETE
  USING (user_id = auth.uid());

-- COMMUNITY_GROUP_MEMBERS
CREATE POLICY "Members can view group memberships"
  ON public.community_group_members FOR SELECT
  USING (has_community_access(auth.uid()));

CREATE POLICY "Members can join groups"
  ON public.community_group_members FOR INSERT
  WITH CHECK (has_community_access(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Members can leave groups"
  ON public.community_group_members FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage group memberships"
  ON public.community_group_members FOR ALL
  USING (is_admin_or_editor(auth.uid()));

-- COMMUNITY_POLLS
CREATE POLICY "Members can view polls"
  ON public.community_polls FOR SELECT
  USING (has_community_access(auth.uid()));

CREATE POLICY "Members can create polls"
  ON public.community_polls FOR INSERT
  WITH CHECK (has_community_access(auth.uid()));

CREATE POLICY "Admins can manage polls"
  ON public.community_polls FOR ALL
  USING (is_admin_or_editor(auth.uid()));

-- COMMUNITY_POLL_VOTES
CREATE POLICY "Members can view their own votes"
  ON public.community_poll_votes FOR SELECT
  USING (user_id = auth.uid() OR has_community_access(auth.uid()));

CREATE POLICY "Members can vote"
  ON public.community_poll_votes FOR INSERT
  WITH CHECK (has_community_access(auth.uid()) AND user_id = auth.uid());

-- COMMUNITY_REPORTS
CREATE POLICY "Users can view their own reports"
  ON public.community_reports FOR SELECT
  USING (reporter_id = auth.uid());

CREATE POLICY "Members can create reports"
  ON public.community_reports FOR INSERT
  WITH CHECK (has_community_access(auth.uid()) AND reporter_id = auth.uid());

CREATE POLICY "Admins can manage all reports"
  ON public.community_reports FOR ALL
  USING (is_admin_or_editor(auth.uid()));

-- COMMUNITY_PENALTIES
CREATE POLICY "Users can view their own penalties"
  ON public.community_penalties FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage penalties"
  ON public.community_penalties FOR ALL
  USING (is_admin_or_editor(auth.uid()));

-- COMMUNITY_POINTS_HISTORY
CREATE POLICY "Users can view their own points history"
  ON public.community_points_history FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert points history"
  ON public.community_points_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all points history"
  ON public.community_points_history FOR SELECT
  USING (is_admin_or_editor(auth.uid()));

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX idx_community_members_user ON public.community_members(user_id);
CREATE INDEX idx_community_members_level ON public.community_members(level);
CREATE INDEX idx_community_shares_user ON public.community_shares(user_id);
CREATE INDEX idx_community_shares_content ON public.community_shares(content_type, content_id);
CREATE INDEX idx_community_posts_author ON public.community_posts(author_id);
CREATE INDEX idx_community_posts_group ON public.community_posts(group_id);
CREATE INDEX idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_comments_post ON public.community_comments(post_id);
CREATE INDEX idx_community_reactions_post ON public.community_reactions(post_id);
CREATE INDEX idx_community_reactions_comment ON public.community_reactions(comment_id);
CREATE INDEX idx_community_invites_code ON public.community_invites(code);
CREATE INDEX idx_community_reports_status ON public.community_reports(status);
CREATE INDEX idx_community_penalties_user ON public.community_penalties(user_id, is_active);