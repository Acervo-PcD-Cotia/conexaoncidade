

# Plano de Implementação: Correção de Datas, Exclusão em Massa de WebStories e Cidade | Categoria no Dashboard

## Resumo do que precisa ser feito

1. **Corrigir datas de publicação** das 60 notícias publicadas em 30/01/2026 — usar a data original da fonte
2. **Criar função excluir em massa** para WebStories (similar ao que já existe em NewsList)
3. **Aplicar lógica "Cidade | Categoria"** no Dashboard e lista de notícias admin

---

## Parte 1: Correção de Datas de Publicação

### Problema Identificado
- As notícias publicadas em 30/01/2026 estão usando a data do momento da publicação no sistema
- A data original da fonte (ex: 27/01/2026 no caso de São Roque) está sendo perdida
- Existem **60 notícias** afetadas

### Solução Proposta
Criar uma edge function que:
1. Busca todas as notícias de 30/01/2026 que têm URL de fonte válida
2. Acessa cada fonte via Firecrawl para extrair a data original
3. Atualiza o campo `published_at` com a data correta

### Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `supabase/functions/fix-publication-dates/index.ts` | Criar | Edge function para correção das datas |
| Migração SQL | Criar | Adicionar coluna `original_published_at` na tabela `news` para preservar data original |

### Fluxo da Edge Function

```text
1. Buscar notícias de 30/01/2026 com campo `source` preenchido
2. Para cada notícia:
   a. Acessar URL da fonte (usar Firecrawl com formato markdown)
   b. Extrair data do padrão "DD MMM YYYY" (ex: "27 JAN 2026")
   c. Atualizar `published_at` com a data extraída
3. Retornar relatório com sucesso/falhas
```

### Migração do Banco de Dados

Adicionar coluna para preservar a data original da fonte:

```sql
ALTER TABLE news ADD COLUMN IF NOT EXISTS original_published_at TIMESTAMPTZ;
```

---

## Parte 2: Exclusão em Massa de WebStories

### Situação Atual
- **NewsList** já tem exclusão em massa implementada
- **StoriesList** só tem exclusão individual

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/admin/StoriesList.tsx` | Adicionar checkbox, seleção múltipla e botão de exclusão em massa |

### Componentes a Adicionar

1. **Estado de seleção**: `useState<Set<string>>`
2. **Checkbox no cabeçalho**: Selecionar/desselecionar todos
3. **Checkbox por linha**: Seleção individual
4. **Barra de ações em massa**: Exibida quando há seleção
5. **Mutation de exclusão em massa**: Similar ao padrão de NewsList

### Exemplo de Código (baseado no NewsList)

```typescript
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

const bulkDeleteMutation = useMutation({
  mutationFn: async (ids: string[]) => {
    // Deletar slides primeiro (foreign key)
    for (const id of ids) {
      await supabase.from("web_story_slides").delete().eq("story_id", id);
    }
    // Depois deletar as stories
    const { error } = await supabase.from("web_stories").delete().in("id", ids);
    if (error) throw error;
    return ids.length;
  },
  onSuccess: (count) => {
    queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
    toast.success(`${count} story(ies) excluída(s)`);
    setSelectedIds(new Set());
  },
});
```

---

## Parte 3: Lógica "Cidade | Categoria" no Dashboard e Admin

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/admin/NewsList.tsx` | Usar `getCategoryDisplay()` na coluna de categoria + carregar tags |
| `src/components/admin/dashboard/RecentArticlesPanel.tsx` | Usar `getCategoryDisplay()` no badge de categoria + carregar tags |

### Mudanças Necessárias

#### 1. NewsList.tsx

**Query atual:**
```typescript
supabase.from("news").select("*, categories(name)")
```

**Query atualizada:**
```typescript
supabase.from("news").select("*, categories(name), news_tags(tags(name))")
```

**Exibição da categoria:**
```typescript
// Antes
{item.categories?.name || "-"}

// Depois
import { getCategoryDisplay } from "@/utils/categoryDisplay";
const tags = item.news_tags?.map(nt => nt.tags?.name).filter(Boolean) || [];
{getCategoryDisplay(item.categories?.name || "Geral", tags)}
```

#### 2. RecentArticlesPanel.tsx

**Query atualizada:**
```typescript
supabase.from("news").select(`
  id, title, slug, status, published_at, updated_at,
  category:categories(name, slug),
  news_tags(tags(name))
`)
```

**Badge de categoria:**
```typescript
// Antes
{article.category.name}

// Depois
import { getCategoryDisplay } from "@/utils/categoryDisplay";
const tags = article.news_tags?.map(nt => nt.tags?.name).filter(Boolean) || [];
{getCategoryDisplay(article.category?.name || "Geral", tags)}
```

---

## Resumo de Alterações

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `supabase/functions/fix-publication-dates/index.ts` | Criar | Edge function para corrigir datas |
| Migração SQL | Criar | Adicionar `original_published_at` à tabela news |
| `src/pages/admin/StoriesList.tsx` | Modificar | Adicionar exclusão em massa |
| `src/pages/admin/NewsList.tsx` | Modificar | Aplicar formato "Cidade \| Categoria" |
| `src/components/admin/dashboard/RecentArticlesPanel.tsx` | Modificar | Aplicar formato "Cidade \| Categoria" |

---

## Ordem de Implementação

1. **Migração SQL** — adicionar coluna `original_published_at`
2. **Edge Function** — criar função para correção de datas
3. **StoriesList** — adicionar exclusão em massa
4. **NewsList + RecentArticlesPanel** — aplicar "Cidade | Categoria"

---

## Seção Técnica

### Padrão de Detecção de Data nas Fontes

Os portais de prefeituras geralmente exibem datas em formato visual:

```text
JAN
27
27 JAN 2026
```

Regex para extração:
```javascript
const dateMatch = markdown.match(/(\d{1,2})\s+(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\s+(\d{4})/i);
if (dateMatch) {
  const [, day, month, year] = dateMatch;
  const monthMap = { JAN: 0, FEV: 1, MAR: 2, ABR: 3, MAI: 4, JUN: 5, JUL: 6, AGO: 7, SET: 8, OUT: 9, NOV: 10, DEZ: 11 };
  return new Date(parseInt(year), monthMap[month.toUpperCase()], parseInt(day));
}
```

### Dependências de Foreign Key (WebStories)

A exclusão em massa de WebStories precisa deletar primeiro os slides (`web_story_slides`) antes de deletar a story principal, pois existe uma FK constraint.

### Formato Final de Categoria no Admin

| Tags | Categoria | Exibição |
|------|-----------|----------|
| ["Cotia", "UBS"] | Saúde | **Cotia \| Saúde** |
| ["Itapevi", "Hospital"] | Saúde | **Itapevi \| Saúde** |
| ["Embu-Guaçu", "CMDCA"] | Política | **Embu-Guaçu \| Política** |
| [] (sem tags) | Geral | **Geral** |

