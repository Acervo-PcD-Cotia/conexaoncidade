-- Tabela para armazenar códigos SSO de uso único
CREATE TABLE public.sso_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  tenant_id UUID REFERENCES sites(id),
  target_app TEXT NOT NULL DEFAULT 'gcotia',
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Indexes para busca rápida
CREATE INDEX idx_sso_codes_code ON public.sso_codes(code);
CREATE INDEX idx_sso_codes_expires ON public.sso_codes(expires_at);
CREATE INDEX idx_sso_codes_user ON public.sso_codes(user_id);

-- RLS
ALTER TABLE public.sso_codes ENABLE ROW LEVEL SECURITY;

-- Apenas service role pode acessar (edge functions)
CREATE POLICY "Service role full access on sso_codes" ON public.sso_codes
  FOR ALL USING (true);

-- Função para limpar códigos expirados
CREATE OR REPLACE FUNCTION cleanup_expired_sso_codes()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.sso_codes
  WHERE expires_at < now() - INTERVAL '1 hour';
END;
$$;