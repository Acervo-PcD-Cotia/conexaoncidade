
# Plano de Correção: 3 Problemas na Página de Notícias

## Resumo dos Problemas

Analisando a notícia `cultura-embu-abre-inscricoes-exposicoes-temporarias`:

| Problema | Descrição | Causa Raiz |
|----------|-----------|------------|
| **1. Imagem ausente** | A imagem não carrega no portal | URL salva com extensão `.jpeg` mas imagem original é `.jpg` |
| **2. Data errada** | Mostra 30/01/2026 ao invés de 06/01/2026 | `original_published_at` está `null`, data de ingestão foi usada |
| **3. Scroll para rodapé** | Ao clicar em links, página vai para o final | Link `#accessibility` não corresponde a nenhum `id` na página |

---

## Solução Detalhada

### Problema 1: Imagem Ausente

**Diagnóstico:**
- No banco de dados, `featured_image_url` está como:
  `https://cidadeembudasartes.sp.gov.br/wp-content/uploads/2026/01/mulher-colocando-foto-na-parede-1000x495.jpeg`
- Mas a imagem real na fonte termina em `.jpg`

**Solução:**
Esta notícia específica precisa de uma correção manual no banco de dados (UPDATE). Além disso, a Edge Function `regional-process-item` deve ser atualizada para verificar se a URL da imagem funciona e tentar variações de extensão (.jpg/.jpeg).

**Arquivo:** `supabase/functions/regional-process-item/index.ts`

Adicionar função de validação de URL de imagem:
```typescript
async function validateImageUrl(url: string): Promise<string | null> {
  if (!url) return null;
  
  // Try original URL first
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) return url;
  } catch {}
  
  // Try swapping .jpeg <-> .jpg
  const altUrl = url.endsWith('.jpeg') 
    ? url.replace('.jpeg', '.jpg')
    : url.endsWith('.jpg') 
    ? url.replace('.jpg', '.jpeg')
    : null;
    
  if (altUrl) {
    try {
      const response = await fetch(altUrl, { method: 'HEAD' });
      if (response.ok) return altUrl;
    } catch {}
  }
  
  return null;
}
```

**Correção imediata via SQL:**
```sql
UPDATE news 
SET featured_image_url = 'https://cidadeembudasartes.sp.gov.br/wp-content/uploads/2026/01/mulher-colocando-foto-na-parede-1000x495.jpg',
    og_image_url = 'https://cidadeembudasartes.sp.gov.br/wp-content/uploads/2026/01/mulher-colocando-foto-na-parede-1000x495.jpg',
    card_image_url = 'https://cidadeembudasartes.sp.gov.br/wp-content/uploads/2026/01/mulher-colocando-foto-na-parede-1000x495.jpg'
WHERE slug = 'cultura-embu-abre-inscricoes-exposicoes-temporarias';
```

---

### Problema 2: Data Incorreta

**Diagnóstico:**
- `published_at`: `2026-01-30 23:41:19.337+00` (data de ingestão)
- `original_published_at`: `null`
- Data original na fonte: **06/01/2026**

**Solução:**
Executar a Edge Function `fix-publication-dates` para esta notícia específica, ou fazer correção direta via SQL.

**Correção imediata via SQL:**
```sql
UPDATE news 
SET published_at = '2026-01-06T12:00:00Z',
    original_published_at = '2026-01-06T12:00:00Z'
WHERE slug = 'cultura-embu-abre-inscricoes-exposicoes-temporarias';
```

**Para correção em lote (outras notícias com mesmo problema):**
Chamar a Edge Function `fix-publication-dates`:
```json
{
  "dryRun": false,
  "daysBack": 60,
  "limit": 100,
  "onlyMissing": true
}
```

---

### Problema 3: Scroll para o Rodapé

**Diagnóstico:**
No arquivo `src/components/home/NewsCardVisual.tsx`, linha 137, existe um link:
```tsx
<Link to={`/noticia/${news.slug}#accessibility`}>
```

Este link aponta para uma âncora `#accessibility`, mas **não existe nenhum elemento com `id="accessibility"` na página de notícias**. Quando o browser não encontra o elemento, ele pode:
- Scrollar para o final da página
- Ou manter o scroll atual (comportamento inconsistente)

**Solução 1 (Preferida):** Adicionar o `id="accessibility"` na seção correta da página de notícias.

**Arquivo:** `src/pages/NewsDetail.tsx` (linha ~430)

```tsx
{/* 2. Audio Block - UOL/Trinity Audio Style (BEFORE summary) */}
<div id="accessibility">
  <NewsAudioBlock
    newsId={news.id}
    // ... props
  />
</div>
```

**Solução 2 (Alternativa):** Remover a âncora `#accessibility` do link.

**Arquivo:** `src/components/home/NewsCardVisual.tsx` (linha 137)

Alterar de:
```tsx
<Link to={`/noticia/${news.slug}#accessibility`} aria-label="Opções de acessibilidade">
```

Para:
```tsx
<Link to={`/noticia/${news.slug}`} aria-label="Opções de acessibilidade">
```

---

## Resumo das Alterações

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| SQL (via insert tool) | Dados | Corrigir imagem e data da notícia específica |
| `src/pages/NewsDetail.tsx` | Código | Adicionar `id="accessibility"` no bloco de áudio |
| `supabase/functions/regional-process-item/index.ts` | Código | Adicionar validação de URL de imagem (.jpg/.jpeg) |

---

## Resultado Esperado

Após as correções:

| Problema | Antes | Depois |
|----------|-------|--------|
| Imagem | Não carrega (URL `.jpeg` inválida) | Carrega normalmente (URL `.jpg`) |
| Data | 30/01/2026 | **06/01/2026** (data original) |
| Scroll | Vai para o rodapé | Vai para o início da notícia |
