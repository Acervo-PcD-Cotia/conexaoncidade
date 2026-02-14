
# Plano: Ajuste do Login e Correcao Massiva de Links Quebrados

## Problema 1: Layout do Login (Logo + Espaco Publicitario)

Na tela de login (`/spah`), o logo esta no topo e o espaco publicitario fica abaixo com um grande vazio entre eles. O usuario quer que ambos fiquem centralizados verticalmente na coluna esquerda, sem precisar rolar.

**Solucao no arquivo `src/pages/Auth.tsx`:**
- Mudar o layout da coluna esquerda para `justify-center` (centralizar verticalmente o bloco logo+banner)
- Remover o `max-h-[50vh]` do banner que limita desnecessariamente o espaco publicitario
- Agrupar logo e banner em um bloco coeso com espacamento controlado
- Manter as noticias no rodape da coluna, usando `mt-auto` para empurra-las para baixo

## Problema 2: Links de Navegacao Quebrados (783 ocorrencias em 61 arquivos)

A maioria dos links internos nas paginas administrativas ainda usa o caminho legado `/admin/` em vez do caminho correto `/spah/painel/`. Isso causa erros 404 ao clicar em qualquer link de navegacao dentro das paginas.

**Causa raiz:** A sidebar (`AdminSidebar.tsx`) ja usa os caminhos corretos, mas os links internos dos componentes de cada pagina nunca foram migrados.

**Solucao:** Substituicao global de `"/admin/` por `"/spah/painel/` e `'/admin/` por `'/spah/painel/` em todos os 61 arquivos afetados.

---

## Detalhes Tecnicos

### Arquivos a editar

**1 arquivo - Layout do Login:**
- `src/pages/Auth.tsx` -- centralizar verticalmente logo + banner, remover restricao de altura

**61 arquivos - Correcao de rotas (substituicao `/admin/` para `/spah/painel/`):**

Componentes de paginas admin:
- `src/pages/admin/NoticiasAI.tsx`
- `src/pages/admin/LinksQRGenerator.tsx`
- `src/pages/admin/EventsList.tsx`
- `src/pages/admin/FinancialDashboard.tsx`
- `src/pages/admin/ModuleUnavailable.tsx`
- `src/pages/admin/Dashboard.tsx`
- `src/pages/admin/Settings.tsx`
- `src/pages/admin/autopost/AutoPostDashboard.tsx`
- `src/pages/admin/autopost-regional/RegionalQueue.tsx`
- `src/pages/admin/autopost-regional/RegionalSourceEdit.tsx`
- `src/pages/admin/academy/AcademyCourse.tsx`
- `src/pages/admin/academy/AcademyLesson.tsx`
- `src/pages/admin/academy/EnemModule.tsx`
- `src/pages/admin/broadcast/BroadcastPlaylist.tsx`
- `src/pages/admin/community/CommunityAdmin.tsx`
- `src/pages/admin/esportes/EsportesConfig.tsx`
- `src/pages/admin/esportes/EsportesEstatisticas.tsx`
- `src/pages/admin/imoveis/ImoveisAdmin.tsx`
- `src/pages/admin/postsocial/PostSocialDashboard.tsx`
- `src/pages/admin/transporte-escolar/TransporteEscolarAdmin.tsx`
- E todos os demais arquivos que contenham `"/admin/` ou `'/admin/`

Componentes reutilizaveis:
- `src/components/admin/dashboard/RecentArticlesPanel.tsx`
- `src/components/admin/dashboard/DashboardAccessibilityPanel.tsx`
- `src/components/admin/stream/RadioTabContent.tsx`
- `src/components/academy/AcademyCategorySection.tsx`
- `src/components/guards/ModuleRouteGuard.tsx`

Paginas de produtos:
- `src/pages/conexao-studio/Dashboard.tsx`
- `src/modules/radio/pages/RadioOverview.tsx`

Paginas publicas com links admin:
- `src/pages/public/Enem2026Landing.tsx`

### Criterios de substituicao

```text
Antes:  "/admin/...
Depois: "/spah/painel/...

Antes:  '/admin/...
Depois: '/spah/painel/...
```

### Nenhuma alteracao no banco de dados
### Nenhum arquivo novo necessario
