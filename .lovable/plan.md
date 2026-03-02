

# Atualizar Layout de Noticias - Estilo Agencia Brasil + UOL

## Resumo
Atualizar a pagina de noticias do Conexao na Cidade para seguir o padrao visual da Agencia Brasil (tipografia, player de audio compacto) e UOL (caixa de resumo), alem de adicionar janela flutuante de live e cores dinamicas por categoria.

---

## 1. Player de Audio Compacto (Estilo Agencia Brasil)

**Arquivo**: `src/components/news/NewsAudioBlock.tsx`

O player atual ja e funcional mas e grande demais. A mudanca sera:
- Reduzir o header "Ouça agora" para um layout mais fino com label "Versao em audio" em caixa alta
- Player compacto: botao play menor (h-10 w-10), barra de progresso fina, controles inline
- Fundo cinza claro sutil (`bg-[#f6f7fb]`), borda suave
- Remover o footer "Powered by Portal Conexao"
- Manter todas as funcionalidades (velocidade, volume, download, Spotify)

## 2. Caixa de Resumo com Cores por Categoria

**Arquivo**: `src/components/news/NewsContentNavigator.tsx`

O componente ja existe e funciona. As mudancas serao:
- Aplicar cor da categoria (`var(--category-color)`) nos marcadores dos bullet points e no label "Resumo"
- Bordas usando tom da categoria com opacidade (border-color com 40% opacity)
- Marcadores quadrados ja existem -- manter, mas usar a cor da categoria
- Label "Resumo da noticia" em uppercase com a cor da categoria

**Arquivo**: `src/pages/NewsDetail.tsx`
- Passar `categoryColor` (hex string do `categoryTheme.color`) para o `NewsContentNavigator`

## 3. Janela Flutuante de TV Web / Live

**Arquivo novo**: `src/components/broadcast/LiveFloatingPopup.tsx`

O sistema de MiniPlayer ja existe (`MiniPlayerContext`, `MiniPlayer.tsx`), mas so aparece quando o usuario sai de uma pagina de broadcast. A nova janela:
- Aparece automaticamente quando ha uma transmissao ao vivo (consultando `useLiveBroadcasts`)
- Posicionada no canto inferior direito (fixed, right-20, bottom-20)
- Inicia mudo com autoplay
- Header com badge "Ao Vivo" vermelho + titulo
- Botao de fechar (X)
- Embed iframe do video (usando o embed_url da transmissao)
- Respeita `sessionStorage` para nao reaparecer se o usuario ja fechou

**Arquivo**: `src/components/layout/PublicLayout.tsx`
- Adicionar `<LiveFloatingPopup />` ao layout publico

## 4. Cores Dinamicas por Categoria

O sistema ja existe em `src/lib/categoryTheme.ts` com `--category-color` CSS variable aplicada em `article-themed`. As mudancas:

**Arquivo**: `src/components/news/NewsContentNavigator.tsx`
- Aceitar prop `categoryColor?: string`
- Usar `style={{ borderColor: categoryColor }}` na borda do resumo
- Usar `style={{ color: categoryColor }}` no label "Resumo"
- Marcadores com `style={{ backgroundColor: categoryColor }}`

**Arquivo**: `src/components/news/NewsAudioBlock.tsx`
- Aceitar prop `categoryColor?: string` opcional
- Usar como accent no botao play

## 5. Ajustes de Tipografia (Agencia Brasil)

**Arquivo**: `src/index.css`
- Ja esta muito proximo do padrao. Pequenos ajustes:
  - `font-family` do body incluir "Noto Sans" como fallback
  - Garantir `line-height: 1.6` no `.prose-news`
  - `max-width: 760px` no `.prose-news` (atualmente 780px, diferenca minima)

---

## Detalhes Tecnicos

### Ordem dos componentes na pagina (NewsDetail.tsx):
1. Header (categoria, titulo, subtitulo, autor, data, share)
2. Imagem Hero
3. Player de Audio (compacto, estilo Agencia Brasil)
4. Resumo (estilo UOL, cores da categoria)
5. Indice "Nesta materia"
6. Conteudo da noticia
7. Footer, tags, autor, relacionadas

### LiveFloatingPopup - Logica:
- Hook `useLiveBroadcasts()` para verificar se ha transmissao ativa
- `sessionStorage.getItem('live-popup-closed-{id}')` para nao reexibir
- Video mudo com autoplay
- Z-index 9999, responsivo (340px desktop, 280px mobile)

### Arquivos modificados:
1. `src/components/news/NewsAudioBlock.tsx` - Player compacto
2. `src/components/news/NewsContentNavigator.tsx` - Cores por categoria
3. `src/pages/NewsDetail.tsx` - Passar categoryColor aos componentes
4. `src/components/broadcast/LiveFloatingPopup.tsx` - Novo componente
5. `src/components/layout/PublicLayout.tsx` - Incluir LiveFloatingPopup
6. `src/index.css` - Ajustes tipograficos menores

