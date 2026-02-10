
# Correcao: Tela em branco ao estar logado

## Causa raiz

O hook `useNews` (usado por HeroSection, LatestNewsList, etc.) faz **queries N+1**: para cada noticia (12+), dispara 2 queries individuais (1 para `profiles`, 1 para `news_tags`). Isso gera 24+ requisicoes HTTP sequenciais que levam 8+ segundos.

Para usuarios autenticados, queries adicionais de tenant/config agravam o atraso. A tabela `profiles` nao tem politica RLS para `anon`, entao as queries de autor falham silenciosamente, mas a cascata de requisicoes trava o carregamento.

## Solucao

### 1. Otimizar `useNews` — eliminar N+1 queries

**Arquivo**: `src/hooks/useNews.ts`

**Antes** (N+1 — 24+ queries):
```ts
const newsWithDetails = await Promise.all(
  (data || []).map(async (item) => {
    // Query individual para cada autor
    const { data: authorData } = await supabase
      .from('profiles').select('...').eq('id', item.author_id).maybeSingle();
    // Query individual para cada tag  
    const { data: tagsData } = await supabase
      .from('news_tags').select('...').eq('news_id', item.id);
    return { ...item, author: authorData, tags };
  })
);
```

**Depois** (3 queries no total):
```ts
// 1. Buscar noticias (ja feito)
// 2. Buscar TODOS os autores de uma vez
const authorIds = [...new Set(data.map(n => n.author_id).filter(Boolean))];
const { data: authors } = await supabase
  .from('profiles')
  .select('id, full_name, avatar_url, bio')
  .in('id', authorIds);
const authorsMap = new Map(authors?.map(a => [a.id, a]) || []);

// 3. Buscar TODAS as tags de uma vez
const newsIds = data.map(n => n.id);
const { data: allTags } = await supabase
  .from('news_tags')
  .select('news_id, tag:tags(id, name, slug)')
  .in('news_id', newsIds);
const tagsMap = new Map();
allTags?.forEach(t => {
  if (!tagsMap.has(t.news_id)) tagsMap.set(t.news_id, []);
  tagsMap.get(t.news_id).push(t.tag);
});

// Montar resultado sem queries extras
const newsWithDetails = data.map(item => ({
  ...item,
  author: authorsMap.get(item.author_id) || null,
  tags: tagsMap.get(item.id) || [],
}));
```

Aplicar a mesma otimizacao nas funcoes: `useNews`, `useFeaturedNews`, `useNewsByCategory`, e qualquer outra que faca o mesmo padrao N+1.

### 2. Adicionar politica RLS publica na tabela `profiles`

A tabela `profiles` so tem politica SELECT para `authenticated`. Usuarios anonimos (visitantes publicos) nao conseguem ler perfis de autores.

**Migracao SQL**:
```sql
CREATE POLICY "Perfis publicos sao visiveis para todos"
  ON public.profiles
  FOR SELECT
  TO public
  USING (true);
```

Isso permite que visitantes anonimos vejam nomes e avatares dos autores nas noticias.

### 3. Adicionar tratamento de erro robusto nos componentes

**Arquivos**: `src/components/home/HeroSection.tsx`, `src/components/home/LatestNewsList.tsx`

Adicionar timeout de seguranca nos hooks de dados para evitar loading infinito:
- Se `useNews` estiver carregando por mais de 10 segundos, forcar renderizacao com dados vazios
- Isso ja existe no `Index.tsx` (5s timeout), mas precisa existir tambem nos componentes internos

---

## Resumo de alteracoes

| Arquivo | Alteracao |
|---|---|
| `src/hooks/useNews.ts` | Otimizar N+1 queries para batch queries (3 queries no total) |
| Migracao SQL | Adicionar politica RLS publica para `profiles` |
| `src/components/home/HeroSection.tsx` | Timeout de seguranca no loading |
| `src/components/home/LatestNewsList.tsx` | Timeout de seguranca no loading |

## Impacto esperado

- Carregamento da homepage: de 8+ segundos para menos de 1 segundo
- Funciona identicamente para usuarios logados e anonimos
- Sem alteracoes na estrutura de dados ou arquitetura
