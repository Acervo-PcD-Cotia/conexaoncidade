

# Correcao Definitiva + Anti-Regressao — Campanhas 360

## Evidencias Coletadas (Provas Reais)

### PROVA 1 — Rotas no Router (App.tsx, linhas 641-647)

```text
{/* Campaign Admin Routes */}
<Route path="campaigns" element={<CampaignsHub />} />
<Route path="campaigns/google-maps" element={<GoogleMapsLeads />} />
<Route path="campaigns/unified" element={<CampaignsUnified />} />
<Route path="campaigns/new" element={<CampaignEditor />} />
<Route path="campaigns/edit/:id" element={<CampaignEditor />} />
<Route path="campaigns/metrics/:id" element={<CampaignMetrics />} />
```

Todas dentro de `<Route path="/spah/painel" element={<AdminLayout />}>` (linha 486).
Resultado: as 4 rotas exigidas existem e estao corretas.

### PROVA 2 — Padrao de rota (mismatch)

Busca por `campaigns/:id/edit`: **0 resultados**.
Busca por `campaigns/edit/`: ocorrencias apenas no Router (App.tsx) e em `CampaignsUnified.tsx` usando `navigate('/spah/painel/campaigns/edit/${id}')`.
Padrao unico confirmado: `/spah/painel/campaigns/edit/:id`.

### PROVA 3 — Busca global /admin no modulo Campanhas

- `navigate('/admin/campaigns...`: **0 resultados**
- `to="/admin/campaigns...`: **0 resultados**
- `/admin/publicidade`: **0 resultados**

As correcoes do diff anterior eliminaram todas as referencias legadas no modulo de campanhas.

**POREM**: Existem **54+ ocorrencias** de `navigate('/admin/...)` e **561 ocorrencias** de `to="/admin/...` em outros modulos (PostSocial, TV, AutoPost, Community, etc). Esses NAO afetam o modulo Campanhas, mas sao divida tecnica.

### Diagnostico React #185

O erro #185 do React ("Objects are not valid as a React child") ocorria quando o usuario navegava para `/admin/campaigns/new` — uma rota que **nao existia** no Router. O Router nao encontrava match, caia no fallback (NotFound ou catch-all), e o componente de fallback tentava renderizar o `location.pathname` ou um objeto de erro como children de um elemento React, gerando o crash. A correcao foi apontar a navegacao para `/spah/painel/campaigns/new`, que resolve corretamente para `CampaignEditor`.

Nao ha bug interno no `CampaignEditor` nem no `CampaignForm` — o problema era exclusivamente rota inexistente.

---

## Plano de Implementacao

### 1. Criar `src/lib/campaignRoutes.ts` (anti-regressao)

Arquivo centralizado com todas as rotas do modulo Campanhas:

```text
CAMPAIGNS_BASE = ROUTES.ADMIN + '/campaigns'
campaignsHub()        -> /spah/painel/campaigns
campaignsUnified()    -> /spah/painel/campaigns/unified
campaignNew()         -> /spah/painel/campaigns/new
campaignEdit(id)      -> /spah/painel/campaigns/edit/{id}
campaignMetrics(id)   -> /spah/painel/campaigns/metrics/{id}
campaignsGoogleMaps() -> /spah/painel/campaigns/google-maps
```

Usa `ROUTES.ADMIN` de `src/config/routes.ts` como base, nunca string hardcoded.

### 2. Substituir strings hardcoded nos arquivos de campanhas

| Arquivo | Mudanca |
|---|---|
| `src/pages/admin/campaigns/CampaignsUnified.tsx` | Trocar 3x `'/spah/painel/campaigns/...'` por funcoes do `campaignRoutes` |
| `src/pages/admin/campaigns/CampaignEditor.tsx` | Trocar 3x `'/spah/painel/campaigns/unified'` por `campaignRoutes.campaignsUnified()` |
| `src/pages/admin/campaigns/CampaignMetrics.tsx` | Trocar 2x navigate por `campaignRoutes.campaignsUnified()` |
| `src/pages/admin/CampaignsHub.tsx` | Trocar href/Link por funcoes centralizadas |

### 3. ErrorBoundary local para o modulo Campanhas

Criar `src/components/admin/campaigns/CampaignErrorBoundary.tsx`:
- Captura erros de render apenas no modulo Campanhas
- Loga stack completo no console
- Exibe fallback com botao "Tentar Novamente" e mensagem do erro
- NAO mascara o bug (mostra a mensagem real)

Envolver as rotas de campanhas no App.tsx com este ErrorBoundary.

### Arquivos

| Arquivo | Tipo |
|---|---|
| `src/lib/campaignRoutes.ts` | NOVO |
| `src/components/admin/campaigns/CampaignErrorBoundary.tsx` | NOVO |
| `src/pages/admin/campaigns/CampaignsUnified.tsx` | MODIFICAR |
| `src/pages/admin/campaigns/CampaignEditor.tsx` | MODIFICAR |
| `src/pages/admin/campaigns/CampaignMetrics.tsx` | MODIFICAR |
| `src/pages/admin/CampaignsHub.tsx` | MODIFICAR |
| `src/App.tsx` | MODIFICAR (ErrorBoundary wrapper) |

### Garantia de nao-regressao

1. Nenhum arquivo de campanhas contera strings `/admin/` ou `/spah/painel/` hardcoded — tudo vem de `campaignRoutes`
2. Se alguem mudar o prefixo do painel, basta alterar `ROUTES.ADMIN` em `src/config/routes.ts`
3. O ErrorBoundary captura e exibe qualquer erro futuro de render sem tela branca

