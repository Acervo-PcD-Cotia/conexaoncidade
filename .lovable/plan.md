
# Plano: Atualização do Prompt Mestre Oficial — Notícias AI

## Análise Comparativa: Versão Atual vs. Nova Versão

| # | Campo/Regra | Versão Atual | Nova Versão | Status |
|---|-------------|--------------|-------------|--------|
| 1 | `subtitulo` limite | Não validado | 0-160 caracteres | ❌ Faltando |
| 2 | Regra categoria inteligente | Analisa título + conteúdo | Analisa título + **subtitulo** + conteúdo | ⚠️ Atualizar |
| 3 | Regras editoriais | Lista básica | + "Preservar dados factuais (datas, números, locais, serviços, regras)" | ⚠️ Atualizar |
| 4 | Campos obrigatórios | Implícito | Lista explícita com todas as regras | ⚠️ Atualizar |
| 5 | `chapeu` definição | Básico | "categoria em MAIÚSCULAS" explícito | ✅ OK |
| 6 | `destaque` valores | Listados | Mantido igual | ✅ OK |
| 7 | `generateWebStory` padrão | true | true | ✅ OK |

---

## Alterações Necessárias

### 1. Atualizar Edge Function com Novo Prompt Mestre

**Arquivo:** `supabase/functions/noticias-ai-generate/index.ts`

Substituir o `systemPrompt` (linhas 611-687) pelo novo Prompt Mestre completo com as seguintes adições:

- Seção 3: Incluir "subtítulo" na análise semântica
- Seção 4: Adicionar regra de preservação de dados factuais
- Seção 7: Adicionar limite do subtítulo (0-160 caracteres)
- Seção 8: Listar todos os campos obrigatórios explicitamente

```typescript
const systemPrompt = `Você é a IA oficial de geração e reescrita de notícias do portal **Conexão na Cidade**.

## 1. FORMATO DE SAÍDA (OBRIGATÓRIO)
Sempre responda EXCLUSIVAMENTE em JSON válido. Nunca escreva texto fora do JSON.

## 2. CATEGORIAS (WHITELIST FIXA)
Use SOMENTE uma destas categorias:
Brasil, Cidades, Política, Economia, Justiça, Segurança Pública, Saúde, Educação, Ciência, Tecnologia, Meio Ambiente, Infraestrutura, Esportes, Entretenimento, Cultura, Comportamento, Lifestyle, Emprego & Renda, Mobilidade Urbana, Inclusão & PCD, Projetos Sociais, Inovação Pública, Conexão Academy, Web Rádio, Web TV, Geral

## 3. REGRA DE CATEGORIA INTELIGENTE (ANTES DO FALLBACK)
Antes de usar "Geral":
1. Analise título + subtítulo + conteúdo semanticamente
2. Tente encaixar a notícia em UMA categoria existente da whitelist
3. Use palavras-chave e contexto
4. Só use "Geral" se NENHUMA categoria fizer sentido
Se a categoria original não estiver na whitelist:
- categoria final = "Geral"
- a categoria original vira TAG obrigatória

## 4. REGRAS EDITORIAIS (OBRIGATÓRIO)
- 1 cidade por resposta
- Gerar até 12 notícias relevantes por resposta
- Reescrever mantendo ~95-105% do tamanho original (NUNCA resumir)
- Preservar todos os dados factuais (datas, números, locais, serviços, regras)
- NUNCA inventar informações
- SEMPRE mencionar "Cotia" no corpo das notícias de cidades vizinhas
- Fonte sempre oficial (prefeitura/secretaria/governo)
- NÃO incluir URLs de imagens dentro do conteúdo

## 5. CONTEÚDO HTML (OBRIGATÓRIO)
O campo "conteudo" deve ser HTML válido usando APENAS estas tags:
<p>, <h2>, <blockquote>, <strong>, <ul>, <li>

Regras:
- O primeiro parágrafo deve ser o lide em negrito:
  <p><strong>Lide completo com informações principais.</strong></p>
- Intertítulos: usar <h2>...</h2>
- Citações longas: usar <blockquote>...</blockquote>
- Parágrafos sempre separados por <p>...</p>

PROIBIÇÕES:
- NÃO inclua URLs de imagens no conteúdo
- NÃO inclua tags HTML fora da lista permitida
- NÃO inclua array de "tags" dentro do conteúdo

## 6. TAGS (OBRIGATÓRIO 3-12)
- Mínimo: 3 tags
- Máximo: 12 tags
- SEMPRE incluir:
  1) A CIDADE principal da notícia como tag limpa (ex: "Itapevi")
  2) "Cotia"
  3) Tema(s) relevante(s)
- Se categoria final virar "Geral", a categoria original vira TAG obrigatória
- Tags devem ter no máximo 40 caracteres cada

## 7. LIMITES DE CARACTERES (VALIDAÇÃO OBRIGATÓRIA)
- titulo: 10 a 100 caracteres
- subtitulo: 0 a 160 caracteres (curto e direto)
- resumo: 30 a 160 caracteres
- seo.meta_titulo: máximo 60 caracteres
- seo.meta_descricao: máximo 160 caracteres
- slug: apenas a-z, 0-9 e hífen (kebab-case)
NUNCA ultrapasse estes limites.

## 8. CAMPOS OBRIGATÓRIOS DO JSON
Cada notícia DEVE conter:
categoria, titulo, slug, subtitulo, chapeu, resumo, conteudo, fonte, imagem(hero,og,card,alt,credito,galeria), tags, seo(meta_titulo,meta_descricao), destaque, generateWebStory

Regras específicas:
- chapeu = categoria em MAIÚSCULAS (ex: "SAÚDE", "EDUCAÇÃO")
- destaque deve ser um destes: none, home, featured, urgent
- generateWebStory deve ser true por padrão

## 9. FORMATO JSON DE SAÍDA (OBRIGATÓRIO)
{
  "noticias": [{
    "categoria": "Categoria da whitelist",
    "titulo": "Título (max 100 chars)",
    "slug": "titulo-em-kebab-case",
    "subtitulo": "Linha fina descritiva (max 160 chars)",
    "chapeu": "CATEGORIA EM MAIÚSCULAS",
    "resumo": "Resumo (max 160 chars)",
    "conteudo": "<p><strong>Lide...</strong></p><h2>...</h2><p>...</p>",
    "fonte": "URL oficial da fonte",
    "imagem": {
      "hero": "URL",
      "og": "URL 1200x630",
      "card": "URL 800x450",
      "alt": "Descrição acessível",
      "credito": "Prefeitura/Secretaria/Agência + URL oficial",
      "galeria": []
    },
    "tags": ["Cidade", "Cotia", "tema1"],
    "seo": {
      "meta_titulo": "Meta título (max 60)",
      "meta_descricao": "Meta descrição (max 160)"
    },
    "destaque": "none",
    "generateWebStory": true
  }]
}

## REGRA FINAL ABSOLUTA
Se qualquer regra acima for violada, a resposta é considerada inválida.
Valide TUDO antes de responder. Responda APENAS com JSON válido.`;
```

### 2. Atualizar Template JSON no Frontend

**Arquivo:** `src/components/admin/noticias-ai/NoticiasAIInput.tsx`

Adicionar campo `subtitulo` ao template oficial:

```typescript
const JSON_TEMPLATE = {
  noticias: [
    {
      categoria: "Cidades",
      titulo: "Título da notícia (máximo 100 caracteres)",
      slug: "titulo-da-noticia-em-kebab-case",
      subtitulo: "Linha fina descritiva (máximo 160 caracteres)",
      chapeu: "CIDADES",
      resumo: "Resumo com até 160 caracteres para exibição em cards.",
      conteudo: "<p><strong>Primeiro parágrafo em negrito (Lide).</strong></p><h2>Subtítulo</h2><p>Desenvolvimento...</p>",
      fonte: "https://prefeitura.gov.br/noticia-original",
      imagem: {
        hero: "https://exemplo.com/imagem-principal.jpg",
        og: "https://exemplo.com/imagem-og-1200x630.jpg",
        card: "https://exemplo.com/imagem-card-800x450.jpg",
        alt: "Descrição acessível da imagem",
        credito: "Foto: Prefeitura Municipal / Divulgação",
        galeria: []
      },
      tags: ["Cotia", "São Paulo", "Prefeitura", "Investimento", "Obras", "Desenvolvimento"],
      seo: {
        meta_titulo: "Meta título (máx 60 caracteres)",
        meta_descricao: "Meta descrição para SEO (máx 160 caracteres)."
      },
      destaque: "none",
      generateWebStory: true
    }
  ]
};
```

### 3. Adicionar Validação do Campo `subtitulo`

**Arquivo:** `src/components/admin/noticias-ai/NoticiasAIInput.tsx`

Na função `validateNewsJson`, adicionar validação do subtítulo:

```typescript
// Subtítulo: máximo 160 caracteres
if (article.subtitulo && article.subtitulo.length > 160) {
  errors.push({ 
    field: 'subtitulo', 
    message: `Artigo ${index + 1}: Subtítulo excede 160 caracteres (atual: ${article.subtitulo.length})`, 
    type: 'warning', 
    articleIndex: index 
  });
}
```

### 4. Atualizar Interface NewsArticle

**Arquivo:** `supabase/functions/noticias-ai-generate/index.ts`

Tornar `subtitulo` campo obrigatório na interface:

```typescript
interface NewsArticle {
  titulo: string;
  slug: string;
  subtitulo: string;  // Agora obrigatório
  resumo: string;
  conteudo: string;
  categoria: string;
  chapeu: string;     // Agora obrigatório
  tags: string[];
  imagem: {
    hero: string;
    og?: string;
    card?: string;
    alt: string;
    credito: string;
    galeria?: string[];
  };
  seo: {
    meta_titulo: string;
    meta_descricao: string;
  };
  fonte: string;
  editor?: string;
  destaque: 'none' | 'home' | 'featured' | 'urgent';
  generateWebStory: boolean;
  is_home_highlight?: boolean;
  is_urgent?: boolean;
  is_featured?: boolean;
}
```

---

## Resumo de Arquivos a Modificar

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `supabase/functions/noticias-ai-generate/index.ts` | Substituir systemPrompt pelo novo Prompt Mestre completo (9 seções) |
| 2 | `supabase/functions/noticias-ai-generate/index.ts` | Atualizar interface NewsArticle com campos obrigatórios |
| 3 | `src/components/admin/noticias-ai/NoticiasAIInput.tsx` | Atualizar JSON_TEMPLATE com subtitulo e chapeu |
| 4 | `src/components/admin/noticias-ai/NoticiasAIInput.tsx` | Adicionar validação do subtitulo (max 160 chars) |

---

## Regras Blindadas Após Atualização

```text
┌─────────────────────────────────────────────────────────────────────────┐
│            PROMPT MESTRE OFICIAL — REGRAS BLINDADAS (v2)                │
├─────────────────────────────────────────────────────────────────────────┤
│ ✓ Resposta SEMPRE em JSON válido (nunca texto livre)                   │
│ ✓ Categorias: APENAS 26 da whitelist                                   │
│ ✓ Análise inteligente: título + SUBTÍTULO + conteúdo                   │
│ ✓ Categoria inválida → TAG obrigatória + fallback "Geral"              │
│ ✓ 1 cidade por resposta, até 12 notícias                               │
│ ✓ Manter ~95-105% do tamanho original (NUNCA resumir)                  │
│ ✓ PRESERVAR dados factuais (datas, números, locais, serviços, regras)  │
│ ✓ NUNCA inventar informações                                           │
│ ✓ Mencionar "Cotia" em notícias de cidades vizinhas                    │
│ ✓ Fonte sempre oficial (prefeitura/secretaria/governo)                 │
│ ✓ NÃO incluir URLs de imagens no conteúdo                              │
│ ✓ HTML: apenas <p>, <h2>, <blockquote>, <strong>, <ul>, <li>          │
│ ✓ Lide: <p><strong>...</strong></p>                                    │
│ ✓ Tags: 3-12, cidade principal + Cotia + temas relevantes              │
│ ✓ Tags: máximo 40 caracteres cada                                       │
│ ✓ Limites: titulo 10-100, subtitulo 0-160, resumo 30-160               │
│ ✓ Limites SEO: meta_titulo ≤60, meta_descricao ≤160                    │
│ ✓ chapeu = categoria em MAIÚSCULAS                                      │
│ ✓ destaque: none | home | featured | urgent                            │
│ ✓ generateWebStory: true por padrão                                    │
│ ✓ Campos obrigatórios listados explicitamente                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Seção Técnica

### Fluxo de Processamento Atualizado

```text
ENTRADA (Texto/URL/JSON/Lote)
         │
         ▼
┌────────────────────────────┐
│ 1. Detecção de Modo        │
│    auto/url/batch/json     │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────┐
│ 2. Edge Function           │
│    - Prompt Mestre v2      │
│    - 9 seções de regras    │
│    - Análise semântica     │
│    - Whitelist check       │
│    - Preservação factual   │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────┐
│ 3. Validação JSON          │
│    - Tags 3-12 (max 40ch)  │
│    - titulo 10-100         │
│    - subtitulo 0-160       │
│    - resumo 30-160         │
│    - meta_titulo ≤60       │
│    - meta_descricao ≤160   │
│    - destaque válido       │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────┐
│ 4. Importação              │
│    - Fallback Geral        │
│    - Cat→Tag convert       │
│    - WebStory = true       │
│    - chapeu = MAIÚSCULAS   │
└────────────────────────────┘
```

### Estrutura JSON Oficial Completa

```json
{
  "noticias": [{
    "categoria": "Categoria da whitelist",
    "titulo": "Título (10-100 chars)",
    "slug": "titulo-em-kebab-case",
    "subtitulo": "Linha fina (0-160 chars)",
    "chapeu": "CATEGORIA EM MAIÚSCULAS",
    "resumo": "Resumo (30-160 chars)",
    "conteudo": "<p><strong>Lide...</strong></p>...",
    "fonte": "URL oficial",
    "imagem": {
      "hero": "URL principal",
      "og": "URL 1200x630",
      "card": "URL 800x450",
      "alt": "Descrição acessível",
      "credito": "Crédito oficial",
      "galeria": []
    },
    "tags": ["Cidade", "Cotia", "tema"],
    "seo": {
      "meta_titulo": "Meta (max 60)",
      "meta_descricao": "Descrição (max 160)"
    },
    "destaque": "none",
    "generateWebStory": true
  }]
}
```
