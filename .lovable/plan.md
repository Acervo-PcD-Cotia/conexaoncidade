
# Correcao: Site exige multiplos refreshes para exibir conteudo

## Diagnostico

O problema principal e uma **condicao de corrida (race condition)** no `TenantProvider` combinada com uma **cascata sequencial de queries** sem cache adequado.

### Fluxo atual (com bug):

```text
1. App monta -> AuthProvider inicia (isLoading=true, user=null)
2. TenantProvider ve user=null -> limpa tenantId, seta isLoading=false
3. useSiteConfig ve shouldUseDefaults=true (sem tenant) -> renderiza com defaults
4. Auth resolve -> user disponivel -> TenantProvider roda de novo
5. MAS isLoading NAO volta para true! -> site continua mostrando defaults
6. Queries de tenant rodam (user_roles, site_users, sites) -> 3 chamadas sequenciais
7. Tenant resolve -> dispara query site_template_config
8. Config resolve -> dispara query portal_templates
9. Template resolve -> finalmente renderiza conteudo real
```

### 3 Problemas Raiz:

**1. TenantProvider nao reseta `isLoading` quando `user` muda (CRITICO)**
- Quando auth carrega e `user` muda de null para um usuario real, o `fetchDefaultTenant` roda novamente
- Mas `isLoading` ja foi setado como `false` no passo 2 e nunca volta para `true`
- Durante as queries de tenant, o site renderiza com defaults (sem tenant) em vez de mostrar loading
- Resultado: flash de conteudo vazio/default, depois re-render com dados reais

**2. Queries criticas sem `staleTime` (CASCATA)**
- `useSiteTemplateConfig` e `usePortalTemplate` nao tem `staleTime`
- Com staleTime=0 (default), toda navegacao causa refetch
- Cada pagina que usa `useSiteConfig` refaz toda a cascata de queries
- Resultado: conteudo pisca ou desaparece temporariamente ao navegar

**3. QueryClient sem configuracao global de cache**
- O `QueryClient` na linha 350 do App.tsx usa configuracao padrao (staleTime=0, gcTime=5min)
- Todas as queries sem staleTime explicito refetcham em cada mount
- Dados que mudam raramente (templates, branding) sao re-buscados desnecessariamente

---

## Plano de Correcao

### Etapa 1: Corrigir race condition no TenantProvider

Arquivo: `src/contexts/TenantContext.tsx`

- Adicionar `setIsLoading(true)` no inicio de `fetchDefaultTenant` quando `user` existe
- Isso garante que durante as queries de tenant, o site mostra loading em vez de defaults
- Componentes que dependem de `tenantLoading` vao esperar corretamente

Mudanca especifica:
```text
const fetchDefaultTenant = async () => {
  if (!user) {
    setCurrentTenantIdState(null);
    localStorage.removeItem(TENANT_CACHE_KEY);
    setIsLoading(false);
    return;
  }

  // NOVO: Resetar loading quando user muda
  setIsLoading(true);

  try {
    // ... resto do codigo existente
```

### Etapa 2: Adicionar staleTime nas queries criticas de configuracao

Arquivos:
- `src/hooks/useSiteTemplateConfig.ts` - Adicionar `staleTime: 5 * 60 * 1000` (5 minutos)
- `src/hooks/usePortalTemplates.ts` - Adicionar `staleTime: 10 * 60 * 1000` (10 minutos) nas queries de template

Isso evita que a cascata de queries se repita em cada navegacao. Templates e config de site mudam raramente.

### Etapa 3: Configurar QueryClient com defaults globais

Arquivo: `src/App.tsx`

Adicionar configuracao default no QueryClient:
```text
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000,  // 1 minuto default
      gcTime: 10 * 60 * 1000,    // 10 minutos no garbage collector
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

Isso reduz refetches desnecessarios em TODAS as queries do app, nao apenas as de config.

### Etapa 4: Usar tenant cacheado enquanto valida

Arquivo: `src/contexts/TenantContext.tsx`

- Quando ha um valor cacheado no localStorage e o usuario esta logado, usar o valor cacheado imediatamente
- Validar em background e atualizar se mudou
- Isso elimina o "flash" de conteudo default para usuarios que retornam ao site

---

## Resultado Esperado

- Site exibe conteudo na primeira carga, sem necessidade de refresh
- Usuarios logados veem o site corretamente sem flash de defaults
- Navegacao entre paginas nao causa recarregamento de dados de configuracao
- Reduzao significativa de chamadas ao banco de dados (menos waterfall)
