

# Correcao: Pagina de noticia em branco para usuarios logados

## Problema identificado

Ao analisar as politicas de seguranca (RLS) da tabela `news`, encontrei a causa raiz:

A tabela `news` tem duas politicas de SELECT:
1. **"Noticias publicadas sao publicas"** - para role `public` - permite ver noticias publicadas
2. **"Editores podem ver todas noticias"** - para role `authenticated` - exige que o usuario seja admin/editor

Quando um usuario comum esta **logado**, ele usa o role `authenticated`. Embora a politica `TO public` teoricamente cubra todos os roles, na pratica o Supabase pode priorizar a politica mais especifica para `authenticated`, que exige `is_admin_or_editor()`. Isso faz com que usuarios logados sem role de admin/editor nao consigam ver as noticias publicadas.

Alem disso, a tabela `sites` tambem tem um problema similar: a politica SELECT so permite acesso para admins/editores, impedindo o `TenantContext` de resolver o tenant para usuarios comuns logados.

## Solucao

### 1. Adicionar politica SELECT explicita na tabela `news` para usuarios autenticados

Criar uma nova politica RLS que permita qualquer usuario autenticado ver noticias publicadas:

```sql
CREATE POLICY "Usuarios autenticados podem ver noticias publicadas"
  ON public.news FOR SELECT
  TO authenticated
  USING (status = 'published' AND deleted_at IS NULL);
```

### 2. Adicionar politica SELECT publica na tabela `sites`

Permitir que qualquer usuario (logado ou nao) possa consultar sites, necessario para o TenantContext funcionar:

```sql
CREATE POLICY "Sites sao visiveis publicamente"
  ON public.sites FOR SELECT
  TO public
  USING (true);
```

Remover a politica antiga que restringe SELECT a admins, ou mante-la como complementar (ambas PERMISSIVE fazem OR).

### 3. Verificar tabela `site_users`

A politica SELECT de `site_users` exige `is_site_member()`, o que impede usuarios comuns de resolver seu tenant. Adicionar politica que permita o usuario ver sua propria associacao:

```sql
CREATE POLICY "Usuarios podem ver suas proprias associacoes"
  ON public.site_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

## Arquivos modificados

Nenhum arquivo de codigo precisa ser alterado - o problema e exclusivamente nas politicas de seguranca do banco de dados. As migracoes SQL serao aplicadas via ferramenta de migracao.

## Impacto

- Usuarios logados poderao ver noticias publicadas normalmente
- O TenantContext conseguira resolver o tenant para todos os usuarios
- Nenhuma alteracao visual ou funcional no front-end
- A seguranca e mantida: usuarios comuns so verao noticias publicadas, enquanto admins/editores continuam podendo ver todas

