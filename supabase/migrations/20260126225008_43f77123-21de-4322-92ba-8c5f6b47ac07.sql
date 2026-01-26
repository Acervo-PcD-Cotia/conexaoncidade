-- =============================================
-- CONEXÃO.AI MODULE - Database Schema
-- =============================================

-- 1. Conversations table for the AI assistant
CREATE TABLE public.conexao_ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT DEFAULT 'Nova conversa',
  context TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Messages table for conversation history
CREATE TABLE public.conexao_ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conexao_ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Content drafts for AI-generated content
CREATE TABLE public.conexao_ai_content_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'news' CHECK (type IN ('news', 'pcd', 'instagram', 'facebook')),
  title TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'discarded')),
  published_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Automations configuration
CREATE TABLE public.conexao_ai_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL,
  action_type TEXT NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Automation execution logs
CREATE TABLE public.conexao_ai_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID REFERENCES public.conexao_ai_automations(id) ON DELETE SET NULL,
  user_id UUID,
  trigger_data JSONB DEFAULT '{}'::jsonb,
  result JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tool usage tracking
CREATE TABLE public.conexao_ai_tool_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tool_id TEXT NOT NULL,
  tool_name TEXT,
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_conexao_ai_conversations_user ON public.conexao_ai_conversations(user_id);
CREATE INDEX idx_conexao_ai_messages_conversation ON public.conexao_ai_messages(conversation_id);
CREATE INDEX idx_conexao_ai_content_drafts_user ON public.conexao_ai_content_drafts(user_id);
CREATE INDEX idx_conexao_ai_content_drafts_status ON public.conexao_ai_content_drafts(status);
CREATE INDEX idx_conexao_ai_automation_logs_automation ON public.conexao_ai_automation_logs(automation_id);
CREATE INDEX idx_conexao_ai_tool_usage_user ON public.conexao_ai_tool_usage(user_id);
CREATE INDEX idx_conexao_ai_tool_usage_tool ON public.conexao_ai_tool_usage(tool_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.conexao_ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conexao_ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conexao_ai_content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conexao_ai_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conexao_ai_automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conexao_ai_tool_usage ENABLE ROW LEVEL SECURITY;

-- Conversations: Users manage their own
CREATE POLICY "Users manage own conversations" ON public.conexao_ai_conversations
  FOR ALL TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Messages: Users access messages from their conversations
CREATE POLICY "Users access own conversation messages" ON public.conexao_ai_messages
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.conexao_ai_conversations 
      WHERE id = conexao_ai_messages.conversation_id 
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conexao_ai_conversations 
      WHERE id = conexao_ai_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

-- Content drafts: Users manage their own
CREATE POLICY "Users manage own content drafts" ON public.conexao_ai_content_drafts
  FOR ALL TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Automations: Admins only
CREATE POLICY "Admins manage automations" ON public.conexao_ai_automations
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'editor_chief')
    )
  );

-- Automation logs: Admins can read, system inserts
CREATE POLICY "Admins read automation logs" ON public.conexao_ai_automation_logs
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'editor_chief')
    )
  );

CREATE POLICY "Authenticated users insert automation logs" ON public.conexao_ai_automation_logs
  FOR INSERT TO authenticated 
  WITH CHECK (true);

-- Tool usage: Users manage their own
CREATE POLICY "Users manage own tool usage" ON public.conexao_ai_tool_usage
  FOR ALL TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================

CREATE TRIGGER update_conexao_ai_conversations_updated_at
  BEFORE UPDATE ON public.conexao_ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conexao_ai_content_drafts_updated_at
  BEFORE UPDATE ON public.conexao_ai_content_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conexao_ai_automations_updated_at
  BEFORE UPDATE ON public.conexao_ai_automations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED DEFAULT AUTOMATIONS
-- =============================================

INSERT INTO public.conexao_ai_automations (name, description, trigger_event, action_type, config, is_active) VALUES
('Sugerir divulgação de notícia', 'Sugere compartilhamento nas redes sociais quando uma notícia é publicada', 'news_created', 'suggest_share', '{"channels": ["instagram", "facebook"]}', true),
('Checklist de parceiro', 'Gera checklist de visibilidade quando um parceiro é cadastrado', 'partner_registered', 'generate_checklist', '{"template": "google_visibility"}', true),
('Post social de evento', 'Cria sugestão de post para redes sociais quando um evento é criado', 'event_created', 'create_social_post', '{"formats": ["instagram", "facebook"]}', true),
('Instruções de rádio/TV', 'Gera páginas e instruções quando rádio ou TV é ativada', 'broadcast_activated', 'generate_instructions', '{"include_embed_codes": true}', true);