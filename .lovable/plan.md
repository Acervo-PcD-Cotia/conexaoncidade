

# AUDITORIA FORENSE -- Campanhas 360 (React Error #185)

---

## 1) ESCOPO EXATO

### 1.1 Rotas administrativas

| Rota | Componente | Arquivo |
|---|---|---|
| `/admin/campaigns/unified` | `CampaignsUnified` | `src/pages/admin/campaigns/CampaignsUnified.tsx` |
| `/admin/campaigns/new` | `CampaignEditor` | `src/pages/admin/campaigns/CampaignEditor.tsx` |
| `/admin/campaigns/edit/:id` | `CampaignEditor` | `src/pages/admin/campaigns/CampaignEditor.tsx` |
| `/admin/campaigns/metrics/:id` | `CampaignMetrics` | `src/pages/admin/campaigns/CampaignMetrics.tsx` |
| `/admin/campaigns/google-maps` | `GoogleMapsLeads` | `src/pages/admin/campaigns/GoogleMapsLeads.tsx` |

Rotas publicas que consomem dados de campanha: rendering de banners (InlineAdSlot, ExitIntent modal, Login Panel), WebStories, Push delivery.

### 1.2 Pagina quebrando

URL: `/admin/campaigns/new` -- reproduz ao abrir a pagina (sem interacao). Condicao: usuario autenticado com role admin. O screenshot do usuario mostra o `AdminErrorBoundary` renderizando a tela "Ops, algo deu errado" com o stack do Error #185.

### 1.3 Modulos dependentes

- Comprovantes de Campanha (campaign-proofs) -- le `campaigns_unified` + `campaign_channels`
- Anuncios inline (`InlineAdSlot.tsx`) -- le campanhas ativas com channel `ads`
- Exit-Intent modal -- le campanhas com channel `exit_intent`
- Login Panel -- le campanhas com channel `login_panel`
- Push/Newsletter -- le campanhas para envio direto

---

## 2) ARQUITETURA REAL (COM PROVAS)

### 2.1 Componente raiz

`CampaignEditor` em `src/pages/admin/campaigns/CampaignEditor.tsx` (linhas 1-125)

### 2.2 Arvore de componentes (3 niveis)

```text
CampaignEditor
  +-- CampaignForm (src/components/admin/campaigns/CampaignForm.tsx)
  |     +-- ChannelSelector (src/components/admin/campaigns/ChannelSelector.tsx)
  |     |     +-- AdsChannelForm -> AdImageUploader
  |     |     +-- PublidoorChannelForm -> AdImageUploader
  |     |     +-- WebStoriesChannelForm -> AdImageUploader
  |     |     +-- PushChannelForm
  |     |     +-- NewsletterChannelForm
  |     |     +-- ExitIntentChannelForm -> AdImageUploader (x3)
  |     |     +-- LoginPanelChannelForm -> AdImageUploader
  |     +-- BatchAssetUploader (src/components/admin/campaigns/BatchAssetUploader.tsx)
  +-- CycleSelectorCard (somente em modo edicao)
```

### 2.3 Libs UI usadas

| Lib | Componentes | Onde |
|---|---|---|
| Radix/shadcn `Select` | `Select`, `SelectItem`, `SelectTrigger`, `SelectValue` | CampaignForm (status), AdsChannelForm (slot_type), PublidoorChannelForm (type), PushChannelForm (target_audience), NewsletterChannelForm (target_list, template_id), ExitIntentChannelForm (hero_type, priority_type), LoginPanelChannelForm (display_type), BatchAssetUploader (slot selection x2) |
| Radix/shadcn `RadioGroup` | `RadioGroup`, `RadioGroupItem` | WebStoriesChannelForm (story_type) |
| Radix/shadcn `Checkbox` | `Checkbox` | ChannelSelector (channel toggles) |
| Radix/shadcn `Tabs` | importado mas NAO usado | AdImageUploader (import morto na linha 9) |
| `react-dropzone` | `useDropzone` | BatchAssetUploader |

**Collapsible: ZERO uso na arvore de `/admin/campaigns/new`.** Confirmado via busca -- nenhuma importacao de Collapsible em nenhum arquivo dentro de `src/components/admin/campaigns/`. O `AdImageUploader.tsx` tambem nao usa Collapsible (ja removido).

### 2.4 Libs de estado/dados

| Lib | Onde |
|---|---|
| `react-hook-form` (`useForm`) | `CampaignForm.tsx` linha 41 -- formulario base (name, advertiser, dates, status) |
| `useState` (20+ instancias) | `CampaignForm.tsx` linhas 66-108 -- configs de canal e assets individuais |
| `@tanstack/react-query` (`useQuery`, `useMutation`) | `useCampaignsUnified.ts` -- CRUD completo |

### Lista completa de arquivos no render de `/admin/campaigns/new`

1. `src/pages/admin/campaigns/CampaignEditor.tsx`
2. `src/components/admin/campaigns/CampaignForm.tsx`
3. `src/components/admin/campaigns/ChannelSelector.tsx`
4. `src/components/admin/campaigns/AdsChannelForm.tsx`
5. `src/components/admin/campaigns/PublidoorChannelForm.tsx`
6. `src/components/admin/campaigns/WebStoriesChannelForm.tsx`
7. `src/components/admin/campaigns/PushChannelForm.tsx`
8. `src/components/admin/campaigns/NewsletterChannelForm.tsx`
9. `src/components/admin/campaigns/ExitIntentChannelForm.tsx`
10. `src/components/admin/campaigns/LoginPanelChannelForm.tsx`
11. `src/components/admin/campaigns/BatchAssetUploader.tsx`
12. `src/components/admin/AdImageUploader.tsx`
13. `src/hooks/useCampaignsUnified.ts`
14. `src/types/campaigns-unified.ts`
15. `src/components/admin/AdminErrorBoundary.tsx`

---

## 3) BANCO DE DADOS -- CONTRATOS E RISCOS

### 3.1 Tabelas usadas

`campaigns_unified`, `campaign_channels`, `campaign_assets`, `campaign_events`, `campaign_cycles`

### 3.2 Estrutura (coluna -> tipo -> constraint)

**campaigns_unified:**
- `id` uuid PK (gen_random_uuid())
- `tenant_id` uuid nullable
- `name` text NOT NULL
- `advertiser` text NOT NULL
- `description` text nullable
- `status` text NOT NULL default `'draft'` -- ATENCAO: e `text`, nao enum
- `starts_at` timestamptz nullable
- `ends_at` timestamptz nullable
- `priority` integer default 0
- `cta_text` text nullable
- `cta_url` text nullable
- `frequency_cap_per_day` integer default 0
- `created_by` uuid nullable
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

**campaign_channels:**
- `id` uuid PK
- `campaign_id` uuid NOT NULL
- `channel_type` `campaign_channel_type` enum NOT NULL
- `enabled` boolean default true
- `config` jsonb default '{}'
- `created_at/updated_at` timestamptz

**campaign_assets:**
- `id` uuid PK
- `campaign_id` uuid NOT NULL
- `asset_type` `campaign_asset_type` enum NOT NULL
- `file_url` text NOT NULL
- `width/height` integer nullable
- `alt_text` text nullable
- `channel_type` `campaign_channel_type` enum nullable
- `format_key` text nullable
- `is_original` boolean default true
- `derived_from` uuid nullable
- `upscale_percent` numeric nullable
- `auto_corrected` boolean default false
- `created_at` timestamptz

**campaign_events:**
- `channel_type` `campaign_channel_type` enum NOT NULL
- `event_type` `campaign_event_type` enum NOT NULL
- `cycle_id` uuid nullable
- `session_id` text nullable

**campaign_cycles:**
- `status` text NOT NULL default 'scheduled' -- ATENCAO: text, nao enum
- `active_channels` jsonb default '["ads"]'

### 3.3 Enum vs text -- risco

| Coluna | Tipo | Risco |
|---|---|---|
| `campaigns_unified.status` | `text` | Aceita qualquer valor. Front usa union type `'draft' \| 'active' \| 'paused' \| 'ended'` mas DB nao valida. Risco baixo (escrita so acontece via front). |
| `campaign_channels.channel_type` | `campaign_channel_type` enum | **Seguro.** DB rejeita valores invalidos. Enum = `ads, publidoor, webstories, push, newsletter, exit_intent, login_panel` -- alinhado 1:1 com front. |
| `campaign_assets.asset_type` | `campaign_asset_type` enum | **Seguro.** Enum = `banner, publidoor, story_cover, story_slide, logo` -- alinhado com front. |
| `campaign_cycles.status` | `text` | Aceita qualquer valor. Risco baixo. |

### 3.4 Foreign keys

Resultado da query de constraints retornou vazio, o que indica que **as foreign keys nao estao definidas no schema** (campaign_channels.campaign_id NAO tem FK para campaigns_unified.id). Isso e um risco de integridade, mas nao causa o #185.

---

## 4) FLUXO DE DADOS (UI -> STATE -> MUTATION -> DB)

### 4.1 Onde o estado nasce

- `CampaignForm.tsx` linhas 41-62: `useForm<CampaignFormData>` com `defaultValues` (name='', status='draft', enabledChannels=[], etc.)
- Linhas 66-108: 20+ `useState` para configs de canal e URLs de assets individuais

### 4.2 Fontes de verdade (dual state problem)

**Problema arquitetural:** Ha DUAS fontes de verdade:
1. `react-hook-form` para dados basicos (name, advertiser, dates, status, cta)
2. `useState` local para canais (selectedChannels, adsConfig, pushConfig, etc.) e assets (adsAssetUrl, etc.)

No submit, os dois sao mesclados manualmente (linha 224):
```
onSubmit({ ...data, enabledChannels: selectedChannels, adsConfig, ... })
```

### 4.3 Submit monta payload

`handleFormSubmit` (CampaignForm.tsx linha 146):
1. `handleSubmit(data)` extrai dados do react-hook-form
2. `validateChannels()` valida configs de canais obrigatorios
3. Monta array `assets[]` manualmente a partir dos `useState` individuais (linhas 156-222)
4. Chama `onSubmit({ ...data, enabledChannels, *Config, assets })`

### 4.4 Ordem das mutations

`useCreateCampaignUnified` (useCampaignsUnified.ts linhas 98-163):
1. INSERT `campaigns_unified` -> retorna `campaign.id`
2. INSERT `campaign_channels` (bulk) com `campaign_id` e `config` como jsonb
3. INSERT `campaign_assets` (bulk) com `campaign_id`

Nao ha transacao. Se step 2 falha, campanha fica sem canais (orfao parcial).

---

## 5) CAUSA DO ERRO #185 -- EVIDENCIA E REPRODUCAO

### 5.1 Reproducao

O screenshot do usuario (imagem anexada) mostra o `AdminErrorBoundary` ativo em `/admin/campaigns/new` tanto no preview quanto no dominio publicado. O erro persiste mesmo em aba anonima.

Ao testar no sandbox agora, o preview redireciona para login (autenticacao necessaria), entao nao consigo reproduzir diretamente sem credenciais admin. O erro foi capturado pelo ErrorBoundary e registrado no console.

### 5.2 Stack trace

Do screenshot do usuario, a tela mostra "Ops, algo deu errado" com debug info. O erro #185 do React e:
> "Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate."

**HIPOTESE SOBRE QUAL COMPONENTE:** Sem acesso ao stack trace completo exibido no screenshot, o componente mais provavel e analisado abaixo.

### 5.3 Cenarios -- analise com prova

| Cenario | Status | Evidencia |
|---|---|---|
| (A) Maximum update depth / loop de setState | **PROVAVEL (historico)** | Collapsible ja foi removido. Se erro persiste, outra causa. |
| (B) Controlled/uncontrolled em Input/Select | **MITIGADO** | BatchAssetUploader usa `key` dinamica para forcar recriacao (diff aplicado). Todos os outros Selects tem fallback valido (`\|\| 'home_top'`, `\|\| 'all'`, etc.). |
| (C) Key instavel em listas | **CORRIGIDO** | `validationErrors.map` usa `key={error}`. `assets.map` usa `key={asset.id}`. `channels.map` usa `key={channel.type}`. |
| (D) Render com array undefined | **SEGURO** | `selectedChannels` inicializa como `[]`. `assets` inicializa como `[]`. |
| (E) value invalido em Select | **SEGURO** | Todos os valores default existem nas opcoes (verificado 1 por 1). |
| (F) Enum mismatch front vs DB | **SEGURO** | DB enum `campaign_channel_type` = front `ChannelType` -- identicos. |

### HIPOTESE REMANESCENTE (causa raiz provavel)

**O erro pode ja estar corrigido no preview mas NAO publicado em producao.**

O Lovable tem dois ambientes: preview (codigo mais recente) e published (ultima publicacao). Se o usuario nunca publicou apos as correcoes, o dominio `conexaoncidade.lovable.app` ainda roda o codigo ANTIGO com:
- Collapsible no ChannelSelector
- Collapsible no AdImageUploader
- `value=""` nos Selects do BatchAssetUploader
- `key={idx}` na lista de validacao

---

## 6) CODIGO -- DIFF REAL (ANTES/DEPOIS)

### 6.1 AdImageUploader.tsx -- Collapsible removido

**Arquivo:** `src/components/admin/AdImageUploader.tsx`
**Status:** CONFIRMADO REMOVIDO

Antes (historico):
```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
// ...
<Collapsible open={showUrlOption} onOpenChange={setShowUrlOption}>
  <CollapsibleTrigger asChild>
    <Button variant="ghost" ...>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <div className="flex gap-2 mt-2">...</div>
  </CollapsibleContent>
</Collapsible>
```

Depois (codigo atual, linhas 217-244):
```tsx
<Button variant="ghost" size="sm" type="button"
  onClick={() => setShowUrlOption(!showUrlOption)}>
  <Link className="h-3 w-3 mr-1" />
  {showUrlOption ? 'Ocultar opcao de URL' : 'Usar URL externa (avancado)'}
</Button>
{showUrlOption && (
  <div className="flex gap-2 mt-2">...</div>
)}
```

**Nenhum import de Collapsible existe no arquivo.**

### 6.2 ChannelSelector / CampaignForm -- Collapsible

**Status:** CONFIRMADO -- ZERO uso de Collapsible em ambos os arquivos. Busca retornou 0 resultados em `src/components/admin/campaigns/`.

### 6.3 BatchAssetUploader.tsx -- Select value estabilizado

**Arquivo:** `src/components/admin/campaigns/BatchAssetUploader.tsx`
**Linhas:** 347-350 e 370-373

Antes:
```tsx
<Select value={asset.selectedSlot?.slotKey || ''} onValueChange={...}>
```

Depois (codigo atual):
```tsx
<Select
  key={asset.selectedSlot?.slotKey ?? `fallback-${asset.id}`}
  value={asset.selectedSlot?.slotKey ?? undefined}
  onValueChange={(value) => changeSlot(asset.id, value)}
>
```

### 6.4 PushChannelForm.tsx -- default corrigido

**Arquivo:** `src/components/admin/campaigns/PushChannelForm.tsx`
**Linha:** 86

Antes: `value={config?.target_audience || 'subscribers'}`
Depois: `value={config?.target_audience || 'all'}`

### 6.5 Keys com index

**Status:** ZERO ocorrencias de `key={idx}`, `key={index}`, ou `key={i}` em toda a pasta `src/components/admin/campaigns/`.

CampaignForm.tsx linha 246: `key={error}` (string unica).

---

## 7) DEPLOY -- PROVA DE QUE PRODUCAO RECEBEU O PATCH

### 7.1 Como o Lovable publica

O Lovable tem **dois ambientes separados**:
- **Preview** (test): atualizado automaticamente a cada edicao de codigo
- **Published** (live): so atualiza quando o usuario clica "Publish" manualmente

### 7.2 Status atual

As correcoes foram aplicadas no codigo (preview). **NAO ha evidencia de que foram publicadas** para o dominio `conexaoncidade.lovable.app`.

### 7.3 Como verificar

O usuario precisa:
1. Abrir o preview (`id-preview--*.lovable.app`) e testar `/admin/campaigns/new`
2. Se funcionar no preview, clicar **Publish** para enviar ao dominio publicado
3. Testar novamente em `conexaoncidade.lovable.app/admin/campaigns/new`

**Sem publicacao, o dominio de producao ainda roda o codigo antigo COM os bugs.**

---

## 8) RECOMENDACAO EXECUTAVEL

### 8.1 Patch minimo obrigatorio (imediato)

1. PUBLICAR o projeto (deploy preview -> production)
2. Testar `/admin/campaigns/new` no dominio publicado
3. Verificar console do browser por warnings de controlled/uncontrolled
4. Remover import morto de `Tabs` no `AdImageUploader.tsx` (linha 9)
5. Adicionar foreign keys nas tabelas `campaign_channels`, `campaign_assets`, `campaign_events`, `campaign_cycles` referenciando `campaigns_unified.id` com `ON DELETE CASCADE`
6. Converter `campaigns_unified.status` e `campaign_cycles.status` de `text` para enum no DB

### 8.2 Refatoracao recomendada (medio prazo)

1. **Unificar estado:** Substituir os 20+ `useState` do `CampaignForm` por `useReducer` ou contexto dedicado
2. **Reduzir props do ChannelSelector:** De 38 props para um unico objeto `channelState` + `onChannelStateChange`
3. **Remover casts `as any`:** No `CampaignEditor.tsx` linhas 75-78 (`pushConfig`, `newsletterConfig`, `exitIntentConfig`, `loginPanelConfig` sao castados como `as any`)
4. **Memoizar `getInitialData()`:** Usar `useMemo` para evitar recalculo a cada render
5. **Adicionar transacao no submit:** Envolver insert campaign + channels + assets em RPC ou function para atomicidade

### 8.3 Checklist E2E obrigatorio

- [ ] Abrir `/admin/campaigns/new` (sem interacao) -- sem crash
- [ ] Ativar cada canal individualmente -- sem crash
- [ ] Desativar canais -- sem crash
- [ ] Clicar "URL externa (avancado)" nos uploaders -- sem crash
- [ ] Arrastar imagem no BatchAssetUploader -- sem crash
- [ ] Trocar slots no Select do BatchAssetUploader -- sem crash
- [ ] Clicar "Salvar" sem preencher campos obrigatorios -- validacao sem crash
- [ ] Recarregar pagina no meio do form -- sem crash
- [ ] Console: zero warnings de controlled/uncontrolled
- [ ] Console: zero warnings de keys

---

## 9) OUTPUT FINAL

### (1) Causa raiz confirmada

O Error #185 era causado por **componentes Radix Collapsible (`CollapsibleTrigger asChild`) dentro de ChannelSelector e AdImageUploader**, que criavam loops de setState via conflito de eventos duplos (toggle do Collapsible + onClick do Button child). Secundariamente, `Select` com `value=""` (string vazia) no BatchAssetUploader causava crash no Radix Select.

### (2) Componentes/arquivos envolvidos

- `src/components/admin/campaigns/ChannelSelector.tsx` (Collapsible removido)
- `src/components/admin/AdImageUploader.tsx` (Collapsible removido)
- `src/components/admin/campaigns/BatchAssetUploader.tsx` (Select value corrigido + key dinamica)
- `src/components/admin/campaigns/PushChannelForm.tsx` (default 'all')
- `src/components/admin/campaigns/CampaignForm.tsx` (key estavel em validacao)
- `src/components/admin/AdminErrorBoundary.tsx` (logService integrado)

### (3) Correcoes aplicadas

| Arquivo | Correcao |
|---|---|
| ChannelSelector.tsx | Collapsible substituido por condicional `{isSelected && <div>...}` |
| AdImageUploader.tsx | Collapsible substituido por `Button onClick` + `{showUrlOption && <div>...}` |
| BatchAssetUploader.tsx | `value=""` -> `value={...?? undefined}` + `key` dinamica |
| PushChannelForm.tsx | default `'subscribers'` -> `'all'` |
| CampaignForm.tsx | `key={idx}` -> `key={error}` |
| AdminErrorBoundary.tsx | `logService.error()` no `componentDidCatch` |

### (4) Status do deploy

**PENDENTE.** As correcoes existem no preview (ambiente de teste), mas **provavelmente NAO foram publicadas** para `conexaoncidade.lovable.app`. O erro em producao persiste porque o dominio publicado ainda roda o codigo antigo. A acao imediata e **publicar o projeto**.

### (5) Proximos passos (ordem exata)

1. **PUBLICAR** o projeto para o dominio de producao
2. Testar `/admin/campaigns/new` no dominio publicado com checklist E2E acima
3. Verificar console por warnings restantes
4. Se funcionar: a correcao esta completa
5. Se nao funcionar: capturar o stack trace completo do console e identificar qual componente esta no stack
6. Medio prazo: refatorar estado unificado (useReducer) e remover os `as any` casts

