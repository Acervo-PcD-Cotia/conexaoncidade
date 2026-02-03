
# Plano: Padronização Visual de Notícias (Modelo Agência Brasil + Cor por Categoria)

## Resumo

Refatorar completamente o layout de páginas de notícias para seguir o padrão visual da **Agência Brasil**, com a diferença de que todos os elementos de destaque (chapéu, blockquotes, links, divisórias, chips) herdam a **cor da categoria** da matéria através de um token CSS único `--category-color`.

---

## Diagnóstico da Situação Atual

### O que existe hoje:
1. **Header com fundo colorido dinâmico** (`headerBgColor`) baseado na categoria
2. **Badge de categoria vermelho sólido** (`bg-red-600`) no topo
3. **Blockquote com borda azul fixa** (`#1a3c6e`)
4. **Links no corpo do texto** usam cor do texto (não da categoria)
5. **Cores de categoria vêm do banco** (`categories.color`) como valores HEX

### Problemas identificados:
- Header com fundo colorido forte competindo com o conteúdo
- Blockquote e links não usam a cor da categoria
- Não existe um token CSS central para tema de categoria
- Chapéu sempre vermelho (não contextual)
- Tags no rodapé não usam a cor da categoria

---

## Arquitetura Proposta

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│                         SISTEMA DE TEMA POR CATEGORIA                          │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   1. FONTE DE VERDADE                                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐  │
│   │ getCategoryTheme(categoryName: string, categoryColor: string | null)    │  │
│   │ → { color: string, label: string }                                      │  │
│   │                                                                          │  │
│   │ Mapeamento (fallback para cor do banco quando não no mapa):             │  │
│   │ • Saúde → #0E7490 (petróleo)                                            │  │
│   │ • Segurança Pública → #7F1D1D (bordô)                                   │  │
│   │ • Projetos Sociais → #166534 (verde)                                    │  │
│   │ • Educação → #1D4ED8 (azul)                                             │  │
│   │ • Tecnologia → #6D28D9 (roxo)                                           │  │
│   │ • Esportes → #15803D (verde vibrante)                                   │  │
│   │ • Geral → #334155 (grafite)                                             │  │
│   └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
│   2. TOKEN CSS                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐  │
│   │ <article style={{ '--category-color': theme.color } as CSSProperties}>  │  │
│   │                                                                          │  │
│   │ Uso no CSS:                                                              │  │
│   │ • Chapéu: color: var(--category-color)                                  │  │
│   │ • Blockquote: border-left-color: var(--category-color)                  │  │
│   │ • Links: color: var(--category-color)                                   │  │
│   │ • Divisórias: color-mix(--category-color, 25%)                          │  │
│   │ • Tags: border-color: var(--category-color)                             │  │
│   └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
│   3. COMPONENTIZAÇÃO                                                           │
│   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌────────────────────┐ │
│   │ ArticleHeader │ │ ArticleHero   │ │ ArticleContent│ │ ArticleFooter      │ │
│   │ (chapéu,      │ │ (imagem       │ │ (prose-news   │ │ (tags, share,      │ │
│   │  título,      │ │  principal)   │ │  + blockquote)│ │  relacionadas)     │ │
│   │  linha fina)  │ │               │ │               │ │                    │ │
│   └───────────────┘ └───────────────┘ └───────────────┘ └────────────────────┘ │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## Fase 1: Criar Sistema de Tema por Categoria

### 1.1 Criar `src/lib/categoryTheme.ts`

**Função principal:**

```typescript
interface CategoryTheme {
  color: string;  // HEX color
  label: string;  // Category name for display
}

const CATEGORY_COLOR_MAP: Record<string, string> = {
  'saúde': '#0E7490',
  'segurança pública': '#7F1D1D',
  'projetos sociais': '#166534',
  'educação': '#1D4ED8',
  'tecnologia': '#6D28D9',
  'esportes': '#15803D',
  'cultura': '#D97706',
  'economia': '#B45309',
  'política': '#1E3A8A',
  'internacional': '#1E3A8A',
  'brasil': '#166534',
  'geral': '#334155',
};

export function getCategoryTheme(
  categoryName: string,
  categoryColorFromDB: string | null
): CategoryTheme {
  const normalized = categoryName.toLowerCase().trim();
  const mappedColor = CATEGORY_COLOR_MAP[normalized];
  
  return {
    color: mappedColor || categoryColorFromDB || '#334155',
    label: categoryName,
  };
}
```

### 1.2 Adicionar CSS para `--category-color`

No `src/index.css`, adicionar regras que usam a variável CSS:

```css
/* Article with category theme */
.article-themed {
  --category-color: #334155; /* fallback */
}

/* Chapéu (category label) */
.article-themed .article-chapeu {
  color: var(--category-color);
  border-bottom: 2px solid var(--category-color);
}

/* Blockquote */
.article-themed .prose-news blockquote {
  border-left-color: var(--category-color);
}

/* Links within article content */
.article-themed .prose-news a {
  color: var(--category-color);
}

.article-themed .prose-news a:hover {
  filter: brightness(0.85);
  text-decoration: underline;
}

/* Dividers */
.article-themed .article-divider {
  border-color: color-mix(in srgb, var(--category-color) 25%, transparent);
}

/* Tag chips */
.article-themed .article-tag {
  border-color: var(--category-color);
  color: var(--category-color);
}
```

---

## Fase 2: Refatorar Layout do NewsDetail (Modelo Agência Brasil)

### Mudanças no Layout

| Elemento | Antes | Depois |
|----------|-------|--------|
| Header | Fundo colorido escuro | Fundo branco/neutro, chapéu colorido |
| Chapéu | Badge vermelho sólido | Texto + underline na cor da categoria |
| Título | Texto branco sobre fundo | Texto preto sobre fundo neutro |
| Linha fina | Sobre fundo colorido | Cinza escuro, logo abaixo do título |
| Meta (autor/data) | Barra separada | Texto discreto, cinza médio |
| Blockquote | Borda azul fixa | Borda na cor da categoria |
| Links | Cor do texto | Cor da categoria |
| Tags | Hover genérico | Borda + texto na cor da categoria |

### Estrutura HTML Final

```tsx
<article 
  className="article-themed"
  style={{ '--category-color': theme.color } as React.CSSProperties}
>
  {/* 1. Chapéu (categoria) */}
  <div className="article-chapeu">
    COTIA | SAÚDE
  </div>
  
  {/* 2. Título */}
  <h1 className="text-3xl font-bold text-foreground">
    Título da notícia
  </h1>
  
  {/* 3. Linha fina (subtítulo) */}
  <p className="text-lg text-muted-foreground">
    Subtítulo opcional
  </p>
  
  {/* 4. Meta */}
  <div className="text-sm text-muted-foreground">
    Por REDAÇÃO – Brasília | 03/02/2026
  </div>
  
  {/* 5. Divisória */}
  <hr className="article-divider" />
  
  {/* 6. Imagem principal */}
  <figure>
    <img ... />
    <figcaption>Crédito da imagem</figcaption>
  </figure>
  
  {/* 7. Áudio (se existir) */}
  <NewsAudioBlock ... />
  
  {/* 8. Conteúdo */}
  <div className="prose-news">
    {content with blockquotes, links using --category-color}
  </div>
  
  {/* 9. Tags */}
  <div className="flex gap-2">
    <span className="article-tag">Tag 1</span>
    <span className="article-tag">Tag 2</span>
  </div>
  
  {/* 10. Compartilhar */}
  <ShareButtons ... />
</article>
```

---

## Fase 3: Criar Componentes de Artigo

### Novos Componentes

| Componente | Responsabilidade |
|------------|------------------|
| `ArticleHeader.tsx` | Chapéu, título, linha fina, meta |
| `ArticleHero.tsx` | Imagem principal com crédito |
| `ArticleContent.tsx` | Wrapper para prose-news |
| `ArticleBlockquote.tsx` | Estilo de citação (opcional) |
| `ArticleFooter.tsx` | Tags, share, autor |
| `ArticleDivider.tsx` | Linha divisória temática |

### Estrutura de Arquivos

```text
src/components/article/
├── ArticleHeader.tsx
├── ArticleHero.tsx
├── ArticleContent.tsx
├── ArticleFooter.tsx
├── ArticleDivider.tsx
└── index.ts (exports)
```

### Exemplo: ArticleHeader.tsx

```tsx
interface ArticleHeaderProps {
  categoryDisplay: string;  // "Cotia | Saúde"
  title: string;
  subtitle?: string;
  authorName: string;
  publishedAt: string;
  source?: string;
}

export function ArticleHeader({
  categoryDisplay,
  title,
  subtitle,
  authorName,
  publishedAt,
  source,
}: ArticleHeaderProps) {
  return (
    <header className="max-w-[820px] mx-auto px-4 md:px-6 pt-8 pb-4">
      {/* Chapéu */}
      <span className="article-chapeu uppercase tracking-wide text-xs font-semibold pb-1 inline-block mb-4">
        {categoryDisplay}
      </span>
      
      {/* Título */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-foreground mb-4">
        {title}
      </h1>
      
      {/* Linha fina */}
      {subtitle && (
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-4">
          {subtitle}
        </p>
      )}
      
      {/* Meta */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-muted-foreground">
        <span className="font-semibold uppercase tracking-wide">
          {authorName}
        </span>
        {source && <span>– {source}</span>}
        <span className="hidden md:inline">|</span>
        <time>{formatDate(publishedAt)}</time>
      </div>
    </header>
  );
}
```

---

## Fase 4: Atualizar CSS (prose-news)

### Mudanças no `src/index.css`

```css
/* Prose styling for news content - Agência Brasil Editorial Style v3 */
.prose-news {
  @apply text-foreground leading-relaxed;
  max-width: 780px;
  font-size: 1.125rem;
  line-height: 1.85;
}

/* Blockquote - Usa cor da categoria */
.article-themed .prose-news blockquote {
  @apply border-l-4 pl-6 py-4 my-8;
  border-left-color: var(--category-color);
  background: hsl(var(--muted) / 0.3);
  color: hsl(var(--foreground));
  font-style: italic;
}

/* Links - Usa cor da categoria */
.article-themed .prose-news a {
  color: var(--category-color);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.article-themed .prose-news a:hover {
  filter: brightness(0.85);
}

/* H2 com borda inferior sutil (opcional) */
.article-themed .prose-news h2 {
  @apply text-xl font-bold mt-10 mb-4 pb-2;
  border-bottom: 1px solid color-mix(in srgb, var(--category-color) 20%, transparent);
}

/* Listas com bullet na cor da categoria */
.article-themed .prose-news ul {
  list-style-type: disc;
}

.article-themed .prose-news li::marker {
  color: var(--category-color);
}
```

---

## Fase 5: Refatorar NewsDetail.tsx

### Mudanças Principais

1. **Remover header colorido** - Trocar por fundo neutro
2. **Aplicar `--category-color`** no `<article>`
3. **Trocar Badge vermelho** por chapéu estilizado
4. **Usar novos componentes** (ArticleHeader, ArticleHero, etc.)

### Código Simplificado

```tsx
function NewsDetailContent({ news }: NewsDetailContentProps) {
  const categoryTheme = useMemo(() => {
    return getCategoryTheme(
      news.category?.name || 'Geral',
      news.category?.color || null
    );
  }, [news.category]);
  
  const categoryDisplay = getCategoryDisplay(
    news.category?.name || 'Geral',
    news.tags?.map(t => t.name) || [],
    news.source
  );

  return (
    <article 
      className="article-themed"
      style={{ '--category-color': categoryTheme.color } as React.CSSProperties}
    >
      <ArticleHeader
        categoryDisplay={categoryDisplay}
        title={news.title}
        subtitle={news.subtitle}
        authorName={news.author?.full_name || 'Redação'}
        publishedAt={news.published_at || ''}
        source={news.source}
      />
      
      <ArticleDivider />
      
      <div className="max-w-[820px] mx-auto px-4 md:px-6 py-8">
        <ArticleHero
          imageUrl={news.featured_image_url}
          imageAlt={news.image_alt}
          imageCredit={news.image_credit}
        />
        
        <NewsAudioBlock ... />
        
        <ArticleContent html={news.content} />
        
        <ArticleFooter
          tags={news.tags}
          newsId={news.id}
          newsTitle={news.title}
          currentUrl={currentUrl}
        />
      </div>
      
      <RelatedNews news={relatedNews} />
    </article>
  );
}
```

---

## Fase 6: Atualizar GeneratedNewsDetail (Esportes)

Aplicar o mesmo padrão visual ao `GeneratedNewsDetail.tsx`:

1. Importar `getCategoryTheme`
2. Aplicar `--category-color` (para Esportes: `#15803D`)
3. Usar componentes de artigo

---

## Fase 7: Atualizar Componentes Relacionados

### RelatedNews.tsx

Usar `--category-color` nas tags de categoria:

```tsx
<span
  className="article-tag inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
  style={{ 
    borderColor: categoryColor,
    color: categoryColor,
  }}
>
```

### ShareButtons (footer)

Manter estilo atual, mas garantir que divisórias usem a cor da categoria.

---

## Resumo de Arquivos

### Novos Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/categoryTheme.ts` | Função `getCategoryTheme()` + mapa de cores |
| `src/components/article/ArticleHeader.tsx` | Chapéu, título, linha fina, meta |
| `src/components/article/ArticleHero.tsx` | Imagem principal com crédito |
| `src/components/article/ArticleContent.tsx` | Wrapper para prose-news |
| `src/components/article/ArticleFooter.tsx` | Tags, share |
| `src/components/article/ArticleDivider.tsx` | Divisória temática |
| `src/components/article/index.ts` | Exports |

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/index.css` | Adicionar regras para `.article-themed`, atualizar `.prose-news` |
| `src/pages/NewsDetail.tsx` | Refatorar layout para Agência Brasil, usar novos componentes |
| `src/pages/public/esportes/GeneratedNewsDetail.tsx` | Aplicar mesmo padrão |
| `src/components/news/RelatedNews.tsx` | Tags com cor da categoria |

---

## Ordem de Implementação (Build Order)

| Ordem | Tarefa | Prioridade |
|-------|--------|------------|
| 1 | Criar `categoryTheme.ts` com mapa de cores | ALTA |
| 2 | Adicionar CSS para `.article-themed` e `--category-color` | ALTA |
| 3 | Criar componentes de artigo (ArticleHeader, ArticleHero, etc.) | ALTA |
| 4 | Refatorar `NewsDetail.tsx` para novo layout | ALTA |
| 5 | Atualizar `GeneratedNewsDetail.tsx` | MÉDIA |
| 6 | Atualizar `RelatedNews.tsx` para usar tema | MÉDIA |
| 7 | Testar em 5+ notícias de categorias diferentes | ALTA |
| 8 | Verificar responsividade mobile | MÉDIA |

---

## Critérios de Aceite

1. Todas as notícias têm o mesmo layout e hierarquia (Agência Brasil)
2. Chapéu aparece sempre no topo com cor da categoria
3. Título sem fundo/gradiente colorido
4. Blockquote sempre com barra lateral na cor da categoria
5. Links no texto com cor da categoria
6. Tags no rodapé com borda na cor da categoria
7. Nenhuma matéria mistura duas cores tema
8. Categoria desconhecida cai em "Geral" (grafite)
9. Layout responsivo funciona em mobile
10. Print styles mantidos
