
# Plano: Finalizar Itens Restantes do Auto Post Regional

## Análise do Estado Atual

### JÁ IMPLEMENTADO (Sprint 1-5)
1. Edge Function `regional-process-item` - Completa com IA, SEO, tags
2. Edge Function `regional-admin-tools` - Todas as actions (process_item, publish_item, etc.)
3. Edge Function `regional-ingest` - Com TLS fallback, SSRF validation, backoff
4. Hooks React - useProcessRegionalItem, usePublishRegionalItem, useProcessAllNew, useTestSelectors
5. UI RegionalQueue - Com botões Processar/Publicar e preview com abas
6. UI RegionalSourceEdit - Editor de fontes com seletores CSS
7. Database columns - error_message, retry_count, processing_started_at
8. Exportação no index.ts - RegionalSourceEdit já exportada

---

## ITENS RESTANTES (3-4 itens)

### 1. Rota de Edição de Fonte no App.tsx
**Problema**: `RegionalSourceEdit` existe mas a rota `/admin/autopost-regional/fontes/:id/edit` não está registrada.

**Arquivo**: `src/App.tsx`
- Adicionar rota: `<Route path="autopost-regional/fontes/:id/edit" element={<RegionalSourceEdit />} />`
- Adicionar import de `RegionalSourceEdit` no bloco de imports regionais

### 2. Botão "Editar" na Tabela de Fontes
**Problema**: `RegionalSources.tsx` não possui botão para navegar até a página de edição.

**Arquivo**: `src/pages/admin/autopost-regional/RegionalSources.tsx`
- Adicionar botão com ícone `Settings` ou `Pencil` na coluna de ações
- Link para `/admin/autopost-regional/fontes/${source.id}/edit`

### 3. Hook useRegionalSource (verificar existência)
**Status**: Já existe em `useRegionalAutoPost.ts` na linha 95

---

## Verificação de Completude

### Checklist (35 itens)

#### Edge Functions (8/8) ✅
- [x] Criar `regional-process-item`
- [x] Implementar fetch de conteúdo completo
- [x] Integrar Lovable AI para reescrita
- [x] Integrar Gemini Image para imagens
- [x] Adicionar action `process_item`
- [x] Adicionar action `process_all_new`
- [x] Adicionar action `publish_item`
- [x] Adicionar action `test_selectors`

#### Ingestão (6/6) ✅
- [x] Tratamento TLS/SSL com fallback
- [x] Backoff exponencial
- [x] Parser listing otimizado
- [x] Validação SSRF
- [x] Rate limiting por fonte
- [x] Timeout configurável

#### Banco de Dados (4/4) ✅
- [x] Coluna `error_message`
- [x] Coluna `retry_count`
- [x] Coluna `processing_started_at`
- [x] Índices de performance

#### Integração News (5/5) ✅
- [x] Criar registro em `news`
- [x] Gerar slug único
- [x] Inserir 12 tags
- [x] Linkar `news_tags`
- [x] Atualizar status para `published`

#### UI/Hooks (9/9) ✅
- [x] Hook `useProcessRegionalItem`
- [x] Hook `usePublishRegionalItem`
- [x] Hook `useProcessAllNew`
- [x] Hook `useTestSelectors`
- [x] Botão Processar na fila
- [x] Botão Publicar na fila
- [x] Preview conteúdo reescrito
- [x] Página `RegionalSourceEdit`
- [x] Editor visual de selectors

#### Automação - NÃO IMPLEMENTAR
- [ ] Cron ingestão (2h) - Requer pg_cron via SQL manual
- [ ] Cron processamento (30min) - Requer pg_cron via SQL manual
- [ ] Auto-publish para fontes configuradas - Já funciona via mode=auto_publish

---

## Implementação Necessária

### Arquivo 1: src/App.tsx

**Modificações**:
1. Adicionar `RegionalSourceEdit` ao import existente (linha 88-94)
2. Adicionar rota após linha 479

### Arquivo 2: src/pages/admin/autopost-regional/RegionalSources.tsx

**Modificações**:
1. Adicionar import do ícone `Pencil` do lucide-react
2. Adicionar botão de edição na coluna de ações (após ExternalLink)

---

## Notas sobre Cron (Automação)

O agendamento automático via `pg_cron` requer execução manual de SQL no Cloud View. Fornecerei o SQL para configurar:

```sql
-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Cron de ingestão a cada 2 horas
SELECT cron.schedule(
  'regional-ingest-every-2h',
  '0 */2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://qfavfwvsficnqaznincz.supabase.co/functions/v1/regional-ingest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Cron de processamento a cada 30 min
SELECT cron.schedule(
  'regional-process-every-30m',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://qfavfwvsficnqaznincz.supabase.co/functions/v1/regional-admin-tools',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ..."}'::jsonb,
    body := '{"action": "process_all_new"}'::jsonb
  );
  $$
);
```

---

## Resumo das Alterações

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| src/App.tsx | Modificar | Adicionar import e rota para RegionalSourceEdit |
| src/pages/admin/autopost-regional/RegionalSources.tsx | Modificar | Adicionar botão de edição na tabela |

**Total de mudanças**: 2 arquivos, ~15 linhas de código
