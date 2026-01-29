
# Plano: Auto Post Regional - Módulo Completo e Independente

## Visão Geral

Criar um módulo **totalmente independente** do Auto Post PRO, com banco próprio, edge functions próprias, páginas próprias e fontes pré-cadastradas (seed) das 13 prefeituras da região Grande Cotia.

---

## Arquitetura do Sistema

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        AUTO POST REGIONAL                           │
├─────────────────────────────────────────────────────────────────────┤
│  ROTAS                                                              │
│  /admin/autopost-regional           → Dashboard                     │
│  /admin/autopost-regional/fontes    → Gerenciar Fontes              │
│  /admin/autopost-regional/fila      → Fila Editorial                │
│  /admin/autopost-regional/logs      → Execuções e Erros             │
├─────────────────────────────────────────────────────────────────────┤
│  TABELAS (NOVAS)                                                    │
│  regional_sources         → Fontes RSS/Listing                      │
│  regional_ingest_items    → Itens capturados                        │
│  regional_ingest_runs     → Histórico de execuções                  │
├─────────────────────────────────────────────────────────────────────┤
│  EDGE FUNCTIONS (NOVAS)                                             │
│  regional-ingest          → Captura RSS + Listing                   │
│  regional-process-item    → Processa, reescreve, publica            │
│  regional-admin-tools     → Testar, rodar, pausar, etc.             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. Banco de Dados (Migrations)

### Tabela: `regional_sources`

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| id | uuid | gen_random_uuid() | PK |
| city | text | NOT NULL | Nome da cidade |
| name | text | NOT NULL | Nome da fonte |
| type | text | NOT NULL | 'rss' ou 'listing' |
| source_url | text | | URL do portal |
| rss_url | text | | URL do feed RSS |
| listing_url | text | | URL da listagem |
| selectors | jsonb | | Seletores para listing |
| is_active | boolean | true | Ativa/inativa |
| mode | text | 'review' | 'review', 'auto_publish', 'off' |
| poll_interval_minutes | int | 120 | Intervalo entre execuções |
| rate_limit_per_hour | int | 60 | Limite de requisições |
| last_fetched_at | timestamptz | | Última execução |
| last_success_at | timestamptz | | Último sucesso |
| error_count | int | 0 | Contador de erros |
| last_error | text | | Último erro |
| tags_default | text[] | | Tags padrão |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | |

### Tabela: `regional_ingest_items`

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| id | uuid | gen_random_uuid() | PK |
| source_id | uuid | FK regional_sources | Fonte |
| canonical_url | text | UNIQUE | URL original (dedupe) |
| title | text | | Título capturado |
| excerpt | text | | Resumo |
| content | text | | Conteúdo completo |
| image_url | text | | Imagem original |
| published_at | timestamptz | | Data original |
| raw_payload | jsonb | | Dados brutos |
| status | text | 'new' | new/queued/processed/skipped/failed/published |
| draft_id | uuid | | ID do draft gerado |
| news_id | uuid | | ID da notícia publicada |
| rewritten_title | text | | Título reescrito |
| rewritten_content | text | | Conteúdo reescrito |
| seo_meta_title | text | | Meta título |
| seo_meta_description | text | | Meta descrição |
| generated_image_url | text | | Imagem gerada por IA |
| processed_at | timestamptz | | Quando foi processado |
| published_at_portal | timestamptz | | Quando foi publicado |
| created_at | timestamptz | now() | |

### Tabela: `regional_ingest_runs`

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| id | uuid | gen_random_uuid() | PK |
| source_id | uuid | FK regional_sources | Fonte |
| started_at | timestamptz | now() | Início |
| finished_at | timestamptz | | Fim |
| status | text | 'running' | ok/warning/error |
| items_found | int | 0 | Itens encontrados |
| items_new | int | 0 | Itens novos |
| items_duplicated | int | 0 | Duplicados ignorados |
| items_errored | int | 0 | Com erro |
| result | jsonb | | Detalhes |
| log | text | | Log textual |
| created_at | timestamptz | now() | |

### RLS Policies

- Leitura: permitida para usuários autenticados com role admin/editor
- Escrita: apenas admin/super_admin

### Seed das 13 Fontes

| # | Cidade | Tipo | URL |
|---|--------|------|-----|
| 1 | Itapevi | rss | https://noticias.itapevi.sp.gov.br/feed/ |
| 2 | Vargem Grande Paulista | rss | https://www.vargemgrandepaulista.sp.gov.br/site/category/noticias-da-cidade/feed/ |
| 3 | São Roque | listing | https://www.saoroque.sp.gov.br/portal/noticias |
| 4 | Ibiúna | rss | https://ibiuna.sp.gov.br/todas-as-noticias/feed/ |
| 5 | Embu-Guaçu | listing | https://www.embuguacu.sp.gov.br/noticias |
| 6 | Embu das Artes | rss | https://cidadeembudasartes.sp.gov.br/feed/ |
| 7 | Itapecerica da Serra | listing | https://www.itapecerica.sp.gov.br/noticias |
| 8 | São Lourenço da Serra | rss | https://saolourencodaserra.sp.gov.br/novo/feed/ |
| 9 | São Paulo (Prefeitura) | listing | https://prefeitura.sp.gov.br/todas-as-noticias/ |
| 10 | Osasco | rss | https://osasco.sp.gov.br/feed/ |
| 11 | Jandira | listing | https://portal.jandira.sp.gov.br/Noticias/ |
| 12 | Carapicuíba | listing | https://www.carapicuiba.sp.gov.br/noticia/ |
| 13 | Barueri | rss | https://portal.barueri.sp.gov.br/feed |

---

## 2. Edge Functions

### `regional-ingest`

Responsabilidades:
- Executar por source_id ou todas as fontes ativas
- Para RSS: parse do feed XML
- Para Listing: fetch HTML + extração de links
- Deduplicação por canonical_url
- Inserir em regional_ingest_items com status 'new'
- Criar registro em regional_ingest_runs

Lógica de Listing:
1. Tentar auto-detect de links (padrões comuns)
2. Se falhar, usar selectors configurados
3. Extrair: link, título, data (se disponível)

Rate limiting:
- Concorrência máxima: 3
- Backoff exponencial em 429/403/timeout
- 5 falhas seguidas: pausar fonte por 12h

### `regional-process-item`

Responsabilidades:
- Receber ingest_item_id
- Buscar conteúdo completo da URL original
- Reescrever com estilo jornalístico natural
- Gerar meta_title (≤60), meta_description (≤160)
- Gerar imagem realista SEM texto via IA
- Se mode=auto_publish: publicar na tabela news
- Se mode=review: deixar como draft

Output:
- rewritten_title, rewritten_content
- seo_meta_title, seo_meta_description
- generated_image_url
- Atualizar status para 'processed' ou 'published'

### `regional-admin-tools`

Endpoints (via action no body):
- `test_source`: preview de 10 itens (dry_run)
- `run_now`: forçar ingest de 1 fonte
- `reprocess_url`: reprocessar item específico
- `pause_source` / `resume_source`: ativar/desativar
- `update_selectors`: salvar e testar seletores

---

## 3. Páginas (UI)

### `/admin/autopost-regional` (Dashboard)

Layout:
- Header com título "Auto Post Regional - Grande Cotia"
- 5 cards de métricas
- Lista de execuções recentes (últimas 10)
- Preview da fila editorial (últimos 10 itens)

Cards:
1. Capturadas Hoje (azul)
2. Publicadas Hoje (verde)
3. Na Fila (laranja)
4. Duplicadas Bloqueadas (roxo)
5. Fontes com Erro (vermelho)

### `/admin/autopost-regional/fontes`

Layout:
- Tabela com as 13 fontes (preenchidas pelo seed)
- Colunas: Cidade, Nome, Tipo, Status, Última Execução, Ações
- Ações: Testar, Rodar Agora, Editar, Pausar/Ativar, Ver Logs

Modal de Edição:
- Campos: city, name, type, URLs, mode, interval
- Se type=listing: editor de selectors + botão "Testar Selectors"
- Filtros: palavras obrigatórias/proibidas

### `/admin/autopost-regional/fila`

Layout:
- Tabela de itens capturados
- Filtros: status, cidade
- Colunas: Título, Cidade, Status, Data Captura, Ações
- Ações: Processar, Reprocessar, Ver Original, Ver Payload

### `/admin/autopost-regional/logs`

Layout:
- Lista de runs por fonte
- Filtros: fonte, status, período
- Colunas: Fonte, Início, Status, Novos, Duplicados, Erros
- Expandir para ver log completo

---

## 4. Hooks (React Query)

Novo arquivo: `src/hooks/useRegionalAutoPost.ts`

Hooks:
- `useRegionalSources()` - listar fontes
- `useRegionalSource(id)` - fonte específica
- `useUpdateRegionalSource()` - atualizar fonte
- `useRegionalQueue(status?)` - fila de itens
- `useRegionalRuns(sourceId?)` - execuções
- `useRegionalStats()` - métricas do dashboard
- `useTestRegionalSource()` - testar fonte
- `useRunRegionalIngest()` - executar ingest
- `useProcessRegionalItem()` - processar item

---

## 5. Correções Necessárias

### Remover redirect errado

Arquivo: `src/pages/admin/autopost/AutoPostRegional.tsx`

Atualmente faz: `<Navigate to="/admin/autopost" replace />`

Deve ser: Página completa do dashboard regional

### Atualizar quick action

Arquivo: `src/types/profiles-modules.ts`

Linha 246: mudar href de `/admin/autopost` para `/admin/autopost-regional`

---

## 6. Rotas (App.tsx)

Adicionar dentro do bloco admin:

```text
{/* Auto Post Regional (Grande Cotia) - Módulo Independente */}
<Route path="autopost-regional" element={<RegionalDashboard />} />
<Route path="autopost-regional/fontes" element={<RegionalSources />} />
<Route path="autopost-regional/fontes/:id/edit" element={<RegionalSourceEdit />} />
<Route path="autopost-regional/fila" element={<RegionalQueue />} />
<Route path="autopost-regional/logs" element={<RegionalLogs />} />
```

---

## 7. Menu Lateral

O item já está correto em `contentItems`:
- Título: "Auto Post Regional"
- URL: `/admin/autopost-regional`
- Badge: "Grande Cotia"

---

## 8. Fluxo de Operação

```text
[Cron 2h] → regional-ingest
              ↓
         Para cada fonte ativa:
              ↓
         RSS? → Parse XML
         Listing? → Fetch HTML + Extract
              ↓
         Dedupe por canonical_url
              ↓
         Inserir regional_ingest_items (status: new)
              ↓
         Criar regional_ingest_runs
              ↓
[Manual ou Auto] → regional-process-item
              ↓
         Buscar conteúdo completo
              ↓
         Reescrever + SEO
              ↓
         Gerar imagem IA (sem texto)
              ↓
         mode=auto_publish? → Publicar em news
         mode=review? → Aguardar aprovação
```

---

## 9. Arquivos a Criar/Modificar

### Novos Arquivos

```text
supabase/migrations/xxx_regional_autopost_tables.sql
supabase/functions/regional-ingest/index.ts
supabase/functions/regional-process-item/index.ts
supabase/functions/regional-admin-tools/index.ts
src/hooks/useRegionalAutoPost.ts
src/pages/admin/autopost-regional/RegionalDashboard.tsx
src/pages/admin/autopost-regional/RegionalSources.tsx
src/pages/admin/autopost-regional/RegionalSourceEdit.tsx
src/pages/admin/autopost-regional/RegionalQueue.tsx
src/pages/admin/autopost-regional/RegionalLogs.tsx
```

### Arquivos a Modificar

```text
src/App.tsx - adicionar rotas
src/types/profiles-modules.ts - corrigir href
supabase/config.toml - adicionar edge functions
```

### Arquivo a Remover/Substituir

```text
src/pages/admin/autopost/AutoPostRegional.tsx - substituir por redirect para nova rota
```

---

## 10. Detalhes Técnicos

### Extração de Listing (Auto-detect)

Padrões a buscar:
- Links contendo: /noticia/, /noticias/, /portal/noticias, /news/
- Dentro de containers: article, .news-item, .noticia, .card
- Com títulos em h2, h3, .title, .titulo

Seletores padrão iniciais:
```json
{
  "item_container": "article, .news-item, .noticia",
  "item_link": "a[href*='noticia']",
  "item_title": "h2, h3, .title",
  "item_date": "time, .date, .data"
}
```

### Tags Padrão (12 tags)

Para cada fonte, gerar automaticamente:
1. Nome da cidade
2. "regional"
3. "grande cotia"
4. "prefeitura"
5. "governo municipal"
6. "serviço público"
7. "administração"
8. "região oeste"
9. "são paulo"
10. "interior"
11. Categoria inferida do conteúdo
12. Tema principal da notícia

### Integração com News

Ao publicar, criar registro em `news` com:
- title: rewritten_title
- content: rewritten_content
- source: canonical_url
- category_id: mapeamento ou "Geral"
- tags: 12 tags definidas
- featured_image_url: generated_image_url
- meta_title, meta_description, og_image_url
- status: 'published'
- author_id: usuário do sistema

---

## Checklist de Validação Final

1. Clicar em "Auto Post Regional" abre /admin/autopost-regional (NÃO /admin/autopost)
2. Tela de fontes mostra as 13 fontes pré-cadastradas
3. "Testar" em Itapevi retorna itens do RSS
4. "Testar" em São Roque retorna itens da listagem
5. Rodar ingest cria itens com dedupe por canonical_url
6. Processar item cria draft, reescreve, aplica SEO, gera imagem
