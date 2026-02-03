
# Plano de Implementação: Publicidade & Monetização + Campanhas 360

## Resumo Executivo

Este plano completa o menu **Publicidade & Monetização** removendo todos os dados mockados, implementando CRUDs faltantes, e ativando o sistema **Campanhas 360** como hub central unificado. O objetivo é entregar um sistema 100% funcional com persistência em banco de dados, upload real no Storage, e métricas rastreáveis.

---

## Escopo da Implementação

### 1. Navegação e Menu

**Problema**: O menu "Publicidade & Monetização" não possui link para "Campanhas 360"

**Solução**:
- Adicionar item "Campanhas 360" no `AdminSidebar.tsx` dentro de `monetizationItems`
- Badge "Novo" para destaque visual
- Rota: `/admin/campaigns/unified`
- Atualizar a página hub `CampaignsHub.tsx` para incluir card de Campanhas 360

### 2. Parceiros - Remover Mock Data

**Problema atual**: 3 páginas usam arrays mockados ao invés de hooks/tabelas existentes

#### 2.1 PartnersInbox.tsx
**Implementação**:
- Substituir `mockInboxItems` por `useSyndicationInbox()` hook
- Conectar ações de Aprovar/Rejeitar com mutations existentes
- Adicionar contadores dinâmicos nos cards de stats
- Implementar filtro de status real

#### 2.2 PartnersManage.tsx
**Implementação**:
- Substituir `mockPartners` e `mockPendingRequests` pelo hook `usePartnerRelationships(siteId)`
- Criar modal de "Convidar Parceiro" que usa `useCreatePartnership()`
- Conectar botões Aceitar/Recusar com `useUpdatePartnership()`
- Adicionar campo siteId via contexto de tenant ou configuração

#### 2.3 PartnersPitches.tsx
**Implementação**:
- Substituir `mockReceivedPitches` e `mockSentPitches` por `usePitchRequests(siteId, direction)`
- Conectar formulário "Nova Sugestão" com `useCreatePitchRequest()`
- Implementar respostas com `useRespondToPitch()`

### 3. Publidoor - CRUD Completo

**Problema**: Locations e Templates são read-only; Schedules é apenas informativo

#### 3.1 PublidoorLocations.tsx - CRUD Completo
**Implementação**:
- Adicionar botão "Novo Local" abrindo modal/drawer
- Criar mutations: `useCreatePublidoorLocation()`, `useUpdatePublidoorLocation()`, `useDeletePublidoorLocation()`
- Formulário com campos: nome, slug, descrição, device_target, max_items, is_premium, allows_rotation, is_active
- Ações inline: editar, ativar/desativar, excluir

#### 3.2 PublidoorTemplates.tsx - CRUD Completo
**Implementação**:
- Adicionar botão "Novo Template" abrindo modal
- Criar mutations: `useCreatePublidoorTemplate()`, `useUpdatePublidoorTemplate()`, `useDeletePublidoorTemplate()`
- Editor de template com: nome, slug, descrição, font_family, font_size, color_palette (JSON), has_animations, is_active
- Preview em tempo real do template

#### 3.3 PublidoorSchedules.tsx - UI Real de Agendamento
**Implementação**:
- Transformar página informativa em gestão real de agendamentos
- Lista de todos agendamentos ativos/agendados
- Formulário: publidoor_id, start_at, end_at, days_of_week, hours_range, priority, status
- Mutations já existem: `useCreatePublidoorSchedule()`, `useDeletePublidoorSchedule()`
- Adicionar `useUpdatePublidoorSchedule()` mutation

### 4. Campanhas 360 - Ativação Completa

#### 4.1 Navegação e Acesso
- Atualizar `CampaignsHub.tsx` para incluir card "Campanhas 360" apontando para `/admin/campaigns/unified`
- Garantir rotas funcionando: `/admin/campaigns/unified`, `/admin/campaigns/new`, `/admin/campaigns/edit/:id`

#### 4.2 Upload em Lote para Storage Real
**Problema**: BatchAssetUploader criado mas sem upload real para Storage

**Implementação**:
- Implementar `uploadToStorage()` no BatchAssetUploader usando bucket `campaign-assets`
- Path: `{campaign_id}/{channel}/{slot}/original/{filename}`
- Criar registro em `campaign_assets` após upload
- Aplicar motor de correção de imagem (125% upscale max, 2% tolerance)
- Gerar derivados automáticos quando necessário

#### 4.3 Integração Display Components
**InlineAdSlot**: 
- Já implementado mas precisa ser integrado em templates de matérias
- Verificar query de campanhas ativas com canal 'ads' habilitado

**ExitIntentModal**:
- Já integrado no App.tsx
- Verificar query no useExitIntent busca campanhas com canal 'exit_intent'

**LoginPanelAd**:
- Já integrado no Auth.tsx
- Verificar query busca campanhas com canal 'login_panel'

#### 4.4 WebStories como Canal de Publicidade
**Implementação**:
- Criar componente `WebStoriesViewer.tsx` para exibição fullscreen
- Integrar como slot em: home, matérias, exit-intent secundário
- Query por campanhas com canal 'webstories' habilitado

### 5. Push e Newsletter End-to-End

#### 5.1 Push Notifications
**Edge Function** `campaign-push` já existe

**Implementação Frontend**:
- Criar `usePushSubscription()` hook para gerenciar inscrições do usuário
- Adicionar lógica de request permission e subscribe
- Testar fluxo completo: criar campanha > habilitar Push > confirmar ciclo > enviar

#### 5.2 Newsletter
**Edge Function** `campaign-newsletter` já existe

**Implementação Frontend**:
- Criar hook para listar emails/listas disponíveis
- Integrar com ciclos de campanha
- Testar fluxo: criar campanha > habilitar Newsletter > configurar lista > confirmar ciclo > enviar

### 6. Integração Ads/Banners/Publidoor com 360

**Estratégia**: Modo opcional "Gerenciado por Campanha 360"

#### 6.1 Ads (Anúncios)
- Adicionar campos na tabela `ads`: `campaign_id`, `cycle_id`, `managed_by_campaign`
- No formulário de criação/edição de Ad, adicionar toggle "Vincular a Campanha 360"
- Quando vinculado: ocultar upload local, puxar assets do 360

#### 6.2 Super Banners
- Mesmo padrão: `campaign_id`, `cycle_id`, `managed_by_campaign`
- Banner slider pode puxar lista de assets do ciclo ativo

#### 6.3 Publidoor
- Adicionar campo `campaign_id` na tabela `publidoor_items`
- Quando vinculado: assets e schedule podem vir do 360

### 7. Métricas Unificadas

**Implementação**:
- Criar helper `trackCampaignEvent()` para uso padronizado
- Garantir todos componentes de display usem este helper:
  - InlineAdSlot
  - ExitIntentModal
  - LoginPanelAd
  - WebStoriesViewer
  - Ads/Banners quando gerenciados pelo 360

---

## Detalhes Técnicos

### Migrações de Banco de Dados Necessárias

```text
1. Adicionar campos para integração 360:
   - ALTER TABLE ads ADD COLUMN campaign_id UUID REFERENCES campaigns_unified(id);
   - ALTER TABLE ads ADD COLUMN managed_by_campaign BOOLEAN DEFAULT false;
   - ALTER TABLE super_banners ADD COLUMN campaign_id UUID REFERENCES campaigns_unified(id);
   - ALTER TABLE super_banners ADD COLUMN managed_by_campaign BOOLEAN DEFAULT false;
   - ALTER TABLE publidoor_items ADD COLUMN campaign_id UUID REFERENCES campaigns_unified(id);

2. Adicionar update mutation para schedules:
   - useUpdatePublidoorSchedule() no usePublidoor.ts

3. RLS policies para novas integrações
```

### Arquivos a Criar/Modificar

**Novos Arquivos**:
- `src/components/ads/WebStoriesViewer.tsx`
- `src/hooks/usePushSubscription.ts`
- `src/lib/trackCampaignEvent.ts`

**Arquivos a Modificar**:

| Arquivo | Mudança |
|---------|---------|
| `AdminSidebar.tsx` | Adicionar "Campanhas 360" em monetizationItems |
| `CampaignsHub.tsx` | Adicionar card para Campanhas 360 |
| `PartnersInbox.tsx` | Substituir mock por hooks reais |
| `PartnersManage.tsx` | Substituir mock por hooks reais |
| `PartnersPitches.tsx` | Substituir mock por hooks reais |
| `PublidoorLocations.tsx` | Adicionar CRUD completo |
| `PublidoorTemplates.tsx` | Adicionar CRUD completo |
| `PublidoorSchedules.tsx` | Converter para gestão real |
| `usePublidoor.ts` | Adicionar mutations faltantes |
| `BatchAssetUploader.tsx` | Implementar upload real para Storage |

### Ordem de Implementação

```text
Fase 1: Menu e Navegação
  [1] AdminSidebar.tsx - Adicionar Campanhas 360
  [2] CampaignsHub.tsx - Card para Campanhas 360

Fase 2: Parceiros (Remover Mock)
  [3] PartnersInbox.tsx - DB real
  [4] PartnersManage.tsx - DB real
  [5] PartnersPitches.tsx - DB real

Fase 3: Publidoor CRUD
  [6] usePublidoor.ts - Adicionar mutations
  [7] PublidoorLocations.tsx - CRUD
  [8] PublidoorTemplates.tsx - CRUD
  [9] PublidoorSchedules.tsx - Gestão real

Fase 4: Campanhas 360 Storage
  [10] Migration: adicionar campos integração
  [11] BatchAssetUploader.tsx - Upload real
  [12] trackCampaignEvent.ts - Helper métricas

Fase 5: Display Components
  [13] WebStoriesViewer.tsx
  [14] Integrar InlineAdSlot em templates de matéria
  [15] Verificar ExitIntentModal e LoginPanelAd

Fase 6: Push/Newsletter
  [16] usePushSubscription.ts
  [17] Testar fluxos end-to-end

Fase 7: Integração Legacy
  [18] Ads - vincular ao 360
  [19] Super Banners - vincular ao 360
  [20] Publidoor Items - vincular ao 360
```

---

## Critérios de Aceite

O sistema estará 100% funcional quando:

1. Menu "Publicidade & Monetização" tiver link "Campanhas 360" visível e funcional
2. Parceiros (Inbox/Manage/Pitches) sem nenhum array mock - 100% DB
3. Publidoor Locations e Templates com CRUD completo (criar/editar/excluir)
4. Publidoor Schedules com gestão real de agendamentos
5. Upload de assets salvando em Storage `campaign-assets` com registros em DB
6. Exit-Intent, Login Panel e InlineAdSlot exibindo campanhas reais do DB
7. Push e Newsletter com fluxo testável de ponta a ponta
8. Métricas sendo gravadas em `campaign_events` para todos os canais
9. Ads e Banners podendo ser vinculados opcionalmente a Campanhas 360

---

## Estimativa de Implementação

| Fase | Descrição | Complexidade |
|------|-----------|--------------|
| 1 | Menu e Navegação | Baixa |
| 2 | Parceiros (remover mock) | Média |
| 3 | Publidoor CRUD | Média |
| 4 | Storage Upload | Alta |
| 5 | Display Components | Média |
| 6 | Push/Newsletter | Alta |
| 7 | Integração Legacy | Média |

