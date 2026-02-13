

# Corrigir Acesso Super Admin — Redefinir Senha

## Problema

O usuario `bs7freitas@gmail.com` existe no banco com papel `super_admin`, mas a senha informada (`@Sfx2537$`) nao corresponde a senha armazenada no sistema de autenticacao. O erro retornado e "Invalid login credentials" (HTTP 400).

**Nao e um bug de codigo.** O login, as rotas e o papel estao corretos. O problema e exclusivamente a senha.

## Evidencias

- Usuario encontrado: `2d99c315-28f2-419a-8d71-3d7525739da0`
- Email confirmado: sim (2026-01-07)
- Ultimo login: 2026-02-13 17:46 UTC (funcionou antes hoje)
- Papel: `super_admin` (correto)
- Auth logs: `400: Invalid login credentials` as 19:26 UTC

## Solucao

Redefinir a senha do usuario via Admin API do backend. Isso sera feito atraves de uma Edge Function temporaria que chama `supabase.auth.admin.updateUserById()` com a nova senha.

### Passos

1. Criar edge function `reset-admin-password` que recebe user_id e nova senha
2. Chamar a funcao para redefinir a senha para `@Sfx2537$` (ou outra senha que o usuario preferir)
3. Remover a edge function apos uso (temporaria)

### Alternativa mais simples

Se o usuario preferir, pode clicar em "Esqueceu sua senha?" na tela de login e redefinir via email.

### Arquivos

| Arquivo | Tipo |
|---|---|
| `supabase/functions/reset-admin-password/index.ts` | NOVO (temporario) |

