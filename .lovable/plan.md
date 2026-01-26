

# Plano de Correção Urgente: Notícias não carregam para usuários logados

## Diagnóstico

### Causa Raiz Identificada
A política RLS da tabela `illumina_team_members` contém uma subconsulta **proibida** para `auth.users`:

```sql
-- POLÍTICA PROBLEMÁTICA (atual)
CREATE POLICY "Team members can view other members" ON public.illumina_team_members
  FOR SELECT USING (
    is_illumina_team_member(team_id) OR
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())  -- ❌ PROIBIDO!
  );
```

**Por que isso quebra tudo?**
- Usuários autenticados normais **não têm permissão** para acessar `auth.users` diretamente
- Quando qualquer componente da homepage tenta verificar algo relacionado a times (mesmo indiretamente), esse erro é disparado
- O erro `permission denied for table users` cascateia e impede o carregamento correto dos dados
- O React Query fica em estado de loading infinito

### Fluxo do Erro
```text
Usuário logado visita homepage
        ↓
DynamicHomeSection renderiza seções
        ↓
Algum componente verifica permissões de time
        ↓
RLS de illumina_team_members é avaliada
        ↓
Subconsulta para auth.users FALHA
        ↓
"permission denied for table users"
        ↓
Query de notícias também falha (mesmo fluxo de autenticação)
        ↓
Skeleton infinito
```

---

## Solução

### 1. Corrigir a Política RLS do `illumina_team_members`

Substituir a subconsulta `auth.users` pela função JWT nativa:

```sql
-- CORREÇÃO: Usar auth.jwt() ao invés de consultar auth.users
DROP POLICY IF EXISTS "Team members can view other members" ON public.illumina_team_members;

CREATE POLICY "Team members can view other members" ON public.illumina_team_members
  FOR SELECT USING (
    is_illumina_team_member(team_id) OR
    invited_email = auth.jwt() ->> 'email'  -- ✅ CORRETO: usa JWT diretamente
  );
```

**Por que funciona?**
- `auth.jwt() ->> 'email'` extrai o email diretamente do token JWT do usuário
- Não requer acesso à tabela `auth.users`
- É a forma recomendada pelo Supabase para obter dados do usuário em políticas RLS

### 2. Garantir Políticas Públicas para Notícias (Verificação)

As políticas atuais da tabela `news` já parecem corretas, mas vou confirmar que incluem `anon` E `authenticated`:

| Tabela | Política | Status |
|--------|----------|--------|
| `news` | Notícias publicadas são públicas | ✅ OK (roles: public) |
| `categories` | Categorias ativas são públicas | ✅ OK (roles: public) |
| `news_tags` | News tags são públicas para leitura | ✅ OK (roles: public) |
| `tags` | Tags são públicas | ✅ OK (roles: public) |
| `profiles` | Perfis são visíveis publicamente | ✅ OK (roles: public) |

Todas as políticas já usam `roles: public` (que inclui `anon` e `authenticated`).

---

## Ações Técnicas

### Migração SQL a Ser Executada

```sql
-- 1. Remover política problemática
DROP POLICY IF EXISTS "Team members can view other members" ON public.illumina_team_members;

-- 2. Recriar com sintaxe correta (usando JWT)
CREATE POLICY "Team members can view other members" ON public.illumina_team_members
  FOR SELECT USING (
    is_illumina_team_member(team_id) OR
    invited_email = (auth.jwt() ->> 'email')
  );
```

---

## Impacto da Correção

- **Imediato**: Usuários logados poderão ver notícias normalmente
- **Funcionalidade Illumina**: Continuará funcionando (verificação de email por JWT)
- **Segurança**: Mantida (apenas verifica email do próprio usuário)
- **Performance**: Melhora (JWT já está em memória, não precisa de query)

---

## Arquivos Afetados

| Tipo | Arquivo/Recurso | Ação |
|------|-----------------|------|
| SQL | Nova migração | Criar e executar |
| Frontend | Nenhum | Não requer mudanças |

---

## Critérios de Aceite

- [x] Identificar causa raiz (política RLS com acesso a auth.users)
- [ ] Executar migração corrigindo a política
- [ ] Usuário anônimo continua vendo notícias
- [ ] Usuário logado agora vê notícias corretamente
- [ ] Funcionalidade de times do Illumina mantida
- [ ] Nenhum erro "permission denied" nos logs

---

## Observações Adicionais

### Prevenção Futura
Nunca usar subconsultas para `auth.users` em políticas RLS. Alternativas:

| Precisa de... | Use |
|---------------|-----|
| Email do usuário | `auth.jwt() ->> 'email'` |
| ID do usuário | `auth.uid()` |
| Role do usuário | `auth.jwt() ->> 'role'` |
| Metadados | `auth.jwt() -> 'user_metadata' ->> 'campo'` |

### Por que o erro só aparece logado?
- Usuários anônimos não têm sessão JWT, então a condição `invited_email = ...` simplesmente retorna `false` (sem erro)
- Usuários autenticados têm uma sessão ativa, então a política é avaliada e a subconsulta para `auth.users` é executada (causando o erro)

