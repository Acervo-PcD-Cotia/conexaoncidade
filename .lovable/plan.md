

# Reset de Senha do Super Admin

## Objetivo
Forcar o reset da senha do usuario `bs7freitas@gmail.com` para `@Sph5273#` usando uma Edge Function com service role key.

## Implementacao

### 1. Criar Edge Function `reset-admin-password`

Arquivo: `supabase/functions/reset-admin-password/index.ts`

- Usa `SUPABASE_SERVICE_ROLE_KEY` para chamar `auth.admin.updateUserById`
- Aceita `userId` e `newPassword` no body
- Requer autorizacao (token de admin) OU sera uma funcao one-shot que hardcoda o user ID para seguranca

**Abordagem segura**: A funcao vai buscar o user por email `bs7freitas@gmail.com`, validar que existe, e atualizar a senha para o valor enviado. Nao expora endpoint generico — sera especifica para este reset.

```ts
// Pseudocodigo
const supabaseAdmin = createClient(url, serviceRoleKey);
const { data } = await supabaseAdmin.auth.admin.listUsers();
const user = data.users.find(u => u.email === 'bs7freitas@gmail.com');
await supabaseAdmin.auth.admin.updateUserById(user.id, { password: newPassword });
```

### 2. Chamar a funcao via curl

Apos deploy, chamar a funcao com o body `{ "password": "@Sph5273#" }` para efetivar o reset.

### 3. Limpar apos uso

Apos confirmar que o login funciona, a edge function pode ser removida por seguranca (funcao one-shot).

## Arquivos

| Arquivo | Tipo | Descricao |
|---|---|---|
| `supabase/functions/reset-admin-password/index.ts` | NOVO | Edge function para reset de senha |

## Resultado esperado

Login em `conexaonacidade.com.br/auth` com:
- Email: `bs7freitas@gmail.com`
- Senha: `@Sph5273#`

