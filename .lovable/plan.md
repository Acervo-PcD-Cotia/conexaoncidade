
# Plano: Nomes Comerciais, Menu Lateral Funcional e Publidoor 404

## Problemas Identificados

### 1. Nomes tecnicos nos slots de anuncios
A pagina `Ads.tsx` usa nomes tecnicos como "Home Topo", "Home Banner", "Arranha-ceu", "Pop-up" em vez dos nomes comerciais padronizados: "Destaque Horizontal", "Mega Destaque", "Painel Vertical", "Alerta Comercial".

### 2. Links do menu lateral nao filtram campanhas
Os links "Banner Intro", "Destaque Flutuante", "Exit-Intent" e "Painel de Login" passam `?channel=banner_intro` na URL, porem a pagina `CampaignsUnified.tsx` nao le parametros da URL -- usa apenas estado local. Resultado: o filtro nunca e aplicado.

### 3. Publidoor da 404
O componente `PublidoorDashboard.tsx` usa links com `/admin/publidoor/criar` (rota legada) em vez de `/spah/painel/publidoor/criar` (rota obfuscada correta). O mesmo problema afeta `CommercialReports.tsx`.

---

## Alteracoes Propostas

### A. Corrigir nomes comerciais nos slots (Ads.tsx)

**Arquivo: `src/pages/admin/Ads.tsx`**

Atualizar o array `AD_SLOTS` para usar os nomes comerciais oficiais:

```text
Antes                          Depois
Home Topo (728x90)          -> Destaque Horizontal (728x90)
Home Banner (970x250)       -> Mega Destaque (970x250)
Super Banner Topo (970x250) -> Mega Destaque Topo (970x250)
Retangulo Medio (300x250)   -> Destaque Inteligente (300x250)
Arranha-ceu (300x600)       -> Painel Vertical (300x600)
Pop-up (580x400)            -> Alerta Comercial (580x400)
```

### B. Fazer links do sidebar funcionarem (CampaignsUnified.tsx)

**Arquivo: `src/pages/admin/campaigns/CampaignsUnified.tsx`**

- Importar `useSearchParams` do `react-router-dom`
- Na inicializacao, ler o parametro `channel` da URL
- Usar esse valor como filtro inicial do `channelFilter`
- Quando o parametro mudar (navegacao pelo sidebar), atualizar o filtro

### C. Corrigir rotas do Publidoor (2 arquivos)

**Arquivo: `src/pages/admin/publidoor/PublidoorDashboard.tsx`**
- Trocar todos os `/admin/publidoor/...` por `/spah/painel/publidoor/...`

**Arquivo: `src/pages/admin/CommercialReports.tsx`**
- Trocar todos os `/admin/publidoor/...` por `/spah/painel/publidoor/...`

---

## Detalhes Tecnicos

### Arquivos a editar (4)

1. **`src/pages/admin/Ads.tsx`** -- nomes comerciais no array AD_SLOTS
2. **`src/pages/admin/campaigns/CampaignsUnified.tsx`** -- ler searchParams da URL para filtro de canal
3. **`src/pages/admin/publidoor/PublidoorDashboard.tsx`** -- corrigir rotas /admin/ para /spah/painel/
4. **`src/pages/admin/CommercialReports.tsx`** -- corrigir rotas /admin/ para /spah/painel/

### Nenhum arquivo novo necessario
### Nenhuma alteracao no banco de dados
