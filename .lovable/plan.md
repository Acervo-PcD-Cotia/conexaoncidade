
# Correcao: Formularios de canais crashing ao clicar

## Diagnostico

Apos analise extensiva do codigo, foram identificados **3 problemas** que podem causar crashes nos formularios de canais:

### Problema 1: Conflito Collapsible + onClick
O `ChannelSelector` usa `CollapsibleTrigger asChild` envolvendo um `<div>` que tem seu proprio `onClick`. Isso causa DOIS handlers de click simultaneos: o do `onClick` do div (que chama `toggleChannel`) e o interno do `CollapsibleTrigger` (que tenta alternar o estado interno). Como o `Collapsible` e controlado (`open={...}`) mas **nao tem `onOpenChange`**, isso pode gerar comportamento inesperado ou erros dependendo da versao do Radix.

### Problema 2: SelectItem com value=""
Em `NewsletterChannelForm.tsx` (linha 85), existe:
```tsx
<SelectItem value="">Template padrao</SelectItem>
```
O Radix UI Select nao aceita valor vazio em `SelectItem` e lanca um erro de runtime.

### Problema 3: Erro invisivel no Error Boundary
O `AdminErrorBoundary` so mostra detalhes do erro em modo DEV (`import.meta.env.DEV`). Na preview de producao, o usuario ve apenas "Ops, algo deu errado" sem saber a causa real.

## Solucao

### 1. ChannelSelector.tsx -- Remover conflito de click

Separar a logica de toggle do `CollapsibleTrigger`. O `Collapsible` deve usar `onOpenChange` para controlar o estado, e o `CollapsibleTrigger` nao deve interferir:

```tsx
<Collapsible 
  open={isSelected(channel.type)}
  onOpenChange={() => toggleChannel(channel.type)}
>
  <CollapsibleTrigger asChild>
    <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors">
      <Checkbox
        checked={isSelected(channel.type)}
        className="mt-0.5 pointer-events-none"
      />
      {/* ... rest of content */}
    </div>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <div className="px-4 pb-4 pt-2 border-t border-border/50">
      {renderChannelForm(channel)}
    </div>
  </CollapsibleContent>
</Collapsible>
```

A mudanca principal e:
- Remover `onClick={() => toggleChannel(channel.type)}` do div
- Adicionar `onOpenChange={() => toggleChannel(channel.type)}` no `Collapsible`
- Isso garante que o toggle so acontece por UM caminho, controlado pelo Radix

### 2. NewsletterChannelForm.tsx -- Corrigir SelectItem vazio

Trocar `value=""` por `value="default"`:

```tsx
<SelectItem value="default">Template padrao</SelectItem>
```

E ajustar a logica para tratar "default" como template padrao.

### 3. AdminErrorBoundary.tsx -- Mostrar erro real

Remover a condicao `isDev` para mostrar detalhes do erro sempre (util para debugging):

```tsx
{this.state.error && (
  <div className="w-full mt-4 p-3 rounded-lg bg-muted text-left">
    <div className="flex items-center gap-2 mb-2">
      <Bug className="h-4 w-4 text-orange-500" />
      <span className="text-xs font-medium uppercase text-orange-600">Detalhes do erro</span>
    </div>
    <p className="text-xs font-mono text-destructive break-all">
      {this.state.error.message}
    </p>
  </div>
)}
```

### 4. ChannelSelector.tsx -- Protecao extra no renderChannelForm

Envolver a chamada `renderChannelForm` em try-catch para capturar erros individuais por canal:

```tsx
const safeRenderChannelForm = (channel: ChannelOption) => {
  try {
    return renderChannelForm(channel);
  } catch (error) {
    console.error(`Error rendering form for ${channel.type}:`, error);
    return (
      <div className="p-4 text-sm text-destructive">
        Erro ao carregar formulario deste canal.
      </div>
    );
  }
};
```

---

## Resumo de alteracoes

| Arquivo | Alteracao |
|---|---|
| `src/components/admin/campaigns/ChannelSelector.tsx` | Usar `onOpenChange` no Collapsible, remover `onClick` do div, adicionar try-catch no render |
| `src/components/admin/campaigns/NewsletterChannelForm.tsx` | Trocar `value=""` por `value="default"` no SelectItem |
| `src/components/admin/AdminErrorBoundary.tsx` | Mostrar detalhes do erro sem condicao isDev |

## Impacto

- Elimina conflito de eventos click no ChannelSelector
- Corrige erro de runtime causado por SelectItem com valor vazio
- Se houver outro erro nao identificado, ele sera visivel na tela de erro para debugging futuro
