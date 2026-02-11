

# Fix definitivo do Error #185 - Fontes remanescentes

## Diagnostico

Apos revisar todos os arquivos na arvore de renderizacao de `/admin/campaigns/new`, identifiquei **2 fontes remanescentes** que podem causar o Error #185:

### Fonte 1: `AdImageUploader.tsx` - Collapsible com CollapsibleTrigger asChild

O `AdImageUploader` ainda usa `Collapsible` + `CollapsibleTrigger asChild` (linhas 217-247). Este componente e renderizado dentro de **5 formularios de canal** (Ads, Publidoor, WebStories, Exit-Intent, Login Panel). Apesar de ter `onOpenChange`, o padrao `CollapsibleTrigger asChild` com `Button` pode causar conflito de eventos (duplo toggle), gerando oscilacao de estado.

### Fonte 2: `BatchAssetUploader.tsx` - Select com valor vazio

Nas linhas 348 e 370, o componente `Select` recebe `value={asset.selectedSlot?.slotKey || ''}` - string vazia que causa crash no Radix Select.

### Fonte 3: `PushChannelForm.tsx` - Select com valor default inconsistente

O fallback `'subscribers'` nao corresponde a nenhum valor possivel vindo do `CampaignForm` (que usa `'all'`). Embora nao cause o crash, e uma inconsistencia.

## Solucao

### 1. `AdImageUploader.tsx` - Remover Collapsible, usar renderizacao condicional

Substituir:
```tsx
<Collapsible open={showUrlOption} onOpenChange={setShowUrlOption}>
  <CollapsibleTrigger asChild>
    <Button ...>
  </CollapsibleTrigger>
  <CollapsibleContent>
    ...
  </CollapsibleContent>
</Collapsible>
```

Por:
```tsx
<Button onClick={() => setShowUrlOption(!showUrlOption)} ...>
  ...
</Button>
{showUrlOption && (
  <div className="mt-2">
    ...
  </div>
)}
```

Remover o import de `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger`.

### 2. `BatchAssetUploader.tsx` - Corrigir valor vazio no Select

Substituir `value={asset.selectedSlot?.slotKey || ''}` por `value={asset.selectedSlot?.slotKey || undefined}` em ambas as instancias do Select (linhas 348 e 370), e adicionar `placeholder` adequado.

### 3. `PushChannelForm.tsx` - Corrigir valor default do Select

Mudar de `value={config?.target_audience || 'subscribers'}` para `value={config?.target_audience || 'all'}` para consistencia com o default do CampaignForm.

## Arquivos a alterar

| Arquivo | Alteracao |
|---|---|
| `AdImageUploader.tsx` | Remover Collapsible, usar div + condicional |
| `BatchAssetUploader.tsx` | Corrigir valor vazio nos Select |
| `PushChannelForm.tsx` | Corrigir valor default do Select |

## Por que isso resolve

1. Elimina o **ultimo** uso de Collapsible na arvore de componentes do formulario de campanhas
2. Remove todas as strings vazias como valor de Select (causa conhecida de crash no Radix)
3. Garante consistencia de valores default entre componentes

