
# Plano: Redesign Completo do Dashboard — Estilo ITL Brasil

## Visao Geral

Redesenhar completamente o Dashboard administrativo para um visual limpo e moderno inspirado no painel ITL Brasil. O novo design terá:

- Cards de KPI com fundos em gradiente suave (tons azuis/verdes)
- Layout de duas colunas invertido (esquerda mais estreita, direita mais larga)
- Painéis funcionais específicos: Acessibilidade, Mais Pesquisadas, Gestão de Usuários, Logs, Estatísticas
- Visual clean com badges coloridos e hierarquia tipográfica clara

---

## 1. Novo Layout Estrutural

```text
+------------------------------------------------------------------+
| HEADER: "Dashboard" | "Visão geral do sistema..."                |
+------------------------------------------------------------------+
|                                                                  |
| KPI CARDS (4 colunas iguais, gradientes azuis/verdes)            |
| [Artigos Publicados] [Categorias] [Feeds RSS] [Importacoes Hoje] |
|                                                                  |
+-------------------------+----------------------------------------+
| COLUNA ESQUERDA (5 cols)|  COLUNA DIREITA (7 cols)               |
|                         |                                        |
| [Acessibilidade]        |  [Artigos Recentes]                    |
|  - VLibras Toggle       |   - Lista com badges de categoria      |
|  - Leitor de Página     |   - Indicador de tempo relativo        |
|  - Controles Visuais    |   - Bullet colorido por status         |
|                         |                                        |
| [Mais Pesquisadas]      |                                        |
|  - Top 3 com badges     |                                        |
|    numerados (#1, #2)   |                                        |
|  - Contagem de views    |                                        |
|                         |                                        |
| [Gestão de Usuários]    |                                        |
|  - Novo Usuário         |                                        |
|  - Listar Usuários      |                                        |
|  - Permissões           |                                        |
|                         |                                        |
+-------------------------+----------------------------------------+
|                                                                  |
| [Logs de Importação]            [Estatísticas Rápidas]           |
|  - Lista de feeds               - Artigos esta semana: 21        |
|  - Badge "Sucesso"              - Feeds ativos: 0                |
|  - Timestamp                    - Média views/artigo: 139        |
|                                 - Taxa sucesso RSS: 95% [bar]    |
+------------------------------------------------------------------+
```

---

## 2. Novos Componentes a Criar

### 2.1 GradientKpiCard

Card de KPI com fundo em gradiente suave:

```typescript
interface GradientKpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string; positive?: boolean };
  icon: LucideIcon;
  gradient: "blue" | "green" | "orange" | "purple";
}
```

**Estilos:**
- Fundo: gradiente suave horizontal (ex: `from-blue-50 to-blue-100/50`)
- Borda: `border border-blue-200/50`
- Ícone: posicionado no canto superior direito, cor coordenada
- Valor: `text-3xl font-bold text-foreground`
- Subtitle: `text-xs text-muted-foreground`
- Trend: texto pequeno verde/vermelho com seta

### 2.2 AccessibilityPanel

Painel de acessibilidade completo:

- Toggle VLibras com descrição
- Botão "Ler Página"
- Controles visuais: Tamanho fonte (A-/100%/A+), Alto Contraste, Dislexia, Espaçamento
- Link "Configurações de Acessibilidade"

### 2.3 TrendingPanel

Painel "Mais Pesquisadas":

- Ícone de trending no header
- Lista compacta com badges numerados (#1, #2, #3) em coral/laranja
- Contagem de visualizações
- Título truncado

### 2.4 UserManagementPanel

Links de gestão de usuários:

- Ícone + texto para cada ação
- Hover com background sutil
- Links: Novo Usuário, Listar Usuários, Permissões

### 2.5 ImportLogsPanel

Logs de importação RSS:

- Lista de feeds com nome + contagem
- Badge "Sucesso" em verde
- Timestamp relativo

### 2.6 QuickStatsPanel

Estatísticas rápidas:

- Linhas de stat com label + valor
- Valores numéricos alinhados à direita em cor destaque
- Barra de progresso para taxas percentuais

---

## 3. Modificacoes por Arquivo

### Arquivos a CRIAR

| Arquivo | Descrição |
|---------|-----------|
| `src/components/admin/dashboard/GradientKpiCard.tsx` | KPI com gradiente |
| `src/components/admin/dashboard/AccessibilityPanel.tsx` | Painel de acessibilidade |
| `src/components/admin/dashboard/TrendingPanel.tsx` | Mais pesquisadas |
| `src/components/admin/dashboard/UserManagementPanel.tsx` | Gestão de usuários |
| `src/components/admin/dashboard/ImportLogsPanel.tsx` | Logs de importação |
| `src/components/admin/dashboard/QuickStatsPanel.tsx` | Estatísticas rápidas |
| `src/components/admin/dashboard/RecentArticlesPanel.tsx` | Artigos recentes estilo ITL |

### Arquivos a MODIFICAR

| Arquivo | Mudanças |
|---------|----------|
| `src/pages/admin/Dashboard.tsx` | Layout completamente novo, remover componentes antigos, usar novos painéis |
| `src/index.css` | Adicionar classes de gradiente para KPIs |

### Arquivos que PODEM SER REMOVIDOS (apos migracao)

| Arquivo | Motivo |
|---------|--------|
| `src/components/admin/dashboard/KpiCard.tsx` | Substituído por GradientKpiCard |
| `src/components/admin/dashboard/QuickActionsGrid.tsx` | Não existe no novo design |
| `src/components/admin/dashboard/DashboardProductionCard.tsx` | Substituído por novos painéis |
| `src/components/admin/dashboard/DashboardAudienceCard.tsx` | Substituído por QuickStatsPanel |
| `src/components/admin/dashboard/DashboardRevenueCard.tsx` | Pode ser integrado em stats |

---

## 4. Detalhes de Implementação

### 4.1 GradientKpiCard

```typescript
// Mapeamento de gradientes
const gradients = {
  blue: "from-blue-50 to-blue-100/30 border-blue-200/50",
  green: "from-emerald-50 to-emerald-100/30 border-emerald-200/50",
  orange: "from-orange-50 to-orange-100/30 border-orange-200/50",
  purple: "from-violet-50 to-violet-100/30 border-violet-200/50",
};

const iconColors = {
  blue: "text-blue-500 bg-blue-100",
  green: "text-emerald-500 bg-emerald-100",
  orange: "text-orange-500 bg-orange-100",
  purple: "text-violet-500 bg-violet-100",
};
```

### 4.2 Header Simplificado

**Antes:** Header com logo, busca, alertas, botão Nova Notícia

**Depois:** Header mínimo apenas com título da página
```tsx
<header className="px-6 py-4">
  <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
  <p className="text-sm text-muted-foreground">
    Visão geral do sistema de notícias Conexão na Cidade
  </p>
</header>
```

### 4.3 Artigos Recentes (Novo Estilo)

- Bullet colorido à esquerda (indicador de categoria/status)
- Título em negrito
- Badge de categoria escuro
- Timestamp em texto muted

```tsx
<div className="flex items-start gap-3 py-3 border-b last:border-0">
  <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500" />
  <div className="flex-1 min-w-0">
    <p className="font-medium text-sm line-clamp-2">{title}</p>
    <div className="flex items-center gap-2 mt-1">
      <span className="px-2 py-0.5 text-xs bg-neutral-900 text-white rounded">
        {category}
      </span>
      <span className="text-xs text-muted-foreground">{timeAgo}</span>
    </div>
  </div>
</div>
```

### 4.4 Badges Numerados (Trending)

```tsx
<span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-coral-100 text-coral-600 text-xs font-bold">
  #{index + 1}
</span>
```

### 4.5 Painel de Acessibilidade

Componentes:
- Switch para VLibras
- Botão "Ler Página" com ícone play
- Slider/botões para tamanho de fonte (A-, 100%, A+)
- Toggle para Alto Contraste
- Toggle para Fonte Amigável à Dislexia
- Select para Espaçamento de Linhas

---

## 5. Cores e Gradientes

### Gradientes dos KPI Cards

| Card | Gradiente |
|------|-----------|
| Artigos Publicados | blue: `from-sky-50 to-sky-100/30` |
| Categorias | green: `from-teal-50 to-teal-100/30` |
| Feeds RSS | blue: `from-blue-50 to-blue-100/30` |
| Importações Hoje | purple: `from-violet-50 to-violet-100/30` |

### Cores de Badge

| Tipo | Cor |
|------|-----|
| Ranking (#1, #2, #3) | Coral/Salmon (`bg-[#FEE2E2]` `text-[#DC2626]`) |
| Sucesso | Verde (`bg-emerald-100 text-emerald-700`) |
| Categoria | Cinza escuro (`bg-neutral-800 text-white`) |

---

## 6. Layout Grid Final

```tsx
<div className="p-6 space-y-6">
  {/* Header */}
  <header>...</header>
  
  {/* KPI Cards - 4 colunas */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <GradientKpiCard gradient="blue" ... />
    <GradientKpiCard gradient="green" ... />
    <GradientKpiCard gradient="blue" ... />
    <GradientKpiCard gradient="purple" ... />
  </div>
  
  {/* Main Content - 5+7 colunas */}
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    {/* Coluna Esquerda */}
    <div className="lg:col-span-5 space-y-6">
      <AccessibilityPanel />
      <TrendingPanel />
      <UserManagementPanel />
    </div>
    
    {/* Coluna Direita */}
    <div className="lg:col-span-7">
      <RecentArticlesPanel />
    </div>
  </div>
  
  {/* Footer Panels - 2 colunas */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <ImportLogsPanel />
    <QuickStatsPanel />
  </div>
</div>
```

---

## 7. Remocoes e Limpeza

### Elementos a Remover do Design Atual

- Header complexo com logo, busca global, alertas (mover para layout global)
- KpiCard antigo (substituir por GradientKpiCard)
- QuickActionsGrid (não existe no novo design)
- DashboardProductionCard, DashboardAudienceCard, DashboardRevenueCard (consolidar em novos painéis)
- Popover de alertas (mover para header global ou remover)
- CommandDialog de busca (mover para componente global)

### CSS a Adicionar

```css
/* Gradientes suaves para KPIs */
.kpi-gradient-blue {
  background: linear-gradient(135deg, hsl(200 85% 96%) 0%, hsl(200 80% 94% / 0.3) 100%);
  border-color: hsl(200 70% 85% / 0.5);
}

.kpi-gradient-green {
  background: linear-gradient(135deg, hsl(160 70% 95%) 0%, hsl(160 65% 92% / 0.3) 100%);
  border-color: hsl(160 60% 80% / 0.5);
}

/* Badge de ranking coral */
.badge-ranking {
  background-color: hsl(0 85% 95%);
  color: hsl(0 70% 50%);
}
```

---

## 8. Funcionalidades dos Paineis

### AccessibilityPanel
- Toggle VLibras: estado local + integração futura
- Leitor de Página: botão que inicia leitura via Web Speech API
- Tamanho Fonte: A-/100%/A+ que altera CSS root
- Alto Contraste: toggle que adiciona classe ao body
- Dislexia: toggle para fonte OpenDyslexic
- Espaçamento: select 1x, 1.5x, 2x

### TrendingPanel
- Query: busca top 3-5 notícias por view_count
- Exibe: ranking badge, título truncado, views

### UserManagementPanel
- Links estáticos para:
  - /admin/users/new
  - /admin/users
  - /admin/users/permissions

### ImportLogsPanel
- Query: últimos 5-10 registros de importação RSS
- Exibe: nome do feed, status badge, timestamp

### QuickStatsPanel
- Queries agregadas:
  - Artigos esta semana (count com filtro de data)
  - Feeds ativos (count de feeds com enabled=true)
  - Média views/artigo (avg de view_count)
  - Taxa sucesso RSS (% de importações com sucesso)
- Barra de progresso visual para taxa

---

## 9. Responsividade

### Mobile (< 768px)
- KPIs: 2 colunas
- Main: 1 coluna (Acessibilidade em cima, Artigos embaixo)
- Footer: 1 coluna

### Tablet (768px - 1024px)
- KPIs: 4 colunas
- Main: 1 coluna ou 6+6
- Footer: 2 colunas

### Desktop (> 1024px)
- KPIs: 4 colunas
- Main: 5+7 colunas
- Footer: 2 colunas

---

## 10. Resumo de Arquivos

### Criar (7 arquivos)
1. `GradientKpiCard.tsx`
2. `AccessibilityPanel.tsx`
3. `TrendingPanel.tsx`
4. `UserManagementPanel.tsx`
5. `ImportLogsPanel.tsx`
6. `QuickStatsPanel.tsx`
7. `RecentArticlesPanel.tsx`

### Modificar (2 arquivos)
1. `Dashboard.tsx` - reescrever completamente
2. `index.css` - adicionar gradientes

### Manter/Reutilizar
- `DashboardPanel.tsx` - pode ser usado como wrapper
- `CompactList.tsx` - pode ser útil internamente

---

## 11. Ordem de Implementação

1. Criar `GradientKpiCard.tsx`
2. Criar `AccessibilityPanel.tsx`
3. Criar `TrendingPanel.tsx`
4. Criar `RecentArticlesPanel.tsx`
5. Criar `UserManagementPanel.tsx`
6. Criar `ImportLogsPanel.tsx`
7. Criar `QuickStatsPanel.tsx`
8. Atualizar `index.css` com gradientes
9. Reescrever `Dashboard.tsx` usando novos componentes
10. Testar responsividade
