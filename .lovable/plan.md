
# Plano: Login sem Rolagem e Novos Canais no Upload de Criativos

## 1. Organizar Login sem Barra de Rolagem

**Problema:** O painel esquerdo (logo + banner + noticias) ultrapassa a altura da tela, forcando rolagem.

**Solucao no arquivo `src/pages/Auth.tsx`:**
- Usar `h-screen overflow-hidden` no container principal (desktop)
- Reduzir o logo de 280px para 180px e diminuir padding (pt-6 pb-3)
- Limitar a area do banner publicitario com `max-h-[50vh]` e `flex-shrink`
- Tornar as noticias mais compactas (max 3 itens, texto menor)
- Usar `flex-col` com `overflow-hidden` para que tudo caiba em 100vh sem scroll
- No lado direito, centralizar o card de login verticalmente com `overflow-auto` caso necessario

## 2. Conectar Novos Canais no Upload de Criativos

**Problema:** No `CampaignForm.tsx`, o `onAssetsUploaded` so trata `ads`, `publidoor` e `webstories`. Os novos canais (`banner_intro`, `floating_ad`, `exit_intent`, `login_panel`) sao ignorados quando imagens sao enviadas pelo BatchAssetUploader.

**Solucao no arquivo `src/components/admin/campaigns/CampaignForm.tsx`:**
- Expandir o callback `onAssetsUploaded` para incluir os novos canais:
  - `banner_intro` -> `setAsset('bannerIntro', url)`
  - `floating_ad` -> `setAsset('floatingAd', url)`  
  - `exit_intent` -> `setAsset('exitIntentHero', url)`
  - `login_panel` -> `setAsset('loginPanel', url)`

---

## Detalhes Tecnicos

### Arquivos a editar (2)

1. **`src/pages/Auth.tsx`** -- layout compacto sem scroll, elementos redimensionados para caber em 100vh
2. **`src/components/admin/campaigns/CampaignForm.tsx`** -- expandir onAssetsUploaded com mapeamento dos 4 novos canais
