-- Função para atualizar status do convite quando usuário é criado
CREATE OR REPLACE FUNCTION public.handle_invite_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar convite pendente para o email do novo usuário
  UPDATE public.user_invites
  SET 
    status = 'accepted',
    accepted_at = now()
  WHERE 
    email = NEW.email 
    AND status = 'pending';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger após criação de usuário
DROP TRIGGER IF EXISTS on_user_created_accept_invite ON auth.users;
CREATE TRIGGER on_user_created_accept_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_invite_acceptance();