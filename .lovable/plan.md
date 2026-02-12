
# Fix Definitivo: React Error #185 + Build ID + ErrorBoundary Copiavel

## Diagnostico Final

O erro #185 persiste em producao porque **o codigo corrigido nunca foi publicado**. O log mais recente (2026-02-12 12:01:55) ainda vem do bundle antigo (`index-n1e1U0fs.js`) que contem o Collapsible e o `watch('status')`.

Alem disso, o `BatchAssetUploader.tsx` ainda usa `value={... ?? undefined}` com `key` dinamica como workaround -- isso precisa ser corrigido com engenharia real.

---

## Alteracoes (5 arquivos)

### 1. Criar `src/config/buildInfo.ts` (novo)

Constante fixa com BUILD_ID e deteccao de ambiente:

```ts
export const BUILD_ID = '2026-02-12-v7';
export const BUILD_ENV = window.location.hostname.includes('preview') ? 'preview' : 'production';
```

Isso permite confirmar visualmente se producao recebeu o deploy.

---

### 2. `src/components/admin/AdminLayout.tsx` -- Rodape com Build ID

Adicionar um rodape discreto dentro do layout admin (abaixo do `main`), exibindo:

```
Build: 2026-02-12-v7 | Env: production
```

Estilo: texto `text-[10px] text-muted-foreground` no canto inferior direito.

---

### 3. `src/components/admin/campaigns/BatchAssetUploader.tsx` -- Fix Select controlado

**Problema atual (linhas 347-350 e 370-373):**
```tsx
<Select
  key={asset.selectedSlot?.slotKey ?? `fallback-${asset.id}`}
  value={asset.selectedSlot?.slotKey ?? undefined}  // undefined = uncontrolled!
  onValueChange={...}
>
```

Passar `undefined` como `value` faz o Select operar em modo uncontrolled. Quando o usuario seleciona um slot, `value` passa a ser string = controlled. Essa alternancia e a causa classica do #185.

**Correcao real (sem key dinamica como muleta):**

```tsx
<Select
  value={asset.selectedSlot?.slotKey ?? ''}
  onValueChange={(value) => {
    if (value === '') return; // ignora placeholder
    changeSlot(asset.id, value);
  }}
>
  <SelectTrigger className="h-8 w-48 text-xs">
    <SelectValue placeholder="Selecionar slot..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="" disabled className="text-xs text-muted-foreground">
      Selecione...
    </SelectItem>
    {/* ...slots */}
  </SelectContent>
</Select>
```

Nota: Radix Select nao aceita `value=""` em `SelectItem`. A solucao correta e usar um valor sentinela:

```tsx
const PLACEHOLDER_VALUE = '__none__';

<Select
  value={asset.selectedSlot?.slotKey ?? PLACEHOLDER_VALUE}
  onValueChange={(value) => {
    if (value === PLACEHOLDER_VALUE) return;
    changeSlot(asset.id, value);
  }}
>
  <SelectContent>
    <SelectItem value={PLACEHOLDER_VALUE} disabled>Selecione...</SelectItem>
    {/* ...real slots */}
  </SelectContent>
</Select>
```

- Sempre controlled (string para string)
- Nunca `undefined`
- Sem `key` dinamica como workaround
- Aplicado nos DOIS Selects (linhas ~347 e ~370)

---

### 4. `src/components/admin/AdminErrorBoundary.tsx` -- Relatorio copiavel com Build ID

Adicionar ao render de erro:

- Exibir `Build: {BUILD_ID} | Env: {BUILD_ENV}`
- Exibir `Route: {window.location.pathname}`
- Exibir `componentStack` formatado
- Botao "Copiar erro" que copia tudo para clipboard (`navigator.clipboard.writeText(...)`)

O conteudo copiado sera:

```
BUILD: 2026-02-12-v7
ENV: production
ROUTE: /admin/campaigns/new
ERROR: Maximum update depth exceeded...
STACK: ...
COMPONENT_STACK: ...
```

---

### 5. `src/components/admin/campaigns/CampaignForm.tsx` -- Confirmar fix do status

Ja corrigido no ultimo diff (watch/setValue removidos, useState no lugar). Nenhuma alteracao adicional necessaria. Apenas confirmar que esta no codigo.

---

## Resumo de arquivos

| Arquivo | Tipo | Alteracao |
|---|---|---|
| `src/config/buildInfo.ts` | NOVO | Constantes BUILD_ID e BUILD_ENV |
| `src/components/admin/AdminLayout.tsx` | EDIT | Rodape com build info |
| `src/components/admin/campaigns/BatchAssetUploader.tsx` | EDIT | Select sempre controlled com valor sentinela `__none__` |
| `src/components/admin/AdminErrorBoundary.tsx` | EDIT | Build info + botao "Copiar erro" |

## Apos implementacao

O usuario devera:
1. Verificar preview funciona em `/admin/campaigns/new`
2. Clicar **Publicar** para enviar ao dominio de producao
3. Abrir `conexaoncidade.lovable.app/admin/campaigns/new` em aba anonima
4. Confirmar que o rodape mostra `Build: 2026-02-12-v7 | Env: production`
5. Confirmar zero crash e zero warnings no console
