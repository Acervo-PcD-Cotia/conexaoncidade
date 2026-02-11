
# Fix: React Error #185 (Maximum update depth exceeded) na pagina de campanhas

## Causa raiz

O erro ocorre por um conflito de eventos entre `CollapsibleTrigger` e `onOpenChange` no componente `ChannelSelector.tsx`. Quando o `CollapsibleTrigger asChild` e clicado, ele dispara seu handler interno E o `onOpenChange` do `Collapsible`. O handler `toggleChannel` ignora o parametro booleano e faz toggle cego, o que pode criar uma oscilacao de estado (abrir-fechar-abrir infinitamente), atingindo o limite do React de 50 atualizacoes aninhadas.

Alem disso, dois `Select` no `NewsletterChannelForm` usam `value=""` quando nao ha valor configurado, o que nao tem `SelectItem` correspondente e pode causar erros adicionais do Radix.

## Solucao

### 1. ChannelSelector.tsx -- Remover CollapsibleTrigger completamente

Eliminar o componente `CollapsibleTrigger` e o `onOpenChange` do `Collapsible`. Usar um `Collapsible` puramente controlado com um `onClick` simples no div wrapper:

```tsx
<Collapsible 
  key={channel.type} 
  open={isSelected(channel.type)}
  className={cn("border rounded-lg transition-colors", ...)}
>
  <div
    className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
    onClick={() => toggleChannel(channel.type)}
  >
    <Checkbox checked={isSelected(channel.type)} className="mt-0.5 pointer-events-none" />
    {/* ...conteudo do canal... */}
  </div>
  <CollapsibleContent>
    <div className="px-4 pb-4 pt-2 border-t border-border/50">
      {safeRenderChannelForm(channel)}
    </div>
  </CollapsibleContent>
</Collapsible>
```

Isso elimina QUALQUER possibilidade de conflito de eventos do Radix, pois nao ha `CollapsibleTrigger` nem `onOpenChange`. O estado e 100% controlado manualmente.

### 2. NewsletterChannelForm.tsx -- Corrigir Select com valor vazio

Dois `Select` podem ter `value=""` sem `SelectItem` correspondente:

- Linha 44: `value={config?.target_list || ''}` -- mudar para `value={config?.target_list || 'all'}` (com "all" como default)
- Linha 79: `value={config?.template_id || ''}` -- mudar para `value={config?.template_id || 'default'}`

---

## Resumo de alteracoes

| Arquivo | Alteracao |
|---|---|
| `src/components/admin/campaigns/ChannelSelector.tsx` | Remover `CollapsibleTrigger` e `onOpenChange`; usar div com `onClick` direto |
| `src/components/admin/campaigns/NewsletterChannelForm.tsx` | Garantir valores default validos nos Select components |

## Impacto

- Elimina completamente o conflito de eventos que causa o erro #185
- A pagina de criacao de campanhas volta a funcionar
- Todos os formularios de canais (Ads, Publidoor, WebStories, etc.) ficam acessiveis
- Sem mudanca na aparencia ou comportamento visivel para o usuario
