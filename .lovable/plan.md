
# Plano: Reposicionar Mega Destaque, Adicionar Novos Espacos e Links no Menu Lateral

## Problemas Identificados

### 1. Mega Destaque (Super Banner) esta muito alto
Na imagem, o Super Banner (970x250) aparece logo apos o hero/stories, cobrindo conteudo importante. Precisa descer para uma posicao menos intrusiva.

### 2. Faltam espacos para novos formatos no site publico
Os formatos **Banner Intro** (970x250), **Destaque Flutuante** (300x600) e **Alerta Full Saida** (1280x720) ja tem componentes criados (`BannerIntro.tsx`, `FloatingAd.tsx`, `ExitIntentModal.tsx`) e formularios de campanha, mas nao estao renderizados no layout publico do site. Apenas o `banner_intro` aparece na Home via `DynamicHomeSection`. O `FloatingAd` e o `ExitIntentModal` precisam ser adicionados ao layout global.

### 3. Novos formatos nao aparecem no menu lateral do admin
A secao "Publicidade e Monetizacao" do sidebar so tem: Campanhas 360, Midia Kit, Comprovantes, Anuncios, Super Banners, Publidoor, Parceiros. Faltam links diretos para gerenciar **Banner Intro**, **Destaque Flutuante**, **Exit-Intent** e **Login Panel** individualmente.

---

## Alteracoes Propostas

### A. Reposicionar Super Banner na Home

**Arquivo: `src/pages/Index.tsx`**
- Mover `super_banner` da posicao 6 (apos hero) para posicao 10 (apos latest_news), dando mais espaco para o conteudo editorial aparecer primeiro

Nova ordem:
```text
0  market_data
1  banner_intro
2  video_block
3  stories_bar
4  ad_slot_top (Mega Destaque)
5  hero_headlines
6  live_broadcast
7  agora_na_cidade
8  ad_slot_mid
9  latest_news
10 super_banner         (MOVIDO - era posicao 6)
11 ad_slot_bottom
12 quick_notes
13 most_read
```

### B. Adicionar FloatingAd e ExitIntentModal ao layout global

**Arquivo: `src/components/layout/PublicLayout.tsx`** (ou arquivo de layout principal)
- Importar e renderizar `FloatingAd` no layout publico (ja tem logica interna de exibicao 1x por sessao)
- Importar e renderizar `ExitIntentModal` no layout publico (ja tem logica de deteccao de saida)
- Esses componentes so aparecem quando ha campanhas ativas configuradas para esses canais

### C. Adicionar links no menu lateral do admin

**Arquivo: `src/components/admin/AdminSidebar.tsx`**
- Adicionar 4 novos itens na secao `monetizationItems`:
  - "Banner Intro" -> link para filtro de campanhas com canal banner_intro
  - "Destaque Flutuante" -> link para filtro de campanhas com canal floating_ad
  - "Exit-Intent" -> link para filtro de campanhas com canal exit_intent
  - "Painel de Login" -> link para filtro de campanhas com canal login_panel

Os links apontarao para a pagina de Campanhas 360 com parametro de filtro por canal, permitindo que o usuario veja e gerencie apenas campanhas daquele formato especifico.

---

## Detalhes Tecnicos

### Arquivos a editar (3)

1. **`src/pages/Index.tsx`** -- mover super_banner para order 10
2. **`src/components/admin/AdminSidebar.tsx`** -- 4 novos itens em monetizationItems
3. **Layout publico (App.tsx ou PublicLayout)** -- renderizar FloatingAd + ExitIntentModal globalmente

### Nenhum arquivo novo necessario
Os componentes FloatingAd, ExitIntentModal e BannerIntro ja existem e funcionam com campanhas 360.

### Nenhuma alteracao no banco de dados
Reutiliza componentes e hooks existentes.
