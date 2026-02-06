
# Plano de Implementacao Completa - Fases 2 e 3

## Resumo do Estado Atual

### Fase 1 (CONCLUIDA)
- DOMPurify instalado e hook `useSanitizedHtml` criado
- `ArticleContent.tsx` e `RichTextEditor.tsx` ja usam sanitizacao
- RLS da tabela `profiles` restringida para autenticados
- RLS de 5 tabelas autopost corrigidas
- RLS de `audit_logs` corrigida

### Pendencias Identificadas

**Linter atual: 99 warnings**
- 1 ERROR: Security Definer View
- 27 WARN: Functions sem search_path (excluindo funcoes do pg_trgm que sao imutaveis)
- 2 WARN: Extensions in public (pg_trgm, unaccent)
- 69 WARN: RLS Policies permissivas (com WITH CHECK true)

**Frontend: 21 arquivos com dangerouslySetInnerHTML**
- 2 ja corrigidos (ArticleContent.tsx, RichTextEditor.tsx)
- 19 arquivos ainda precisam sanitizacao

---

## FASE 2: Melhorias Estruturais

### 2.1 Sanitizacao HTML em TODOS os Arquivos (19 restantes)

| # | Arquivo | Linha | Campo |
|---|---------|-------|-------|
| 1 | src/pages/public/TvPage.tsx | 163 | getPlayerHtml() |
| 2 | src/pages/public/RadioPage.tsx | 181 | getPlayerHtml() |
| 3 | src/pages/guia/GuiaCategoriaPage.tsx | 133 | category.page_content |
| 4 | src/pages/guia/BusinessDetailPage.tsx | 250 | business.description_full |
| 5 | src/modules/imoveis/pages/ImovelDetailPage.tsx | 212 | imovel.descricao_html |
| 6 | src/pages/EventDetail.tsx | 306 | event.content_html |
| 7 | src/pages/StoryViewer.tsx | 259 | currentSlideData.content_html |
| 8 | src/pages/admin/StoryEditor.tsx | 477 | slides[0].content_html |
| 9 | src/pages/admin/academy/AcademyLesson.tsx | 159 | lesson.content_html |
| 10 | src/pages/admin/academy/EnemLesson.tsx | 147 | lesson.video_embed |
| 11 | src/pages/admin/academy/EnemLesson.tsx | 170 | lesson.content_html |
| 12 | src/pages/admin/autopost-regional/RegionalQueue.tsx | 394 | selectedItem.rewritten_content |
| 13 | src/pages/public/esportes/GeneratedNewsDetail.tsx | 121 | news.content |
| 14 | src/components/conexao-ai/AIContentPreview.tsx | 138 | content.conteudo |
| 15 | src/components/admin/NewsPreview.tsx | 254 | content |
| 16 | src/components/admin/noticias-ai/ArticlePreviewDialog.tsx | 214 | article.conteudo |
| 17 | src/components/ui/chart.tsx | 70 | CSS injection (manter - e interno) |

**Abordagem:**
- Para conteudo HTML (noticias, descricoes): usar `useSanitizedHtml` ou `sanitizeHtml`
- Para embeds de video (YouTube, player): usar `sanitizeEmbed` (mais permissivo)
- Para CSS interno (chart.tsx): manter como esta (nao e input de usuario)

### 2.2 Corrigir Funcoes sem search_path (27 funcoes)

Funcoes que precisam adicionar `SET search_path = public`:

```text
audit_news_changes, autopost_item_before_insert, autopost_job_after_update,
autopost_update_timestamp, award_comment_points, award_post_points,
calculate_community_level, calculate_lead_score, calculate_next_run_time,
can_invite_to_community, check_autopost_duplicate, check_community_unlock,
check_duplicate_news, check_edition_access, cleanup_expired_sso_codes,
create_site_default_style, create_social_posts_on_publish,
ensure_single_current_version, ensure_single_default_billing_client,
generate_content_hash, generate_school_slug, get_autopost_stats,
get_business_stats, get_partner_advertiser_id, handle_invite_acceptance,
handle_new_user, handle_new_user_role, e mais...
```

### 2.3 Corrigir Politicas RLS Permissivas (69 warnings)

Tabelas com politicas INSERT/UPDATE/DELETE com `WITH CHECK (true)`:

**Grupo A - Metricas/Analytics (PUBLIC INSERT INTENCIONAL)**
Manter como esta - sao metricas anonimas de tracking:
- banner_ab_impressions, banner_clicks, banner_impressions
- broadcast_analytics, business_clicks, campaign_events
- classified_interest_clicks, click_events, digital_edition_views

**Grupo B - Leads/Forms (PUBLIC INSERT INTENCIONAL)**
Manter como esta - formularios publicos:
- business_leads, campaign_leads, fact_check_claims
- newsletter_subscribers, phone_leads, whatsapp_leads

**Grupo C - Precisam Restricao**
Restringir para `is_admin_or_editor(auth.uid())`:
- autopost_audit_logs, autopost_ingest_items, autopost_ingest_jobs
- autopost_media_assets, autopost_rewritten_posts
- broadcast_autodj_settings, broadcast_chat_messages
- community_notifications, community_points_history
- conexao_ai_automation_logs, sso_exchange_codes

### 2.4 Adicionar Validacao SEO na Edge Function

Modificar `supabase/functions/noticias-ai-generate/index.ts`:
- Adicionar truncamento automatico de `meta_titulo` (max 60 chars)
- Adicionar truncamento automatico de `meta_descricao` (max 160 chars)
- Adicionar sanitizacao HTML com DOMPurify (adaptar para Deno)

### 2.5 Implementar Campo data_original (Opcional)

Adicionar campo opcional na interface para preservar data original da fonte.

---

## FASE 3: Otimizacoes e Evolucao

### 3.1 Mover Extensions para Schema Separado
- Criar schema `extensions` se nao existir
- Mover `pg_trgm` e `unaccent` para esse schema

### 3.2 Adicionar Headers de Seguranca
- CSP (Content Security Policy)
- X-Frame-Options
- X-Content-Type-Options

### 3.3 Rate Limiting em Edge Functions Criticas
- noticias-ai-generate (prevenir abuso de IA)
- Login/auth endpoints

---

## Implementacao Tecnica

### Arquivos a Modificar (Frontend)

1. **19 arquivos com dangerouslySetInnerHTML**
   - Importar `useSanitizedHtml` ou `sanitizeHtml`
   - Aplicar sanitizacao antes de renderizar

2. **Edge function noticias-ai-generate**
   - Adicionar validacao de limites SEO
   - Adicionar sanitizacao HTML basica

### Migracao SQL

Uma unica migracao para:
1. Corrigir todas as funcoes sem search_path
2. Atualizar politicas RLS que precisam restricao
3. Mover extensions para schema separado

---

## Resultado Esperado

Apos implementacao completa:
- Linter warnings: de 99 para ~20 (restantes sao intencionais)
- XSS: 0 vetores de ataque via dangerouslySetInnerHTML
- RLS: Todas as tabelas sensiveis protegidas
- Search_path: Todas as funcoes com path fixo
- SEO: Validacao automatica de limites

### Notas Importantes

1. **Embeds de video** (TvPage, RadioPage, EnemLesson): Usar `sanitizeEmbed` que permite `<iframe>` de forma controlada
2. **chart.tsx**: Manter sem sanitizacao - e CSS gerado internamente, nao input de usuario
3. **Politicas de metricas**: Manter publicas - sao essenciais para analytics
4. **Extensions pg_trgm/unaccent**: Sao funcoes imutaveis, warnings podem ser ignorados

