
# Plano: Dashboard Premium com Modo Claro / Escuro / Sistema

## Resumo Executivo

Atualizar o Dashboard "Centro de Comando" para um visual institucional premium com identidade em laranja, suportando Claro, Escuro e detecção automática do Sistema. Todas as cores serão baseadas em tokens, eliminando valores hardcoded.

---

## 1. Sistema de Tema Completo

### 1.1 Atualizar useTheme.ts

O hook atual suporta apenas "light" e "dark". Será expandido para:

```typescript
type ThemeMode = "light" | "dark" | "system";

// Lógica:
// - "system" -> detecta prefers-color-scheme e aplica automaticamente
// - Persistência em localStorage: "theme-mode"
// - Listener para mudanças do sistema em tempo real
```

**Novo comportamento:**
- `mode`: "light" | "dark" | "system" (preferência do usuário)
- `resolvedTheme`: "light" | "dark" (tema efetivamente aplicado)
- Listener `matchMedia` para detectar mudanças do SO em tempo real

### 1.2 Criar ThemeContext.tsx

Contexto global para disponibilizar o tema em toda a aplicação:

```text
ThemeProvider
├── mode (light | dark | system)
├── resolvedTheme (light | dark)
├── setMode(mode)
└── toggleTheme()
```

---

## 2. Tokens Obrigatórios - Padronização

### 2.1 Adicionar novos tokens em index.css

```css
:root {
  /* Dashboard Premium Tokens */
  --bg: var(--background);
  --surface: var(--card);
  --surface-hover: var(--muted);
  --text: var(--foreground);
  --text-muted: var(--muted-foreground);
  
  /* Primary (Laranja - Identidade) */
  --primary-soft: 25 95% 53% / 0.1;
  
  /* Semantic tokens para dashboard */
  --dashboard-card-bg: var(--card);
  --dashboard-stat-text: var(--foreground);
  --dashboard-icon-accent: var(--primary);
}

.dark {
  /* Ajustes dark mode */
  --primary-soft: 25 95% 55% / 0.15;
}
```

### 2.2 Atualizar Tailwind Config

Adicionar aliases:
```typescript
colors: {
  bg: "hsl(var(--bg))",
  surface: "hsl(var(--surface))",
  "surface-hover": "hsl(var(--surface-hover))",
  "primary-soft": "hsl(var(--primary-soft))",
}
```

---

## 3. Refatoração do Dashboard

### 3.1 Estrutura Visual Premium

```text
┌─────────────────────────────────────────────────────────────────┐
│ HEADER - Logo + "Centro de Comando" + [Modo Foco] [Alertas]    │
│ Fundo neutro (--bg), sem gradientes pesados                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TOPO: VISÃO GERAL (4 cards)                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │Publicadas│ │  Total   │ │ Stories  │ │ Views    │          │
│  │  Hoje    │ │ Notícias │ │  Ativos  │ │ Totais   │          │
│  │   12     │ │  1,247   │ │    18    │ │  45.2K   │          │
│  │  🟠      │ │  🟠      │ │  🟠      │ │  🟠      │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│  Fundo: surface | Borda sutil | Ícone: primary (laranja)       │
│                                                                 │
│  CORPO: GRID EDITORIAL                                          │
│  ┌─────────────────────────────┐ ┌───────────────────────────┐ │
│  │ COL PRINCIPAL (8 cols)      │ │ COL SECUNDÁRIA (4 cols)   │ │
│  │                             │ │                           │ │
│  │ ┌─────┐ ┌─────┐ ┌─────┐    │ │ ┌─────────────────────┐   │ │
│  │ │Prod.│ │Rec. │ │Aud. │    │ │ │ Últimas Atualizações│   │ │
│  │ │Edit │ │Monet│ │ência│    │ │ │                     │   │ │
│  │ └─────┘ └─────┘ └─────┘    │ │ └─────────────────────┘   │ │
│  │                             │ │                           │ │
│  │ ┌─────────────────────────┐ │ │ ┌─────────────────────┐   │ │
│  │ │ Ações Rápidas           │ │ │ │ Mais Lidas          │   │ │
│  │ │ Grid de botões premium  │ │ │ │ Top 5 com medals    │   │ │
│  │ └─────────────────────────┘ │ └─────────────────────────┘ │ │
│  └─────────────────────────────┘                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Cards com Identidade Laranja

**Regras de Design:**
- Fundo dos cards: `bg-surface` (neutro, branco/cinza escuro)
- Bordas: `border-border` (sutil, sem destaque)
- Ícones: `text-primary` (laranja) como cor de destaque
- Valores: `text-foreground` (preto/branco conforme modo)
- Labels: `text-muted-foreground`

**Sem gradientes de fundo coloridos** - eliminar:
```typescript
// REMOVER estas classes dos statsCards:
gradient: "from-emerald-500/20 to-transparent"
bgColor: "bg-emerald-500/10"
color: "text-emerald-600"

// SUBSTITUIR por:
iconBg: "bg-primary/10"  // Laranja suave
iconColor: "text-primary" // Laranja
```

### 3.3 Remover Cores Hardcoded

Substituições no Dashboard.tsx:

| Antes | Depois |
|-------|--------|
| `text-emerald-600` | `text-primary` |
| `text-blue-600` | `text-primary` |
| `text-purple-600` | `text-ai` ou `text-primary` |
| `text-orange-600` | `text-primary` |
| `bg-emerald-500/10` | `bg-primary/10` |
| `bg-blue-500/10` | `bg-primary/10` |
| `bg-purple-500/10` | `bg-ai/10` (se for IA) ou `bg-primary/10` |
| `bg-orange-500/10` | `bg-primary/10` |
| `bg-yellow-500/10` | `bg-primary/10` |
| `bg-green-500/10` | `bg-money/10` (se monetização) |

---

## 4. Configuração de Aparência

### 4.1 Criar Nova Página de Aparência

**Localização:** `src/pages/admin/settings/AppearanceSettings.tsx`

```text
Gestão do Portal → Configurações → Aparência
┌─────────────────────────────────────────────┐
│ 🎨 Aparência                                │
│                                             │
│ Tema do Dashboard                           │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │ ☀️      │ │ 🌙      │ │ 🖥️      │        │
│ │ Claro   │ │ Escuro  │ │ Sistema │        │
│ │  [✓]    │ │         │ │         │        │
│ └─────────┘ └─────────┘ └─────────┘        │
│                                             │
│ ⓘ O modo "Sistema" detecta automaticamente │
│   a preferência do seu dispositivo.        │
│                                             │
│ [Salvar preferência]                        │
└─────────────────────────────────────────────┘
```

### 4.2 Persistência da Preferência

- Por usuário: `localStorage.setItem("theme-mode", mode)`
- Global do portal: Opcional, via tabela `site_settings` se desejar

### 4.3 Adicionar Rota

Adicionar ao menu de Gestão do Portal:
```text
Gestão do Portal
├── Editor da Home
├── Categorias
├── Tags
├── Aparência ← NOVO
├── Modelo do Portal
└── Vocabulário
```

---

## 5. Componentes Premium

### 5.1 ThemeToggle.tsx

Componente reutilizável para seleção de tema:

```typescript
// Props
interface ThemeToggleProps {
  variant?: "dropdown" | "cards";  // dropdown para header, cards para settings
}

// Visual com RadioGroup de 3 opções
// Ícones: Sun, Moon, Monitor
```

### 5.2 Atualização do AdminLayout

Adicionar ThemeToggle no header do admin:

```text
┌─────────────────────────────────────────────────┐
│ Logo    [Busca...]    [🌙] [🔔] [👤]            │
└─────────────────────────────────────────────────┘
                         ↑
                    ThemeToggle (dropdown)
```

---

## 6. Arquivos a Modificar

### Novos Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `src/hooks/useThemeMode.ts` | Hook expandido com suporte a "system" |
| `src/contexts/ThemeContext.tsx` | Contexto global de tema |
| `src/components/admin/ThemeToggle.tsx` | Componente de seleção de tema |
| `src/pages/admin/settings/AppearanceSettings.tsx` | Página de configuração |

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/index.css` | Adicionar tokens `--primary-soft`, padronizar dashboard |
| `tailwind.config.ts` | Adicionar aliases `surface`, `primary-soft` |
| `src/pages/admin/Dashboard.tsx` | Refatorar cores para usar tokens |
| `src/components/admin/dashboard/DashboardProductionCard.tsx` | Usar tokens |
| `src/components/admin/dashboard/DashboardRevenueCard.tsx` | Usar tokens |
| `src/components/admin/dashboard/DashboardAudienceCard.tsx` | Usar tokens |
| `src/components/admin/AdminSidebar.tsx` | Adicionar link para Aparência |
| `src/App.tsx` | Adicionar rota `/admin/settings/appearance` |
| `src/App.tsx` | Envolver app com ThemeProvider |

---

## 7. Detalhes de Implementação

### 7.1 Hook useThemeMode.ts

```typescript
type ThemeMode = "light" | "dark" | "system";

export function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("theme-mode") as ThemeMode;
    return stored || "system";
  });

  // Calcula tema resolvido
  const resolvedTheme = useMemo(() => {
    if (mode === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches 
        ? "dark" 
        : "light";
    }
    return mode;
  }, [mode]);

  // Listener para mudanças do sistema
  useEffect(() => {
    if (mode !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => forceUpdate();
    
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [mode]);

  // Aplica classe no documento
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    localStorage.setItem("theme-mode", mode);
  }, [resolvedTheme, mode]);

  return { mode, setMode, resolvedTheme };
}
```

### 7.2 Tokens CSS para Dashboard

```css
/* Dashboard Premium - Tokens unificados */
:root {
  --dashboard-bg: var(--muted) / 0.2;
  --dashboard-card: var(--card);
  --dashboard-card-border: var(--border);
  --dashboard-icon-bg: 25 95% 53% / 0.1;
  --dashboard-icon-color: var(--primary);
  --dashboard-stat-color: var(--foreground);
  --dashboard-label-color: var(--muted-foreground);
}

.dark {
  --dashboard-bg: var(--muted) / 0.1;
  --dashboard-icon-bg: 25 95% 55% / 0.15;
}
```

### 7.3 Card Premium Refatorado

```typescript
// statsCards refatorado
const statsCards = [
  {
    title: "Publicadas Hoje",
    value: stats?.publishedToday || 0,
    icon: Newspaper,
    // Sem cores individuais - tudo usa tokens
  },
  // ...
];

// Renderização
<Card className="bg-surface border-border">
  <CardContent className="p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase">
          {stat.title}
        </p>
        <p className="dashboard-stat-xl text-foreground mt-2">
          {stat.value}
        </p>
      </div>
      <div className="p-3 rounded-xl bg-primary/10">
        <stat.icon className="h-6 w-6 text-primary" />
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 8. Estilos Premium Específicos

### 8.1 Cards Neutros com Borda

```css
.dashboard-card-premium {
  @apply bg-card border border-border rounded-xl;
  @apply hover:shadow-md hover:border-primary/20 transition-all;
}
```

### 8.2 Ícones em Laranja

Todos os ícones de destaque usarão:
```css
.dashboard-icon-accent {
  @apply text-primary bg-primary/10 p-3 rounded-xl;
}
```

### 8.3 Espaçamento como Separador

- Gap entre cards: `gap-6`
- Padding interno: `p-6`
- Eliminar divisórias pesadas

---

## 9. Validação Visual

### Checklist de Modo Claro

| Elemento | Esperado |
|----------|----------|
| Background | Branco/Cinza muito claro |
| Cards | Brancos com borda cinza clara |
| Ícones | Laranja vibrante |
| Textos valores | Preto/Cinza escuro |
| Labels | Cinza médio |

### Checklist de Modo Escuro

| Elemento | Esperado |
|----------|----------|
| Background | Cinza escuro profundo |
| Cards | Cinza escuro com borda sutil |
| Ícones | Laranja brilhante |
| Textos valores | Branco |
| Labels | Cinza claro |

### Checklist de Modo Sistema

| Elemento | Esperado |
|----------|----------|
| Detecção | Segue `prefers-color-scheme` do SO |
| Mudança | Atualiza automaticamente |
| Persistência | "system" salvo no localStorage |

---

## 10. Resultado Esperado

```text
✅ Dashboard com visual institucional premium
✅ Identidade forte em laranja (ícones, botões, indicadores)
✅ Cards neutros sem competição visual
✅ Modo Claro elegante e limpo
✅ Modo Escuro elegante (não pesado)
✅ Modo Sistema com detecção automática
✅ Configuração em Gestão → Aparência
✅ Nenhuma cor hardcoded
✅ Todos os componentes usando tokens
✅ Experiência premium de portal institucional
```
