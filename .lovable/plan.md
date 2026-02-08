
# Views Agregadas + Destaques por Bairro

## Resumo

Criar 3 views SQL para mover agregacoes pesadas do frontend para o banco de dados, e adicionar uma nova secao de "Destaques territoriais" no Relatorio Semanal e na pagina de analitica por materia.

---

## Parte 1 -- Migration SQL (3 views)

Criar uma unica migration com as 3 views:

### `vw_news_clicks_aggregated_30d`
- Agrupa `news_clicks` por `news_id`, `src`, `ref_code`
- Filtra `clicked_at >= now() - interval '30 days'`
- Retorna `click_count` (COUNT)

### `vw_news_clicks_by_news_30d`
- Agrupa apenas por `news_id`
- Filtra ultimos 30 dias
- Retorna `total_clicks`

### `vw_news_clicks_by_neighborhood_30d`
- JOIN entre `news_clicks` e `community_members` via `ref_code`
- Filtra ultimos 30 dias e `neighborhood IS NOT NULL`
- Agrupa por `neighborhood`, `city`
- Retorna `total_clicks` e `unique_refs` (COUNT DISTINCT ref_code)

Todas sao views simples (nao materializadas), de leitura, sem alterar dados nem RLS.

---

## Parte 2 -- Atualizar `WeeklyReport.tsx`

### Substituir query principal
- Trocar a query direta em `news_clicks` pela view `vw_news_clicks_aggregated_30d`
- Derivar `srcCounts`, `refCounts`, `totalClicks` e `uniqueRefs` a partir dos dados pre-agregados (somando `click_count`)
- Usar `vw_news_clicks_by_news_30d` para o bloco "Top materias"
- A UI permanece identica; apenas a fonte de dados muda

### Novo bloco: "Destaques territoriais"
- Nova query em `vw_news_clicks_by_neighborhood_30d` (top 5 por `total_clicks`)
- Card com titulo "Destaques territoriais"
- Exibe: Bairro, Cidade (se diferente de "Cotia"), Total de acessos, Contribuicoes unicas
- Secao oculta se nao houver dados
- Incluir dados territoriais no texto do "Copiar resumo"

---

## Parte 3 -- Atualizar `NewsAnalytics.tsx`

### Substituir query de cliques
- Usar `vw_news_clicks_aggregated_30d` filtrada por `news_id` em vez de buscar linhas individuais

### Novo bloco: Top 3 bairros
- Query em `vw_news_clicks_by_neighborhood_30d` filtrada por `news_id` (via join interno da view, sera feita com query direta usando as mesmas tabelas ja que a view nao tem `news_id`)
- Alternativa: criar query inline que replica a logica da view territorial mas filtrando por `news_id`
- Card com top 3 bairros, oculto se sem dados

---

## Parte 4 -- Atualizar `useMemberCirculation.ts`

- Substituir query direta em `news_clicks` pela view `vw_news_clicks_aggregated_30d` filtrada por `ref_code`
- Manter comportamento identico

---

## Detalhes Tecnicos

### Migration SQL

```sql
-- View 1: Agregada por news_id + src + ref_code (30 dias)
CREATE OR REPLACE VIEW public.vw_news_clicks_aggregated_30d AS
SELECT
  news_id,
  src,
  ref_code,
  COUNT(*)::int AS click_count
FROM public.news_clicks
WHERE clicked_at >= now() - interval '30 days'
GROUP BY news_id, src, ref_code;

-- View 2: Total por materia (30 dias)
CREATE OR REPLACE VIEW public.vw_news_clicks_by_news_30d AS
SELECT
  news_id,
  COUNT(*)::int AS total_clicks
FROM public.news_clicks
WHERE clicked_at >= now() - interval '30 days'
GROUP BY news_id;

-- View 3: Territorial (30 dias)
CREATE OR REPLACE VIEW public.vw_news_clicks_by_neighborhood_30d AS
SELECT
  cm.neighborhood,
  cm.city,
  COUNT(*)::int AS total_clicks,
  COUNT(DISTINCT nc.ref_code)::int AS unique_refs
FROM public.news_clicks nc
JOIN public.community_members cm ON cm.ref_code = nc.ref_code
WHERE nc.clicked_at >= now() - interval '30 days'
  AND cm.neighborhood IS NOT NULL
GROUP BY cm.neighborhood, cm.city;
```

### Queries no Frontend

As views serao acessadas via `supabase.from('vw_news_clicks_...' as any).select(...)`. Os tipos continuam com cast explicito para manter consistencia com o padrao existente.

### Para NewsAnalytics (top bairros por materia)

Como a view territorial nao inclui `news_id`, sera usada uma query direta:

```typescript
const { data } = await supabase
  .from('news_clicks' as any)
  .select('ref_code')
  .eq('news_id', id)
  .gte('clicked_at', since.toISOString());
// Depois faz join local com community_members para obter neighborhood
```

Alternativa mais limpa: criar uma 4a view `vw_news_clicks_by_neighborhood_news_30d` que inclui `news_id` no agrupamento. Isso evita join no frontend.

### Decisao: Criar view adicional com `news_id`

```sql
CREATE OR REPLACE VIEW public.vw_news_clicks_by_neighborhood_news_30d AS
SELECT
  nc.news_id,
  cm.neighborhood,
  cm.city,
  COUNT(*)::int AS total_clicks,
  COUNT(DISTINCT nc.ref_code)::int AS unique_refs
FROM public.news_clicks nc
JOIN public.community_members cm ON cm.ref_code = nc.ref_code
WHERE nc.clicked_at >= now() - interval '30 days'
  AND cm.neighborhood IS NOT NULL
GROUP BY nc.news_id, cm.neighborhood, cm.city;
```

---

## Arquivos Modificados

| Arquivo | Acao |
|---|---|
| Migration SQL | Criar 4 views |
| `src/pages/admin/WeeklyReport.tsx` | Usar views + novo bloco territorial |
| `src/pages/admin/NewsAnalytics.tsx` | Usar views + top 3 bairros |
| `src/hooks/useMemberCirculation.ts` | Usar view agregada |

## Nenhuma alteracao em

- Tabelas existentes
- Politicas RLS
- Arquitetura do projeto
- `circulationUtils.ts`
- `NewsDetail.tsx` (tracking)
