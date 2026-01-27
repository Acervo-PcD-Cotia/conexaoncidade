
# Plano: Redesign Completo do Dashboard — Estilo Institucional Premium

## Resumo Executivo

Redesenhar completamente o layout do Dashboard (/admin) para um visual "quiet premium" institucional, inspirado no modelo ITL Brasil. O sistema de tema (light/dark/system) e tokens já existem e **não serão alterados**. O foco é reorganização estrutural, hierarquia visual e componentização premium.

---

## 1. Análise do Estado Atual

### Problemas Identificados

| Problema | Localização | Impacto |
|----------|-------------|---------|
| Cards muito "gordos" | statsCards (p-6) | Visual pesado |
| Grid desbalanceado | main grid 8/4 cols | Coluna lateral estreita |
| Ícones grandes demais | h-6 w-6 nos stats | Desproporcionais |
| "Ações Rápidas" ocupa muito espaço | grid-cols-4, cards grandes | Poluição visual |
| Header com gradiente desnecessário | dashboard-header-premium | Visual não-institucional |
| Badges de status hardcoded | text-emerald-700, etc. | Violação de tokens |

### O Que Funciona

- ✅ Tokens semânticos (primary, muted-foreground, border)
- ✅ Ícones usando text-primary
- ✅ Cards usando bg-card e border-border
- ✅ Sistema de tema funcionando

---

## 2. Nova Estrutura do Dashboard

### Layout em Grid 12 Colunas

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ HEADER - Compacto, limpo, sem gradiente pesado                              │
│ h-14 (reduzido de h-24)                                                     │
│ Logo menor + Título + [Busca] [Alertas] [Nova Notícia]                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LINHA 1: KPI CARDS (4 colunas iguais)                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │Publicadas│ │  Total   │ │ Stories  │ │  Views   │                        │
│  │   12     │ │  1,247   │ │    18    │ │  45.2K   │                        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                        │
│  Cards compactos (p-4), ícone h-4 w-4, sem sombras pesadas                   │
│                                                                              │
│  LINHA 2: CORPO (8 cols principal + 4 cols lateral)                          │
│  ┌───────────────────────────────────────────┐  ┌──────────────────────────┐│
│  │ COLUNA PRINCIPAL (col-span-8)             │  │ COLUNA LATERAL (col-4)   ││
│  │                                           │  │                          ││
│  │ ┌───────────────────────────────────────┐ │  │ ┌──────────────────────┐ ││
│  │ │ 📰 ARTIGOS RECENTES                   │ │  │ │ Produção Editorial   │ ││
│  │ │ Lista compacta com badges + datas     │ │  │ │ • Rascunhos: 12     │ ││
│  │ │ Sem cards internos, apenas linhas     │ │  │ │ • Em Revisão: 3     │ ││
│  │ └───────────────────────────────────────┘ │  │ │ • Agendadas: 5      │ ││
│  │                                           │  │ │ • Publicadas: 8     │ ││
│  │ ┌───────────────────────────────────────┐ │  │ └──────────────────────┘ ││
│  │ │ 🔥 MAIS LIDAS                         │ │  │                          ││
│  │ │ Top 5 compacto com ranking medals     │ │  │ ┌──────────────────────┐ ││
│  │ └───────────────────────────────────────┘ │  │ │ 📊 Audiência         │ ││
│  │                                           │  │ │ Views | Online | Users│ ││
│  │ ┌───────────────────────────────────────┐ │  │ └──────────────────────┘ ││
│  │ │ ⚡ AÇÕES RÁPIDAS (grid compacto)      │ │  │                          ││
│  │ │ Grid 6 cols com botões icon-only      │ │  │ ┌──────────────────────┐ ││
│  │ └───────────────────────────────────────┘ │  │ │ 💰 Receita           │ ││
│  │                                           │  │ │ Publidoor + Ads CTR  │ ││
│  └───────────────────────────────────────────┘  │ └──────────────────────┘ ││
│                                                  └──────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Novos Componentes Reutilizáveis

### 3.1 DashboardPanel

Componente wrapper para painéis consistentes:

```typescript
interface DashboardPanelProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;  // Botão "Ver todas" etc
  children: React.ReactNode;
  className?: string;
}
```

**Estilos:**
- Fundo: `bg-card`
- Borda: `border border-border`
- Header: `p-4 border-b border-border` (menor que p-5)
- Título: `text-sm font-semibold` (não text-lg)
- Ícone: `h-4 w-4 text-primary` (discreto)

### 3.2 KpiCard

Card de KPI padronizado e compacto:

```typescript
interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
}
```

**Estilos:**
- Card: `bg-card border-border p-4` (não p-6)
- Título: `text-xs font-medium text-muted-foreground uppercase`
- Valor: `text-2xl font-bold` (não text-4xl)
- Ícone: `h-4 w-4 text-primary` em container `p-2 bg-primary/10 rounded-lg`
- Hover: apenas `hover:shadow-sm`, sem lift

### 3.3 CompactList

Lista compacta para itens com status:

```typescript
interface CompactListProps {
  items: Array<{
    id: string;
    title: string;
    status?: string;
    meta?: string;
    href?: string;
  }>;
  emptyMessage?: string;
}
```

**Estilos:**
- Item: `py-2 border-b border-border/50 last:border-0`
- Título: `text-sm font-medium line-clamp-1`
- Meta: `text-[10px] text-muted-foreground`
- Hover: `hover:bg-muted/30`

---

## 4. Detalhes de Implementação

### 4.1 Header Simplificado

**Antes:**
```tsx
<header className="h-24 ... dashboard-header-premium">
```

**Depois:**
```tsx
<header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-border bg-card">
  {/* Logo menor (h-8) + Título compacto */}
  {/* Busca + Alertas + Nova Notícia (botões menores) */}
</header>
```

### 4.2 KPI Cards Compactos

**Antes:**
```tsx
<Card className="...">
  <CardContent className="p-6">
    <div className="p-3 rounded-xl bg-primary/10">
      <stat.icon className="h-6 w-6 text-primary" />
    </div>
    <p className="dashboard-stat-xl">{value}</p>  {/* text-4xl */}
  </CardContent>
</Card>
```

**Depois:**
```tsx
<KpiCard
  title="Publicadas Hoje"
  value={12}
  icon={Newspaper}
/>

// Internamente:
<Card className="bg-card border-border">
  <CardContent className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </p>
        <p className="text-2xl font-bold tabular-nums mt-1">{value}</p>
      </div>
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
    </div>
  </CardContent>
</Card>
```

### 4.3 Badges de Status (Corrigir Hardcoded)

**Antes (hardcoded):**
```tsx
const styles: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  draft: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  ...
};
```

**Depois (usando tokens):**
```tsx
const styles: Record<string, string> = {
  published: "bg-money/10 text-money",
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-brand/10 text-brand",
  review: "bg-primary/10 text-primary",
};
```

### 4.4 Ações Rápidas Compactas

**Antes:** Grid 4 cols com cards grandes contendo ícone + título + descrição

**Depois:** Grid 6-8 cols com botões icon-only + tooltip

```tsx
<div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
  {quickActions.map((action) => (
    <Tooltip key={action.title}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-12 w-full flex flex-col gap-1 hover:bg-muted"
          onClick={action.onClick}
          asChild={!!action.href}
        >
          {action.href ? (
            <Link to={action.href}>
              <action.icon className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-muted-foreground truncate">
                {action.title}
              </span>
            </Link>
          ) : (
            <>
              <action.icon className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-muted-foreground truncate">
                {action.title}
              </span>
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{action.description}</TooltipContent>
    </Tooltip>
  ))}
</div>
```

---

## 5. Arquivos a Modificar

### Novos Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `src/components/admin/dashboard/DashboardPanel.tsx` | Wrapper premium para painéis |
| `src/components/admin/dashboard/KpiCard.tsx` | Card de KPI compacto padronizado |
| `src/components/admin/dashboard/CompactList.tsx` | Lista compacta de itens |
| `src/components/admin/dashboard/QuickActionsGrid.tsx` | Grid de ações compactas |

### Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/pages/admin/Dashboard.tsx` | Reestruturar layout completo, usar novos componentes |
| `src/components/admin/dashboard/DashboardProductionCard.tsx` | Usar DashboardPanel, simplificar |
| `src/components/admin/dashboard/DashboardRevenueCard.tsx` | Usar DashboardPanel, simplificar |
| `src/components/admin/dashboard/DashboardAudienceCard.tsx` | Usar DashboardPanel, simplificar |
| `src/index.css` | Ajustar `.dashboard-stat-xl` para text-2xl, remover gradientes desnecessários |

---

## 6. Padronização de Espaçamento

### Regras de Espaçamento

| Elemento | Antes | Depois |
|----------|-------|--------|
| Header height | h-24 | h-14 |
| Card padding | p-6 | p-4 |
| Section gap | gap-6 | gap-4 |
| Icon size (KPI) | h-6 w-6 | h-4 w-4 |
| Icon container | p-3 | p-2 |
| Título seção | text-lg | text-sm font-semibold |
| Valor KPI | text-4xl | text-2xl |
| Item lista | py-3 | py-2 |

### Regras de Tipografia

| Elemento | Classe |
|----------|--------|
| KPI Label | `text-xs font-medium text-muted-foreground uppercase tracking-wide` |
| KPI Value | `text-2xl font-bold tabular-nums` |
| Panel Title | `text-sm font-semibold` |
| Panel Description | `text-xs text-muted-foreground` |
| List Item Title | `text-sm font-medium` |
| List Item Meta | `text-[10px] text-muted-foreground` |

---

## 7. Tokens Utilizados (Sem Alteração)

Os tokens existentes serão usados de forma consistente:

| Token | Uso |
|-------|-----|
| `bg-card` | Fundo de todos os cards e painéis |
| `bg-background` | Fundo geral da página |
| `bg-muted` | Backgrounds hover e estados |
| `border-border` | Todas as bordas |
| `text-foreground` | Texto principal |
| `text-muted-foreground` | Labels e meta |
| `text-primary` | Ícones de destaque (laranja) |
| `bg-primary/10` | Container de ícones |
| `text-money` | Status "publicado", receita |
| `text-brand` | Status "agendado" |

---

## 8. Validação Visual

### Checklist Modo Claro

| Elemento | Esperado |
|----------|----------|
| Background geral | Cinza muito claro (#fafafa) |
| Cards | Brancos com borda cinza sutil |
| Ícones KPI | Laranja em fundo laranja/10 |
| Valores | Preto (#1a1a1a) |
| Labels | Cinza médio |
| Bordas | Quase invisíveis |
| Sombras | Mínimas (shadow-sm hover) |

### Checklist Modo Escuro

| Elemento | Esperado |
|----------|----------|
| Background geral | Cinza escuro profundo |
| Cards | Cinza escuro com borda sutil |
| Ícones KPI | Laranja brilhante |
| Valores | Branco |
| Labels | Cinza claro |

### Visual "Quiet Premium"

- [ ] Muito espaço em branco/superfície
- [ ] Bordas sutis (apenas estruturais)
- [ ] Sombras quase invisíveis
- [ ] Cores apenas em ícones, badges, status
- [ ] Tipografia com hierarquia clara
- [ ] Cards não competem visualmente
- [ ] Botão "Nova Notícia" destaque único

---

## 9. Resultado Esperado

```text
✅ Header compacto (h-14) sem gradientes
✅ KPI Cards pequenos (p-4, text-2xl, icon h-4)
✅ Grid 8+4 com hierarquia clara
✅ Artigos Recentes como lista compacta
✅ Mais Lidas com ranking visual
✅ Ações Rápidas em grid icon-only
✅ Coluna lateral com Production/Audience/Revenue
✅ Badges usando tokens (text-money, text-brand)
✅ Zero cores hardcoded
✅ Visual institucional premium
✅ Funciona perfeitamente em Light/Dark/System
```

---

## 10. Componentes Detalhados

### DashboardPanel.tsx

```typescript
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardPanelProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function DashboardPanel({
  title,
  description,
  icon: Icon,
  iconColor = "text-primary",
  action,
  children,
  className,
  contentClassName,
}: DashboardPanelProps) {
  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader className="p-4 border-b border-border flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-1.5 rounded-md bg-muted">
              <Icon className={cn("h-4 w-4", iconColor)} />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
      </CardHeader>
      <CardContent className={cn("p-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
```

### KpiCard.tsx

```typescript
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: KpiCardProps) {
  const formattedValue = typeof value === "number"
    ? value >= 1000
      ? `${(value / 1000).toFixed(1)}K`
      : value.toLocaleString('pt-BR')
    : value;

  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1">{formattedValue}</p>
            {trend && (
              <p className={cn(
                "text-[10px] mt-0.5",
                trend.value >= 0 ? "text-money" : "text-destructive"
              )}>
                {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 11. Ordem de Implementação

1. **Criar KpiCard.tsx** — componente base reutilizável
2. **Criar DashboardPanel.tsx** — wrapper para painéis
3. **Criar CompactList.tsx** — lista reutilizável
4. **Criar QuickActionsGrid.tsx** — grid de ações
5. **Refatorar Dashboard.tsx** — nova estrutura completa
6. **Atualizar cards existentes** — usar DashboardPanel
7. **Ajustar index.css** — remover estilos pesados
8. **Teste visual** — Light/Dark/System
