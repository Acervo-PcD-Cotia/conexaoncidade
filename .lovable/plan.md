
# Plano: Blindagem Definitiva do Módulo Notícias AI

## Análise da Situação Atual

Após análise detalhada do código, identifiquei que a maior parte da infraestrutura já está implementada:

### Já Implementado
- Whitelist de 26 categorias em `src/constants/categories.ts`
- Fallback para "Geral" quando categoria inválida
- Conversão de categoria inválida em tag adicional
- Template JSON oficial com estrutura correta
- Validação em tempo real com erros/avisos
- Detecção automática de modo (texto, URL, JSON, lote)
- Geração de WebStory automática
- Edge function com prompt atualizado

### Lacunas Identificadas para Blindagem

| # | Problema | Impacto |
|---|----------|---------|
| 1 | Validação de tags aceita menos de 3 | Artigos com poucas tags |
| 2 | Validação de SEO não verifica limites | Títulos/descrições podem exceder limites |
| 3 | Edge function recomenda 12 tags mas valida só warnings | Sem garantia de mínimo |
| 4 | Validação de resumo não limita 160 chars | Resumos longos demais |
| 5 | Template JSON mostra 12 tags, mas spec diz 3-12 | Confusão sobre mínimo |
| 6 | Fallback de tags usa localizações genéricas (Ceará, Fortaleza) | Deveria usar contexto local |

---

## Alterações Propostas

### 1. Atualizar Validação JSON com Regras Definitivas

**Arquivo:** `src/components/admin/noticias-ai/NoticiasAIInput.tsx`

Atualizar a função `validateNewsJson` para incluir:

```typescript
// REGRAS DEFINITIVAS DE VALIDAÇÃO

// Tags: mínimo 3, máximo 12
if (!article.tags || article.tags.length < 3) {
  errors.push({
    field: 'tags',
    message: `Artigo ${index + 1}: Mínimo 3 tags obrigatórias (atual: ${article.tags?.length || 0})`,
    type: 'error',
    articleIndex: index
  });
} else if (article.tags.length > 12) {
  errors.push({
    field: 'tags',
    message: `Artigo ${index + 1}: Máximo 12 tags permitidas (atual: ${article.tags.length})`,
    type: 'error',
    articleIndex: index
  });
}

// Resumo: máximo 160 caracteres
if (article.resumo && article.resumo.length > 160) {
  errors.push({
    field: 'resumo',
    message: `Artigo ${index + 1}: Resumo excede 160 caracteres (atual: ${article.resumo.length})`,
    type: 'warning',
    articleIndex: index
  });
}

// SEO: meta_titulo máximo 60 caracteres
if (article.seo?.meta_titulo && article.seo.meta_titulo.length > 60) {
  errors.push({
    field: 'seo.meta_titulo',
    message: `Artigo ${index + 1}: Meta título excede 60 caracteres (atual: ${article.seo.meta_titulo.length})`,
    type: 'warning',
    articleIndex: index
  });
}

// SEO: meta_descricao máximo 160 caracteres
if (article.seo?.meta_descricao && article.seo.meta_descricao.length > 160) {
  errors.push({
    field: 'seo.meta_descricao',
    message: `Artigo ${index + 1}: Meta descrição excede 160 caracteres (atual: ${article.seo.meta_descricao.length})`,
    type: 'warning',
    articleIndex: index
  });
}

// Título: máximo 100 caracteres
if (article.titulo && article.titulo.length > 100) {
  errors.push({
    field: 'titulo',
    message: `Artigo ${index + 1}: Título excede 100 caracteres (atual: ${article.titulo.length})`,
    type: 'warning',
    articleIndex: index
  });
}
```

### 2. Atualizar Template JSON com Limites Claros

**Arquivo:** `src/components/admin/noticias-ai/NoticiasAIInput.tsx`

Atualizar o placeholder do textarea JSON para documentar os limites:

```typescript
placeholder={`Cole o JSON aqui...

ESTRUTURA OFICIAL:
{
  "noticias": [{
    "categoria": "Cidades",           // WHITELIST FIXA - ver lista abaixo
    "titulo": "...",                   // Obrigatório, máx 100 caracteres
    "slug": "titulo-em-kebab-case",   // Obrigatório, apenas a-z, 0-9 e hífen
    "resumo": "...",                   // Obrigatório, máx 160 caracteres
    "conteudo": "<p>...</p>",          // HTML, min 100 caracteres
    "fonte": "https://...",            // URL da fonte original
    "imagem": {
      "hero": "https://...",           // Imagem principal
      "og": "https://...",             // Imagem OG 1200x630 (opcional)
      "card": "https://...",           // Imagem card 800x450 (opcional)
      "alt": "Descrição",
      "credito": "Foto: Nome"
    },
    "tags": ["tag1", ...],             // OBRIGATÓRIO: 3 a 12 tags
    "seo": {
      "meta_titulo": "...",            // máx 60 caracteres
      "meta_descricao": "..."          // máx 160 caracteres
    }
  }]
}

CATEGORIAS PERMITIDAS (qualquer outra vira TAG):
Brasil, Cidades, Política, Economia, Justiça, Segurança Pública, 
Saúde, Educação, Ciência, Tecnologia, Meio Ambiente, Infraestrutura, 
Esportes, Entretenimento, Cultura, Comportamento, Lifestyle, 
Emprego & Renda, Mobilidade Urbana, Inclusão & PCD, Projetos Sociais, 
Inovação Pública, Conexão Academy, Web Rádio, Web TV, Geral`}
```

### 3. Atualizar Template JSON Download

**Arquivo:** `src/components/admin/noticias-ai/NoticiasAIInput.tsx`

Simplificar o template para seguir exatamente a especificação oficial:

```typescript
const JSON_TEMPLATE = {
  noticias: [
    {
      categoria: "Cidades",
      titulo: "Título da notícia (máximo 100 caracteres)",
      slug: "titulo-da-noticia-em-kebab-case",
      resumo: "Resumo com até 160 caracteres para exibição em cards e redes sociais.",
      conteudo: "<p><strong>Primeiro parágrafo em negrito com informações principais.</strong></p><h2>Subtítulo</h2><p>Desenvolvimento do conteúdo...</p>",
      fonte: "https://site-origem.com/noticia-original",
      imagem: {
        hero: "https://exemplo.com/imagem-principal.jpg",
        og: "https://exemplo.com/imagem-og-1200x630.jpg",
        card: "https://exemplo.com/imagem-card-800x450.jpg",
        alt: "Descrição acessível da imagem",
        credito: "Foto: Nome do Fotógrafo / Agência"
      },
      tags: ["Cotia", "Trânsito", "Mobilidade Urbana", "Prefeitura", "Obras", "Investimento"],
      seo: {
        meta_titulo: "Meta título otimizado (máx 60 caracteres)",
        meta_descricao: "Meta descrição com palavras-chave para SEO (máx 160 caracteres)."
      }
    }
  ]
};
```

### 4. Blindar Lógica de Importação

**Arquivo:** `src/pages/admin/NoticiasAI.tsx`

Atualizar a função `importArticle` para garantir tags entre 3-12:

```typescript
// Garantir entre 3 e 12 tags
let tags = article.tags || [];

// Se menos de 3 tags, complementar com tags contextuais
if (tags.length < 3) {
  const contextualTags = [
    categoryToUse || 'Notícias',
    'Cotia',
    'São Paulo',
    'Atualidades',
    'Destaque'
  ];
  for (const ft of contextualTags) {
    if (tags.length >= 3) break;
    if (!tags.some(t => t.toLowerCase() === ft.toLowerCase())) {
      tags.push(ft);
    }
  }
}

// Limitar a 12 tags
tags = tags.slice(0, 12);
```

### 5. Reforçar Edge Function com Regras Absolutas

**Arquivo:** `supabase/functions/noticias-ai-generate/index.ts`

Atualizar o `systemPrompt` para ser mais explícito sobre os limites:

```typescript
const systemPrompt = `Você é um jornalista experiente seguindo o padrão editorial da Agência Brasil.

## REGRAS ABSOLUTAS (NÃO VIOLAR):

### CATEGORIAS (WHITELIST FIXA - NUNCA CRIAR NOVAS)
Use APENAS estas categorias:
Brasil, Cidades, Política, Economia, Justiça, Segurança Pública, Saúde, Educação, Ciência, Tecnologia, Meio Ambiente, Infraestrutura, Esportes, Entretenimento, Cultura, Comportamento, Lifestyle, Emprego & Renda, Mobilidade Urbana, Inclusão & PCD, Projetos Sociais, Inovação Pública, Conexão Academy, Web Rádio, Web TV, Geral

Se o tema não se encaixar em nenhuma, use "Geral".
Temas específicos (Futebol, ENEM, SUS, nomes de cidades, bairros) vão nas TAGS, não na categoria.

### TAGS (OBRIGATÓRIO 3-12)
- Mínimo: 3 tags
- Máximo: 12 tags
- Incluir: nomes de cidades, bairros, órgãos públicos, pessoas citadas, eventos, subtemas

### LIMITES DE CARACTERES
- Título: máximo 100 caracteres
- Resumo/excerpt: máximo 160 caracteres
- Meta título: máximo 60 caracteres  
- Meta descrição: máximo 160 caracteres
- Tags individuais: máximo 40 caracteres cada

### FORMATAÇÃO DO CONTEÚDO
1. LIDE (1º parágrafo) SEMPRE em <strong>texto completo</strong>
2. Intertítulos: <h2>Título</h2>
3. Citações longas: <blockquote><p>"texto"</p></blockquote>
4. Atribuição: <strong>afirmou Fulano em entrevista.</strong>

### PROIBIÇÕES
- NÃO inclua URLs de imagens no texto
- NÃO inclua tags <img>
- NÃO invente informações
- NÃO crie categorias novas
`;
```

### 6. Atualizar Fallback de Tags com Contexto Local

**Arquivo:** `supabase/functions/noticias-ai-generate/index.ts`

Na função `ensureRequiredFields`, atualizar fallback:

```typescript
function ensureRequiredFields(article: NewsArticle, sourceUrl?: string): NewsArticle {
  let tags = article.tags || [];
  
  // Garantir mínimo 3 tags, máximo 12
  if (tags.length < 3) {
    const fallbackTags = [
      article.categoria || 'Notícias',
      'Cotia',              // Cidade principal do portal
      'São Paulo',          // Estado
      'Atualidades',
      'Destaque',
      'Região Metropolitana'
    ];
    while (tags.length < 3 && fallbackTags.length > 0) {
      const tag = fallbackTags.shift();
      if (tag && !tags.some(t => t.toLowerCase() === tag.toLowerCase())) {
        tags.push(tag);
      }
    }
  }
  
  return {
    ...article,
    tags: tags.slice(0, 12),  // Garantir máximo 12
    // ... resto dos campos
  };
}
```

---

## Resumo de Arquivos a Modificar

| # | Arquivo | Alterações |
|---|---------|------------|
| 1 | `src/components/admin/noticias-ai/NoticiasAIInput.tsx` | Validação de tags 3-12, SEO, limites de caracteres, placeholder atualizado, template simplificado |
| 2 | `src/pages/admin/NoticiasAI.tsx` | Garantir tags 3-12 na importação, fallback contextual |
| 3 | `supabase/functions/noticias-ai-generate/index.ts` | Prompt mais explícito, fallback de tags atualizado |

---

## Validação Pós-Implementação

Após as alterações, o sistema garantirá:

```text
┌─────────────────────────────────────────────────────────────────┐
│                    REGRAS BLINDADAS                             │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Categorias: APENAS 26 da whitelist (fallback → Geral)        │
│ ✓ Categoria inválida → convertida em TAG automaticamente       │
│ ✓ Tags: 3 mínimo, 12 máximo (erro se violar)                   │
│ ✓ Título: máx 100 chars (warning se exceder)                   │
│ ✓ Resumo: máx 160 chars (warning se exceder)                   │
│ ✓ Meta título: máx 60 chars (warning se exceder)               │
│ ✓ Meta descrição: máx 160 chars (warning se exceder)           │
│ ✓ Tags incluem: cidades, bairros, órgãos, pessoas, eventos     │
│ ✓ Fallback de tags contextualizado (Cotia, São Paulo)          │
│ ✓ Compatível com Google News e Discover                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Seção Técnica

### Fluxo de Validação Completo

```text
ENTRADA JSON
    │
    ▼
┌───────────────────┐
│ 1. Parse JSON     │
│    - Estrutura    │
│    - Sintaxe      │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ 2. Validar Campos │
│    Obrigatórios   │
│    - titulo ≥ 10  │
│    - slug válido  │
│    - resumo ≥ 30  │
│    - conteudo ≥100│
│    - categoria    │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ 3. Validar Limites│
│    - titulo ≤ 100 │
│    - resumo ≤ 160 │
│    - meta_tit ≤60 │
│    - meta_desc≤160│
│    - tags 3-12    │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ 4. Validar        │
│    Categoria      │
│    - Na whitelist?│
│    - Warning se ≠ │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ 5. Importação     │
│    - Fallback     │
│    - Cat→Tag conv │
│    - Tags 3-12    │
└───────────────────┘
```

