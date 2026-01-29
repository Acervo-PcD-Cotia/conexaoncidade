
# Plano: Modulo Brasileirao Completo (Sem API Paga)

## Resumo Executivo

Este plano implementa um modulo completo do Brasileirao Serie A/B **sem custos de API**, utilizando:
- **CBF (site oficial)** como fonte primaria de tabela e jogos
- **GE + oGol (RSS)** como fontes de noticias
- **Lovable AI** para geracao automatica de noticias SEO
- **Funcao "Onde Assistir"** para TV aberta, fechada e streaming
- **Sistema resiliente** com cache, rate limit, backoff e fallback

---

## Diagnostico Atual

### Infraestrutura Existente (aproveitavel):
- Tabelas: `football_teams`, `football_matches`, `football_standings`, `football_competitions`, `football_player_stats`, `football_match_events`, `football_head_to_head`
- Edge Function: `football-api` (usa RAPIDAPI_KEY - API paga)
- Edge Function: `rss-parser` (parser RSS generico - reaproveitavel)
- Hooks: `useFootball.ts` com queries completas
- UI publica: `BrasileiraoPage.tsx`, `SerieDetailPage.tsx`, `MatchDetailPage.tsx`
- UI admin: `EsportesDashboard.tsx`, `EsportesConfig.tsx`, `BrasileiraoHome.tsx`

### O que falta:
- Novas tabelas para fontes, noticias RSS, noticias geradas, transmissoes e logs
- Edge functions para scraping CBF e ingestao RSS
- Edge function para geracao de noticias com IA
- Edge function para transmissoes (onde assistir)
- Painel admin de controle e monitoramento
- Secao "Noticias" e "Onde Assistir" na UI publica

---

## FASE 1: Banco de Dados (Novas Tabelas)

### 1.1 Tabela: br_sources

Controla fontes de dados com cache e estado.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| key | TEXT PK | Ex: `cbf_standings`, `ge_rss`, `ogol_rss` |
| name | TEXT | Nome amigavel |
| url | TEXT | URL da fonte |
| kind | TEXT | `rss`, `html` |
| last_etag | TEXT | ETag para cache HTTP |
| last_modified | TEXT | Last-Modified header |
| last_success_at | TIMESTAMPTZ | Ultimo sucesso |
| last_error | TEXT | Ultima mensagem de erro |
| error_count | INT | Contador de falhas consecutivas |
| is_enabled | BOOL | Fonte ativa? |
| scrape_interval_minutes | INT | Intervalo entre sincronizacoes |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 1.2 Tabela: br_news_items

Noticias externas capturadas via RSS (apenas metadados).

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID PK | |
| source_key | TEXT FK | Referencia br_sources |
| title | TEXT | Titulo |
| url | TEXT UNIQUE | Link original (dedup key) |
| excerpt | TEXT | Trecho/descricao |
| image_url | TEXT | Imagem destacada |
| published_at | TIMESTAMPTZ | Data de publicacao |
| author | TEXT | Autor (se disponivel) |
| created_at | TIMESTAMPTZ | |

### 1.3 Tabela: br_generated_news

Conteudo original gerado pelo portal.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID PK | |
| slug | TEXT UNIQUE | URL amigavel |
| title | TEXT | Titulo |
| content | TEXT | Conteudo HTML |
| seo_title | TEXT | Titulo SEO (≤60 chars) |
| seo_description | TEXT | Descricao SEO (≤160 chars) |
| related_match_id | UUID FK | Jogo relacionado |
| related_round | INT | Rodada relacionada |
| news_type | TEXT | `round_recap`, `standings_change`, `where_to_watch`, `preview` |
| status | TEXT | `draft`, `published` |
| published_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 1.4 Tabela: br_broadcasts

Onde assistir (transmissoes).

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID PK | |
| match_id | UUID FK UNIQUE | Referencia football_matches |
| tv_open | TEXT[] | Globo, Band, Record |
| tv_closed | TEXT[] | SporTV, Premiere, ESPN |
| streaming | TEXT[] | Globoplay, Prime Video, Star+ |
| updated_from | TEXT | Fonte: `ge`, `cbf`, `manual` |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 1.5 Tabela: br_fetch_logs

Logs de sincronizacao.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID PK | |
| source_key | TEXT | Fonte |
| success | BOOL | Sucesso? |
| message | TEXT | Detalhes |
| items_processed | INT | Itens processados |
| duration_ms | INT | Tempo de execucao |
| fetched_at | TIMESTAMPTZ | |

### 1.6 Tabela: br_rate_state

Controle de rate limit e circuit breaker.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| source_key | TEXT PK | |
| tokens | REAL | Tokens disponiveis (token bucket) |
| last_refill | TIMESTAMPTZ | Ultima recarga de tokens |
| circuit_open | BOOL | Circuit breaker aberto? |
| circuit_open_until | TIMESTAMPTZ | Quando reabrir |

---

## FASE 2: Edge Functions (Sincronizacao)

### 2.1 br-sync-cbf

Scraping do site oficial da CBF para tabela e jogos.

**Fonte:** `https://www.cbf.com.br/futebol-brasileiro/competicoes/campeonato-brasileiro-serie-a/2026`

**Logica:**
1. Verificar rate limit e circuit breaker
2. Fetch HTML com User-Agent realista
3. Parse tabela de classificacao
4. Parse calendario de jogos
5. Normalizar nomes e gerar slugs
6. Upsert em `football_teams`
7. Upsert em `football_standings`
8. Upsert em `football_matches`
9. Registrar log em `br_fetch_logs`
10. Atualizar estado em `br_sources`

**Resiliencia:**
- Max 2 tentativas com backoff exponencial (1.5s, 4s)
- Circuit breaker abre apos 5 falhas consecutivas
- Nunca apagar dados existentes se falhar
- Cache HTTP com ETag/If-Modified-Since

### 2.2 br-sync-news-rss

Ingestao de noticias via RSS (GE + oGol).

**Fontes:**
- GE Brasileirao: `https://ge.globo.com/rss/futebol/brasileirao-serie-a/`
- oGol: Feed RSS do oGol

**Logica:**
1. Usar `rss-parser` existente
2. Deduplicar por URL
3. Salvar metadados em `br_news_items`
4. Respeitar ETag/Last-Modified

### 2.3 br-sync-broadcasts

Informacoes de transmissao (onde assistir).

**Fontes:**
- Parse de paginas de jogos do GE
- Dados manuais via admin

**Logica:**
1. Para cada jogo sem transmissao definida
2. Tentar extrair info do GE
3. Fallback: usar padroes (ex: jogos sab 21h = Globo)
4. Salvar em `br_broadcasts`

### 2.4 br-generate-news-ai

Geracao automatica de noticias usando Lovable AI.

**Gatilhos:**
- Rodada finalizada
- Mudanca significativa no G4/Z4
- Classico se aproximando (24h antes)
- Goleada (diferenca ≥4 gols)

**Tipos de noticia:**
1. `round_recap`: "Rodada 12 termina com mudanca no G4"
2. `standings_change`: "Tabela atualizada: [Time] sobe para [posicao]"
3. `where_to_watch`: "Onde assistir [Time A] x [Time B] ao vivo"
4. `preview`: "Classico [Time A] x [Time B]: o que esperar"

**Output:**
- Titulo (≤60 chars)
- Conteudo (300-500 palavras)
- SEO Title
- SEO Description (≤160 chars)
- Slug unico

**Modelo:** `google/gemini-2.5-flash` (Lovable AI - sem custo)

---

## FASE 3: Painel Admin

### 3.1 Dashboard de Controle

**Rota:** `/admin/esportes/brasileirao/sync`

**Componentes:**
1. **Status das Fontes**
   - Cards para cada fonte (CBF, GE, oGol)
   - Indicador: online/offline/erro
   - Ultima atualizacao
   - Proximo agendamento

2. **Metricas**
   - Noticias capturadas hoje
   - Noticias geradas hoje
   - Jogos sincronizados
   - Transmissoes definidas

3. **Botoes de Acao**
   - Sync Tabela (CBF)
   - Sync Jogos (CBF)
   - Sync Noticias (RSS)
   - Gerar Noticias (IA)
   - Sync Transmissoes

4. **Logs Recentes**
   - Lista das ultimas 20 sincronizacoes
   - Filtro por fonte
   - Indicador sucesso/erro

### 3.2 Editor de Transmissoes

**Rota:** `/admin/esportes/brasileirao/transmissoes`

**Funcionalidades:**
- Lista de jogos da rodada atual
- Edicao manual de TV/streaming
- Preview de como aparece no site

### 3.3 Gerenciador de Noticias Geradas

**Rota:** `/admin/esportes/brasileirao/noticias`

**Funcionalidades:**
- Lista de noticias geradas
- Edicao de titulo/conteudo
- Publicar/despublicar
- Regenerar com IA

---

## FASE 4: UI Publica

### 4.1 Secao Noticias no BrasileiraoPage

**Novo componente:** `BrasileiraoNewsSection.tsx`

- Abas: "Noticias Portal" | "GE" | "oGol"
- Cards de noticia com imagem, titulo, data
- Links externos para RSS
- Conteudo proprio para geradas

### 4.2 Secao Onde Assistir

**Novo componente:** `WhereToWatchSection.tsx`

- Lista por rodada
- Badges: Globo, SporTV, Premiere, etc
- Destaque para proximo jogo
- Schema.org SportsEvent com broadcast

**SEO Target:** "onde assistir [time] x [time] hoje"

### 4.3 Pagina de Jogo com Transmissao

**Atualizar:** `MatchDetailPage.tsx`

- Card "Onde Assistir" no topo
- Lista de canais/streaming
- Links para programacao

### 4.4 Landing Brasileirao Atualizada

**Atualizar:** `BrasileiraoPage.tsx`

Nova estrutura com abas:
1. **Tabela** - Classificacao atualizada
2. **Jogos** - Proximos/Ultimos
3. **Noticias** - GE + oGol + Portal
4. **Onde Assistir** - Por rodada

---

## Arquivos a Criar

### Edge Functions (6 arquivos):
```text
supabase/functions/br-sync-cbf/index.ts
supabase/functions/br-sync-news-rss/index.ts
supabase/functions/br-sync-broadcasts/index.ts
supabase/functions/br-generate-news-ai/index.ts
supabase/functions/br-cron-orchestrator/index.ts (opcional)
```

### Componentes React (5 arquivos):
```text
src/components/esportes/BrasileiraoNewsSection.tsx
src/components/esportes/WhereToWatchSection.tsx
src/components/esportes/WhereToWatchCard.tsx
src/components/esportes/ExternalNewsCard.tsx
src/components/esportes/GeneratedNewsCard.tsx
```

### Paginas Admin (3 arquivos):
```text
src/pages/admin/esportes/BrasileiraoSync.tsx
src/pages/admin/esportes/BrasileiraoBroadcasts.tsx
src/pages/admin/esportes/BrasileiraoNews.tsx
```

### Hooks (1 arquivo):
```text
src/hooks/useBrasileiraoNews.ts
```

---

## Arquivos a Modificar

1. `src/pages/public/esportes/BrasileiraoPage.tsx` - Adicionar abas e secoes
2. `src/pages/public/esportes/MatchDetailPage.tsx` - Card onde assistir
3. `src/pages/admin/esportes/EsportesDashboard.tsx` - Links para sync
4. `src/App.tsx` - Novas rotas admin
5. `supabase/config.toml` - Novas edge functions

---

## Cronograma de Sincronizacao

| Fonte | Intervalo | Horario Ativo |
|-------|-----------|---------------|
| CBF Tabela | 2 horas | 06:00-00:00 |
| CBF Jogos | 1 hora | 06:00-00:00 |
| RSS GE | 15 minutos | 24/7 |
| RSS oGol | 30 minutos | 24/7 |
| Transmissoes | 1 hora | 06:00-00:00 |
| Geracao IA | Sob demanda | Apos sync |

**Nota:** Frequencia aumenta em dia de rodada.

---

## Ordem de Execucao

### Dia 1: Banco de Dados
1. Criar tabelas br_sources, br_news_items, br_generated_news
2. Criar tabelas br_broadcasts, br_fetch_logs, br_rate_state
3. Inserir dados iniciais em br_sources
4. Configurar RLS

### Dia 2: Edge Functions Core
5. Implementar br-sync-cbf (tabela + jogos)
6. Implementar br-sync-news-rss
7. Testar e ajustar parsers

### Dia 3: Edge Functions Avancadas
8. Implementar br-sync-broadcasts
9. Implementar br-generate-news-ai
10. Testar fluxo completo

### Dia 4: Admin UI
11. Criar BrasileiraoSync.tsx (dashboard controle)
12. Criar BrasileiraoBroadcasts.tsx (editor)
13. Criar BrasileiraoNews.tsx (gerenciador)

### Dia 5: Public UI
14. Criar componentes de noticias
15. Criar componentes onde assistir
16. Atualizar BrasileiraoPage com abas
17. Atualizar MatchDetailPage

### Dia 6: Polish
18. SEO e Schema.org
19. Testes E2E
20. Documentacao

---

## Secao Tecnica

### Parsing CBF (Estrategia)

A CBF usa um site relativamente estatico. O scraping envolve:

```typescript
// Pseudo-codigo para parse da tabela
const html = await fetch(CBF_URL).then(r => r.text());

// Regex ou DOM parsing para extrair tabela
const rows = html.match(/<tr class="tabela-corpo-linha">(.*?)<\/tr>/gs);

for (const row of rows) {
  const position = extractCell(row, 0);
  const team = extractCell(row, 1);
  const points = extractCell(row, 2);
  // ... etc
}
```

### Rate Limiting (Token Bucket)

```typescript
const BUCKET_SIZE = 10;
const REFILL_RATE = 1; // token por minuto

async function canFetch(sourceKey: string): Promise<boolean> {
  const state = await getState(sourceKey);
  
  // Refill tokens
  const elapsed = Date.now() - state.last_refill;
  const refill = Math.floor(elapsed / 60000) * REFILL_RATE;
  state.tokens = Math.min(BUCKET_SIZE, state.tokens + refill);
  
  if (state.tokens < 1) return false;
  
  state.tokens -= 1;
  await saveState(state);
  return true;
}
```

### Geracao de Noticias (Lovable AI)

```typescript
const response = await fetch("https://api.lovable.ai/v1/chat", {
  method: "POST",
  headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}` },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",
    messages: [{
      role: "user",
      content: `Escreva uma noticia sobre o fim da rodada ${round} do Brasileirao.
      
      Resultados:
      ${matchResults}
      
      Mudancas na tabela:
      ${standingsChanges}
      
      Formato: JSON com title, content, seo_title, seo_description`
    }]
  })
});
```

---

## Criterios de Aceite

| # | Criterio | Prioridade |
|---|----------|------------|
| 1 | Tabela sincroniza automaticamente da CBF | Alta |
| 2 | Jogos sincronizam com placar em tempo real | Alta |
| 3 | Noticias RSS aparecem na UI publica | Alta |
| 4 | Onde assistir mostra canais por jogo | Alta |
| 5 | Geracao de noticias funciona com IA | Media |
| 6 | Admin controla sincronizacao manual | Alta |
| 7 | Logs mostram status de cada fonte | Media |
| 8 | Circuit breaker protege contra falhas | Media |
| 9 | SEO otimizado para buscas | Media |
| 10 | Zero custo de API externa | Alta |

---

## Resultado Esperado

### Buscas Alvo no Google:
- "tabela do brasileirao 2026"
- "jogos do brasileirao hoje"
- "onde assistir flamengo x corinthians"
- "classificacao serie a atualizada"
- "rodada do brasileirao resultados"

### Metricas de Sucesso:
- Atualizacao a cada 1-2 horas automatica
- Noticias geradas diariamente
- Transmissoes definidas para 90%+ dos jogos
- Zero erro de sincronizacao por semana
