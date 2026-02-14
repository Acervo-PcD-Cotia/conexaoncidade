

# Plano: Atualizar Nomenclatura Comercial dos Formatos de Midia

## Resumo

Substituir os nomes tecnicos dos formatos publicitarios por nomes comerciais estrategicos em todo o sistema, mantendo as dimensoes tecnicas funcionando internamente sem alteracao de logica.

## Mapeamento de Nomes

| Dimensao | Nome Atual | Nome Comercial | Canal | Tooltip |
|----------|-----------|----------------|-------|---------|
| 728x90 | Leaderboard | Destaque Horizontal | Ads | Faixa horizontal no topo das paginas |
| 970x250 | Super Banner / Super Banner Topo | Mega Destaque | Ads | Grande impacto visual para branding |
| 300x250 | Retangulo Medio | Destaque Inteligente | Ads | Versatil e performatico para conversao |
| 300x600 | Arranha-ceu | Painel Vertical | Ads | Formato vertical institucional |
| 580x400 | Pop-up / Pop-up Inteligente | Alerta Comercial | Ads | Chamada direta com controle de frequencia |
| 970x250 | Banner Grande | Destaque Premium | Publidoor | Patrocinado com destaque editorial |
| 300x250 | Retangulo | Destaque Editorial | Publidoor | Bloco integrado ao conteudo editorial |
| 300x600 | Vertical | Painel Vertical (Publidoor) | Publidoor | Patrocinado vertical de alto destaque |
| 1080x1920 | Capa Story (9:16) | Story Premium | WebStories | Formato vertical imersivo em tela cheia |

## Arquivos a Editar (9 arquivos)

### 1. `src/lib/adFormats.ts` — Central de Formatos
- Atualizar `label`, `labelPt` em `AD_FORMATS` para nomes comerciais
- Atualizar `FORMAT_OPTIONS` com labels comerciais e descricoes enriquecidas com tooltips ("O que e" + "Onde aparece")
- Adicionar campo `commercialName` e `tooltip` a interface `AdFormatBase`

### 2. `src/lib/adSlots.ts` — Definicoes de Slots
- Atualizar `label` de cada `AdSlot` no array `AD_SLOTS` para o nome comercial correspondente
- Manter `id` e `key` inalterados (backend continua funcionando)

### 3. `src/types/campaigns-unified.ts` — OFFICIAL_SLOTS
- Atualizar labels no objeto `OFFICIAL_SLOTS.ads` e `OFFICIAL_SLOTS.publidoor`

### 4. `src/lib/imageCorrection.ts` — SLOT_DEFINITIONS
- Atualizar labels no objeto `SLOT_DEFINITIONS.ads` e `SLOT_DEFINITIONS.publidoor`

### 5. `src/components/admin/AdImageUploader.tsx` — Upload de Criativos
- Atualizar `FORMAT_DIMENSIONS` com labels comerciais
- Adicionar tooltip com "O que e" + "Onde aparece" abaixo do nome do formato

### 6. `src/components/admin/campaigns/AdsChannelForm.tsx` — Formulario de Canais
- Atualizar `SLOT_OPTIONS` com nomes comerciais
- Adicionar badge de canal (Ads/Publidoor) ao lado do nome

### 7. `src/pages/admin/campaigns/CampaignsTutorial.tsx` — Tutorial
- Atualizar todas as referencias de nomes tecnicos para nomes comerciais
- Adicionar tabela de referencia rapida com nome comercial + dimensao + canal

### 8. `src/components/ads/InlineAdSlot.tsx` — Comentarios
- Atualizar comentario de "Retangulo Medio" para "Destaque Inteligente"

### 9. `src/components/admin/campaigns/ExitIntentChannelForm.tsx` — Exit Intent
- Atualizar labels "Banner Grande" e "Retangulo Medio" para nomes comerciais

## O Que NAO Sera Alterado

- IDs internos (`super_banner_topo`, `retangulo_medio`, etc.)
- Keys de dimensao (`728x90`, `970x250`, etc.)
- Logica de atribuicao automatica por dimensao
- Estrutura de campanhas e banco de dados
- Regras de exibicao e integracao com metricas
- Arquivos auto-gerados (types.ts, client.ts)

## Padronizacao Visual

Cada formato exibira:
1. **Nome comercial** em destaque (fonte maior)
2. **Dimensao tecnica** abaixo em texto menor e cor secundaria
3. **Badge** identificando o canal: Ads / Publidoor / WebStories
4. **Tooltip** explicativo com "O que e" e "Onde aparece no site"

