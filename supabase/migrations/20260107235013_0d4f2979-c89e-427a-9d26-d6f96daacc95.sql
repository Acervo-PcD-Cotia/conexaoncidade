-- Inserir primeiro usuário como admin (bs7freitas@gmail.com)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role 
FROM auth.users 
WHERE email = 'bs7freitas@gmail.com'
ON CONFLICT DO NOTHING;

-- Criar função para atribuir papel padrão a novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'collaborator');
  RETURN NEW;
END;
$$;

-- Criar trigger para atribuir papel padrão automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();