# CONEXÃO CORE ENGINE — Plano de Arquitetura v3.0

## Visão Geral

Módulo proprietário que centraliza todas as funcionalidades do portal, substituindo dependências de plugins externos por um ecossistema nativo integrado.

---

## STATUS GERAL DOS MÓDULOS

| # | Módulo | Status | Prioridade |
|---|--------|--------|------------|
| 1 | core-seo | 🟡 Parcial | Alta |
| 2 | core-ads | ✅ Implementado | Manutenção |
| 3 | core-performance | 🟡 Parcial | Alta |
| 4 | core-security | 🟡 Parcial | Média |
| 5 | core-analytics | 🔴 Básico | Alta |
| 6 | core-push | ✅ Implementado | Manutenção |
| 7 | core-editorial | ✅ Implementado | Manutenção |
| 8 | core-media | 🟡 Parcial | Média |
| 9 | core-leads | 🟡 Parcial | Média |
| 10 | core-redirect | 🔴 Não existe | Alta |
| 11 | core-schema | 🟡 Parcial | Média |
| 12 | core-backup | ⬜ N/A (Cloud) | — |
| 13 | core-roles | ✅ Implementado | Manutenção |
| 14 | core-automation | ✅ Implementado | Manutenção |

---

## FASE 1 — Painel Unificado Core Engine (PRIMEIRO)

### Objetivo
Criar menu "Core Engine" no painel admin que centraliza todos os módulos com toggles de ativação.

### Implementação
- Rota: `/spah/painel/core-engine`
- Submenu no AdminSidebar com ícone dedicado (Cpu ou Boxes)
- Dashboard com cards de cada módulo + status + toggle
- Subrotas para cada módulo: `/spah/painel/core-engine/seo`, etc.

### Tarefas
- [ ] Adicionar rota e menu no sidebar
- [ ] Criar página CoreEngineDashboard com grid de módulos
- [ ] Atualizar ModuleKey para incluir novos core-* modules
- [ ] Criar layout CoreEngineLayout com submenu lateral

---

## FASE 2 — core-seo (SEO Profissional)

### Já existe
- Meta título/descrição no editor de notícias
- Sitemap dinâmico (Edge Function `sitemap`)
- Canonical automático
- OG e Twitter Cards
- Schema Article/NewsArticle
- Index/noindex por post (`is_indexable`)
- Slug inteligente
- Google News marcação

### Falta implementar
- [ ] Score SEO visual em tempo real no editor (barra lateral)
- [ ] Score de legibilidade (Flesch-Kincaid adaptado PT-BR)
- [ ] Controle de robots.txt via painel
- [ ] Breadcrumb estruturado (Schema)
- [ ] Painel centralizado de SEO com métricas globais
- [ ] Análise de keywords por post
- [ ] Sugestões automáticas de otimização

### Banco de dados
- Tabela `seo_scores` (news_id, seo_score, readability_score, issues JSON, updated_at)
- Tabela `seo_settings` (robots_txt, default_meta, sitemap_config)

---

## FASE 3 — core-analytics (Analytics Interno)

### Já existe
- Contagem de views por notícia
- Ranking "Mais Lidas"
- Métricas básicas de ads (impressões, cliques, CTR)
- Página Analytics.tsx (básica)

### Falta implementar
- [ ] Dashboard completo com:
  - Usuários online em tempo real (Realtime)
  - Visitas por matéria (gráfico temporal)
  - Matérias mais lidas (período selecionável)
  - Tempo médio de permanência
  - Origem de tráfego
  - Dispositivo (mobile/desktop/tablet)
  - CTR dos anúncios por slot
  - Receita estimada por bloco
- [ ] Integração GA4 (via Measurement Protocol)
- [ ] Integração Google Search Console (API)
- [ ] Integração Meta Pixel (eventos)

### Banco de dados
- Tabela `analytics_pageviews` (page_path, session_id, user_agent, referrer, device, country, duration_ms, created_at)
- Tabela `analytics_sessions` (session_id, started_at, ended_at, page_count, device, source)
- View materializada `analytics_daily_summary`

---

## FASE 4 — core-redirect (Redirecionamentos)

### Não existe — criar do zero

### Implementar
- [ ] Tabela `redirects` (source_path, target_path, type 301/302, hits, created_at, is_active)
- [ ] Tabela `404_log` (path, referrer, user_agent, count, first_seen, last_seen)
- [ ] Página admin de gestão de redirects
- [ ] Sugestão automática de redirect para 404 frequentes
- [ ] Middleware no frontend para interceptar redirects
- [ ] Importação/exportação CSV

---

## FASE 5 — core-schema (Dados Estruturados Avançados)

### Já existe
- Article / NewsArticle
- Organization (parcial)

### Falta implementar
- [ ] LocalBusiness schema
- [ ] FAQ schema (gerado automaticamente de conteúdo)
- [ ] Breadcrumb schema (complementar ao SEO)
- [ ] Validador inline contra Google Rich Results
- [ ] Painel de gestão de schemas por tipo de conteúdo

---

## FASE 6 — core-performance

### Já implementado (automático pela stack)
- Minificação CSS/JS (Vite)
- Compressão GZIP (servidor)
- Lazy loading (React.lazy + Suspense)
- Cache inteligente (React Query staleTime/gcTime)

### Falta implementar
- [ ] Painel de Core Web Vitals (LCP, FID, CLS)
- [ ] Monitor de performance por página
- [ ] Alertas de degradação
- [ ] Preload inteligente de rotas críticas
- [ ] Relatório de imagens não otimizadas

### Banco de dados
- Tabela `performance_metrics` (page_path, lcp, fid, cls, ttfb, device, created_at)

---

## FASE 7 — core-security

### Já implementado
- RLS rigoroso
- DOMPurify sanitização
- Proteção SQL injection (parameterized queries)
- Roles e permissões granulares
- Log de atividades admin (audit_logs)

### Falta implementar
- [ ] Painel de segurança centralizado
- [ ] Monitor de tentativas de login falhas
- [ ] Bloqueio automático de IP (rate limiting via Edge Function)
- [ ] 2FA opcional (TOTP)
- [ ] Scanner de vulnerabilidades interno
- [ ] Dashboard de logs de segurança

### Banco de dados
- Tabela `security_events` (event_type, ip_address, user_id, details, severity, created_at)
- Tabela `blocked_ips` (ip_address, reason, blocked_at, expires_at)

---

## FASE 8 — core-media (Mídia Inteligente)

### Já implementado
- Compressão automática
- WebP (parcial)
- ALT automático
- Geração Hero/OG/Card

### Falta implementar
- [ ] Biblioteca de mídia organizada por categoria
- [ ] Detecção de imagem duplicada (hash perceptual)
- [ ] Painel de gestão de mídia com filtros
- [ ] Estatísticas de uso por imagem
- [ ] Limpeza de mídia órfã

---

## FASE 9 — core-leads (Captação de Leads)

### Já existe (parcial)
- Formulários básicos
- WhatsApp integration
- Push notifications para engajamento

### Falta implementar
- [ ] Formulário nativo configurável (drag & drop)
- [ ] Segmentação de listas
- [ ] Exportação CSV
- [ ] Automação básica de resposta (autoresponder)
- [ ] Integração e-mail marketing (Mailchimp/Brevo)
- [ ] Dashboard de leads com funil

### Banco de dados
- Tabela `leads` (name, email, phone, source, tags, status, created_at)
- Tabela `lead_lists` (name, description, filter_rules)

---

## NOTAS SOBRE MÓDULOS JÁ COMPLETOS

### core-ads ✅
15 formatos, Campanhas 360, AdLabel 3 níveis, métricas completas.

### core-push ✅
Web Push VAPID, segmentação, agendamento, Service Worker.

### core-editorial ✅
Quality Gate, checklist, campos obrigatórios, histórico, controle autor.

### core-roles ✅
super_admin, admin, editor, editor_chief, reporter, columnist, moderator + permissões granulares.

### core-automation ✅
AutoPost, sitemap, indexação Google, notificações automáticas.

### core-backup ⬜
Gerenciado pelo Lovable Cloud — não requer implementação.

---

## ORDEM DE IMPLEMENTAÇÃO

1. **Painel Core Engine** (hub central + menu)
2. **core-redirect** (não existe, alto impacto SEO)
3. **core-analytics** (alto impacto operacional)
4. **core-seo** (complementar existente)
5. **core-schema** (complementar existente)
6. **core-performance** (painel de monitoramento)
7. **core-security** (painel + 2FA)
8. **core-media** (biblioteca aprimorada)
9. **core-leads** (captação avançada)

---

## ESTRUTURA DE ARQUIVOS

```
src/pages/admin/core-engine/
├── CoreEngineDashboard.tsx
├── CoreSEO.tsx
├── CoreAnalytics.tsx
├── CoreRedirects.tsx
├── CoreSchema.tsx
├── CorePerformance.tsx
├── CoreSecurity.tsx
├── CoreMedia.tsx
└── CoreLeads.tsx

src/components/core-engine/
├── SEOScorePanel.tsx
├── ReadabilityScore.tsx
├── AnalyticsChart.tsx
├── RedirectForm.tsx
└── SecurityDashboard.tsx

src/hooks/
├── useCoreAnalytics.ts
├── useCoreRedirects.ts
├── useCoreSEO.ts
└── useCorePerformance.ts
```

---

## DECISÕES TÉCNICAS

1. **Analytics**: Coletar via Edge Function + inserir em batch
2. **SEO Score**: Calcular client-side no editor, salvar resultado
3. **Redirects**: Middleware no App.tsx + consulta em cache
4. **Performance**: Web Vitals API nativa + enviar via beacon
5. **Segurança**: Rate limiting via Edge Function proxy
6. **Schema**: Renderizar via react-helmet-async

---

## PRÓXIMO PASSO

Aguardando aprovação para iniciar Fase 1 (Painel Core Engine).
