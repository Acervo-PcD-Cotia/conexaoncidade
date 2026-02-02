
# Corrigir Datas de 83 Notícias de 30/01/2026

## Situação Atual

| Métrica | Valor |
|---------|-------|
| Notícias com data 30/01/2026 | **83** |
| Todas sem `original_published_at` | ✅ Sim |
| Têm link de fonte válido | ✅ Sim |

## Solução

A Edge Function `fix-publication-dates` já está configurada e pronta. Precisa apenas ser executada com os parâmetros corretos.

### Estratégia de Execução

Devido ao limite de rate do Firecrawl (delay de 1.5s entre requests), vou executar em **lotes de 20** para evitar timeout:

| Lote | Notícias | Tempo Estimado |
|------|----------|----------------|
| 1º | 20 | ~40 segundos |
| 2º | 20 | ~40 segundos |
| 3º | 20 | ~40 segundos |
| 4º | 20 | ~40 segundos |
| 5º | 3 | ~10 segundos |

### Comando para Executar

```json
{
  "dryRun": false,
  "limit": 20,
  "daysBack": 5,
  "onlyMissing": true
}
```

Parâmetros:
- `dryRun: false` - Aplica as correções de fato
- `limit: 20` - Processa 20 notícias por vez (evita timeout)
- `daysBack: 5` - Busca notícias criadas nos últimos 5 dias (inclui 30/01)
- `onlyMissing: true` - Só processa notícias sem `original_published_at`

## Alterações Necessárias

### Opção A: Executar a Edge Function Existente

Chamar a função `fix-publication-dates` via curl/invoke **5 vezes** até processar todas as 83 notícias.

### Opção B: Adicionar Filtro por Data Específica (Recomendado)

Melhorar a Edge Function para aceitar um parâmetro `targetDate` que filtra notícias com `published_at` em uma data específica:

**Arquivo:** `supabase/functions/fix-publication-dates/index.ts`

Adicionar parâmetro opcional:
```typescript
const { 
  dryRun = true, 
  limit = 50, 
  daysBack = 30,
  onlyMissing = true,
  targetDate = null  // Nova opção: filtrar por data específica
} = await req.json().catch(() => ({}));

// Se targetDate fornecido, filtrar por essa data específica
if (targetDate) {
  query = query
    .gte('published_at', `${targetDate}T00:00:00Z`)
    .lt('published_at', `${targetDate}T23:59:59Z`);
}
```

Isso permite chamar:
```json
{
  "dryRun": false,
  "limit": 25,
  "targetDate": "2026-01-30",
  "onlyMissing": true
}
```

---

## Resumo das Alterações

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `supabase/functions/fix-publication-dates/index.ts` | Modificar | Adicionar filtro `targetDate` para processar data específica |

## Resultado Esperado

Após executar (4 chamadas de 25 notícias cada):

| Antes | Depois |
|-------|--------|
| 83 notícias com data 30/01/2026 | 0 notícias com data errada |
| Datas de ingestão | **Datas originais das fontes** |

### Exemplo de Correção

| Título | Antes | Depois |
|--------|-------|--------|
| "Cesta básica do servidor..." | 30/01/2026 | **14/01/2026** |
| "Cine Inclusão Embu..." | 30/01/2026 | **27/01/2026** |
| "Encontro de carros..." | 30/01/2026 | **28/01/2026** |
