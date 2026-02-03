
# Plano de Correção: Crash nos Canais + Upload Inteligente por Proporção

## Diagnóstico Completo

### Problema 1: Crash ao clicar nos canais

**Causa raiz identificada:** No arquivo `src/hooks/useCampaignsUnified.ts`, linhas 127 e 205, o código faz um type cast incorreto:

```typescript
channel_type: channelType as 'ads' | 'publidoor' | 'webstories',
```

Mas a UI suporta 7 canais: `ads`, `publidoor`, `webstories`, `push`, `newsletter`, `exit_intent`, `login_panel`.

Quando o usuário seleciona `exit_intent`, `login_panel`, `push` ou `newsletter`, a inserção no banco falha silenciosamente porque o tipo não bate com o enum do banco.

### Problema 2: Upload rejeitando imagens maiores com mesma proporção

A lógica atual em `imageCorrection.ts` está correta para proporção, mas:
1. O `upscalePercent` só é calculado para quando a imagem precisa ser ampliada
2. Falta lógica clara para aceitar imagens maiores (que precisam de downscale)
3. Falta UI para mostrar "Proporção OK - será ajustado automaticamente"

---

## Fase 1: Corrigir Crash nos Canais

### Arquivos a Modificar

#### 1. `src/hooks/useCampaignsUnified.ts`

**Correções:**
- Remover casts incorretos `as 'ads' | 'publidoor' | 'webstories'`
- Usar o tipo correto do banco `Database["public"]["Enums"]["campaign_channel_type"]`
- Adicionar validação de enum antes de inserir
- Normalizar `selectedChannels` para garantir que nunca seja `undefined`

```typescript
// Antes (linha 127)
channel_type: channelType as 'ads' | 'publidoor' | 'webstories',

// Depois
channel_type: channelType, // TypeScript já sabe que é ChannelType válido
```

#### 2. `src/components/admin/campaigns/CampaignForm.tsx`

**Correções:**
- Garantir que `selectedChannels` sempre seja inicializado como array vazio
- Adicionar fallback seguro no estado inicial

#### 3. `src/components/admin/campaigns/ChannelSelector.tsx`

**Correções:**
- Adicionar validação no `toggleChannel` para prevenir valores inválidos
- Adicionar try-catch e logging para debug

---

## Fase 2: Upload Inteligente por Proporção

### Conceito

Aceitar imagens que tenham a **mesma proporção** (aspect ratio) do slot oficial, mesmo que sejam maiores. O sistema deve:
1. Detectar dimensões reais
2. Calcular proporção
3. Encontrar slots compatíveis por proporção (não tamanho exato)
4. Gerar variante no tamanho oficial automaticamente

### Arquivos a Modificar

#### 1. `src/lib/imageCorrection.ts`

**Adicionar:**
- Novo enum `MatchType`: `'exact' | 'downscale' | 'upscale_within_limit' | 'upscale_over_limit' | 'proportion_mismatch'`
- Função `analyzeImageV2()` que retorna status mais granular
- Aceitar imagens maiores (downscale sempre é permitido)

```typescript
// Nova estrutura de resposta
interface SlotMatchV2 {
  slotKey: string;
  slotLabel: string;
  channel: 'ads' | 'publidoor' | 'webstories';
  width: number;
  height: number;
  matchType: 'exact' | 'downscale' | 'upscale_ok' | 'manual_required';
  proportionDiff: number;
  scaleFactor: number; // <1 = downscale, >1 = upscale
  statusText: string;
  statusVariant: 'success' | 'warning' | 'error';
}
```

**Regras de negócio:**
- Proporção OK (±2%) + Imagem maior → `downscale` → ✅ Aceito automaticamente
- Proporção OK (±2%) + Imagem menor (upscale ≤125%) → `upscale_ok` → ✅ Aceito com aviso
- Proporção OK (±2%) + Imagem menor (upscale >125%) → `manual_required` → ⚠️ Escolha manual
- Proporção diferente → `proportion_mismatch` → ❌ Não compatível

#### 2. `src/components/admin/campaigns/BatchAssetUploader.tsx`

**Melhorar UI:**
- Mostrar dimensões detectadas claramente
- Mostrar proporção calculada
- Mostrar slot sugerido com status visual
- Adicionar dropdown "Selecionar manualmente" quando não houver match automático
- Adicionar badges visuais:
  - ✅ "Tamanho ideal" (exact)
  - ✅ "Será reduzido" (downscale) 
  - ⚠️ "Será ampliado X%" (upscale)
  - ❌ "Sem slot compatível"

---

## Fase 3: Constantes Oficiais de Slots (AD_SLOTS)

### Criar arquivo `src/lib/adSlots.ts`

Fonte única de verdade para todos os slots oficiais:

```typescript
export const AD_SLOTS = [
  // Ads
  { id: 'leaderboard', label: 'Leaderboard', width: 728, height: 90, 
    aspect: 8.089, channel: 'ads', placement: 'top' },
  { id: 'super_banner', label: 'Super Banner', width: 970, height: 250, 
    aspect: 3.88, channel: 'ads', placement: 'top' },
  { id: 'retangulo_medio', label: 'Retângulo Médio', width: 300, height: 250, 
    aspect: 1.2, channel: 'ads', placement: 'inline' },
  { id: 'arranha_ceu', label: 'Arranha-céu', width: 300, height: 600, 
    aspect: 0.5, channel: 'ads', placement: 'sidebar' },
  { id: 'popup', label: 'Pop-up', width: 580, height: 400, 
    aspect: 1.45, channel: 'ads', placement: 'modal' },
  
  // Publidoor
  { id: 'publidoor_banner', label: 'Banner Grande', width: 970, height: 250, 
    aspect: 3.88, channel: 'publidoor', placement: 'hero' },
  { id: 'publidoor_retangulo', label: 'Retângulo', width: 300, height: 250, 
    aspect: 1.2, channel: 'publidoor', placement: 'inline' },
  { id: 'publidoor_vertical', label: 'Vertical', width: 300, height: 600, 
    aspect: 0.5, channel: 'publidoor', placement: 'sidebar' },
  
  // WebStories
  { id: 'story_cover', label: 'Capa Story', width: 1080, height: 1920, 
    aspect: 0.5625, channel: 'webstories', placement: 'fullscreen' },
] as const;

export type AdSlotId = typeof AD_SLOTS[number]['id'];
```

---

## Fase 4: Migration para Campos de Processamento

### SQL Migration

Adicionar campos em `campaign_assets` para rastrear processamento:

```sql
ALTER TABLE campaign_assets 
ADD COLUMN IF NOT EXISTS slot_id TEXT,
ADD COLUMN IF NOT EXISTS original_url TEXT,
ADD COLUMN IF NOT EXISTS original_width INTEGER,
ADD COLUMN IF NOT EXISTS original_height INTEGER,
ADD COLUMN IF NOT EXISTS final_width INTEGER,
ADD COLUMN IF NOT EXISTS final_height INTEGER,
ADD COLUMN IF NOT EXISTS original_aspect NUMERIC(10,6),
ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS fit_mode TEXT DEFAULT 'cover',
ADD COLUMN IF NOT EXISTS error_message TEXT;

CREATE INDEX IF NOT EXISTS idx_campaign_assets_slot ON campaign_assets(slot_id);
CREATE INDEX IF NOT EXISTS idx_campaign_assets_processing ON campaign_assets(processing_status);
```

---

## Fase 5: Edge Function para Processamento (Opcional)

### `supabase/functions/campaign-creative-processor/index.ts`

Processar imagens automaticamente:
1. Receber `asset_id`
2. Baixar original do Storage
3. Redimensionar/crop para tamanho oficial usando sharp ou canvas
4. Salvar versão processada
5. Atualizar registro com `final_url`, `processing_status: 'ready'`

---

## Resumo de Arquivos

| Arquivo | Ação | Prioridade |
|---------|------|------------|
| `src/hooks/useCampaignsUnified.ts` | Corrigir cast de channel_type | 🔴 CRÍTICA |
| `src/components/admin/campaigns/CampaignForm.tsx` | Garantir default [] | 🔴 CRÍTICA |
| `src/components/admin/campaigns/ChannelSelector.tsx` | Validação no toggle | 🟡 ALTA |
| `src/lib/adSlots.ts` | Criar constantes oficiais | 🟡 ALTA |
| `src/lib/imageCorrection.ts` | Melhorar lógica de match | 🟡 ALTA |
| `src/components/admin/campaigns/BatchAssetUploader.tsx` | Melhorar UI de status | 🟢 MÉDIA |
| `supabase/migrations/*.sql` | Campos de processamento | 🟢 MÉDIA |
| `supabase/functions/campaign-creative-processor/` | Processamento automático | 🔵 OPCIONAL |

---

## Ordem de Implementação

1. **Fase 1** - Corrigir crash (30 min)
   - Corrigir cast em useCampaignsUnified.ts
   - Adicionar validação no ChannelSelector
   
2. **Fase 2** - Consolidar slots (15 min)
   - Criar src/lib/adSlots.ts
   - Atualizar imageCorrection.ts para usar nova fonte
   
3. **Fase 3** - Melhorar upload (30 min)
   - Atualizar lógica de match por proporção
   - Melhorar UI do BatchAssetUploader
   
4. **Fase 4** - Testes (15 min)
   - Testar todos os 7 canais
   - Testar upload com imagens maiores

---

## Critérios de Aceite

1. ✅ Clicar em qualquer canal (Ads, Publidoor, WebStories, Push, Newsletter, Exit-Intent, Login Panel) não causa crash
2. ✅ Criar campanha com qualquer combinação de canais funciona
3. ✅ Upload de imagem 3033x375 é reconhecido como compatível com Leaderboard 728x90
4. ✅ UI mostra "Será reduzido automaticamente" para imagens maiores
5. ✅ Dropdown "Selecionar manualmente" aparece quando não há match automático
6. ✅ Nenhum erro TypeScript no build
