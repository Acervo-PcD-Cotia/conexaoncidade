
# Plano: Importacao/Correcao de Imagens e Datas no Noticias AI

## Resumo do Problema

Com base na analise da noticia "Festival Gastronomico de Cotia":

| Campo | Valor no Banco | Valor Correto |
|-------|----------------|---------------|
| Imagem | `festival-gastronomico_0001.jpeg` (quebrada) | `chef-placing-herb-gourmet-meal-1512x1080.jpg` |
| Data | 02/02/2026 12:32 | **19/01/2026** (fonte original) |
| `original_published_at` | NULL | 19/01/2026 |

**Estatisticas atuais do banco:**
- 105 noticias publicadas
- 29 sem imagem valida
- 60 sem `original_published_at`

---

## Solucao Proposta

### 1. Dialog de Correcao de Imagem (Similar ao DateCorrectionDialog)

Criar um novo componente `ImageCorrectionDialog` que permite:

**Modo 1: Buscar imagem da fonte automaticamente**
- Usa Firecrawl para acessar a URL fonte
- Extrai todas as imagens do artigo original
- Apresenta galeria para o usuario escolher a melhor

**Modo 2: Definir URL manualmente**
- Campo de input para colar URL da imagem
- Preview da imagem antes de confirmar
- Validacao HEAD request para verificar se URL funciona

---

### 2. Integracao com Lista de Noticias (NewsList.tsx)

Adicionar botao "Corrigir Imagens" na barra de acoes em lote:

```text
[Excluir] [Corrigir Datas] [Corrigir Imagens] [Cancelar]
```

---

### 3. Edge Function para Extracao de Imagens

Criar `fix-news-images` que:
1. Recebe array de `newsIds`
2. Acessa URL fonte via Firecrawl
3. Extrai imagens do conteudo (og:image, article images)
4. Retorna lista de URLs candidatas
5. Opcionalmente aplica correcao automatica

---

### 4. Validacao de Imagem durante Importacao JSON

Modificar o fluxo de importacao no `NoticiasAI.tsx`:

**Antes de inserir no banco:**
1. Fazer HEAD request na URL da imagem
2. Se falhar, tentar extensoes alternativas (.jpg/.jpeg)
3. Se ainda falhar, marcar como "imagem invalida"
4. Mostrar alerta ao usuario antes da importacao

---

## Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/components/admin/ImageCorrectionDialog.tsx` | Criar | Modal para correcao de imagens em lote |
| `src/pages/admin/NewsList.tsx` | Modificar | Adicionar botao "Corrigir Imagens" |
| `supabase/functions/fix-news-images/index.ts` | Criar | Edge function para extracao de imagens via Firecrawl |
| `src/pages/admin/NoticiasAI.tsx` | Modificar | Adicionar validacao de imagem antes da importacao |
| `src/components/admin/noticias-ai/NoticiasAIJsonTab.tsx` | Modificar | Indicador visual de imagens invalidas |

---

## Detalhes de Implementacao

### ImageCorrectionDialog.tsx

```typescript
interface ImageCorrectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNews: Array<{
    id: string;
    title: string;
    featured_image_url: string | null;
    source: string | null;
  }>;
  onSuccess: () => void;
}

type CorrectionMode = "auto" | "manual";

// Estados:
// - mode: "auto" | "manual"
// - manualUrl: string
// - isProcessing: boolean
// - extractedImages: string[] (para modo auto)
// - selectedImageUrl: string | null
// - results: ProcessResult[]
```

**UI do Dialog:**
1. RadioGroup: "Buscar da fonte" vs "Definir manualmente"
2. Se modo auto: galeria de imagens extraidas com selecao
3. Se modo manual: input de URL + preview
4. Lista de noticias selecionadas
5. Botao "Corrigir Imagens"
6. Progress bar durante processamento
7. Resultados ao final

---

### fix-news-images Edge Function

```typescript
// Entrada:
{
  newsIds: string[],
  mode: "extract" | "validate" | "apply",
  imageUrl?: string  // Para modo "apply" manual
}

// Saida (modo extract):
{
  success: true,
  results: [{
    id: "...",
    title: "...",
    currentImage: "...",
    extractedImages: ["url1", "url2", ...],
    recommendedImage: "url1",
    status: "success" | "error"
  }]
}

// Logica de extracao:
// 1. Firecrawl scrape da fonte
// 2. Buscar og:image no metadata
// 3. Buscar todas <img> no conteudo
// 4. Filtrar logos/icones
// 5. Ordenar por tamanho estimado
// 6. Validar URLs com HEAD request
```

---

### Validacao na Importacao JSON

Modificar `NoticiasAI.tsx` funcao `importArticle()`:

```typescript
// Antes de inserir:
async function validateImageBeforeImport(imageUrl: string): Promise<{
  valid: boolean;
  correctedUrl: string | null;
}> {
  // 1. HEAD request
  // 2. Se 404, tentar .jpg <-> .jpeg
  // 3. Retornar URL corrigida ou null
}

// No importArticle():
const imageValidation = await validateImageBeforeImport(article.imagem.hero);
const finalImageUrl = imageValidation.correctedUrl || article.imagem.hero;

// Insert com imagem validada
.insert({
  featured_image_url: finalImageUrl,
  og_image_url: finalImageUrl,
  card_image_url: finalImageUrl,
  // ...
})
```

---

### Indicador Visual no NoticiasAIJsonTab

Adicionar badge de "Imagem Invalida" ao lado da thumbnail:

```tsx
{!imageValid && (
  <Badge variant="destructive" className="absolute top-1 right-1 text-xs">
    Imagem invalida
  </Badge>
)}
```

---

## Correcao Imediata da Noticia Especifica

Para corrigir a noticia do Festival Gastronomico:

```sql
UPDATE news 
SET 
  featured_image_url = 'https://cotia.sp.gov.br/wp-content/uploads/2026/01/chef-placing-herb-gourmet-meal-1512x1080.jpg',
  og_image_url = 'https://cotia.sp.gov.br/wp-content/uploads/2026/01/chef-placing-herb-gourmet-meal-1512x1080.jpg',
  card_image_url = 'https://cotia.sp.gov.br/wp-content/uploads/2026/01/chef-placing-herb-gourmet-meal-1512x1080.jpg',
  published_at = '2026-01-19T12:00:00Z',
  original_published_at = '2026-01-19T12:00:00Z'
WHERE slug = 'festival-gastronomico-de-cotia-une-sabores-desconto-e-incentivo-a-economia-local';
```

---

## Resumo das Funcionalidades

| Funcionalidade | Antes | Depois |
|---------------|-------|--------|
| Correcao de imagem em lote | Nao existia | Via dialog visual |
| Extracao automatica de imagem | Nao existia | Via Firecrawl |
| Validacao de imagem na importacao | Nao existia | HEAD request + fallback |
| Indicador de imagem invalida | Nao existia | Badge visual no preview |
| Correcao manual de URL | Nao existia | Input + preview |

---

## Resultado Esperado

1. **Noticia do Festival Gastronomico**: imagem e data corrigidas
2. **Novas importacoes**: imagens validadas automaticamente
3. **Noticias existentes**: ferramenta em lote para corrigir
4. **UX**: feedback visual claro sobre status das imagens
