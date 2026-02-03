
# Sistema Oficial de Campanhas & Publicidade 360

## Resumo Executivo

Evoluir o sistema de campanhas ja implementado para suportar:
1. **Ciclos de Distribuicao** - Reenvio/repeticao sem duplicar campanha
2. **Novos Canais** - Push, Newsletter, Exit-Intent, Login Panel
3. **Upload em Lote com Auto-Atribuicao** - Deteccao automatica de dimensoes
4. **Motor de Correcao de Imagem** - Upscale 125%, tolerancia 2%
5. **Storage Organizado** - Bucket campaign-assets com estrutura padrao
6. **Exit-Intent Modal (modelo UOL)** - 3 espacos publicitarios
7. **Login Panel** - Criativo no lado esquerdo

---

## Estado Atual vs. Objetivo

### Ja Implementado
- Tabela `campaigns_unified` com campos basicos
- Tabela `campaign_channels` (ads, publidoor, webstories)
- Tabela `campaign_assets` e `campaign_events`
- Hooks CRUD (`useCampaignsUnified.ts`)
- Formulario de campanha (`CampaignForm.tsx`)
- Seletor de canais (`ChannelSelector.tsx`)
- Componente `AdImageUploader` para upload

### A Implementar
- Tabela `campaign_cycles` (ciclos de distribuicao)
- Expandir ENUMs para novos canais e eventos
- Upload em lote com deteccao de dimensoes
- Motor de correcao de imagem
- Novo bucket `campaign-assets`
- Componente Exit-Intent Modal
- Painel de Login com criativo

---

## 1. Migracao de Banco de Dados

### 1.1 Tabela campaign_cycles (NOVA)

```sql
CREATE TABLE campaign_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns_unified(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  active_channels JSONB DEFAULT '["ads"]',
  status TEXT NOT NULL DEFAULT 'scheduled' 
    CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  requires_confirmation BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.2 Expandir ENUMs

```sql
-- Adicionar novos tipos de canal
ALTER TYPE campaign_channel_type ADD VALUE IF NOT EXISTS 'push';
ALTER TYPE campaign_channel_type ADD VALUE IF NOT EXISTS 'newsletter';
ALTER TYPE campaign_channel_type ADD VALUE IF NOT EXISTS 'exit_intent';
ALTER TYPE campaign_channel_type ADD VALUE IF NOT EXISTS 'login_panel';

-- Adicionar novos tipos de evento
ALTER TYPE campaign_event_type ADD VALUE IF NOT EXISTS 'push_sent';
ALTER TYPE campaign_event_type ADD VALUE IF NOT EXISTS 'push_delivered';
ALTER TYPE campaign_event_type ADD VALUE IF NOT EXISTS 'newsletter_sent';
ALTER TYPE campaign_event_type ADD VALUE IF NOT EXISTS 'newsletter_open';
```

### 1.3 Expandir campaign_assets para derivados

```sql
ALTER TABLE campaign_assets 
  ADD COLUMN IF NOT EXISTS is_original BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS derived_from UUID REFERENCES campaign_assets(id),
  ADD COLUMN IF NOT EXISTS upscale_percent NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS auto_corrected BOOLEAN DEFAULT false;
```

### 1.4 Criar Bucket campaign-assets

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-assets',
  'campaign-assets',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;
```

---

## 2. Estrutura de Storage

```text
campaign-assets/
  {campaign_id}/
    ads/
      super_banner_topo/
        original/
          1706123456789-abc.jpg
        derived/
          1706123456789-abc-970x250.jpg
          1706123456789-abc-728x90.jpg
      retangulo_medio/
        ...
    publidoor/
      ...
    webstories/
      cover/
        ...
      slides/
        ...
```

---

## 3. Tipos TypeScript Expandidos

### Atualizar src/types/campaigns-unified.ts

```typescript
// Adicionar aos tipos existentes:
export type ChannelType = 
  | 'ads' | 'publidoor' | 'webstories' 
  | 'push' | 'newsletter' | 'exit_intent' | 'login_panel';

export type EventType = 
  | 'impression' | 'click' | 'cta_click' 
  | 'story_open' | 'story_complete' | 'slide_view'
  | 'push_sent' | 'push_delivered' 
  | 'newsletter_sent' | 'newsletter_open';

export type CycleStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

// Nova interface
export interface CampaignCycle {
  id: string;
  campaign_id: string;
  name: string;
  starts_at?: string;
  ends_at?: string;
  active_channels: ChannelType[];
  status: CycleStatus;
  requires_confirmation: boolean;
  confirmed_at?: string;
  confirmed_by?: string;
  created_at: string;
  updated_at: string;
}

// Configuracoes dos novos canais
export interface PushChannelConfig {
  title: string;
  body: string;
  icon_url?: string;
  action_url: string;
  send_at?: string;
  target_audience: 'all' | 'subscribers' | 'segment';
  segment_id?: string;
}

export interface NewsletterChannelConfig {
  subject: string;
  preview_text: string;
  template_id?: string;
  send_at?: string;
  target_list: string;
}

export interface ExitIntentChannelConfig {
  hero_type: 'publidoor' | 'banner';
  hero_asset_id?: string;
  secondary_1_asset_id?: string;
  secondary_2_asset_id?: string;
  cta_text: string;
  priority_type: 'institutional' | 'editorial' | 'commercial';
}

export interface LoginPanelChannelConfig {
  display_type: 'publidoor' | 'story';
  asset_id?: string;
  short_text?: string;
  cta_text?: string;
  cta_url?: string;
}

// Slots oficiais por canal
export const OFFICIAL_SLOTS = {
  ads: [
    { key: '728x90', label: 'Leaderboard', width: 728, height: 90 },
    { key: '970x250', label: 'Super Banner', width: 970, height: 250 },
    { key: '300x250', label: 'Retangulo Medio', width: 300, height: 250 },
    { key: '300x600', label: 'Arranha-ceu', width: 300, height: 600 },
    { key: '580x400', label: 'Pop-up', width: 580, height: 400 },
  ],
  publidoor: [
    { key: '970x250', label: 'Banner Grande', width: 970, height: 250 },
    { key: '300x250', label: 'Retangulo', width: 300, height: 250 },
    { key: '300x600', label: 'Vertical', width: 300, height: 600 },
  ],
  webstories: [
    { key: '1080x1920', label: 'Capa Story', width: 1080, height: 1920 },
  ],
} as const;
```

---

## 4. Motor de Correcao de Imagem

### Novo arquivo: src/lib/imageCorrection.ts

```typescript
interface ImageCorrectionResult {
  canProcess: boolean;
  reason?: string;
  originalWidth: number;
  originalHeight: number;
  targetWidth: number;
  targetHeight: number;
  upscalePercent: number;
  proportionDiff: number;
}

const MAX_UPSCALE = 125; // 125%
const MAX_PROPORTION_DIFF = 2; // 2%

export function analyzeImage(
  original: { width: number; height: number },
  target: { width: number; height: number }
): ImageCorrectionResult {
  const originalRatio = original.width / original.height;
  const targetRatio = target.width / target.height;
  const proportionDiff = Math.abs(1 - originalRatio / targetRatio) * 100;
  
  const scaleX = target.width / original.width;
  const scaleY = target.height / original.height;
  const upscalePercent = Math.max(scaleX, scaleY) * 100;
  
  const canProcess = 
    proportionDiff <= MAX_PROPORTION_DIFF && 
    upscalePercent <= MAX_UPSCALE;
  
  let reason: string | undefined;
  if (upscalePercent > MAX_UPSCALE) {
    reason = `Upscale de ${upscalePercent.toFixed(0)}% excede limite de ${MAX_UPSCALE}%`;
  } else if (proportionDiff > MAX_PROPORTION_DIFF) {
    reason = `Diferenca de proporcao ${proportionDiff.toFixed(1)}% excede ${MAX_PROPORTION_DIFF}%`;
  }
  
  return {
    canProcess,
    reason,
    originalWidth: original.width,
    originalHeight: original.height,
    targetWidth: target.width,
    targetHeight: target.height,
    upscalePercent,
    proportionDiff,
  };
}
```

---

## 5. Componentes Novos

### 5.1 BatchAssetUploader.tsx

Upload em lote com deteccao automatica de dimensoes:

- Drag & drop multiplo
- Ler dimensoes via Image API
- Mostrar preview + tamanho detectado
- Auto-atribuir ao slot correto baseado nas dimensoes
- Indicador visual de correcao (badge)
- Botao "Remover" e "Atribuir manualmente"

### 5.2 CycleSelectorCard.tsx

Gerenciador de ciclos de campanha:

- Lista ciclos existentes
- Botao "Novo Ciclo"
- Nome do ciclo (ex: Lancamento, Reforco)
- Datas de inicio/fim
- Checkboxes de canais ativos neste ciclo
- Status (agendado, ativo, concluido)
- Aviso para Push/Newsletter: "Requer confirmacao"

### 5.3 ExitIntentModal.tsx

Modal de saida estilo UOL:

- Detectar intencao de saida (mouseout no topo)
- Exibir 1x por sessao (sessionStorage)
- Layout fixo: HERO + SECUNDARIO 1 + SECUNDARIO 2
- Prioridade: Institucional > Editorial > Comercial
- CTA neutro ("Ver depois" / "Continuar navegando")

### 5.4 LoginPanelAd.tsx

Criativo no painel esquerdo do login:

- Remover textos fixos atuais
- Exibir criativo ativo (Publidoor ou Story)
- Texto curto opcional
- CTA abre nova aba
- Nunca bloquear login

### 5.5 Formularios de novos canais

- `PushChannelForm.tsx` - Titulo, corpo, icone, agendamento
- `NewsletterChannelForm.tsx` - Assunto, preview, template
- `ExitIntentChannelForm.tsx` - Configuracao dos 3 espacos
- `LoginPanelChannelForm.tsx` - Tipo, asset, texto

---

## 6. Atualizacoes de Arquivos Existentes

### 6.1 ChannelSelector.tsx

Expandir lista de canais:

```typescript
const CHANNELS: ChannelOption[] = [
  { type: 'ads', label: 'Ads (Banners)', icon: Layout },
  { type: 'publidoor', label: 'Publidoor', icon: Megaphone },
  { type: 'webstories', label: 'WebStories', icon: Smartphone },
  { type: 'push', label: 'Push Notification', icon: Bell },
  { type: 'newsletter', label: 'Newsletter', icon: Mail },
  { type: 'exit_intent', label: 'Exit-Intent Modal', icon: DoorOpen },
  { type: 'login_panel', label: 'Painel de Login', icon: LogIn },
];
```

### 6.2 CampaignForm.tsx

- Adicionar secao "Ciclos de Distribuicao"
- Adicionar componente `BatchAssetUploader`
- Suportar novos canais

### 6.3 src/pages/Auth.tsx

- Integrar `LoginPanelAd` na coluna esquerda
- Substituir textos estaticos por criativo dinamico

### 6.4 useCampaignsUnified.ts

- Adicionar hook `useCampaignCycles`
- Adicionar hook `useCreateCycle`
- Adicionar hook `useConfirmCycle` (para Push/Newsletter)

### 6.5 useCampaignMetrics.ts

- Expandir eventos para push_sent, newsletter_open
- Agregar metricas por ciclo

---

## 7. Hooks Novos

### useCampaignCycles.ts

```typescript
function useCampaignCycles(campaignId: string);
function useCreateCycle(campaignId: string);
function useUpdateCycleStatus(cycleId: string);
function useConfirmCycle(cycleId: string);
```

### useExitIntent.ts

```typescript
function useExitIntent() {
  // Detectar mouseout no topo da pagina
  // Verificar sessionStorage para 1x por sessao
  // Retornar { shouldShow, campaigns, dismiss }
}
```

### usePushCampaign.ts

```typescript
function useSendPushCampaign(cycleId: string);
function usePushCampaignLogs(cycleId: string);
```

---

## 8. Fluxos de Usuario

### Fluxo 1: Criar Campanha com Ciclo

1. Admin acessa `/admin/campaigns/unified`
2. Preenche dados basicos
3. Seleciona canais: Ads + Push
4. Cria Ciclo "Lancamento" com datas
5. Para Push: sistema exige confirmacao antes de enviar
6. Salva campanha com ciclo ativo

### Fluxo 2: Reenviar Campanha (Novo Ciclo)

1. Admin abre campanha existente
2. Clica "Novo Ciclo"
3. Nomeia: "Reforco Semana 2"
4. Seleciona canais ativos neste ciclo
5. Salva -> novo ciclo criado sem duplicar campanha

### Fluxo 3: Upload em Lote

1. Admin arrasta 5 imagens
2. Sistema detecta dimensoes de cada uma
3. Auto-atribui: 970x250 -> Super Banner, 300x250 -> Retangulo
4. Badge mostra "Corrigido 112%" se upscale aplicado
5. Admin confirma ou ajusta manualmente

### Fluxo 4: Exit-Intent

1. Usuario move mouse para fechar aba
2. Modal aparece com 3 criativos
3. Prioridade: campanha institucional primeiro
4. Usuario clica CTA ou fecha
5. Nao exibe novamente na sessao

---

## 9. Estrutura de Arquivos

```text
src/
  types/
    campaigns-unified.ts    # Atualizar com novos tipos
  lib/
    imageCorrection.ts      # NOVO - Motor de correcao
  hooks/
    useCampaignsUnified.ts  # Atualizar
    useCampaignCycles.ts    # NOVO
    useExitIntent.ts        # NOVO
    usePushCampaign.ts      # NOVO
  components/
    admin/
      campaigns/
        BatchAssetUploader.tsx       # NOVO
        CycleSelectorCard.tsx        # NOVO
        PushChannelForm.tsx          # NOVO
        NewsletterChannelForm.tsx    # NOVO
        ExitIntentChannelForm.tsx    # NOVO
        LoginPanelChannelForm.tsx    # NOVO
    ads/
      ExitIntentModal.tsx            # NOVO
    auth/
      LoginPanelAd.tsx               # NOVO
```

---

## 10. Ordem de Implementacao

### Fase 1: Banco de Dados (Migracao)
1. Criar tabela `campaign_cycles`
2. Expandir ENUMs (canais e eventos)
3. Adicionar colunas em `campaign_assets`
4. Criar bucket `campaign-assets`
5. RLS policies

### Fase 2: Tipos e Hooks Base
6. Atualizar `campaigns-unified.ts`
7. Criar `imageCorrection.ts`
8. Criar `useCampaignCycles.ts`

### Fase 3: Upload em Lote
9. Criar `BatchAssetUploader.tsx`
10. Integrar no `CampaignForm.tsx`

### Fase 4: Ciclos de Campanha
11. Criar `CycleSelectorCard.tsx`
12. Integrar no editor de campanha

### Fase 5: Novos Canais
13. Forms: Push, Newsletter, Exit-Intent, Login
14. Atualizar `ChannelSelector.tsx`

### Fase 6: Componentes de Exibicao
15. `ExitIntentModal.tsx` + `useExitIntent.ts`
16. `LoginPanelAd.tsx` + integracao Auth.tsx

### Fase 7: Metricas Expandidas
17. Atualizar `useCampaignMetrics.ts`
18. Dashboard com breakdown por ciclo

---

## Secao Tecnica

### Slots Oficiais (Dimensoes Fixas)

| Canal | Slot | Dimensoes |
|-------|------|-----------|
| Ads | Leaderboard | 728x90 |
| Ads | Super Banner | 970x250 |
| Ads | Retangulo Medio | 300x250 |
| Ads | Arranha-ceu | 300x600 |
| Ads | Pop-up | 580x400 |
| Publidoor | Banner Grande | 970x250 |
| Publidoor | Retangulo | 300x250 |
| Publidoor | Vertical | 300x600 |
| WebStories | Capa | 1080x1920 |

### Regras do Motor de Correcao

```text
1. Auto-correcao ATIVA
2. Upscale maximo: 125%
3. Tolerancia de proporcao: <= 2%
4. NUNCA distorcer
5. NUNCA esticar
6. Original SEMPRE preservado
7. Derivados marcados: is_derived = true
8. Badge visual no admin
```

### Exit-Intent Layout

```text
+----------------------------------+
|            HERO                  |
|    (Publidoor ou Banner)         |
+----------------------------------+
+---------------+------------------+
| SECUNDARIO 1  |   SECUNDARIO 2   |
+---------------+------------------+
|     [ Continuar Navegando ]      |
+----------------------------------+
```

### Prioridade Exit-Intent

1. Institucional (prefeitura, governo)
2. Editorial (materias patrocinadas)
3. Comercial (anunciantes)

### Frequency Cap por Ciclo

```typescript
// Cada ciclo tem seu proprio contador
const key = `campaign_${campaignId}_cycle_${cycleId}_views`;
```

---

## Validacao Final

- [ ] Upload em lote funciona com drag & drop
- [ ] Dimensoes detectadas automaticamente
- [ ] Auto-atribuicao correta de slots
- [ ] Motor de correcao bloqueia upscale > 125%
- [ ] Ciclos permitem reenvio sem duplicar
- [ ] Push/Newsletter exigem confirmacao
- [ ] Exit-Intent aparece 1x por sessao
- [ ] Login panel exibe criativo dinamico
- [ ] Metricas agregam por campanha + ciclo + canal
- [ ] Responsivo em todos os dispositivos
