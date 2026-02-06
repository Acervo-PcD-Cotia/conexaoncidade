-- ============================================================
-- FASE 2: Correção de funções sem search_path e políticas RLS
-- ============================================================

-- PARTE 1: Adicionar SET search_path = public a funções existentes

-- 1. handle_new_user (já corrigido na última verificação, verificar se precisa)
-- A função já possui SET search_path = public conforme db-functions

-- 2. Corrigir cleanup_expired_sso_codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_sso_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.sso_codes
  WHERE expires_at < now() - INTERVAL '1 hour';
END;
$$;

-- 3. has_community_access
CREATE OR REPLACE FUNCTION public.has_community_access(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.community_members
    WHERE user_id = _user_id
      AND access_granted_at IS NOT NULL
      AND (is_suspended = false OR (suspended_until IS NOT NULL AND suspended_until < now()))
  );
END;
$$;

-- 4. notify_community_new_post
CREATE OR REPLACE FUNCTION public.notify_community_new_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.community_notifications (user_id, type, title, body, reference_id, reference_type, actor_id)
  SELECT 
    cm.user_id,
    'new_post',
    'Nova publicação na comunidade',
    LEFT(NEW.content, 100),
    NEW.id,
    'post',
    NEW.author_id
  FROM public.community_members cm
  WHERE cm.user_id != NEW.author_id
    AND cm.access_granted_at IS NOT NULL
    AND cm.is_suspended = false
  LIMIT 100;
  
  RETURN NEW;
END;
$$;

-- 5. can_invite_to_community
CREATE OR REPLACE FUNCTION public.can_invite_to_community(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_level public.community_level;
  invite_count INTEGER;
BEGIN
  SELECT level INTO member_level FROM public.community_members WHERE user_id = _user_id;
  
  IF member_level IS NULL THEN RETURN false; END IF;
  IF member_level = 'leader' THEN RETURN true; END IF;
  
  IF member_level = 'ambassador' THEN
    SELECT COUNT(*) INTO invite_count 
    FROM public.community_invites 
    WHERE created_by = _user_id 
      AND created_at > date_trunc('month', now());
    RETURN invite_count < 5;
  END IF;
  
  IF member_level = 'collaborator' THEN
    SELECT COUNT(*) INTO invite_count 
    FROM public.community_invites 
    WHERE created_by = _user_id 
      AND created_at > date_trunc('month', now());
    RETURN invite_count < 2;
  END IF;
  
  RETURN false;
END;
$$;

-- 6. check_community_unlock
CREATE OR REPLACE FUNCTION public.check_community_unlock()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.share_count >= 12 AND OLD.share_count < 12 THEN
    NEW.access_granted_at := now();
    NEW.access_method := 'challenge';
    NEW.badges := array_append(NEW.badges, 'founding_member');
    NEW.points := NEW.points + 100;
  END IF;
  RETURN NEW;
END;
$$;

-- 7. update_reaction_counts
CREATE OR REPLACE FUNCTION public.update_reaction_counts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;

-- 8. update_comment_count
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 9. notify_community_mention
CREATE OR REPLACE FUNCTION public.notify_community_mention()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mentioned_user_id UUID;
  mentioned_username TEXT;
  mention_match TEXT;
BEGIN
  FOR mention_match IN
    SELECT (regexp_matches(NEW.content, '@([a-zA-Z0-9_]+)', 'g'))[1]
  LOOP
    SELECT p.id INTO mentioned_user_id
    FROM public.profiles p
    WHERE LOWER(SPLIT_PART(p.full_name, ' ', 1)) = LOWER(mention_match)
       OR p.id::text LIKE mention_match || '%'
    LIMIT 1;
    
    IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.author_id THEN
      INSERT INTO public.community_notifications (user_id, type, title, body, reference_id, reference_type, actor_id)
      VALUES (
        mentioned_user_id,
        'mention',
        'Você foi mencionado',
        LEFT(NEW.content, 100),
        COALESCE(NEW.post_id, NEW.id),
        CASE WHEN NEW.post_id IS NULL THEN 'post' ELSE 'comment' END,
        NEW.author_id
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- 10. notify_community_reply
CREATE OR REPLACE FUNCTION public.notify_community_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parent_author_id UUID;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    SELECT author_id INTO parent_author_id
    FROM public.community_comments
    WHERE id = NEW.parent_id;
    
    IF parent_author_id IS NOT NULL AND parent_author_id != NEW.author_id THEN
      INSERT INTO public.community_notifications (user_id, type, title, body, reference_id, reference_type, actor_id)
      VALUES (
        parent_author_id,
        'reply',
        'Resposta ao seu comentário',
        LEFT(NEW.content, 100),
        NEW.id,
        'comment',
        NEW.author_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 11. update_broadcast_viewer_count
CREATE OR REPLACE FUNCTION public.update_broadcast_viewer_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.broadcasts
    SET viewer_count = viewer_count + 1,
        peak_viewers = GREATEST(peak_viewers, viewer_count + 1),
        total_views = total_views + 1
    WHERE id = NEW.broadcast_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.left_at IS NOT NULL AND OLD.left_at IS NULL THEN
    UPDATE public.broadcasts
    SET viewer_count = GREATEST(0, viewer_count - 1)
    WHERE id = NEW.broadcast_id;
  END IF;
  RETURN NEW;
END;
$$;

-- 12. update_autodj_settings_updated_at
CREATE OR REPLACE FUNCTION public.update_autodj_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 13. update_challenge_progress
CREATE OR REPLACE FUNCTION public.update_challenge_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  challenge_record RECORD;
  current_progress INTEGER;
BEGIN
  FOR challenge_record IN
    SELECT c.* FROM community_challenges c
    WHERE c.is_active = true
    AND c.start_date <= now()
    AND c.end_date >= now()
    AND (
      (c.goal_type = 'shares' AND TG_TABLE_NAME = 'community_shares') OR
      (c.goal_type = 'comments' AND TG_TABLE_NAME = 'community_comments') OR
      (c.goal_type = 'readings' AND TG_TABLE_NAME = 'community_reading_progress') OR
      (c.goal_type = 'referrals' AND TG_TABLE_NAME = 'community_invites')
    )
  LOOP
    INSERT INTO community_challenge_progress (challenge_id, user_id, current_value)
    VALUES (challenge_record.id, NEW.user_id, 1)
    ON CONFLICT (challenge_id, user_id) DO UPDATE
    SET current_value = community_challenge_progress.current_value + 1,
        updated_at = now(),
        completed_at = CASE 
          WHEN community_challenge_progress.current_value + 1 >= challenge_record.goal_value 
               AND community_challenge_progress.completed_at IS NULL 
          THEN now() 
          ELSE community_challenge_progress.completed_at 
        END;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- 14. notify_new_edition
CREATE OR REPLACE FUNCTION public.notify_new_edition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    INSERT INTO push_notifications (
      title,
      body,
      url,
      target_type,
      scheduled_for,
      edition_id
    ) VALUES (
      '📰 Nova Edição Digital!',
      NEW.title || CASE 
        WHEN NEW.acesso_livre_ate IS NOT NULL 
        THEN ' - Acesso livre até ' || to_char(NEW.acesso_livre_ate, 'DD/MM')
        ELSE ' - Confira agora!'
      END,
      '/edicao/' || NEW.slug,
      'community',
      now(),
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 15. update_post_global_status
CREATE OR REPLACE FUNCTION public.update_post_global_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  total_count INTEGER;
  done_count INTEGER;
  failed_count INTEGER;
  processing_count INTEGER;
  scheduled_count INTEGER;
  new_status social_post_status;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'done'),
    COUNT(*) FILTER (WHERE status IN ('failed', 'assisted')),
    COUNT(*) FILTER (WHERE status IN ('processing', 'queued')),
    COUNT(*) FILTER (WHERE status = 'scheduled')
  INTO total_count, done_count, failed_count, processing_count, scheduled_count
  FROM public.social_post_targets
  WHERE post_id = COALESCE(NEW.post_id, OLD.post_id);
  
  IF total_count = 0 THEN
    new_status := 'draft';
  ELSIF done_count = total_count THEN
    new_status := 'done';
  ELSIF failed_count = total_count THEN
    new_status := 'failed';
  ELSIF processing_count > 0 THEN
    new_status := 'processing';
  ELSIF scheduled_count > 0 THEN
    new_status := 'scheduled';
  ELSE
    new_status := 'draft';
  END IF;
  
  UPDATE public.social_posts
  SET status_global = new_status
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================
-- PARTE 2: Restringir políticas RLS que precisam de correção
-- ============================================================

-- autopost_audit_logs - Restringir INSERT para admins
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.autopost_audit_logs;
CREATE POLICY "Admins podem inserir logs de auditoria"
ON public.autopost_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- autopost_audit_logs - Restringir SELECT para admins
DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.autopost_audit_logs;
CREATE POLICY "Admins podem visualizar logs de auditoria"
ON public.autopost_audit_logs
FOR SELECT
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

-- autopost_ingest_jobs - Restringir INSERT
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.autopost_ingest_jobs;
CREATE POLICY "Admins podem inserir jobs de ingestão"
ON public.autopost_ingest_jobs
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- autopost_ingest_jobs - Restringir UPDATE
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.autopost_ingest_jobs;
CREATE POLICY "Admins podem atualizar jobs de ingestão"
ON public.autopost_ingest_jobs
FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

-- autopost_media_assets - Restringir INSERT
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.autopost_media_assets;
CREATE POLICY "Admins podem inserir media assets"
ON public.autopost_media_assets
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- autopost_media_assets - Restringir UPDATE
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.autopost_media_assets;
CREATE POLICY "Admins podem atualizar media assets"
ON public.autopost_media_assets
FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

-- autopost_scheduled_publishes - Restringir INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.autopost_scheduled_publishes;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.autopost_scheduled_publishes;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.autopost_scheduled_publishes;

CREATE POLICY "Admins podem inserir publicações agendadas"
ON public.autopost_scheduled_publishes
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins podem atualizar publicações agendadas"
ON public.autopost_scheduled_publishes
FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins podem deletar publicações agendadas"
ON public.autopost_scheduled_publishes
FOR DELETE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

-- broadcast_autodj_settings - Restringir INSERT/UPDATE
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.broadcast_autodj_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.broadcast_autodj_settings;

CREATE POLICY "Admins podem inserir configurações de AutoDJ"
ON public.broadcast_autodj_settings
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins podem atualizar configurações de AutoDJ"
ON public.broadcast_autodj_settings
FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

-- conexao_ai_automation_logs - Restringir INSERT
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.conexao_ai_automation_logs;
CREATE POLICY "Admins podem inserir logs de automação IA"
ON public.conexao_ai_automation_logs
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor(auth.uid()));