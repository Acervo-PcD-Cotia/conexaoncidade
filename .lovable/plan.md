
# Corrigir Detecção de Cidade via URL da Fonte + Notícias Relacionadas

## Problema Identificado

### 1. Detecção de cidade inconsistente
A função `getCategoryDisplay` usa apenas **tags** para identificar a cidade, mas as tags podem estar incorretas ou ausentes. 

**Solução**: Usar o campo `source` (URL da fonte) como **fonte primária** para identificar a cidade, pois cada prefeitura tem um domínio único.

### 2. Notícias Relacionadas não exibem "Cidade | Categoria"
O componente `RelatedNews.tsx` exibe apenas `{item.category.name}` e não usa a função `getCategoryDisplay()`.

---

## Mapeamento de Domínios para Cidades

| Domínio | Cidade |
|---------|--------|
| `noticias.itapevi.sp.gov.br` | Itapevi |
| `vargemgrandepaulista.sp.gov.br` | Vargem Grande Paulista |
| `saoroque.sp.gov.br` | São Roque |
| `ibiuna.sp.gov.br` | Ibiúna |
| `embuguacu.sp.gov.br` | Embu-Guaçu |
| `cidadeembudasartes.sp.gov.br` | Embu das Artes |
| `itapecerica.sp.gov.br` | Itapecerica da Serra |
| `saolourencodaserra.sp.gov.br` | São Lourenço da Serra |
| `prefeitura.sp.gov.br` | São Paulo |
| `osasco.sp.gov.br` | Osasco |
| `jandira.sp.gov.br` | Jandira |
| `carapicuiba.sp.gov.br` | Carapicuíba |
| `barueri.sp.gov.br` | Barueri |
| `cotia.sp.gov.br` | Cotia |

---

## Plano de Implementação

### Parte 1: Atualizar `categoryDisplay.ts`

Adicionar nova função `extractCityFromSource(sourceUrl: string)` que:
1. Extrai o domínio da URL da fonte
2. Mapeia para a cidade correspondente
3. Retorna a cidade formatada

```typescript
const SOURCE_DOMAIN_TO_CITY: Record<string, string> = {
  'noticias.itapevi.sp.gov.br': 'Itapevi',
  'itapevi.sp.gov.br': 'Itapevi',
  'vargemgrandepaulista.sp.gov.br': 'Vargem Grande Paulista',
  'saoroque.sp.gov.br': 'São Roque',
  'ibiuna.sp.gov.br': 'Ibiúna',
  'embuguacu.sp.gov.br': 'Embu-Guaçu',
  'cidadeembudasartes.sp.gov.br': 'Embu das Artes',
  'itapecerica.sp.gov.br': 'Itapecerica da Serra',
  'saolourencodaserra.sp.gov.br': 'São Lourenço da Serra',
  'prefeitura.sp.gov.br': 'São Paulo',
  'osasco.sp.gov.br': 'Osasco',
  'jandira.sp.gov.br': 'Jandira',
  'portal.jandira.sp.gov.br': 'Jandira',
  'carapicuiba.sp.gov.br': 'Carapicuíba',
  'barueri.sp.gov.br': 'Barueri',
  'portal.barueri.sp.gov.br': 'Barueri',
  'cotia.sp.gov.br': 'Cotia',
};

export function extractCityFromSource(sourceUrl: string | null): string | null {
  if (!sourceUrl) return null;
  
  try {
    const url = new URL(sourceUrl);
    const hostname = url.hostname.toLowerCase();
    
    for (const [domain, city] of Object.entries(SOURCE_DOMAIN_TO_CITY)) {
      if (hostname.includes(domain) || hostname.endsWith(domain)) {
        return city;
      }
    }
  } catch {
    // URL inválida, tentar match parcial
    const lowercaseSource = sourceUrl.toLowerCase();
    for (const [domain, city] of Object.entries(SOURCE_DOMAIN_TO_CITY)) {
      if (lowercaseSource.includes(domain)) {
        return city;
      }
    }
  }
  
  return null;
}
```

Atualizar `getCategoryDisplay` para aceitar `source`:

```typescript
export function getCategoryDisplay(
  category: string, 
  tags: string[], 
  source?: string | null
): string {
  // 1. Prioridade: detectar cidade pela URL da fonte
  const cityFromSource = extractCityFromSource(source || null);
  if (cityFromSource) {
    return `${cityFromSource} | ${category}`;
  }
  
  // 2. Fallback: detectar cidade pelas tags
  const cityFromTags = extractCityFromTags(tags);
  if (cityFromTags) {
    return `${cityFromTags} | ${category}`;
  }
  
  // 3. Fallback final: apenas categoria
  return category;
}
```

### Parte 2: Atualizar `useRelatedNews` para buscar tags e source

Modificar a query para incluir tags e o campo `source`:

```typescript
const { data: taggedNews } = await supabase
  .from('news')
  .select(`
    *,
    category:categories(id, name, slug, color),
    news_tags(tag:tags(id, name, slug))
  `)
  // ... resto da query
```

Depois mapear as tags:

```typescript
const mappedNews = taggedNews.map(item => ({
  ...item,
  tags: item.news_tags?.map(nt => nt.tag).filter(Boolean) || []
}));
```

### Parte 3: Atualizar `RelatedNews.tsx`

```typescript
import { getCategoryDisplay } from '@/utils/categoryDisplay';

// No badge de categoria:
<span
  className="..."
  style={{ backgroundColor: item.category.color }}
>
  {getCategoryDisplay(
    item.category.name,
    item.tags?.map(t => t.name) || [],
    item.source
  )}
</span>
```

### Parte 4: Atualizar todos os componentes para passar `source`

Garantir que todos os componentes que usam `getCategoryDisplay` passem o campo `source`:

| Componente | Mudança |
|------------|---------|
| `NewsCard.tsx` | Adicionar `news.source` como 3º parâmetro |
| `NewsCardVisual.tsx` | Adicionar `news.source` como 3º parâmetro |
| `HeroSection.tsx` | Adicionar `heroNews.source` como 3º parâmetro |
| `CategorySection.tsx` | Adicionar `news.source` como 3º parâmetro |
| `NewsDetail.tsx` | Adicionar `news.source` como 3º parâmetro |
| `RelatedNews.tsx` | Adicionar `item.source` como 3º parâmetro |
| `NewsList.tsx` (admin) | Adicionar `item.source` como 3º parâmetro |
| `RecentArticlesPanel.tsx` (admin) | Adicionar `article.source` como 3º parâmetro |

---

## Resumo de Alterações

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/utils/categoryDisplay.ts` | Modificar | Adicionar mapeamento de domínios, função `extractCityFromSource`, atualizar `getCategoryDisplay` |
| `src/hooks/useNews.ts` | Modificar | Atualizar `useRelatedNews` para buscar tags |
| `src/components/news/RelatedNews.tsx` | Modificar | Usar `getCategoryDisplay` com source |
| `src/components/home/NewsCard.tsx` | Modificar | Passar `source` para `getCategoryDisplay` |
| `src/components/home/NewsCardVisual.tsx` | Modificar | Passar `source` para `getCategoryDisplay` |
| `src/components/home/HeroSection.tsx` | Modificar | Passar `source` para `getCategoryDisplay` |
| `src/components/home/CategorySection.tsx` | Modificar | Passar `source` para `getCategoryDisplay` |
| `src/pages/NewsDetail.tsx` | Modificar | Passar `source` para `getCategoryDisplay` |
| `src/pages/admin/NewsList.tsx` | Modificar | Passar `source` para `getCategoryDisplay` |
| `src/components/admin/dashboard/RecentArticlesPanel.tsx` | Modificar | Passar `source` para `getCategoryDisplay` |

---

## Resultado Esperado

| Fonte (source) | Categoria | Exibição |
|----------------|-----------|----------|
| `https://www.embuguacu.sp.gov.br/...` | Política | **Embu-Guaçu \| Política** |
| `https://cidadeembudasartes.sp.gov.br/...` | Cultura | **Embu das Artes \| Cultura** |
| `https://www.saoroque.sp.gov.br/...` | Educação | **São Roque \| Educação** |
| `https://cotia.sp.gov.br/...` | Saúde | **Cotia \| Saúde** |
| `null` (sem fonte) + Tag "Cotia" | Cidades | **Cotia \| Cidades** |

A detecção via `source` é **100% precisa** pois cada prefeitura tem seu próprio domínio.
