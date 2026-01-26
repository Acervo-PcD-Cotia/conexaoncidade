-- CORREÇÃO URGENTE: Política RLS com acesso proibido a auth.users
-- Problema: subconsulta para auth.users causa "permission denied" para usuários autenticados

-- 1. Remover política problemática
DROP POLICY IF EXISTS "Team members can view other members" ON public.illumina_team_members;

-- 2. Recriar com sintaxe correta (usando JWT ao invés de subconsulta para auth.users)
CREATE POLICY "Team members can view other members" ON public.illumina_team_members
  FOR SELECT USING (
    is_illumina_team_member(team_id) OR
    invited_email = (auth.jwt() ->> 'email')
  );