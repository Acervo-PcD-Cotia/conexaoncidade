
# Correcao: Erro na pagina de criacao de campanhas e botao "Voltar"

## Problemas identificados

### 1. Erro de build bloqueando a aplicacao
O arquivo `src/hooks/usePushSubscription.ts` tem erros TypeScript nas linhas 57, 124 e 174: `Property 'pushManager' does not exist on type 'ServiceWorkerRegistration'`. Este erro de build impede a compilacao correta da aplicacao, causando a tela de erro ao acessar `/admin/campaigns/new`.

### 2. Botao "Voltar" na tela de erro navega para o lugar errado
O componente `AdminErrorBoundary.tsx` usa `window.history.back()` no botao "Voltar". Quando o usuario veio da lista de campanhas, o "Voltar" o leva de volta para la em vez de tentar recarregar a pagina atual (criacao de campanha).

## Solucao

### 1. Corrigir erro de tipo em `usePushSubscription.ts`

A propriedade `pushManager` existe em runtime nos navegadores modernos, mas o TypeScript nao a reconhece sem a tipagem correta. A solucao e fazer um cast para `any` nas 3 ocorrencias (linhas 57, 124, 174):

```ts
// Antes:
const subscription = await registration.pushManager.getSubscription();

// Depois:
const subscription = await (registration as any).pushManager.getSubscription();
```

Aplicar o mesmo cast nas 3 linhas.

### 2. Corrigir botao "Voltar" no `AdminErrorBoundary.tsx`

Trocar `window.history.back()` por `window.location.reload()` no `handleGoBack`, para que o botao "Voltar" recarregue a pagina atual em vez de navegar para a pagina anterior:

```tsx
handleGoBack = () => {
  this.setState({ hasError: false, error: null, errorInfo: null });
  window.location.reload();
};
```

Alternativamente, renomear o botao de "Voltar" para "Tentar novamente" para refletir melhor a acao.

---

## Resumo de alteracoes

| Arquivo | Alteracao |
|---|---|
| `src/hooks/usePushSubscription.ts` | Cast `registration as any` nas linhas 57, 124 e 174 para resolver erro de tipo `pushManager` |
| `src/components/admin/AdminErrorBoundary.tsx` | Trocar `window.history.back()` por reload da pagina e ajustar label do botao |

## Impacto esperado

- A aplicacao volta a compilar corretamente, eliminando a tela de erro
- O botao "Voltar" na tela de erro recarrega a pagina atual em vez de navegar para a lista de campanhas
- Os formularios de canais (Ads, Publidoor, WebStories, etc.) voltam a funcionar normalmente
