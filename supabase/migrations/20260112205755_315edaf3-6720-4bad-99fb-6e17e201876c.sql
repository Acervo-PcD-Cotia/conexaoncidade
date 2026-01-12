-- Tabela para registrar sessões de login
CREATE TABLE public.user_sessions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  device_info TEXT,
  browser TEXT,
  ip_address TEXT,
  location TEXT,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_active_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- RLS para sessões
ALTER TABLE public.user_sessions_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem próprias sessões"
ON public.user_sessions_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir próprias sessões"
ON public.user_sessions_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprias sessões"
ON public.user_sessions_log FOR UPDATE
USING (auth.uid() = user_id);

-- Índice para performance
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions_log(user_id);
CREATE INDEX idx_user_sessions_created_at ON public.user_sessions_log(created_at DESC);

-- Tabela para códigos de recuperação do 2FA
CREATE TABLE public.mfa_recovery_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para recovery codes
ALTER TABLE public.mfa_recovery_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem próprios códigos"
ON public.mfa_recovery_codes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar próprios códigos"
ON public.mfa_recovery_codes FOR DELETE
USING (auth.uid() = user_id);

-- Índice para performance
CREATE INDEX idx_mfa_recovery_codes_user_id ON public.mfa_recovery_codes(user_id);