

# Renomear Rotas `/auth` e `/admin` para `/spah`

## Objetivo
Substituir todas as rotas `/auth` e `/admin` por `/spah` para ofuscar o acesso ao painel administrativo, dificultando tentativas de acesso nao autorizado.

## Escopo da Mudanca

A mudanca afeta **~130 arquivos** no total:
- **114 arquivos** referenciam `/admin` (navegacao, links, redirects)
- **23 arquivos** referenciam `/auth` (login, redirects de autenticacao)
- **2 arquivos** em hooks (`useRequireRole.ts`, `useSidebarPersistence.ts`)

## Estrategia

### Fase 1 - Criar constantes centralizadas de rotas

Criar um arquivo `src/config/routes.ts` com todas as rotas administrativas como constantes. Isso facilita futuras mudancas e evita hardcoding espalhado.

```text
ROUTES.AUTH = "/spah"
ROUTES.ADMIN = "/spah/painel"
ROUTES.LOGIN = "/spah"  (alias)
```

A rota `/auth` vira `/spah` e `/admin` vira `/spah/painel`. Assim o login fica em `/spah` e o dashboard em `/spah/painel`.

### Fase 2 - Atualizar App.tsx (definicao de rotas)

- `<Route path="/auth">` muda para `<Route path="/spah">`
- `<Route path="/admin">` muda para `<Route path="/spah/painel">`
- Adicionar redirects de compatibilidade: `/auth` -> `/spah`, `/admin` -> `/spah/painel`, `/login` -> `/spah`

### Fase 3 - Atualizar todos os 114+ arquivos com referencias

Substituir em massa:
- `"/admin/` por `"/spah/painel/`
- `"/admin"` por `"/spah/painel"`
- `"/auth"` por `"/spah"`
- `"/auth?` por `"/spah?`
- `to="/admin` por `to="/spah/painel`
- `navigate("/admin` por `navigate("/spah/painel`

### Fase 4 - Atualizar hooks e contextos

- `useRequireRole.ts`: redirect para `/spah` em vez de `/auth`
- `useSidebarPersistence.ts`: atualizar mapa de rotas de `/admin` para `/spah/painel`

### Fase 5 - Redirects de seguranca

Manter redirects das rotas antigas para as novas (temporariamente), para que links salvos nao quebrem:
- `/auth` -> redireciona para `/spah`
- `/admin` -> redireciona para `/spah/painel`
- `/login` -> redireciona para `/spah`
- `/dashboard` -> redireciona para `/spah/painel`

**Nota**: Esses redirects podem ser removidos futuramente para esconder completamente as rotas antigas.

## Arquivos Modificados

| Arquivo | Tipo | Descricao |
|---|---|---|
| `src/config/routes.ts` | NOVO | Constantes centralizadas de rotas |
| `src/App.tsx` | MODIFICAR | Atualizar definicoes de Route e redirects |
| `src/hooks/useRequireRole.ts` | MODIFICAR | Redirect para `/spah` |
| `src/hooks/useSidebarPersistence.ts` | MODIFICAR | Mapa de rotas atualizado |
| ~114 arquivos em `src/pages/admin/` | MODIFICAR | Links e navegacao `/admin` -> `/spah/painel` |
| ~23 arquivos em `src/pages/`, `src/components/` | MODIFICAR | Links `/auth` -> `/spah` |

## Detalhes Tecnicos

- A rota `/auth-comunidade` NAO sera alterada (login da comunidade e publico, nao administrativo)
- O `AdminLayout` continua o mesmo componente, apenas montado em path diferente
- A autenticacao e RLS nao sao afetadas (seguranca real permanece no backend)
- `reset-password` permanece inalterado pois e fluxo publico

## Resultado Esperado

- Login admin: `conexaonacidade.com.br/spah`
- Dashboard: `conexaonacidade.com.br/spah/painel`
- Todas as sub-rotas: `conexaonacidade.com.br/spah/painel/news`, etc.
- Rotas antigas redirecionam temporariamente para as novas

