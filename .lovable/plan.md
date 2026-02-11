
# Fix definitivo: React Error #185 nos formularios de campanhas

## Causa raiz REAL identificada

O componente `Collapsible` do Radix UI (`@radix-ui/react-collapsible@1.1.11`) esta sendo usado em modo CONTROLADO (`open={isSelected(channel.type)}`) **sem** um handler `onOpenChange`. Isso e um bug conhecido do Radix: quando o `Collapsible` recebe `open` mas nao tem `onOpenChange`, seu estado interno tenta se sincronizar com o prop externo em loop, causando "Maximum update depth exceeded" (Error #185).

O mesmo problema existe no `AdImageUploader.tsx`, que usa `Collapsible` com `CollapsibleTrigger` -- porem la funciona porque TEM `onOpenChange`.

## Solucao

**Eliminar completamente o uso de `Collapsible`/`CollapsibleContent` no `ChannelSelector.tsx`**, substituindo por renderizacao condicional simples com `div` e `{condition && ...}`. Isso remove toda a dependencia do Radix Collapsible neste componente, eliminando a possibilidade de conflito de estado.

### Alteracao em `ChannelSelector.tsx`

**Antes (problematico):**
```tsx
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
// ...
<Collapsible open={isSelected(channel.type)} className={...}>
  <div onClick={() => toggleChannel(channel.type)}>...</div>
  <CollapsibleContent>
    <div>...</div>
  </CollapsibleContent>
</Collapsible>
```

**Depois (corrigido):**
```tsx
// Sem import de Collapsible
<div className={cn("border rounded-lg transition-colors", ...)}>
  <div onClick={() => toggleChannel(channel.type)}>...</div>
  {isSelected(channel.type) && (
    <div className="px-4 pb-4 pt-2 border-t border-border/50">
      {safeRenderChannelForm(channel)}
    </div>
  )}
</div>
```

### Resumo tecnico

| Arquivo | Alteracao |
|---|---|
| `ChannelSelector.tsx` | Remover import de `Collapsible`/`CollapsibleContent`, substituir por `div` + renderizacao condicional |

### Por que esta solucao e definitiva

1. Remove 100% da dependencia do Radix Collapsible neste componente
2. Renderizacao condicional com `{condition && ...}` e nativa do React, sem gerenciamento de estado externo
3. O comportamento visual permanece identico (formulario aparece/desaparece ao clicar)
4. A unica diferenca e a ausencia da animacao suave de abertura/fechamento do Collapsible, que e um trade-off aceitavel para garantir estabilidade
