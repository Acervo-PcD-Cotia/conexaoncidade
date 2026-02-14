
# Plano: Mais Anuncios na Home, Ads nas Noticias, Noticias no Login e Formatos Atualizados

## Problemas Identificados

### 1. Apenas 2 espacos de publicidade na Home
Atualmente a Home so exibe o `ad_slot_top` (Mega Destaque) e o `super_banner`. Faltam espaços intermediarios entre os blocos de conteudo.

### 2. Falta publicidade na area de noticias
O componente `LatestNewsList` exibe 8 cards sem nenhum anuncio intercalado. O `InlineAdSlot` so e usado dentro de artigos individuais (`NewsDetail.tsx`), nao na listagem da Home.

### 3. Falta noticias na area de login
A pagina de login (`Auth.tsx`) exibe apenas banners publicitarios no painel esquerdo, sem nenhuma noticia ou conteudo editorial para engajar o usuario.

### 4. Formatos faltando no "Ver dimensoes oficiais"
O `BatchAssetUploader.tsx` so lista slots de `ads`, `publidoor` e `webstories` no `allSlots`. Faltam os blocos `login` e `experience` (formatos 10-15).

---

## Alteracoes Propostas

### A. Mais espacos publicitarios na Home (Index.tsx)

Adicionar 2 novos slots de anuncio entre os blocos de conteudo:

```text
Ordem atualizada:
0  market_data
1  banner_intro
2  video_block
3  stories_bar
4  ad_slot_top          (Mega Destaque existente)
5  hero_headlines
6  super_banner
7  live_broadcast
8  agora_na_cidade
9  ad_slot_mid          (NOVO - Destaque Inteligente 300x250)
10 latest_news
11 ad_slot_bottom        (NOVO - Destaque Horizontal 728x90)
12 quick_notes
13 most_read
```

**Arquivo: `src/pages/Index.tsx`**
- Adicionar `ad_slot_mid` e `ad_slot_bottom` ao `FALLBACK_HOME_SECTIONS`

**Arquivo: `src/types/portal-templates.ts`**
- Adicionar `'ad_slot_mid' | 'ad_slot_bottom'` ao `HomeSectionType`

**Arquivo: `src/components/home/DynamicHomeSection.tsx`**
- Adicionar mapeamento para `ad_slot_mid` (formato Destaque Inteligente 300x250)
- Adicionar mapeamento para `ad_slot_bottom` (formato Destaque Horizontal 728x90)

### B. Publicidade intercalada na area de noticias

**Arquivo: `src/components/home/LatestNewsList.tsx`**
- Inserir um `InlineAdSlot` (300x250) entre a primeira e segunda fileira de cards (apos o 4o card)
- Usa o componente `InlineAdSlot` ja existente, centralizado entre as linhas de noticias

### C. Noticias recentes no painel de login

**Arquivo: `src/pages/Auth.tsx`**
- Adicionar uma secao de "Ultimas Noticias" abaixo do painel publicitario no desktop
- Exibir 3-4 manchetes compactas com link para as noticias
- No mobile, exibir abaixo do banner compacto
- Usar o hook `useNews` ja existente para buscar as ultimas noticias

### D. Formatos completos no "Ver dimensoes oficiais"

**Arquivo: `src/components/admin/campaigns/BatchAssetUploader.tsx`**
- Expandir o array `allSlots` para incluir os blocos `login` e `experience` do `OFFICIAL_SLOTS`
- Os 15 formatos aparecerao na tabela de referencia com seus nomes comerciais corretos

---

## Detalhes Tecnicos

### Arquivos a editar (6)

1. **`src/pages/Index.tsx`** -- adicionar `ad_slot_mid` e `ad_slot_bottom` ao fallback
2. **`src/types/portal-templates.ts`** -- novos tipos de secao
3. **`src/components/home/DynamicHomeSection.tsx`** -- mapeamento dos novos slots
4. **`src/components/home/LatestNewsList.tsx`** -- InlineAdSlot entre cards
5. **`src/pages/Auth.tsx`** -- noticias no login
6. **`src/components/admin/campaigns/BatchAssetUploader.tsx`** -- allSlots completo com 15 formatos

### Nenhum arquivo novo necessario
Todos os componentes ja existem (`InlineAdSlot`, `ResponsiveAdUnit`, `useNews`).

### Nenhuma alteracao no banco de dados
Reutiliza componentes e hooks existentes.
