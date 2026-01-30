
# Plano: Corrigir Edge Function generate-webstory

## Diagnóstico Completo

### Problema Identificado
A edge function `generate-webstory` está falhando com erro 500 porque usa nomes de colunas incorretos que não existem no banco de dados.

### Erros Encontrados

| # | Código Atual | Código Correto | Tabela Afetada |
|---|--------------|----------------|----------------|
| 1 | `category: categoryName` | Remover campo | `web_stories` |
| 2 | `background_url` | `background_image_url` | `web_story_slides` |
| 3 | `slide_order` | `sort_order` | `web_story_slides` |

### Teste Realizado
```
POST /generate-webstory {"newsId": "8f252d07-..."}
→ 500 Error: "Could not find the 'category' column of 'web_stories'"
```

---

## Correções Necessárias

### Arquivo: `supabase/functions/generate-webstory/index.ts`

**Correção 1 - Remover campo `category` do insert de web_stories (linha 72-85)**:
```typescript
// ANTES
const { data: story, error: storyError } = await supabase
  .from('web_stories')
  .insert({
    title: news.title,
    slug: storySlug,
    cover_image_url: news.featured_image_url,
    status: 'published',
    news_id: newsId,
    category: categoryName,  // ❌ COLUNA NÃO EXISTE
    published_at: new Date().toISOString(),
  })
  
// DEPOIS
const { data: story, error: storyError } = await supabase
  .from('web_stories')
  .insert({
    title: news.title,
    slug: storySlug,
    cover_image_url: news.featured_image_url,
    status: 'published',
    news_id: newsId,
    published_at: new Date().toISOString(),
  })
```

**Correção 2 - Corrigir campos dos slides (linha 98-141)**:
```typescript
// ANTES
{
  story_id: story.id,
  slide_order: 0,           // ❌ CAMPO ERRADO
  background_url: news.featured_image_url,  // ❌ CAMPO ERRADO
  headline_text: news.title,
  subheadline_text: categoryName.toUpperCase(),
}

// DEPOIS
{
  story_id: story.id,
  sort_order: 0,           // ✅ CORRETO
  background_image_url: news.featured_image_url,  // ✅ CORRETO
  headline_text: news.title,
  subheadline_text: categoryName.toUpperCase(),
}
```

Aplicar a mesma correção em todos os 5 slides.

---

## Correção Adicional no Hook

### Arquivo: `src/hooks/useWebStories.ts`

Ajustar a ordenação que usa `slide_order` (inexistente) para `sort_order`:

**Linha 75**:
```typescript
// ANTES
.order("slide_order", { ascending: true })

// DEPOIS  
.order("sort_order", { ascending: true })
```

**Linha 96**:
```typescript
// ANTES
.order("slide_order", { ascending: true })

// DEPOIS
.order("sort_order", { ascending: true })
```

---

## Resumo de Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `supabase/functions/generate-webstory/index.ts` | Remover `category`, corrigir `sort_order` e `background_image_url` |
| `src/hooks/useWebStories.ts` | Corrigir ordenação para `sort_order` |

---

## Resultado Esperado

Após as correções:
1. Edge function `generate-webstory` funcionará sem erros
2. WebStories serão criadas automaticamente para novas notícias
3. Os 5 slides padrão serão inseridos corretamente
4. Stories aparecerão na página inicial e na listagem
