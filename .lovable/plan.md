

## Remover tela "Autenticacao Necessaria" e redirecionar direto para o login

### Problema

Quando um usuario nao autenticado acessa `/spah/painel`, o `useRequireRole` exibe a tela `AccessDeniedScreen` com um countdown de 3 segundos antes de redirecionar para `/spah`. Isso cria uma experiencia ruim -- o usuario ve um card de "Autenticacao Necessaria" por 3 segundos antes de chegar ao formulario de login.

### Solucao

No hook `useRequireRole.ts`, quando o motivo for `not_authenticated`, redirecionar imediatamente para `/spah` via `navigate()` (SPA), sem exibir a tela de acesso negado e sem countdown.

Manter a tela `AccessDeniedScreen` apenas para o caso `not_authorized` (usuario logado mas sem permissao), que e um cenario legitimo para mostrar uma mensagem de erro.

### Arquivo a alterar

| Arquivo | Mudanca |
|---|---|
| `src/hooks/useRequireRole.ts` | Quando `!user`, usar `navigate('/spah', { replace: true })` imediatamente em vez de mostrar AccessDeniedScreen com countdown |

### Detalhe tecnico

Bloco atual (linhas 24-42):
```text
if (!user) {
  setShowDenied('not_authenticated');
  setCheckingRole(false);
  // ... countdown 3s -> window.location.href
}
```

Novo comportamento:
```text
if (!user) {
  navigate('/spah', { replace: true });
  return;
}
```

Redirecionamento instantaneo, sem tela intermediaria, sem reload de pagina.

