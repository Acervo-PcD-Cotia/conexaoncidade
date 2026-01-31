
# Corrigir Regra: Categoria Oculta no Menu Também Oculta as Notícias

## Problema Identificado

Atualmente, quando uma categoria é desativada (`is_active = false`) no painel administrativo:
- A categoria desaparece do **menu** do site (Header e Footer)
- Porém, as **notícias dessa categoria continuam aparecendo** normalmente no portal

Isso acontece porque as queries que buscam notícias não verificam se a categoria associada está ativa.

---

## Solução Proposta

Adicionar filtro nas queries de notícias para verificar se `categories.is_active = true`, garantindo que:

1. Notícias de categorias desativadas **não apareçam** na Home
2. Notícias de categorias desativadas **não apareçam** nos destaques
3. Notícias de categorias desativadas **não apareçam** nas "Mais Lidas"
4. Notícias de categorias desativadas **não apareçam** nas "Relacionadas"
5. A página individual da notícia continue acessível (para quem tem o link direto)

---

## Impacto nas Funções

| Hook/Função | Arquivo | Precisa Filtrar? |
|-------------|---------|------------------|
| `useNews` | `src/hooks/useNews.ts` | Sim |
| `useFeaturedNews` | `src/hooks/useNews.ts` | Sim |
| `useMostReadNews` | `src/hooks/useNews.ts` | Sim |
| `useRelatedNews` | `src/hooks/useNews.ts` | Sim |
| `useNewsByCategory` | `src/hooks/useNews.ts` | Já filtra pela categoria |
| `useNewsBySlug` | `src/hooks/useNews.ts` | Não (acesso direto) |
| `useNewsById` | `src/hooks/useNews.ts` | Não (acesso direto) |

---

## Abordagem Técnica

O Supabase permite filtrar por campos relacionados usando a sintaxe `column.nestedColumn`. Como o select já inclui `category:categories(...)`, podemos adicionar filtro:

```typescript
// Antes
const { data } = await supabase
  .from('news')
  .select(`*, category:categories(id, name, slug, color)`)
  .eq('status', 'published')
  .is('deleted_at', null)
  .order('published_at', { ascending: false });

// Depois
const { data } = await supabase
  .from('news')
  .select(`*, category:categories!inner(id, name, slug, color, is_active)`)
  .eq('status', 'published')
  .is('deleted_at', null)
  .eq('category.is_active', true)  // Filtra apenas categorias ativas
  .order('published_at', { ascending: false });
```

**Nota:** O modificador `!inner` força um INNER JOIN, garantindo que apenas notícias com categorias ativas sejam retornadas.

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useNews.ts` | Adicionar filtro `category.is_active = true` em 4 funções |

---

## Resultado Esperado

### Antes (Problema)
| Categoria | is_active | Notícias no Menu | Notícias no Site |
|-----------|-----------|------------------|------------------|
| Saúde | true | Visível | Visível |
| Esportes | **false** | Oculto | **Visível** (BUG!) |

### Depois (Corrigido)
| Categoria | is_active | Notícias no Menu | Notícias no Site |
|-----------|-----------|------------------|------------------|
| Saúde | true | Visível | Visível |
| Esportes | **false** | Oculto | **Oculto** |

---

## Considerações

1. **Notícias sem categoria:** Continuarão aparecendo normalmente (usando INNER JOIN exclui estas também - será necessário decidir o comportamento desejado)

2. **Acesso direto por URL:** A página individual da notícia (`/noticia/slug`) continuará acessível para quem tem o link - isso é intencional para não quebrar links externos

3. **Admin:** O painel administrativo continuará mostrando todas as notícias, independente da categoria estar ativa ou não
