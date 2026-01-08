
-- Adicionar campos ao home_config para blocos avançados
ALTER TABLE public.home_config 
ADD COLUMN IF NOT EXISTS block_type TEXT DEFAULT 'curated',
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS tag_id UUID REFERENCES public.tags(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS item_count INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Adicionar campos ao profiles para ativar/desativar e atividade
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- Criar tabela de permissões granulares
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  permission TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, permission)
);

-- Habilitar RLS na tabela de permissões
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_permissions
CREATE POLICY "Admins podem gerenciar permissões" 
ON public.user_permissions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuários podem ver próprias permissões" 
ON public.user_permissions 
FOR SELECT 
USING (user_id = auth.uid());

-- Função helper para verificar permissão específica
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_permissions
    WHERE user_id = _user_id
      AND permission = _permission
  ) OR has_role(_user_id, 'admin')
$$;
