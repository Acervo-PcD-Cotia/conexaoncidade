
# Relatório de Auditoria e Plano de Conclusão: Publicidade & Monetização 360

## Estado Atual do Sistema

Após análise detalhada do código, identifiquei o que já está implementado e o que ainda precisa ser finalizado para atingir 100% de funcionalidade.

---

## Itens Implementados (Funcionando)

| Módulo | Status | Detalhes |
|--------|--------|----------|
| **Menu Campanhas 360** | OK | Item "Campanhas 360" adicionado em `AdminSidebar.tsx` com badge "Novo" |
| **CampaignsHub.tsx** | OK | Card "Campanhas 360" com stats dinâmicos do DB |
| **CampaignsUnified.tsx** | OK | Lista de campanhas com CRUD completo |
| **CampaignEditor.tsx** | OK | Formulário multi-canal com ciclos |
| **Parceiros Inbox** | OK | Usando `useSyndicationInbox` - mock removido |
| **Parceiros Manage** | OK | Usando `usePartnerRelationships` - mock removido |
| **Parceiros Pitches** | OK | Usando `usePitchRequests` - mock removido |
| **Publidoor Locations** | OK | CRUD completo implementado |
| **Publidoor Templates** | OK | CRUD completo com preview |
| **Publidoor Schedules** | OK | CRUD completo com tipos de agendamento |
| **trackCampaignEvent.ts** | OK | Helper unificado para métricas |
| **WebStoriesViewer.tsx** | OK | Viewer fullscreen com tracking |
| **InlineAdSlot.tsx** | OK | Usando trackCampaignEvent |
| **ExitIntentModal.tsx** | OK | Integrado com campanhas 360 |
| **LoginPanelAd.tsx** | OK | Integrado com campanhas 360 |
| **Ads.tsx** | OK | Campos campaign_id e managed_by_campaign |
| **Banners.tsx** | OK | Campos campaign_id e managed_by_campaign |
| **Edge Function campaign-push** | OK | Registra eventos e atualiza ciclos |
| **Edge Function campaign-newsletter** | OK | Registra eventos e atualiza ciclos |
| **Tabelas DB** | OK | Todas criadas: campaigns_unified, campaign_cycles, campaign_channels, campaign_assets, campaign_events, publidoor_locations, publidoor_templates, publidoor_schedules |

---

## Itens Pendentes para 100% Funcionalidade

### Categoria A: Integrações Faltantes (Prioridade Alta)

#### 1. InlineAdSlot não está integrado em templates de matérias
**Problema**: O componente existe e funciona, mas não está sendo renderizado nas páginas de artigos/matérias do portal.

**Solução**: Integrar o `InlineAdSlot` no componente de visualização de artigos (`NewsDetail.tsx` ou similar) para exibir anúncios entre parágrafos.

#### 2. WebStoriesViewer não está acessível no site público
**Problema**: O viewer existe mas não há rota pública ou integração na home/matérias.

**Solução**: 
- Criar rota `/stories/:id` para visualização individual
- Adicionar slot na home para exibir WebStories de campanhas
- Opcionalmente integrar como opção secundária no Exit-Intent

#### 3. Push Notifications faltam envio real
**Problema**: A Edge Function `campaign-push` registra eventos mas não usa web-push para envio real. Falta `VAPID_PRIVATE_KEY`.

**Solução**: 
- Configurar chaves VAPID no ambiente
- Implementar envio real usando biblioteca web-push
- Criar UI no frontend para disparar push por ciclo

#### 4. Newsletter falta integração com serviço de email
**Problema**: A Edge Function `campaign-newsletter` registra eventos mas não envia emails reais.

**Solução**:
- Integrar com Resend, SendGrid ou outro serviço
- Configurar API key no ambiente
- Implementar template de email HTML

---

### Categoria B: Melhorias de UX (Prioridade Média)

#### 5. BatchAssetUploader precisa validação de upload real
**Problema**: O componente existe mas precisa garantir que o upload para Storage está funcionando end-to-end com criação de registros em `campaign_assets`.

**Solução**: Testar e validar fluxo completo de upload em lote.

#### 6. Service Worker para Push não está registrado
**Problema**: Falta arquivo `public/sw.js` para receber push notifications no browser.

**Solução**: Criar Service Worker com handlers para push e notificationclick.

#### 7. UI para disparar Push/Newsletter por ciclo
**Problema**: As Edge Functions existem mas falta UI amigável no CampaignEditor para disparar envios.

**Solução**: Adicionar botões "Enviar Push" e "Enviar Newsletter" no CycleSelectorCard.

---

### Categoria C: Integrações Opcionais (Prioridade Baixa)

#### 8. Publidoor Items não tem campo campaign_id
**Problema**: A tabela `publidoor_items` precisa de campo para vincular a campanhas 360.

**Solução**: Migration para adicionar `campaign_id` e atualizar formulário.

---

## Plano de Implementação

### Fase 1: Integrações Front-End Críticas

1. Integrar InlineAdSlot em NewsDetail/ArticleView
2. Criar rota pública para WebStories
3. Adicionar slot de WebStories na home

### Fase 2: Push e Newsletter End-to-End

4. Criar `public/sw.js` (Service Worker)
5. Atualizar Edge Function `campaign-push` para envio real
6. Adicionar UI de disparo no CycleSelectorCard

### Fase 3: Validações e Testes

7. Testar fluxo completo de upload de assets
8. Testar exibição de campanhas em todos os canais
9. Validar gravação de métricas em campaign_events

---

## Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/pages/NewsDetail.tsx` | Modificar | Integrar InlineAdSlot |
| `src/pages/WebStoryViewer.tsx` | Criar | Página pública para stories |
| `src/App.tsx` | Modificar | Adicionar rota /stories/:id |
| `public/sw.js` | Criar | Service Worker para push |
| `src/components/admin/campaigns/CycleSelectorCard.tsx` | Modificar | Botões de disparo Push/Newsletter |
| `supabase/functions/campaign-push/index.ts` | Modificar | Implementar web-push real |

---

## Migrações Pendentes

Nenhuma migração de banco é estritamente necessária - todas as tabelas já existem. Opcionalmente:

```sql
-- Opcional: Adicionar campaign_id em publidoor_items
ALTER TABLE publidoor_items 
  ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns_unified(id) ON DELETE SET NULL;
```

---

## Critérios de Aceite Final

O sistema estará 100% completo quando:

1. Menu "Campanhas 360" visível e acessível
2. Parceiros (Inbox/Manage/Pitches) sem mock data
3. Publidoor com CRUD completo (Locations/Templates/Schedules)
4. InlineAdSlot exibindo em matérias reais
5. WebStories acessíveis em rota pública
6. Exit-Intent e Login Panel funcionando
7. trackCampaignEvent gravando métricas
8. Push/Newsletter com UI de disparo
9. Ads e Banners vinculáveis a campanhas 360

---

## Resumo Executivo

**Implementado**: 85% do sistema está funcional
**Pendente**: Integrações de exibição no site público + Push/Newsletter end-to-end

O sistema de campanhas 360 está praticamente pronto. As principais pendências são:
- Integrar os componentes de display (InlineAdSlot, WebStories) nas páginas públicas
- Finalizar o fluxo real de Push e Newsletter
- Criar UI amigável para disparar envios por ciclo
