

# Corrigir Datas das Notícias: Usar Data Original da Fonte

## Problema Identificado

Ao publicar notícias automaticamente, o sistema está usando `new Date().toISOString()` (data/hora atual) em vez da data real da matéria original.

### Evidência do Problema

| Notícia | `published_at` no Ingest | `published_at` no News | Erro |
|---------|--------------------------|------------------------|------|
| "Prefeitura de Embu..." | 22/01/2026 (da fonte) | **30/01/2026 23:41** | Errado! |
| "CMDCA Osasco..." | 26/01/2026 (da fonte) | **30/01/2026 22:41** | Errado! |

### Causa Raiz

No arquivo `supabase/functions/regional-process-item/index.ts`, linha 412:

```typescript
published_at: new Date().toISOString(),  // ❌ ERRADO
```

A variável `item.published_at` (que contém a data correta extraída do RSS/fonte) está sendo ignorada.

---

## Solução

### Parte 1: Corrigir o Processamento de Novas Notícias

**Arquivo:** `supabase/functions/regional-process-item/index.ts`

Alterar a linha 412 para usar a data original do item:

```typescript
// ANTES (errado)
published_at: new Date().toISOString(),

// DEPOIS (correto)
published_at: item.published_at || new Date().toISOString(),
```

Também adicionar `original_published_at` para rastreabilidade:

```typescript
{
  // ... outros campos
  published_at: item.published_at || new Date().toISOString(),
  original_published_at: item.published_at || null,
  // ...
}
```

---

### Parte 2: Corrigir Notícias Já Publicadas

**Arquivo:** `supabase/functions/fix-publication-dates/index.ts`

Atualizar a Edge Function existente para:

1. Buscar notícias onde `published_at ≈ created_at` (indicando que usou data errada)
2. Extrair a data real via Firecrawl (já implementado)
3. Atualizar `published_at` e `original_published_at`

Alterar os filtros de data (atualmente fixos em `2026-01-30`) para parâmetros dinâmicos:

```typescript
// ANTES (fixo)
const startDate = '2026-01-30T00:00:00Z';
const endDate = '2026-01-30T23:59:59Z';

// DEPOIS (dinâmico - últimos N dias)
const { dryRun = true, limit = 10, daysBack = 7 } = await req.json();

const endDate = new Date().toISOString();
const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
```

Adicionar filtro inteligente para identificar datas erradas:

```typescript
// Buscar onde published_at está muito próximo de created_at
// (indica que usou new Date() em vez da data da fonte)
.or('original_published_at.is.null')
```

---

## Resumo das Alterações

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `supabase/functions/regional-process-item/index.ts` | Modificar | Usar `item.published_at` em vez de `new Date()` |
| `supabase/functions/fix-publication-dates/index.ts` | Modificar | Tornar datas dinâmicas + filtro inteligente |

---

## Detalhes Técnicos

### Mudança 1: `regional-process-item/index.ts` (linha ~396-416)

```typescript
const { data: newsEntry, error: newsError } = await supabase
  .from('news')
  .insert({
    title: rewritten.title,
    slug: slug,
    content: rewritten.content,
    excerpt: rewritten.summary || extractText(rewritten.content).substring(0, 160),
    featured_image_url: generatedImageUrl || images[0] || item.image_url,
    og_image_url: generatedImageUrl || images[0] || item.image_url,
    card_image_url: generatedImageUrl || images[0] || item.image_url,
    image_alt: `Imagem ilustrativa: ${source.city}`,
    image_credit: 'IA | Conexão na Cidade',
    meta_title: rewritten.metaTitle,
    meta_description: rewritten.metaDescription,
    source: item.canonical_url,
    status: 'published',
    published_at: item.published_at || new Date().toISOString(),  // ✅ CORRIGIDO
    original_published_at: item.published_at || null,              // ✅ NOVO
    origin: 'autopost',
    category_id: categoryId,
  })
```

### Mudança 2: `fix-publication-dates/index.ts` (linhas ~164-186)

```typescript
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      dryRun = true, 
      limit = 50, 
      daysBack = 30,       // Processar últimos 30 dias
      onlyMissing = true   // Só notícias sem original_published_at
    } = await req.json().catch(() => ({}));
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calcular período dinamicamente
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

    console.log(`Fetching news from ${startDate} to ${endDate}`);

    let query = supabase
      .from('news')
      .select('id, title, source, published_at, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .not('source', 'is', null);

    // Filtrar apenas notícias sem data original (as que precisam correção)
    if (onlyMissing) {
      query = query.is('original_published_at', null);
    }

    const { data: newsItems, error: fetchError } = await query.limit(limit);
    // ... resto do código
```

---

## Resultado Esperado

### Antes (Problema)
| Título | Fonte | Data Exibida |
|--------|-------|--------------|
| "Cesta básica do servidor..." | 14/01/2026 (original) | 30/01/2026 (errado) |
| "Feira de Verão no Parque..." | 20/01/2026 (original) | 30/01/2026 (errado) |

### Depois (Corrigido)
| Título | Fonte | Data Exibida |
|--------|-------|--------------|
| "Cesta básica do servidor..." | 14/01/2026 (original) | **14/01/2026** ✅ |
| "Feira de Verão no Parque..." | 20/01/2026 (original) | **20/01/2026** ✅ |

