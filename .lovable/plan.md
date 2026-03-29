

# Correção: Quality Gate bloqueando imagens do cotia.sp.gov.br

## Problema Identificado

Todas as 49 notícias de Cotia estão sendo bloqueadas porque o site usa **lazy loading** (JNews/WordPress):
- O atributo `src` das imagens contém um placeholder (`jeg-empty.png`)
- As imagens reais estão em `data-src` e `data-srcset`
- As imagens extraídas do HTML sidebar contêm sufixos como `-120x86` (thumbnails), que são bloqueados pelo Quality Gate

## Plano de Correção

### 1. Melhorar extração de imagens na função `regional-process-item`

**Arquivo:** `supabase/functions/regional-process-item/index.ts`

Na função `fetchFullContent`:

- **Extrair og:image** do `<head>` da página como fonte prioritária de imagem (full-size, sem thumbnail)
- **Extrair `data-src`** além de `src` nas tags `<img>`, para suportar lazy loading
- **Remover sufixos de thumbnail** (`-120x86`, `-150x`, `-350x250`) da URL da imagem para obter a versão original em tamanho completo
- Retornar og:image como primeira opção na lista de imagens

### 2. Ajustar o Quality Gate para ser menos restritivo com imagens válidas

**Arquivos:** `supabase/functions/regional-process-item/index.ts` e `supabase/functions/autopost-publish/index.ts`

- Remover a regra `-120x86` do Quality Gate, pois a correção na extração já vai fornecer URLs limpas
- Manter as demais regras (placeholder, generico, no-image, default-image)
- Alternativamente: em vez de bloquear, tentar limpar o sufixo de thumbnail da URL antes de validar

### 3. Fallback para geração de imagem por IA

Quando nenhuma imagem válida for encontrada após a extração melhorada, invocar o gerador de imagens AI (`autopost-image-generator`) como fallback, em vez de bloquear a publicação.

## Detalhes Técnicos

```text
Fluxo atual:
  fetchFullContent → extrai src (placeholder) → images[0] = null ou thumbnail
  → Quality Gate → BLOQUEIA (-120x86 detectado)

Fluxo corrigido:
  fetchFullContent → extrai og:image (full-size) + data-src (limpo)
  → images[0] = URL full-size válida
  → Quality Gate → APROVADO
```

Mudanças na função `fetchFullContent`:
1. Antes de extrair imagens do conteúdo, buscar `<meta property="og:image" content="...">` no HTML completo
2. No regex de imagens, capturar `data-src` e `data-srcset` além de `src`
3. Função auxiliar `cleanThumbnailSuffix(url)` que remove padrões como `-\d+x\d+` do nome do arquivo

Mudanças no `validateNewsQuality`:
1. Aplicar `cleanThumbnailSuffix` na URL antes de validar
2. Adicionar filtro para placeholder images conhecidas (`jeg-empty.png`, `placeholder`)

