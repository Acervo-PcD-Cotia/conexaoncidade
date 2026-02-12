
# Fix Definitivo: Root Cause Confirmada no Radix Select + Form

## Causa Raiz (Confirmada no Codigo-Fonte da Biblioteca)

O `@radix-ui/react-select@2.2.5` renderiza um `<select>` nativo oculto quando detecta que esta dentro de um `<form>` (para compatibilidade com formularios nativos). Este `<select>` oculto tem um bug de loop:

1. Cada `SelectItem` ao montar registra uma `<option>` nativa via `onNativeOptionAdd`
2. Isso muda `nativeOptionsSet` -> muda `nativeSelectKey` -> remonta o `<select>` oculto
3. Na remontagem, `usePrevious(value)` reseta para `undefined`
4. O `useEffect` interno detecta `prevValue !== value` (undefined !== 'draft') e dispara um `new Event("change")`
5. O evento de change chama `setValue(event.target.value)` no Select root
6. Isso dispara `onValueChange` -> `setStatus` -> re-render
7. Re-render faz SelectItems re-montarem -> volta ao passo 1

Este loop ocorre APENAS quando o Select esta dentro de um `<form>` (que e o caso do CampaignForm).

## Solucao: Substituir Radix Select por RadioGroup para Status

Em vez de tentar contornar o bug interno do Radix Select, a solucao de engenharia e **eliminar o componente problematico** e usar o Radix RadioGroup (que NAO tem o mecanismo de `<select>` nativo oculto).

### Alteracao 1: `src/components/admin/campaigns/CampaignForm.tsx`

Substituir o bloco do Select de status (linhas 294-310) por um RadioGroup inline:

```tsx
// ANTES (Radix Select com bug de loop interno):
<Select value={status} onValueChange={...}>
  <SelectTrigger><SelectValue /></SelectTrigger>
  <SelectContent>
    <SelectItem value="draft">Rascunho</SelectItem>
    <SelectItem value="active">Ativa</SelectItem>
    <SelectItem value="paused">Pausada</SelectItem>
    <SelectItem value="ended">Encerrada</SelectItem>
  </SelectContent>
</Select>

// DEPOIS (RadioGroup - sem <select> nativo oculto):
<RadioGroup
  value={status}
  onValueChange={(value) => setStatus(value as CampaignStatus)}
  className="flex flex-wrap gap-2"
>
  {[
    { value: 'draft', label: 'Rascunho' },
    { value: 'active', label: 'Ativa' },
    { value: 'paused', label: 'Pausada' },
    { value: 'ended', label: 'Encerrada' },
  ].map((opt) => (
    <div key={opt.value} className="flex items-center space-x-2">
      <RadioGroupItem value={opt.value} id={`status-${opt.value}`} />
      <Label htmlFor={`status-${opt.value}`} className="font-normal cursor-pointer">
        {opt.label}
      </Label>
    </div>
  ))}
</RadioGroup>
```

Imports a adicionar: `RadioGroup, RadioGroupItem` de `@/components/ui/radio-group`.
Imports a remover: `Select, SelectContent, SelectItem, SelectTrigger, SelectValue`.

**Por que RadioGroup e seguro**: O Radix RadioGroup nao renderiza um elemento nativo oculto e nao tem o mecanismo de `nativeOptionsSet` + `BubbleInput` que causa o loop.

### Alteracao 2: `src/config/buildInfo.ts`

Atualizar BUILD_ID para `'2026-02-12-v9'` para confirmar o deploy.

## Arquivos alterados

| Arquivo | Alteracao |
|---|---|
| `src/components/admin/campaigns/CampaignForm.tsx` | Substituir Select por RadioGroup para campo status |
| `src/config/buildInfo.ts` | BUILD_ID -> v9 |

## Por que isso resolve de vez

- O Radix RadioGroup usa `<input type="radio">` nativos (que nao tem o bug de BubbleInput + key + usePrevious)
- Remove completamente o unico Radix Select que renderiza no mount inicial da pagina
- Os outros Selects (nos channel forms) so renderizam quando o usuario ativa um canal, entao nao causam crash no mount
- Comportamento identico para o usuario: seleciona um status entre 4 opcoes

## Detalhes tecnicos da causa raiz

O arquivo `node_modules/@radix-ui/react-select/dist/index.mjs` contem:

1. **Linha 75-76**: `isFormControl = trigger ? form || !!trigger.closest("form") : true` - detecta que esta dentro de um form
2. **Linha 76**: `nativeOptionsSet` e um `Set` que recebe novos elementos a cada mount de SelectItem
3. **Linha 77**: `nativeSelectKey = Array.from(nativeOptionsSet).map(...).join(";")` - muda a cada item adicionado
4. **Linha 115-133**: `SelectBubbleInput` (native select oculto) e renderizado com `key={nativeSelectKey}`
5. **Linha 1074-1088**: `usePrevious(value)` reseta a `undefined` na remontagem, causando `prevValue !== value` -> dispara `new Event("change")` -> loop

Este bug e uma combinacao de:
- Select controlado dentro de `<form>`
- Multiplos SelectItems montando em sequencia
- Cada mount causa remontagem do native select
- Cada remontagem dispara change event via useEffect

## Checklist pos-deploy

1. Verificar rodape mostra `Build: 2026-02-12-v9`
2. Abrir `/admin/campaigns/new` sem crash
3. Confirmar que o campo Status aparece como RadioGroup com 4 opcoes
4. Console: zero warnings/errors
