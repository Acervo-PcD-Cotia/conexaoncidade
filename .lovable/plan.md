

# Plano: Padronizacao Total dos Formatos Publicitarios (01 a 15)

## Resumo

Os formatos 01 a 09 ja estao implementados e com nomes comerciais atualizados. Este plano foca em adicionar os formatos 10 a 15 (Login, Banner Intro, Destaque Flutuante, Alerta Full Saida) e organizar todos os 15 formatos no painel administrativo.

## Status Atual

| # | Formato | Status |
|---|---------|--------|
| 01-05 | Ads (Destaque Horizontal, Mega Destaque, etc.) | Implementado |
| 06-08 | Publidoor (Destaque Premium, Editorial, Vertical) | Implementado |
| 09 | Story Premium (WebStories) | Implementado |
| 10-12 | Login Formatos 01/02/03 | Parcial (existe `login_panel` mas sem variantes) |
| 13 | Banner Intro | Novo |
| 14 | Destaque Flutuante | Novo |
| 15 | Alerta Full Saida | Parcial (Exit-Intent existe, falta dimensao 1280x720) |

---

## Parte A -- Novos Slots e Canais

### A1. Expandir `src/lib/adSlots.ts`
Adicionar novos slots ao array `AD_SLOTS`:
- Expandir `SlotPlacement` para incluir `'login' | 'floating' | 'intro'`
- Expandir `SLOT_CHANNELS` para incluir `'login' | 'experience'`
- Adicionar 6 novos slots:

```text
login_formato_01  | 800x500   | login      | login
login_formato_02  | 200x500   | login      | login  (4 paineis verticais)
login_formato_03  | 400x500   | login      | login  (2 paineis)
banner_intro      | 970x250   | experience | intro
destaque_flutuante| 300x600   | experience | floating
alerta_full_saida | 1280x720  | experience | modal
```

### A2. Expandir `src/lib/adFormats.ts`
Adicionar novos formatos ao `AD_FORMATS` e `FORMAT_OPTIONS`:
- `BANNER_INTRO`: 970x250 (reutiliza dimensao do Mega Destaque mas com contexto diferente)
- `DESTAQUE_FLUTUANTE`: 300x600 (lateral flutuante)
- `ALERTA_FULL_SAIDA`: 1280x720 (exit intent fullscreen)
- `LOGIN_01/02/03`: Formatos especificos para o painel de login

### A3. Atualizar `src/types/campaigns-unified.ts`
- Adicionar `'banner_intro' | 'floating_ad'` ao `CHANNEL_TYPES`
- Criar interfaces `BannerIntroChannelConfig` e `FloatingAdChannelConfig`
- Atualizar `OFFICIAL_SLOTS` com as categorias Login e Experiencia
- Atualizar `CHANNEL_LABELS` e `CHANNEL_ICONS`

### A4. Atualizar `src/lib/imageCorrection.ts`
- Adicionar as novas categorias `login` e `experience` ao `SLOT_DEFINITIONS`

---

## Parte B -- Novos Componentes de Exibicao

### B1. `src/components/ads/BannerIntro.tsx` (Novo)
- Banner de entrada na primeira dobra da Home
- Exibido entre o Super Banner e o conteudo principal
- Busca campanhas 360 com canal `banner_intro` ativo
- Tracking de impressoes e cliques via `trackCampaignEvent`
- Suporte a exibicao programada (por datas)

### B2. `src/components/ads/FloatingAd.tsx` (Novo)
- Banner lateral flutuante (300x600) fixo na tela
- Posicao: canto inferior direito
- Botao de fechar visivel
- Controle de frequencia via `sessionStorage` (1x por sessao)
- Animacao de entrada suave com framer-motion
- Busca campanhas 360 com canal `floating_ad` ativo

### B3. Atualizar `src/components/ads/ExitIntentModal.tsx`
- Formalizar dimensao 1280x720 para o formato "Alerta Full Saida"
- Adicionar fundo escurecido (ja existe `bg-black/60`)
- Garantir botao "Continuar navegando" (ja existe)
- Nome comercial: "Alerta Full Saida"

### B4. Expandir Login Panel (formatos visuais)
- Atualizar `src/components/auth/LoginPanelAd.tsx` para suportar 3 layouts:
  - Formato 01: Banner unico grande (layout atual hero)
  - Formato 02: Grid de 4 paineis verticais lado a lado (layout atual grid)
  - Formato 03: 2 paineis lado a lado (novo)
- O formato e selecionado automaticamente com base no numero de campanhas ativas

---

## Parte C -- Formularios Administrativos

### C1. `src/components/admin/campaigns/BannerIntroChannelForm.tsx` (Novo)
- Formulario para configurar o Banner Intro
- Campos: imagem, datas de exibicao, CTA

### C2. `src/components/admin/campaigns/FloatingAdChannelForm.tsx` (Novo)
- Formulario para configurar o Destaque Flutuante
- Campos: imagem, posicao (esquerda/direita), controle de frequencia

### C3. Atualizar `src/components/admin/campaigns/ChannelSelector.tsx`
- Adicionar os 2 novos canais (Banner Intro, Destaque Flutuante) a lista de canais
- Renderizar os novos formularios no switch/case

### C4. Atualizar `src/components/admin/AdImageUploader.tsx`
- Adicionar novos formatos ao `FORMAT_DIMENSIONS`:
  - `'banner-intro'`: 970x250
  - `'flutuante'`: 300x600
  - `'alerta-saida'`: 1280x720

### C5. Atualizar `src/components/admin/campaigns/CampaignForm.tsx`
- Adicionar logica para novos canais no submit de assets

### C6. Atualizar `src/components/admin/campaigns/useCampaignFormReducer.ts`
- Adicionar configs iniciais para `banner_intro` e `floating_ad`

---

## Parte D -- Integracao no Site

### D1. Atualizar `src/components/home/DynamicHomeSection.tsx`
- Adicionar novo tipo de secao `banner_intro` ao mapeamento
- Lazy load do componente `BannerIntro`

### D2. Atualizar `src/pages/Index.tsx`
- Adicionar `banner_intro` ao `FALLBACK_HOME_SECTIONS` (apos super_banner)

### D3. Atualizar `src/App.tsx`
- Adicionar `FloatingAd` ao layout principal (ao lado do `ExitIntentModal`)

### D4. Atualizar `src/types/portal-templates.ts`
- Adicionar `'banner_intro'` ao tipo `HomeSectionType`

---

## Parte E -- Tutorial e Documentacao

### E1. Atualizar `src/pages/admin/campaigns/CampaignsTutorial.tsx`
- Adicionar secao "Bloco 04 -- Login & Experiencia Inicial" com formatos 10-12
- Adicionar secao "Bloco 05 -- Banners de Experiencia" com formatos 13-15
- Adicionar tabela de referencia completa com todos os 15 formatos organizados por categoria

---

## Parte F -- Hooks e Logica de Dados

### F1. `src/hooks/useBannerIntro.ts` (Novo)
- Hook para buscar campanhas com canal `banner_intro` ativo
- Filtragem por datas e status

### F2. `src/hooks/useFloatingAd.ts` (Novo)
- Hook para buscar campanhas com canal `floating_ad` ativo
- Controle de frequencia

### F3. Atualizar `src/hooks/useCampaignsUnified.ts`
- Adicionar logica de submit para os novos canais

---

## Organizacao Visual no Painel

Todos os 15 formatos organizados em 5 blocos:

```text
Publicidade & Monetizacao
  |-- Ads (01-05)
  |    01 Destaque Horizontal    728x90
  |    02 Mega Destaque          970x250
  |    03 Destaque Inteligente   300x250
  |    04 Painel Vertical        300x600
  |    05 Alerta Comercial       580x400
  |
  |-- Publidoor (06-08)
  |    06 Destaque Premium       970x250
  |    07 Destaque Editorial     300x250
  |    08 Painel Vertical        300x600
  |
  |-- WebStories (09)
  |    09 Story Premium          1080x1920
  |
  |-- Login (10-12)
  |    10 Login Formato 01       Banner unico
  |    11 Login Formato 02       Grid 4 paineis
  |    12 Login Formato 03       Grid 2 paineis
  |
  |-- Experiencia (13-15)
       13 Banner Intro           970x250
       14 Destaque Flutuante     300x600
       15 Alerta Full Saida      1280x720
```

## Arquivos a Criar (5)
1. `src/components/ads/BannerIntro.tsx`
2. `src/components/ads/FloatingAd.tsx`
3. `src/hooks/useBannerIntro.ts`
4. `src/hooks/useFloatingAd.ts`
5. `src/components/admin/campaigns/BannerIntroChannelForm.tsx`
6. `src/components/admin/campaigns/FloatingAdChannelForm.tsx`

## Arquivos a Editar (14)
1. `src/lib/adSlots.ts` -- novos slots
2. `src/lib/adFormats.ts` -- novos formatos
3. `src/types/campaigns-unified.ts` -- novos canais e configs
4. `src/lib/imageCorrection.ts` -- novas categorias
5. `src/components/admin/AdImageUploader.tsx` -- novos formatos
6. `src/components/admin/campaigns/ChannelSelector.tsx` -- novos canais
7. `src/components/admin/campaigns/CampaignForm.tsx` -- submit novos canais
8. `src/components/admin/campaigns/useCampaignFormReducer.ts` -- configs iniciais
9. `src/components/ads/ExitIntentModal.tsx` -- formalizar 1280x720
10. `src/components/auth/LoginPanelAd.tsx` -- 3 layouts
11. `src/components/home/DynamicHomeSection.tsx` -- banner_intro
12. `src/pages/Index.tsx` -- fallback sections
13. `src/App.tsx` -- FloatingAd
14. `src/types/portal-templates.ts` -- HomeSectionType
15. `src/pages/admin/campaigns/CampaignsTutorial.tsx` -- documentacao
16. `src/hooks/useCampaignsUnified.ts` -- submit logic

## O Que NAO Sera Alterado
- Logica de atribuicao automatica por dimensao existente
- Estrutura de banco de dados (novos canais usam a mesma tabela `campaign_channels`)
- Metricas e tracking (reutiliza `trackCampaignEvent`)
- Arquivos auto-gerados (types.ts, client.ts, config.toml)
- Formatos 01-09 ja implementados

