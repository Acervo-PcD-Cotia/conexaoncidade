
# Correcao Definitiva: React Error #185 + Estabilizacao Campanhas 360

## Diagnostico Completo (Auditoria do Codigo Atual)

Revisei todos os 12 arquivos na arvore de renderizacao de `/admin/campaigns/new`. Segue o status real de cada correcao anterior e os problemas remanescentes.

### Correcoes ja aplicadas e confirmadas no codigo

| Arquivo | Status | Detalhe |
|---|---|---|
| `ChannelSelector.tsx` | OK | Sem Collapsible, usa renderizacao condicional |
| `AdImageUploader.tsx` | OK | Sem Collapsible, usa Button + condicional |
| `PushChannelForm.tsx` | OK | Default `'all'` |
| `NewsletterChannelForm.tsx` | OK | Defaults `'all'` e `'default'` |
| `AdminErrorBoundary.tsx` | OK | Ja envolve todo o admin via AdminLayout |
| `campaigns-unified.ts` | OK | `ChannelType` centralizado com type guard |

### Problemas remanescentes identificados

**Problema 1: BatchAssetUploader - controlled/uncontrolled switch nos Selects**

Linhas 347-348 e 369-370 usam `value={asset.selectedSlot?.slotKey || undefined}`. Quando `selectedSlot` e `null`, value e `undefined` (modo uncontrolled). Quando um slot e atribuido, vira controlled. Essa alternancia e uma causa classica do Error #185. O fix anterior trocou `''` por `undefined`, mas o correto e nunca alternar entre controlled e uncontrolled.

**Problema 2: CampaignForm - keys em listas com index**

Linha 246: `validationErrors.map((error, idx) => <li key={idx}>)` usa index como key. Embora nao cause #185 diretamente, e uma ma pratica que pode causar reconciliacao incorreta.

**Problema 3: AdminErrorBoundary - nao envia para logService**

O `componentDidCatch` faz `console.error` mas nao persiste no `system_logs` via `logService`.

**Problema 4: MaintenanceGuard - sem forwardRef (warning no console)**

Pode gerar warning "Function components cannot be given refs" dependendo do contexto de uso.

---

## Plano de Implementacao (por Task)

### Task 0: Logs de diagnostico

- Adicionar logging estruturado no `AdminErrorBoundary.componentDidCatch` usando `logService.error('campaigns_new', error)`
- Isso garante que qualquer erro futuro nesta rota seja persistido com module/stack

**Arquivo:** `src/components/admin/AdminErrorBoundary.tsx`

### Task 1: Confirmar correcoes (validado)

Todas as 3 correcoes anteriores estao confirmadas no codigo:
- `AdImageUploader.tsx`: Collapsible removido (linha 217-244, usa Button + condicional)
- `BatchAssetUploader.tsx`: `value={... || undefined}` (linhas 348, 370)
- `PushChannelForm.tsx`: default `'all'` (linha 86)

### Task 2: Eliminar controlled/uncontrolled switching

**BatchAssetUploader.tsx** - O `Select` com `value={undefined}` cria alternancia controlled/uncontrolled. Fix:

Quando `selectedSlot` e null, nao renderizar o Select pre-preenchido. Em vez disso, usar o Select sempre com um valor valido ou nao passar `value` (deixar sempre uncontrolled com `defaultValue`).

A abordagem mais segura: separar os dois Selects em dois cenarios - quando ha `selectedSlot`, renderizar com `value` (controlled). Quando nao ha, renderizar sem `value` e com `placeholder` (uncontrolled).

Na pratica, o fix mais simples e remover o prop `value` quando e `undefined`, deixando o Select sempre em modo uncontrolled com `onValueChange`:

```tsx
// De:
<Select value={asset.selectedSlot?.slotKey || undefined} onValueChange={...}>

// Para:
<Select
  value={asset.selectedSlot?.slotKey ?? undefined}
  onValueChange={...}
  key={asset.selectedSlot?.slotKey ?? 'no-slot'}
>
```

Usar `key` diferente forca o React a recriar o componente quando alterna entre "sem slot" e "com slot", evitando o switch controlled/uncontrolled.

**Arquivos:** `src/components/admin/campaigns/BatchAssetUploader.tsx`

### Task 3: Validar valores de Select

Todos os Selects nos sub-formularios ja usam valores validos das opcoes:
- `AdsChannelForm`: default `'home_top'` (existe em SLOT_OPTIONS)
- `PublidoorChannelForm`: default `'narrativo'` (existe em TYPE_OPTIONS)
- `ExitIntentChannelForm`: defaults `'banner'` e `'commercial'`
- `LoginPanelChannelForm`: default `'publidoor'`
- `NewsletterChannelForm`: defaults `'all'` e `'default'`
- `PushChannelForm`: default `'all'`
- `CampaignForm` status: default `'draft'`

Nenhuma correcao necessaria aqui.

### Task 4: Keys estaveis em listas

- `CampaignForm.tsx` linha 246: trocar `key={idx}` por `key={error}` (cada mensagem e unica)
- `BatchAssetUploader.tsx` linha 302: ja usa `key={asset.id}` - OK
- `ChannelSelector.tsx` linhas 278, 284: ja usam `key={category}` e `key={channel.type}` - OK

**Arquivo:** `src/components/admin/campaigns/CampaignForm.tsx`

### Task 5: Tipos e enums centralizados

Ja esta implementado. `ChannelType` esta centralizado em `src/types/campaigns-unified.ts` com:
- `CHANNEL_TYPES` array constante
- `isChannelType()` type guard
- `normalizeChannels()` para sanitizar arrays
- `toChannelType()` para cast seguro

Nenhuma correcao necessaria.

### Task 6: Estado inicial a prova de undefined

`CampaignForm.tsx` ja inicializa todos os estados com defaults seguros (linhas 41-62, 66-88). Todos os configs usam `initialData?.x || {}` ou objetos com defaults explicitos.

Nenhuma correcao necessaria.

### Task 7: Guards de render

`ChannelSelector.tsx` ja tem `safeRenderChannelForm()` com try-catch (linhas 186-197).
`CampaignForm.tsx` ja tem defaults para arrays (`enabledChannels: []`, `assets: []`).
`CampaignEditor.tsx` ja tem loading state e error state com guards.

Uma melhoria: adicionar guard no `BatchAssetUploader` para lista vazia de assets.

### Task 8: Error Boundary + logService

Integrar `logService` no `AdminErrorBoundary.componentDidCatch` para persistir erros no banco.

**Arquivo:** `src/components/admin/AdminErrorBoundary.tsx`

---

## Resumo de alteracoes

| Arquivo | Alteracao | Task |
|---|---|---|
| `BatchAssetUploader.tsx` | Adicionar `key` dinamica nos Selects para evitar switch controlled/uncontrolled | 2 |
| `CampaignForm.tsx` | Trocar `key={idx}` por `key={error}` na lista de validacao | 4 |
| `AdminErrorBoundary.tsx` | Integrar `logService` no `componentDidCatch` | 0, 8 |

### Detalhes tecnicos das alteracoes

**BatchAssetUploader.tsx (2 pontos):**
```tsx
// Linha ~347: Adicionar key para forcar recriacao
<Select
  key={asset.selectedSlot?.slotKey ?? `fallback-${asset.id}`}
  value={asset.selectedSlot?.slotKey ?? undefined}
  onValueChange={(value) => changeSlot(asset.id, value)}
>

// Linha ~369: Mesmo padrao
<Select
  key={asset.selectedSlot?.slotKey ?? `fallback2-${asset.id}`}
  value={asset.selectedSlot?.slotKey ?? undefined}
  onValueChange={(value) => changeSlot(asset.id, value)}
>
```

**CampaignForm.tsx:**
```tsx
// Linha 246: Trocar key
{validationErrors.map((error) => (
  <li key={error}>{error}</li>
))}
```

**AdminErrorBoundary.tsx:**
```tsx
// No componentDidCatch, adicionar:
import { logService } from '@/lib/logService';

componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  this.setState({ errorInfo });
  console.error('[AdminErrorBoundary] Error caught:', { ... });
  // Persistir no banco
  logService.error('admin_error_boundary', error, {
    componentStack: errorInfo.componentStack,
    route: window.location.pathname,
  });
}
```

### Resultado esperado

- Zero alternancia controlled/uncontrolled nos Selects
- Keys estaveis em todas as listas
- Erros persistidos no banco via logService
- Error #185 eliminado na rota `/admin/campaigns/new`
