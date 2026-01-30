
# Plano: Implementação do Prompt Mestre — Módulo Notícias AI

## Análise da Situação Atual

O módulo Notícias AI já possui uma infraestrutura robusta com:
- Whitelist de 26 categorias
- Validação de tags (3-12)
- Limites de caracteres para SEO
- Fallback automático para "Geral"
- Geração de WebStory habilitada por padrão

### Lacunas Identificadas vs. Prompt Mestre

| # | Regra do Prompt Mestre | Status Atual | Ação Necessária |
|---|------------------------|--------------|-----------------|
| 1 | Sempre responder APENAS em JSON | ✅ Implementado | Nenhuma |
| 2 | Whitelist fixa de 26 categorias | ✅ Implementado | Nenhuma |
| 3 | Análise inteligente antes de usar "Geral" | ⚠️ Parcial | Reforçar no prompt |
| 4 | Regra visual "Cidade \| Categoria" | ❌ Faltando | Implementar no frontend |
| 5 | 1 cidade por resposta, até 12 notícias | ❌ Faltando | Adicionar ao prompt |
| 6 | Mencionar Cotia em notícias de cidades vizinhas | ❌ Faltando | Adicionar ao prompt |
| 7 | Crédito oficial (Prefeitura/Secretaria + URL) | ⚠️ Parcial | Reforçar padrão |
| 8 | Campo `destaque` com valores padrão | ⚠️ Parcial | Adicionar ao template JSON |
| 9 | Campo `generateWebStory: true` por padrão | ✅ Implementado | Nenhuma |
| 10 | Nunca ultrapassar limites de caracteres | ⚠️ Warning, não erro | Manter (warning é adequado) |

---

## Alterações Propostas

### 1. Atualizar Edge Function com Prompt Mestre Completo

**Arquivo:** `supabase/functions/noticias-ai-generate/index.ts`

Substituir o `systemPrompt` atual pelo Prompt Mestre oficial:

```typescript
const systemPrompt = `Você é a IA oficial de geração e reescrita de notícias do portal **Conexão na Cidade**.

## 1. FORMATO DE SAÍDA (OBRIGATÓRIO)
Sempre responda EXCLUSIVAMENTE em JSON válido. Nunca escreva texto fora do JSON.

## 2. CATEGORIAS (WHITELIST FIXA)
Use SOMENTE uma destas categorias:
Brasil, Cidades, Política, Economia, Justiça, Segurança Pública, Saúde, Educação, Ciência, Tecnologia, Meio Ambiente, Infraestrutura, Esportes, Entretenimento, Cultura, Comportamento, Lifestyle, Emprego & Renda, Mobilidade Urbana, Inclusão & PCD, Projetos Sociais, Inovação Pública, Conexão Academy, Web Rádio, Web TV, Geral

## 3. REGRA DE CATEGORIA INTELIGENTE
Antes de usar "Geral":
1. Analise título e conteúdo semanticamente
2. Tente encaixar a notícia em UMA categoria existente da whitelist
3. Use palavras-chave e análise de contexto
4. Só use "Geral" se NENHUMA categoria fizer sentido
Se categoria não existe na whitelist → vira TAG + categoria = "Geral"

## 4. REGRAS EDITORIAIS
- Processar 1 cidade por resposta
- Gerar até 12 notícias relevantes por resposta
- Reescrever mantendo ~95-105% do tamanho original
- NUNCA resumir ou omitir informações
- SEMPRE mencionar "Cotia" no corpo das notícias de cidades vizinhas
- Fonte sempre oficial (prefeitura, secretaria, governo)
- Crédito de imagem: "Prefeitura/Secretaria/Agência + URL oficial"

## 5. CONTEÚDO HTML (OBRIGATÓRIO)
- Usar apenas: <p>, <h2>, <blockquote>, <strong>, <ul>, <li>
- Primeiro parágrafo SEMPRE em: <p><strong>Lide completo</strong></p>
- Citações: <blockquote><p>"texto"</p></blockquote>
- NÃO incluir tags <img> ou URLs de imagens no conteúdo

## 6. TAGS (OBRIGATÓRIO 3-12)
- Mínimo: 3 tags
- Máximo: 12 tags
- SEMPRE incluir: cidade da notícia, Cotia, temas relevantes
- Se categoria virar "Geral", a categoria original vira TAG

## 7. LIMITES DE CARACTERES (VALIDAÇÃO OBRIGATÓRIA)
- titulo: 10 a 100 caracteres
- resumo: 30 a 160 caracteres
- meta_titulo: máximo 60 caracteres
- meta_descricao: máximo 160 caracteres
- slug: apenas a-z, 0-9 e hífen
NUNCA ultrapasse estes limites.

## 8. FORMATO JSON DE SAÍDA
{
  "noticias": [{
    "categoria": "Categoria da whitelist",
    "titulo": "Título (max 100 chars)",
    "slug": "titulo-em-kebab-case",
    "resumo": "Resumo (max 160 chars)",
    "conteudo": "<p><strong>Lide.</strong></p>...",
    "fonte": "URL oficial da fonte",
    "imagem": {
      "hero": "URL",
      "og": "URL 1200x630",
      "card": "URL 800x450",
      "alt": "Descrição acessível",
      "credito": "Prefeitura/Agência + URL"
    },
    "tags": ["cidade", "Cotia", "tema1", "..."],
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

### 2. Atualizar Template JSON Oficial

**Arquivo:** `src/components/admin/noticias-ai/NoticiasAIInput.tsx`

Adicionar os campos `destaque` e `generateWebStory` ao template:

```typescript
const JSON_TEMPLATE = {
  noticias: [
    {
      categoria: "Cidades",
      titulo: "Título da notícia (máximo 100 caracteres)",
      slug: "titulo-da-noticia-em-kebab-case",
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

### 3. Implementar Regra Visual "Cidade | Categoria"

**Novo arquivo:** `src/utils/categoryDisplay.ts`

Criar helper para exibição contextual de categoria:

```typescript
/**
 * Regra visual: Cidade | Categoria
 * - Notícias de cidades diferentes de Cotia: exibe "Cidade | Categoria"
 * - Notícias de Cotia: exibe apenas a categoria
 */
export function getCategoryDisplay(
  category: string, 
  tags: string[], 
  content?: string
): string {
  // Detectar cidade nas tags ou conteúdo
  const cotiaKeywords = ['cotia', 'granja viana', 'caucaia do alto'];
  const cityTags = tags.filter(t => 
    !cotiaKeywords.some(k => t.toLowerCase().includes(k)) &&
    // Lista de cidades da região que não são Cotia
    ['são paulo', 'osasco', 'carapicuíba', 'barueri', 'itapevi', 
     'jandira', 'embu', 'taboão', 'vargem grande', 'ibiúna'].some(c => 
      t.toLowerCase().includes(c)
    )
  );
  
  // Se há cidade diferente de Cotia nas tags
  if (cityTags.length > 0) {
    return `${cityTags[0]} | ${category}`;
  }
  
  // Caso padrão: apenas categoria
  return category;
}
```

### 4. Atualizar Validação JSON com Campo `destaque`

**Arquivo:** `src/components/admin/noticias-ai/NoticiasAIInput.tsx`

Validar o campo `destaque` e `generateWebStory`:

```typescript
// Na função validateNewsJson, adicionar:

// Validar destaque
if (article.destaque && !['none', 'home', 'featured', 'urgent'].includes(article.destaque)) {
  errors.push({ 
    field: 'destaque', 
    message: `Artigo ${index + 1}: Destaque inválido (use: none, home, featured, urgent)`, 
    type: 'error', 
    articleIndex: index 
  });
}

// Validar generateWebStory (deve ser boolean)
if (article.generateWebStory !== undefined && typeof article.generateWebStory !== 'boolean') {
  errors.push({ 
    field: 'generateWebStory', 
    message: `Artigo ${index + 1}: generateWebStory deve ser true ou false`, 
    type: 'warning', 
    articleIndex: index 
  });
}
```

### 5. Garantir WebStory Habilitado por Padrão na Importação

**Arquivo:** `src/pages/admin/NoticiasAI.tsx`

Na função `importArticle`, garantir valor padrão:

```typescript
// Garantir WebStory habilitado por padrão se não especificado
const generateWebStory = article.generateWebStory ?? true;

// Na inserção:
auto_generate_webstory: generateWebStory,
```

---

## Resumo de Arquivos a Modificar

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `supabase/functions/noticias-ai-generate/index.ts` | Substituir systemPrompt pelo Prompt Mestre completo |
| 2 | `src/components/admin/noticias-ai/NoticiasAIInput.tsx` | Atualizar JSON_TEMPLATE com `destaque` e `generateWebStory` |
| 3 | `src/utils/categoryDisplay.ts` | Criar helper para regra visual "Cidade \| Categoria" |
| 4 | `src/pages/admin/NoticiasAI.tsx` | Garantir WebStory = true por padrão |

---

## Regras Blindadas Após Implementação

```text
┌─────────────────────────────────────────────────────────────────────┐
│                 PROMPT MESTRE — REGRAS BLINDADAS                    │
├─────────────────────────────────────────────────────────────────────┤
│ ✓ Resposta SEMPRE em JSON válido (nunca texto livre)               │
│ ✓ Categorias: APENAS 26 da whitelist                               │
│ ✓ Análise inteligente antes de usar "Geral"                        │
│ ✓ Categoria inválida → TAG + fallback "Geral"                      │
│ ✓ Regra visual "Cidade | Categoria" para cidades vizinhas          │
│ ✓ 1 cidade por resposta, até 12 notícias                           │
│ ✓ Mencionar "Cotia" em notícias de cidades vizinhas                │
│ ✓ Crédito oficial: Prefeitura/Secretaria + URL                     │
│ ✓ Tags: 3 mínimo, 12 máximo (SEMPRE incluir cidade + Cotia)        │
│ ✓ Limites SEO: titulo ≤100, resumo ≤160, meta ≤60/160              │
│ ✓ Conteúdo HTML: Lide em <strong>, <h2>, <blockquote>              │
│ ✓ destaque: none | home | featured | urgent                        │
│ ✓ generateWebStory: true por padrão                                │
│ ✓ NÃO incluir <img> ou URLs de imagem no conteúdo                  │
│ ✓ Manter ~95-105% do tamanho original (nunca resumir)              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Seção Técnica

### Fluxo de Processamento Atualizado

```text
ENTRADA (Texto/URL/JSON/Lote)
         │
         ▼
┌────────────────────────┐
│ 1. Detecção de Modo    │
│    auto/url/batch/json │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ 2. Edge Function       │
│    - Prompt Mestre     │
│    - Análise semântica │
│    - Whitelist check   │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ 3. Validação JSON      │
│    - Tags 3-12         │
│    - Limites chars     │
│    - Categoria válida  │
│    - destaque válido   │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ 4. Importação          │
│    - Fallback Geral    │
│    - Cat→Tag convert   │
│    - WebStory = true   │
│    - Cotia mencionada  │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ 5. Exibição Frontend   │
│    - Cidade | Categoria│
│    - (se cidade ≠ Cotia)│
└────────────────────────┘
```

### Interface NewsArticle Atualizada

```typescript
interface NewsArticle {
  categoria: string;         // Da whitelist
  titulo: string;            // 10-100 chars
  slug: string;              // a-z, 0-9, hífen
  resumo: string;            // 30-160 chars
  conteudo: string;          // HTML com lide em <strong>
  fonte: string;             // URL oficial
  imagem: {
    hero: string;            // Imagem principal
    og?: string;             // 1200x630
    card?: string;           // 800x450
    alt: string;             // Acessibilidade
    credito: string;         // Prefeitura/Agência + URL
    galeria?: string[];      // Imagens adicionais
  };
  tags: string[];            // 3-12, inclui cidade + Cotia
  seo: {
    meta_titulo: string;     // max 60
    meta_descricao: string;  // max 160
  };
  destaque: 'none' | 'home' | 'featured' | 'urgent';
  generateWebStory: boolean; // default: true
}
```
