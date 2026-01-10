-- Tabela principal de desafios semanais/mensais
CREATE TABLE public.community_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('weekly', 'monthly', 'special', 'seasonal')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('points', 'shares', 'comments', 'readings', 'referrals')),
  goal_value INTEGER NOT NULL DEFAULT 100,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('badge', 'points', 'early_access', 'exclusive_content')),
  reward_value TEXT,
  reward_description TEXT,
  icon TEXT DEFAULT '🎯',
  is_active BOOLEAN DEFAULT true,
  max_participants INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Progresso do usuário em cada desafio
CREATE TABLE public.community_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES community_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  current_value INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  reward_claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Tabela para tracking de leitura completa
CREATE TABLE public.community_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('news', 'edition')),
  content_id UUID NOT NULL,
  scroll_percentage INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Adicionar coluna edition_id na tabela push_notifications se não existir
ALTER TABLE public.push_notifications 
ADD COLUMN IF NOT EXISTS edition_id UUID REFERENCES digital_editions(id);

-- RLS para community_challenges (público para leitura)
ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges are viewable by everyone"
ON public.community_challenges FOR SELECT USING (true);

CREATE POLICY "Only admins can manage challenges"
ON public.community_challenges FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'editor_chief')
  )
);

-- RLS para community_challenge_progress
ALTER TABLE public.community_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challenge progress"
ON public.community_challenge_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge progress"
ON public.community_challenge_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress"
ON public.community_challenge_progress FOR UPDATE
USING (auth.uid() = user_id);

-- RLS para community_reading_progress
ALTER TABLE public.community_reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reading progress"
ON public.community_reading_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own reading progress"
ON public.community_reading_progress FOR ALL
USING (auth.uid() = user_id);

-- Função para atualizar progresso de desafios baseado em ações
CREATE OR REPLACE FUNCTION public.update_challenge_progress()
RETURNS TRIGGER AS $$
DECLARE
  challenge_record RECORD;
  current_progress INTEGER;
BEGIN
  -- Buscar desafios ativos que correspondem ao tipo de ação
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
    -- Inserir ou atualizar progresso
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para atualizar progresso automaticamente
CREATE TRIGGER on_share_update_challenge
  AFTER INSERT ON public.community_shares
  FOR EACH ROW EXECUTE FUNCTION public.update_challenge_progress();

CREATE TRIGGER on_comment_update_challenge
  AFTER INSERT ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_challenge_progress();

CREATE TRIGGER on_reading_complete_update_challenge
  AFTER INSERT OR UPDATE OF completed_at ON public.community_reading_progress
  FOR EACH ROW 
  WHEN (NEW.completed_at IS NOT NULL)
  EXECUTE FUNCTION public.update_challenge_progress();

-- Função para notificar nova edição via push
CREATE OR REPLACE FUNCTION public.notify_new_edition()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger na tabela digital_editions
DROP TRIGGER IF EXISTS on_edition_published ON public.digital_editions;
CREATE TRIGGER on_edition_published
  AFTER INSERT OR UPDATE OF status ON public.digital_editions
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_edition();

-- Inserir alguns desafios iniciais de exemplo
INSERT INTO community_challenges (title, description, challenge_type, start_date, end_date, goal_type, goal_value, reward_type, reward_value, reward_description, icon) VALUES
('Compartilhador da Semana', 'Compartilhe 10 notícias esta semana e ganhe o selo especial!', 'weekly', date_trunc('week', now()), date_trunc('week', now()) + interval '7 days', 'shares', 10, 'badge', 'compartilhador_semana', 'Selo "Compartilhador da Semana" + 50 pontos bônus', '📤'),
('Leitor Dedicado', 'Leia 5 matérias completas esta semana', 'weekly', date_trunc('week', now()), date_trunc('week', now()) + interval '7 days', 'readings', 5, 'points', '25', '25 pontos bônus por completar o desafio', '📖'),
('Formador de Opinião', 'Faça 10 comentários aprovados este mês', 'monthly', date_trunc('month', now()), date_trunc('month', now()) + interval '1 month', 'comments', 10, 'badge', 'formador_opiniao', 'Selo "Formador de Opinião" + acesso antecipado', '💬');