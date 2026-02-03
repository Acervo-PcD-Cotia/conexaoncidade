

# Sistema Unificado de Campanhas Publicitarias

## Resumo Executivo

Criar uma arquitetura centralizada onde **Campanha** e a unica fonte de verdade para toda publicidade do portal. Uma mesma campanha pode rodar simultaneamente em Ads (banners), Publidoor e WebStories, com assets compartilhados e metricas unificadas.

---

## Arquitetura Nova vs. Atual

```text
ATUAL (Fragmentado):
+--------+     +-----------+     +------------+
|  ads   |     | publidoor |     | web_stories|
+--------+     +-----------+     +------------+
(independentes, sem conexao)

NOVO (Unificado):
                  +------------+
                  | campaigns  |
                  +------------+
                       |
       +---------------+---------------+
       |               |               |
+------+------+ +------+------+ +------+------+
| campaign_   | | campaign_   | | campaign_   |
| channels    | | assets      | | events      |
| (ads,pub,   | | (banner,    | | (impressao, |
|  stories)   | |  story,pub) | |  click,etc) |
+-------------+ +-------------+ +-------------+
```

---

## 1. Migracao de Banco de Dados

### 1.1 Nova Tabela: `campaigns_unified`

Nova tabela centralizada (evita conflito com tabela existente `campaigns`):

```sql
CREATE TABLE campaigns_unified (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES sites(id),
  
  -- Identificacao
  name TEXT NOT NULL,
  advertiser TEXT NOT NULL,
  description TEXT,
  
  -- Status e datas
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','ended')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  
  -- Configuracoes
  priority INTEGER DEFAULT 0,
  cta_text TEXT,
  cta_url TEXT,
  frequency_cap_per_day INTEGER DEFAULT 0,
  
  -- Controle
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.2 Nova Tabela: `campaign_channels`

Define quais canais estao ativos para cada campanha:

```sql
CREATE TYPE campaign_channel_type AS ENUM ('ads', 'publidoor', 'webstories');

CREATE TABLE campaign_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns_unified(id) ON DELETE CASCADE,
  channel_type campaign_channel_type NOT NULL,
  enabled BOOLEAN DEFAULT true,
  
  -- Configuracoes especificas do canal (JSON)
  config JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(campaign_id, channel_type)
);
```

**Exemplos de `config` por canal:**

```json
// Ads
{
  "slot_type": "home_top",
  "size": "970x250",
  "sort_order": 1
}

// Publidoor
{
  "location_id": "uuid",
  "type": "narrativo",
  "phrase_1": "Texto principal",
  "template_id": "uuid"
}

// WebStories
{
  "story_url": "https://...",
  "story_id": "uuid", // para stories nativos
  "story_type": "external" // ou "native"
}
```

### 1.3 Nova Tabela: `campaign_assets`

Assets reutilizaveis entre canais:

```sql
CREATE TYPE campaign_asset_type AS ENUM ('banner', 'publidoor', 'story_cover', 'story_slide', 'logo');

CREATE TABLE campaign_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns_unified(id) ON DELETE CASCADE,
  asset_type campaign_asset_type NOT NULL,
  
  file_url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  
  -- Para qual canal e formato
  channel_type campaign_channel_type,
  format_key TEXT, -- ex: 'super_banner_topo', 'retangulo_medio'
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.4 Nova Tabela: `campaign_events`

Metricas unificadas:

```sql
CREATE TYPE campaign_event_type AS ENUM ('impression', 'click', 'cta_click', 'story_open', 'story_complete', 'slide_view');

CREATE TABLE campaign_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns_unified(id) ON DELETE CASCADE,
  channel_type campaign_channel_type NOT NULL,
  event_type campaign_event_type NOT NULL,
  
  -- Contexto
  metadata JSONB DEFAULT '{}', -- slot, page, device, etc.
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index para queries de metricas
CREATE INDEX idx_campaign_events_campaign ON campaign_events(campaign_id, created_at);
CREATE INDEX idx_campaign_events_channel ON campaign_events(channel_type, created_at);
```

### 1.5 RLS Policies

```sql
ALTER TABLE campaigns_unified ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_events ENABLE ROW LEVEL SECURITY;

-- Leitura publica para campanhas ativas
CREATE POLICY "Public read active campaigns" ON campaigns_unified
  FOR SELECT USING (status = 'active');

-- Admin full access
CREATE POLICY "Admin full access campaigns" ON campaigns_unified
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));

-- Policies similares para outras tabelas...
```

---

## 2. Tipos TypeScript

### Arquivo: `src/types/campaigns-unified.ts`

```typescript
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'ended';
export type ChannelType = 'ads' | 'publidoor' | 'webstories';
export type AssetType = 'banner' | 'publidoor' | 'story_cover' | 'story_slide' | 'logo';
export type EventType = 'impression' | 'click' | 'cta_click' | 'story_open' | 'story_complete' | 'slide_view';

export interface CampaignUnified {
  id: string;
  tenant_id?: string;
  name: string;
  advertiser: string;
  description?: string;
  status: CampaignStatus;
  starts_at?: string;
  ends_at?: string;
  priority: number;
  cta_text?: string;
  cta_url?: string;
  frequency_cap_per_day: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Joined
  channels?: CampaignChannel[];
  assets?: CampaignAsset[];
}

export interface CampaignChannel {
  id: string;
  campaign_id: string;
  channel_type: ChannelType;
  enabled: boolean;
  config: AdsChannelConfig | PublidoorChannelConfig | WebStoriesChannelConfig;
  created_at: string;
  updated_at: string;
}

export interface AdsChannelConfig {
  slot_type: string;
  size: string;
  sort_order: number;
  link_target: string;
}

export interface PublidoorChannelConfig {
  location_id?: string;
  type: string;
  phrase_1: string;
  phrase_2?: string;
  phrase_3?: string;
  template_id?: string;
}

export interface WebStoriesChannelConfig {
  story_type: 'external' | 'native';
  story_url?: string;
  story_id?: string;
}

export interface CampaignAsset {
  id: string;
  campaign_id: string;
  asset_type: AssetType;
  file_url: string;
  width?: number;
  height?: number;
  alt_text?: string;
  channel_type?: ChannelType;
  format_key?: string;
  created_at: string;
}

export interface CampaignEvent {
  id: string;
  campaign_id: string;
  channel_type: ChannelType;
  event_type: EventType;
  metadata: Record<string, unknown>;
  created_at: string;
}
```

---

## 3. Hooks

### Arquivo: `src/hooks/useCampaignsUnified.ts`

```typescript
// Principais hooks:
- useCampaignsUnified(filters?) - Lista campanhas
- useCampaignUnified(id) - Campanha com channels e assets
- useCreateCampaignUnified() - Criar campanha + channels + assets
- useUpdateCampaignUnified() - Atualizar campanha
- useToggleCampaignChannel() - Ativar/desativar canal
- useAddChannelToCampaign() - Adicionar canal existente
- useCampaignMetrics(id, dateRange) - Metricas agregadas
- useTrackCampaignEvent() - Registrar evento
```

---

## 4. Componentes Novos

### 4.1 Formulario Unificado: `src/components/admin/campaigns/CampaignForm.tsx`

**Estrutura em 2 blocos:**

**Bloco 1 - Dados Comuns:**
- Nome da campanha
- Anunciante
- Descricao
- Data inicio / fim
- Status (draft/active/paused)
- Prioridade
- CTA texto + URL
- Frequency cap

**Bloco 2 - Canais (Checkboxes expandiveis):**
- [ ] **Ads (Banners)**
  - Ao marcar: expande form com `AdImageUploader` + slot_type
- [ ] **Publidoor**
  - Ao marcar: expande form com tipo, frases, location, template
- [ ] **WebStories**
  - Ao marcar: expande form com tipo (externo/nativo), URL ou editor

### 4.2 Seletor de Canais: `src/components/admin/campaigns/ChannelSelector.tsx`

```typescript
interface ChannelSelectorProps {
  channels: ChannelType[];
  onChange: (channels: ChannelType[]) => void;
  expandedConfigs: Record<ChannelType, ChannelConfig>;
  onConfigChange: (channel: ChannelType, config: ChannelConfig) => void;
}
```

### 4.3 Formularios por Canal:

- `AdsChannelForm.tsx` - Configuracao de banner
- `PublidoorChannelForm.tsx` - Configuracao de Publidoor
- `WebStoriesChannelForm.tsx` - Configuracao de Story

### 4.4 Modal de Conversao: `src/components/admin/campaigns/AddChannelModal.tsx`

Modal para adicionar canal a campanha existente (usado quando usuario clica "Usar tambem em Publidoor" de um Ad existente):

```typescript
interface AddChannelModalProps {
  campaignId: string;
  targetChannel: ChannelType;
  existingAssets: CampaignAsset[];
  onSuccess: () => void;
}
```

### 4.5 Dashboard de Metricas: `src/components/admin/campaigns/CampaignMetricsDashboard.tsx`

- Total impressoes/clicks/CTR (soma de todos canais)
- Breakdown por canal (grafico de pizza)
- Breakdown por dispositivo
- Timeline de eventos

---

## 5. Paginas Admin

### 5.1 Nova Pagina: `src/pages/admin/campaigns/CampaignsUnified.tsx`

Lista de campanhas unificadas com:
- Filtros por status, canal, data
- Cards mostrando canais ativos por campanha
- Acoes rapidas (ativar, pausar, editar)

### 5.2 Nova Pagina: `src/pages/admin/campaigns/CampaignEditor.tsx`

Editor completo com:
- Form unificado (Bloco 1 + Bloco 2)
- Preview por canal
- Gerenciador de assets
- Agendamento

### 5.3 Modificar: `src/pages/admin/Ads.tsx`

Adicionar botoes por anuncio:
- "Usar em Publidoor" -> abre AddChannelModal
- "Usar em WebStory" -> abre AddChannelModal
- "Ver Campanha" -> navega para CampaignEditor (se vinculado)

### 5.4 Modificar: `src/pages/admin/publidoor/PublidoorDashboard.tsx`

Adicionar link para "Campanhas Unificadas" e botoes de conversao em cada item.

### 5.5 Modificar: `src/pages/admin/StoriesList.tsx`

Adicionar botoes de conversao:
- "Usar em Ads" -> cria banner com capa do story
- "Usar em Publidoor" -> cria item Publidoor com assets do story

---

## 6. Integracao com Sistemas Existentes

### 6.1 Migracao de Dados Opcionais

View ou funcao para mapear dados antigos:

```sql
-- View para campanhas legadas de Ads
CREATE VIEW v_legacy_ads_campaigns AS
SELECT 
  id,
  name,
  advertiser,
  'ads' as source,
  slot_type,
  image_url,
  is_active,
  starts_at,
  ends_at
FROM ads;
```

### 6.2 Backward Compatibility

Os sistemas antigos (`ads`, `publidoor_items`, `web_stories`) continuam funcionando. A campanha unificada e uma **camada adicional** que pode ou nao ser usada.

---

## 7. Renderizacao no Portal

### 7.1 Hook Unificado: `src/hooks/useActiveCampaigns.ts`

```typescript
function useActiveCampaigns(channel: ChannelType, slotId?: string) {
  // Busca campanhas ativas para o canal
  // Considera:
  //   - status = 'active'
  //   - starts_at <= now <= ends_at
  //   - frequency_cap (via localStorage/sessionStorage)
  //   - priority para ordenacao
}
```

### 7.2 Atualizacao do ResponsiveAdUnit

Adicionar suporte para buscar de `campaigns_unified`:

```typescript
// Em useAdUnit.ts
const source = props.source === 'unified' 
  ? fetchFromCampaignsUnified(slotId) 
  : fetchFromLegacyAds(slotId);
```

---

## 8. Estrutura de Arquivos

```text
src/
  types/
    campaigns-unified.ts         # Tipos TypeScript
  hooks/
    useCampaignsUnified.ts       # CRUD de campanhas
    useActiveCampaigns.ts        # Campanhas ativas (portal)
    useCampaignMetrics.ts        # Metricas agregadas
  components/
    admin/
      campaigns/
        CampaignForm.tsx         # Formulario principal
        ChannelSelector.tsx      # Checkboxes de canais
        AdsChannelForm.tsx       # Form especifico Ads
        PublidoorChannelForm.tsx # Form especifico Publidoor
        WebStoriesChannelForm.tsx# Form especifico Stories
        AddChannelModal.tsx      # Modal de conversao
        CampaignMetricsDashboard.tsx # Dashboard metricas
        CampaignCard.tsx         # Card na listagem
  pages/
    admin/
      campaigns/
        CampaignsUnified.tsx     # Lista campanhas
        CampaignEditor.tsx       # Editor completo
        CampaignMetrics.tsx      # Pagina de metricas
```

---

## 9. Fluxos de Usuario

### Fluxo 1: Criar Campanha Nova

1. Admin acessa `/admin/campaigns/unified`
2. Clica "Nova Campanha"
3. Preenche dados basicos (nome, anunciante, datas)
4. Seleciona canais (checkboxes): [x] Ads [x] Publidoor [ ] Stories
5. Para cada canal selecionado, preenche config especifica
6. Faz upload de assets (imagens)
7. Salva -> campanha criada com 2 canais ativos

### Fluxo 2: Converter Ad Existente

1. Admin esta em `/admin/ads`
2. Clica "..." em um anuncio -> "Usar em Publidoor"
3. Modal abre com dados pre-preenchidos da campanha/asset
4. Admin escolhe location e preenche frases
5. Salva -> novo canal adicionado a campanha

### Fluxo 3: Ver Metricas Unificadas

1. Admin acessa campanha
2. Ve dashboard com total geral + breakdown por canal
3. Filtra por periodo, dispositivo

---

## 10. Ordem de Implementacao

### Fase 1: Fundacao (Banco + Tipos)
1. Migracao SQL: tabelas, enums, RLS
2. Tipos TypeScript
3. Hook basico `useCampaignsUnified`

### Fase 2: CRUD Admin
4. `CampaignForm` com Bloco 1 (dados comuns)
5. `ChannelSelector` com checkboxes
6. Forms por canal (Ads, Publidoor, Stories)
7. Pagina `CampaignsUnified` (listagem)
8. Pagina `CampaignEditor` (create/edit)

### Fase 3: Conversao e Integracao
9. `AddChannelModal`
10. Botoes de conversao em Ads, Publidoor, Stories
11. `useTrackCampaignEvent` para metricas

### Fase 4: Metricas e Dashboard
12. `CampaignMetricsDashboard`
13. Pagina de metricas detalhadas
14. Integracao com portal (hook `useActiveCampaigns`)

---

## Secao Tecnica

### Estrutura do `config` JSONB

O campo `config` em `campaign_channels` armazena configuracoes especificas. Validacao via Zod no frontend:

```typescript
const AdsConfigSchema = z.object({
  slot_type: z.string(),
  size: z.string(),
  sort_order: z.number().default(0),
  link_target: z.string().default('_blank'),
});

const PublidoorConfigSchema = z.object({
  location_id: z.string().optional(),
  type: z.enum(['narrativo', 'contextual', 'geografico', 'editorial', 'impacto_total']),
  phrase_1: z.string(),
  phrase_2: z.string().optional(),
  phrase_3: z.string().optional(),
  template_id: z.string().optional(),
});

const WebStoriesConfigSchema = z.object({
  story_type: z.enum(['external', 'native']),
  story_url: z.string().url().optional(),
  story_id: z.string().uuid().optional(),
});
```

### Query de Campanhas Ativas

```sql
SELECT c.*, 
       array_agg(DISTINCT ch.channel_type) as active_channels,
       json_agg(DISTINCT a.*) as assets
FROM campaigns_unified c
LEFT JOIN campaign_channels ch ON ch.campaign_id = c.id AND ch.enabled = true
LEFT JOIN campaign_assets a ON a.campaign_id = c.id
WHERE c.status = 'active'
  AND (c.starts_at IS NULL OR c.starts_at <= now())
  AND (c.ends_at IS NULL OR c.ends_at >= now())
GROUP BY c.id
ORDER BY c.priority DESC, c.created_at DESC;
```

### Frequency Cap (Client-side)

```typescript
function checkFrequencyCap(campaignId: string, cap: number): boolean {
  const key = `campaign_${campaignId}_views`;
  const today = new Date().toDateString();
  const data = JSON.parse(sessionStorage.getItem(key) || '{}');
  
  if (data.date !== today) {
    sessionStorage.setItem(key, JSON.stringify({ date: today, count: 1 }));
    return true;
  }
  
  if (data.count >= cap) return false;
  
  data.count++;
  sessionStorage.setItem(key, JSON.stringify(data));
  return true;
}
```

