
# Plano: Redesign Premium do Admin Portal

## Visão Geral

Este plano implementa um redesign completo do Admin do Portal Conexão na Cidade com:
1. Sistema completo de temas (Light/Dark/System + Presets Institucional/Tech)
2. Dashboard com visual premium moderno
3. Módulos Esportes e ENEM 2026 integrados no menu com rotas funcionais

---

## 1. Arquitetura de Temas

### 1.1 Tipos e Estrutura

Criar novo tipo para presets visuais:

```typescript
// src/types/theme.ts
export type ThemeMode = "light" | "dark" | "system";
export type ThemePreset = "institutional" | "tech";
```

### 1.2 Atualizar ThemeContext

**Arquivo:** `src/contexts/ThemeContext.tsx`

Adicionar suporte a presets:
- Nova propriedade `preset` com persistência em `localStorage`
- Aplicar `data-preset` no `documentElement`
- Expor `preset`, `setPreset`

### 1.3 Tokens CSS para Presets

**Arquivo:** `src/index.css`

Adicionar variações por preset:

```css
/* Preset Institucional - Mais suave, sombras leves */
html[data-preset="institutional"] {
  --radius: 0.75rem;
  --shadow-card: 0 1px 3px rgba(0,0,0,0.08);
  --border-opacity: 0.12;
}

/* Preset Tech - Alto contraste, bordas nítidas, glow sutil */
html[data-preset="tech"] {
  --radius: 0.5rem;
  --shadow-card: 0 2px 8px rgba(0,0,0,0.15);
  --border-opacity: 0.2;
  --accent-glow: 0 0 12px hsl(25 95% 53% / 0.25);
}
```

---

## 2. Controles de Tema na UI

### 2.1 Atualizar ThemeToggle

**Arquivo:** `src/components/admin/ThemeToggle.tsx`

Adicionar dropdown expandido com:
- Seção "Modo": Light / Dark / System
- Seção "Estilo Visual": Institucional / Tech-Startup
- Indicador visual do modo/preset atual

### 2.2 Atualizar Página de Aparência

**Arquivo:** `src/pages/admin/settings/AppearanceSettings.tsx`

Adicionar:
- Cards de seleção para Presets (Institucional/Tech)
- Preview visual atualizado em tempo real
- Descrição de cada preset

---

## 3. Redesign do Dashboard

### 3.1 Novo Layout Visual

O Dashboard atual já possui boa estrutura. Refinamentos:

```text
+------------------------------------------------------------------+
| Header: "Dashboard" + "Visão geral do sistema..."                |
+------------------------------------------------------------------+
|                                                                  |
| KPIs (4 cards) - Manter GradientKpiCard com ajustes de tokens    |
|                                                                  |
+-------------------------+----------------------------------------+
| Coluna Esquerda (5)     | Coluna Direita (7)                     |
|                         |                                        |
| [Acessibilidade]        | [Artigos Recentes]                     |
| [Mais Pesquisadas]      |  - Refinado com tokens semânticos      |
| [Gestão Usuários]       |                                        |
+-------------------------+----------------------------------------+
| [Logs de Importação]    | [Estatísticas Rápidas]                 |
+------------------------------------------------------------------+
```

### 3.2 Refatorar Componentes

**Arquivos a modificar:**
- `GradientKpiCard.tsx`: Usar tokens semânticos, remover cores hardcoded
- `DashboardPanel.tsx`: Já existe, refinar estilos
- `TrendingPanel.tsx`, `RecentArticlesPanel.tsx`: Substituir classes hardcoded

**Regra:** Eliminar todas as classes como `text-sky-600`, `bg-emerald-100` e usar apenas tokens: `text-primary`, `bg-primary/10`, `text-muted-foreground`, etc.

### 3.3 Sidebar (Já Implementada)

A sidebar atual já possui:
- Colapso/expansão com persistência
- Tooltips no modo colapsado
- Submenus em accordion
- Destaque laranja no item ativo

Nenhuma modificação necessária.

---

## 4. Módulos Esportes e ENEM 2026

### 4.1 Adicionar ao Menu Sidebar

**Arquivo:** `src/components/admin/AdminSidebar.tsx`

Criar nova seção "Educação & Esportes":

```typescript
const educationSportsItems: MenuItem[] = [
  { title: "Esportes", url: "/admin/esportes", icon: Trophy },
  { title: "ENEM 2026", url: "/admin/academy/enem", icon: GraduationCap, badge: "Novo" },
];

// Adicionar no sidebarGroups
{
  id: "educacao-esportes",
  title: "Educação & Esportes",
  icon: Trophy,
  items: educationSportsItems,
}
```

### 4.2 Rotas ENEM 2026 (Já Existentes)

As rotas ENEM já estão configuradas em `App.tsx`:
- `/admin/academy/enem` → AcademyEnem
- `/admin/academy/enem/:slug` → EnemModule
- `/admin/academy/enem/:slug/semana/:weekNumber` → EnemWeek
- `/admin/academy/enem/:slug/semana/:weekNumber/aula/:lessonId` → EnemLessonPage
- `/admin/academy/enem/:slug/minhas-redacoes` → EnemSubmissions
- `/admin/academy/enem/:slug/redacao/:submissionId` → EnemSubmissionDetail

### 4.3 Criar Páginas Base de Esportes

**Novos arquivos:**

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/admin/esportes/EsportesDashboard.tsx` | Dashboard do módulo |
| `src/pages/admin/esportes/BrasileiraoHome.tsx` | Resultados/Jogos/Times |
| `src/pages/admin/esportes/EsportesEstatisticas.tsx` | Estatísticas |

**Estrutura do Dashboard:**
- Cards KPI: Jogos Hoje, Partidas Semana, Times Cadastrados, Competições
- Lista: Próximas Partidas
- CTA: "Configurar Módulo"

### 4.4 Adicionar Rotas de Esportes

**Arquivo:** `src/App.tsx`

```typescript
// Esportes Routes
<Route path="esportes" element={<EsportesDashboard />} />
<Route path="esportes/brasileirao" element={<BrasileiraoHome />} />
<Route path="esportes/estatisticas" element={<EsportesEstatisticas />} />
```

---

## 5. Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/types/theme.ts` | Tipos ThemePreset |
| `src/pages/admin/esportes/EsportesDashboard.tsx` | Dashboard Esportes |
| `src/pages/admin/esportes/BrasileiraoHome.tsx` | Brasileirão |
| `src/pages/admin/esportes/EsportesEstatisticas.tsx` | Estatísticas |

## 6. Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/contexts/ThemeContext.tsx` | Adicionar preset, setPreset, data-preset |
| `src/hooks/useThemeMode.ts` | Adicionar lógica de preset |
| `src/index.css` | Tokens para presets institutional/tech |
| `src/components/admin/ThemeToggle.tsx` | Dropdown com Mode + Preset |
| `src/pages/admin/settings/AppearanceSettings.tsx` | Cards de seleção de preset |
| `src/components/admin/AdminSidebar.tsx` | Seção Educação & Esportes |
| `src/App.tsx` | Rotas de Esportes + imports |
| `src/components/admin/dashboard/GradientKpiCard.tsx` | Tokens semânticos |
| `src/components/admin/dashboard/*.tsx` | Remover cores hardcoded |

---

## 7. Detalhes Técnicos

### 7.1 ThemeContext Atualizado

```typescript
interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  preset: ThemePreset;
  setPreset: (preset: ThemePreset) => void;
  resolvedTheme: ResolvedTheme;
  toggleTheme: () => void;
  systemTheme: ResolvedTheme;
}
```

### 7.2 Aplicação de Preset no DOM

```typescript
useEffect(() => {
  document.documentElement.setAttribute('data-preset', preset);
}, [preset]);
```

### 7.3 CSS Variables por Preset

```css
html[data-preset="institutional"] {
  --card-shadow: 0 1px 3px rgba(0,0,0,0.08);
  --border-strength: 0.08;
  --radius: 0.75rem;
}

html[data-preset="tech"] {
  --card-shadow: 0 4px 12px rgba(0,0,0,0.12);
  --border-strength: 0.15;
  --radius: 0.5rem;
  --glow-accent: 0 0 20px hsl(25 95% 53% / 0.2);
}

html[data-preset="tech"].dark {
  --glow-accent: 0 0 24px hsl(25 95% 55% / 0.3);
}
```

### 7.4 ThemeToggle com Preset

```tsx
// Seções no dropdown
<DropdownMenuLabel>Modo</DropdownMenuLabel>
<DropdownMenuItem onClick={() => setMode("light")}>
  <Sun /> Claro
</DropdownMenuItem>
<DropdownMenuItem onClick={() => setMode("dark")}>
  <Moon /> Escuro
</DropdownMenuItem>
<DropdownMenuItem onClick={() => setMode("system")}>
  <Monitor /> Sistema
</DropdownMenuItem>

<DropdownMenuSeparator />

<DropdownMenuLabel>Estilo Visual</DropdownMenuLabel>
<DropdownMenuItem onClick={() => setPreset("institutional")}>
  <Building2 /> Institucional
</DropdownMenuItem>
<DropdownMenuItem onClick={() => setPreset("tech")}>
  <Sparkles /> Tech-Startup
</DropdownMenuItem>
```

### 7.5 Página de Esportes (Estrutura)

```tsx
export default function EsportesDashboard() {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Esportes</h1>
        <p className="text-muted-foreground">
          Acompanhe resultados, jogos e estatísticas
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GradientKpiCard title="Jogos Hoje" value={0} icon={Calendar} gradient="blue" />
        <GradientKpiCard title="Partidas Semana" value={0} icon={Trophy} gradient="green" />
        <GradientKpiCard title="Times" value={0} icon={Users} gradient="orange" />
        <GradientKpiCard title="Competições" value={2} icon={Award} gradient="purple" />
      </section>

      <DashboardPanel title="Próximas Partidas" icon={Calendar}>
        <EmptyState 
          icon={Trophy}
          title="Nenhuma partida agendada"
          description="Configure o módulo para começar"
          action={{ label: "Configurar", href: "/admin/esportes/configurar" }}
        />
      </DashboardPanel>
    </div>
  );
}
```

---

## 8. Checklist de Entrega

- [ ] Tema: light/dark/system funcionando e persistindo
- [ ] Preset: institucional/tech funcionando e persistindo
- [ ] Header com controles de tema (Mode + Preset)
- [ ] Página Aparência com seleção de preset
- [ ] Dashboard usando tokens semânticos (sem cores hardcoded)
- [ ] Sidebar com seção Educação & Esportes
- [ ] Rotas e páginas base de Esportes funcionando
- [ ] ENEM 2026 acessível via menu (rotas já existem)

---

## 9. Ordem de Implementação

1. Atualizar `useThemeMode.ts` com suporte a preset
2. Atualizar `ThemeContext.tsx` com preset
3. Adicionar tokens CSS para presets em `index.css`
4. Atualizar `ThemeToggle.tsx` com dropdown completo
5. Atualizar `AppearanceSettings.tsx` com cards de preset
6. Refatorar componentes do Dashboard (remover cores hardcoded)
7. Criar páginas de Esportes
8. Atualizar `AdminSidebar.tsx` com seção Educação & Esportes
9. Adicionar rotas de Esportes em `App.tsx`
10. Testar todos os modos/presets
