
# Extrator Automatico de Imagens da Descricao

## Problema
Quando o usuario cadastra noticias (Relatorio TXT, Noticias AI ou qualquer modo), a descricao frequentemente contem URLs de imagens seguidas de legendas/creditos. Exemplo real:

```
https://imagens.ebc.com.br/nx_rzBAG6oCC-c6fa2IsMlQBA8g=/1170x700/smart/...0g0a4305.jpg?
https://imagens.ebc.com.br/fZUbYwNoEVxMwJlbHab8dXGdCQ=/754x0/smart/...0g0a4196_0.jpg
Moradores denunciam saques nos imoveis interditados - Foto Rovena Rosa/Agencia Brasil
```

Essas imagens sao ignoradas e ficam como texto lixo na descricao. Devem ser extraidas e adicionadas automaticamente a noticia.

## Solucao

### 1. Criar funcao utilitaria `extractImagesFromDescription`

**Arquivo novo**: `src/utils/extractDescriptionImages.ts`

Uma funcao pura que:
- Recebe uma string de descricao
- Identifica todas as URLs de imagens (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`)
- Captura a linha seguinte a cada imagem como legenda/credito (se nao for outra URL)
- Retorna: `{ cleanDescription, images: [{ url, caption }] }`
- Remove as URLs de imagens e suas legendas da descricao limpa

Logica de deteccao:
```text
Linha 1: https://...image.jpg  --> imagem detectada
Linha 2: Foto Fulano/Agencia   --> legenda associada (nao comeca com http)
Linha 3: texto normal           --> faz parte da descricao limpa
```

### 2. Integrar no Relatorio TXT (`handleAdd`)

**Arquivo**: `src/pages/admin/RelatorioTXT.tsx`

- No `handleAdd`, antes de salvar o item, chamar `extractImagesFromDescription(form.descricao)`
- Se imagens forem encontradas:
  - A primeira imagem preenche `linkImagem` (se estiver vazio)
  - A descricao e substituida pela versao limpa (sem as URLs)
  - Mostrar toast informando quantas imagens foram extraidas
- No `mapEntryToItem`, aplicar a mesma logica para importacoes TXT/JSON

### 3. Integrar no Noticias AI (edge function)

**Arquivo**: `supabase/functions/noticias-ai-generate/index.ts`

- Adicionar funcao `extractImagesFromText(text)` na edge function
- Nos modos `manual`, `json` (direct parse) e `auto`:
  - Antes de enviar para a IA ou ao processar JSON direto, extrair imagens do conteudo/descricao
  - As imagens extraidas sao adicionadas ao campo `imagem.galeria`
  - A primeira imagem extraida preenche `imagem.hero` (se estiver vazio)
- No modo `batch`, cada item do lote passa pela mesma extracao

### 4. Integrar no campo `descricao` do formulario (UX)

**Arquivo**: `src/pages/admin/RelatorioTXT.tsx`

- Adicionar um indicador visual abaixo do campo Descricao quando imagens forem detectadas
- Mostrar preview das imagens encontradas com as legendas
- Exemplo: "2 imagens detectadas na descricao - serao extraidas automaticamente"

## Detalhes Tecnicos

### Regex de deteccao:
```typescript
const IMAGE_URL_REGEX = /^(https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif)(\?[^\s]*)?)$/i;
```

### Estrutura de retorno:
```typescript
interface ExtractedImage {
  url: string;
  caption: string;  // linha seguinte se nao for URL
  credit: string;   // extraido da legenda (ex: "Foto Fulano/Agencia")
}

interface ExtractionResult {
  cleanDescription: string;
  images: ExtractedImage[];
}
```

### Fluxo no Relatorio TXT:
1. Usuario cola descricao com URLs de imagens
2. Ao clicar "Adicionar Noticia", o sistema extrai as imagens
3. `linkImagem` e preenchido com a primeira (se vazio)
4. Descricao salva fica limpa, sem URLs
5. Toast: "2 imagens extraidas da descricao"

### Fluxo no Noticias AI:
1. No modo `json` (direct parse), antes de inserir, extrair imagens de cada `conteudo` ou `descricao`
2. No modo `manual`/`auto`, o conteudo enviado para a IA ja vai limpo, e as imagens extraidas sao aplicadas ao resultado
3. No modo `batch`, cada item processado passa pela extracao

### Arquivos modificados:
1. `src/utils/extractDescriptionImages.ts` - Novo: funcao utilitaria
2. `src/pages/admin/RelatorioTXT.tsx` - Integrar extracao no handleAdd e mapEntryToItem
3. `supabase/functions/noticias-ai-generate/index.ts` - Integrar extracao nos modos manual/json/batch/auto
