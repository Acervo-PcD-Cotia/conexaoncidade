

# Implementar Formato "Cidade | Categoria" em Todo o Sistema

## Objetivo

Garantir que **todas** as notícias (manual ou Notícias AI) exibam a categoria no formato **"Cidade | Categoria"** (ex: Cotia | Saúde, Itapevi | Educação, Carapicuíba | Esportes) em todo o portal.

---

## Situação Atual

### O que já existe (✅)
- Utilitário `src/utils/categoryDisplay.ts` com lógica completa para detectar cidades e formatar "Cidade | Categoria"
- Lista de cidades vizinhas (Osasco, Carapicuíba, Barueri, Itapevi, etc.)
- Lista de bairros de Cotia (Granja Viana, Caucaia do Alto, etc.)
- Funções `getCategoryDisplay()` e `getCategoryBadgeInfo()` prontas

### O que NÃO está funcionando (❌)
- **Nenhum componente** está usando essas funções
- Os componentes exibem apenas `news.category?.name`
- A lógica depende das **tags** para identificar a cidade, mas as tags não são carregadas em todas as queries

---

## Plano de Implementação

### Parte 1: Frontend — Integrar `getCategoryDisplay` nos Componentes

**Arquivos a modificar:**

| Componente | Arquivo | Uso Atual | Mudança |
|------------|---------|-----------|---------|
| NewsCard | `src/components/home/NewsCard.tsx` | `news.category?.name` | Usar `getCategoryDisplay()` |
| NewsCardVisual | `src/components/home/NewsCardVisual.tsx` | `news.category?.name` | Usar `getCategoryDisplay()` |
| HeroSection | `src/components/home/HeroSection.tsx` | `heroNews.category?.name` | Usar `getCategoryDisplay()` |
| NewsDetail | `src/pages/NewsDetail.tsx` | `news.category.name` | Usar `getCategoryDisplay()` |
| CategorySection | `src/components/home/CategorySection.tsx` | `category.name` | Usar `getCategoryDisplay()` |

**Exemplo de mudança:**

```text
// Antes
{news.category?.name || "Notícia"}

// Depois
import { getCategoryDisplay } from "@/utils/categoryDisplay";
// ...
{getCategoryDisplay(news.category?.name || "Notícia", news.tags?.map(t => t.name) || [])}
```

### Parte 2: Garantir que Tags sejam carregadas

**Arquivo:** `src/hooks/useNews.ts`

Atualmente, as tags só são carregadas no `useNewsBySlug`. Precisamos adicionar a busca de tags também em:

1. `useNews()` - Lista principal de notícias
2. `useFeaturedNews()` - Notícias em destaque
3. `useMostReadNews()` - Mais lidas
4. `useNewsByCategory()` - Por categoria

**Mudança:** Adicionar query para buscar tags após carregar cada notícia (similar ao padrão já usado em `useNewsBySlug`).

### Parte 3: Regra Especial para Cotia

**Lógica já implementada em `categoryDisplay.ts`:**

```text
- Se a notícia tiver tag de cidade vizinha (Itapevi, Osasco, etc.):
  → Exibe: "Cidade | Categoria" (ex: "Itapevi | Educação")
  
- Se a notícia for de Cotia ou sem cidade identificável:
  → Exibe apenas: "Categoria" (ex: "Saúde")
  
- Se a tag for um bairro de Cotia (Granja Viana, Caucaia, etc.):
  → Trata como Cotia, exibe apenas categoria
```

### Parte 4: Atualizar Notícias AI

**Arquivos a verificar:**

1. `supabase/functions/noticias-ai-generate/index.ts` - Garantir que a primeira tag seja sempre a cidade
2. `src/pages/admin/NoticiasAI.tsx` - Confirmar que as tags são salvas corretamente

**Regra do Prompt Mestre v2 (já implementada):**
- A primeira tag DEVE ser o nome da cidade
- Tags entre 3 e 12

### Parte 5: Atualizar Cadastro Manual

**Arquivo:** `src/pages/admin/NewsEditor.tsx`

Garantir que ao criar notícia manual:
1. Campo de tags seja obrigatório (mínimo 3)
2. Sugerir automaticamente a cidade como primeira tag

---

## Resumo de Alterações por Arquivo

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/hooks/useNews.ts` | Hook | Adicionar busca de tags em todas as funções |
| `src/components/home/NewsCard.tsx` | Componente | Integrar `getCategoryDisplay()` |
| `src/components/home/NewsCardVisual.tsx` | Componente | Integrar `getCategoryDisplay()` |
| `src/components/home/HeroSection.tsx` | Componente | Integrar `getCategoryDisplay()` |
| `src/components/home/CategorySection.tsx` | Componente | Integrar `getCategoryDisplay()` |
| `src/pages/NewsDetail.tsx` | Página | Integrar `getCategoryDisplay()` |
| `src/pages/admin/NewsEditor.tsx` | Página | Adicionar validação de tags (cidade como primeira) |

---

## Seção Técnica

### Interface de Tags no NewsItem

As tags já estão tipadas em `useNews.ts`:

```typescript
tags?: Array<{
  id: string;
  name: string;
  slug: string;
}>;
```

### Função getCategoryDisplay

```typescript
// Entrada
getCategoryDisplay("Saúde", ["Itapevi", "Hospital", "Atendimento"])
// Saída: "Itapevi | Saúde"

getCategoryDisplay("Saúde", ["Cotia", "UBS", "Atendimento"])
// Saída: "Saúde" (Cotia é cidade principal, não exibe)

getCategoryDisplay("Educação", ["Granja Viana", "Escola"])
// Saída: "Educação" (Granja Viana é bairro de Cotia)
```

### Otimização de Performance

Para evitar N+1 queries ao buscar tags, podemos:
1. Usar batch query para buscar todas as tags de uma vez
2. Ou aceitar o custo adicional já que são poucas notícias por página

---

## Resultado Esperado

Após implementação:

- ✅ Cards de notícias exibirão "Itapevi | Educação" para notícias de Itapevi
- ✅ Notícias de Cotia exibirão apenas "Educação"
- ✅ Página de detalhe terá badge "Carapicuíba | Esportes"
- ✅ HeroSection terá formato consistente
- ✅ Tanto notícias manuais quanto AI seguirão o mesmo padrão

