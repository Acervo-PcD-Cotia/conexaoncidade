-- Tabela para histórico de convites
CREATE TABLE public.user_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'collaborator',
  status text NOT NULL DEFAULT 'pending',
  token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  expires_at timestamptz DEFAULT now() + interval '7 days'
);

-- Índices
CREATE INDEX idx_user_invites_email ON public.user_invites(email);
CREATE INDEX idx_user_invites_status ON public.user_invites(status);
CREATE INDEX idx_user_invites_invited_by ON public.user_invites(invited_by);

-- Adicionar campo is_indexable na tabela news para controle de SEO
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS is_indexable boolean DEFAULT true;

-- Enable RLS
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can view all invites"
ON public.user_invites FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'editor_chief')
);

CREATE POLICY "Admins can insert invites"
ON public.user_invites FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'editor_chief')
);

CREATE POLICY "Admins can update invites"
ON public.user_invites FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'editor_chief')
);

CREATE POLICY "Admins can delete invites"
ON public.user_invites FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'admin')
);