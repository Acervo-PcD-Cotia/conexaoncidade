

## Problema identificado

O sistema atual tem uma falha arquitetural: o estado de assets no formulario (`ChannelAssets`) armazena **apenas 1 URL por canal** (ex: `ads: { url, alt }`), mas existem **5 formatos diferentes** so no canal `ads`. Isso causa:

1. **Sobreposicao**: ao enviar o formato #1 (728x90) e depois o #2 (970x250), ambos sao `channel: ads`, entao o segundo sobrescreve o primeiro no state
2. **Exigencia de canal**: o `handleFormSubmit` so inclui assets se o canal estiver selecionado (`selectedChannels.includes('ads')`) -- o usuario quer que funcione **sem precisar ativar o canal**
3. **Assets existentes nao aparecem**: ao reabrir a campanha, o `IndividualSlotUploadList` recebe `existingAssets` mapeado por canal (1 por canal), nao por `format_key`, entao so mostra 1 dos 5 ads

---

## Solucao

### 1. Novo estado: `uploadedSlotAssets` (por format_key)

Adicionar ao reducer um mapa independente `Record<string, { file_url, channel_type, format_key }>` indexado pelo `slot.id` (ex: `leaderboard`, `super_banner`, etc.). Cada formato dos 15 tera seu proprio registro, sem conflito.

### 2. `IndividualSlotUploadList` alimenta o novo estado

Quando o usuario envia uma imagem pelo upload individual (tabela dos 15 formatos), o resultado vai direto para o novo mapa `uploadedSlotAssets`, usando o `slot.id` como chave.

### 3. Assets existentes carregados por `format_key`

Ao abrir campanha existente, os registros de `campaign_assets` serao mapeados para o `IndividualSlotUploadList` usando `format_key` (nao mais por canal), permitindo que cada um dos 15 slots mostre corretamente "Ja enviado" com thumbnail.

### 4. Submit inclui todos os slot assets (sem exigir canal)

No `handleFormSubmit`, alem dos assets legados (que dependem de canal), incluir **todos os assets do mapa `uploadedSlotAssets`** incondicionalmente -- sem verificar `selectedChannels`.

### 5. Exibir thumbnail e nome apos upload

A `IndividualSlotUploadList` ja mostra preview e nome quando o arquivo e selecionado localmente. O ajuste e garantir que apos o upload (status "uploaded") e ao reabrir a campanha, a thumbnail + nome continuem visiveis.

---

## Arquivos a alterar

| Arquivo | Mudanca |
|---|---|
| `src/components/admin/campaigns/useCampaignFormReducer.ts` | Adicionar campo `uploadedSlotAssets` ao state, action `SET_SLOT_ASSET`, e popular a partir de `initialData.assets` usando `format_key` |
| `src/components/admin/campaigns/BatchAssetUploader.tsx` | Receber `existingSlotAssets` (por slot.id) e usar no `IndividualSlotUploadList` para mostrar thumbnails corretas; propagar `onSlotAssetUploaded` com slot.id |
| `src/components/admin/campaigns/CampaignForm.tsx` | Passar `existingSlotAssets` ao `BatchAssetUploader`; no submit, montar array de assets a partir de `uploadedSlotAssets` sem depender de `selectedChannels` |

---

## Detalhes tecnicos

### Novo campo no state do reducer

```text
uploadedSlotAssets: Record<string, {
  file_url: string;
  channel_type: ChannelType;
  format_key: string;
  asset_type: string;
}>
```

Chave = `slot.id` (ex: `leaderboard`, `super_banner`, `retangulo_medio`...)

### Nova action

```text
SET_SLOT_ASSET: { slotId: string, file_url: string, channel_type, format_key, asset_type }
```

### Inicializacao a partir de `initialData.assets`

Ao criar o state inicial, iterar `initialData.assets` e mapear cada `format_key` para o `slot.id` correspondente usando `AD_SLOTS`.

### Submit independente de canal

```text
// Alem dos assets legados:
Object.values(state.uploadedSlotAssets).forEach(slotAsset => {
  formAssets.push({
    asset_type: slotAsset.asset_type,
    file_url: slotAsset.file_url,
    channel_type: slotAsset.channel_type,
    format_key: slotAsset.format_key,
  });
});
```

Deduplicar por `format_key` para evitar duplicatas entre assets legados e slot assets.

