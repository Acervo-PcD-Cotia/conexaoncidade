
# Plano: Aplicação Real do Design System Global

## Resumo

Implementar tokens globais de design que transformem o Portal Conexão na Cidade de um template admin genérico em uma plataforma premium com identidade visual própria. A mudança é estrutural: todos os componentes passarão a consumir tokens semânticos em vez de cores hardcoded.

---

## 1. Reestruturação dos Design Tokens (index.css)

### Nova Hierarquia de Tokens

Adicionar tokens semânticos de nível superior que todos os componentes devem consumir:

```css
/* ============ DESIGN TOKENS GLOBAIS ============ */

/* Brand - Identidade do produto (Azul Petróleo) */
--brand-primary: 200 65% 25%;        /* Azul petróleo escuro */
--brand-secondary: 200 50% 35%;      /* Azul petróleo médio */
--brand-accent: 200 40% 45%;         /* Azul petróleo claro */

/* CTA - Ações principais (Laranja) */
--cta-primary: 25 95% 53%;           /* Laranja vibrante */
--cta-hover: 25 95% 48%;             /* Laranja hover */
--cta-foreground: 0 0% 100%;         /* Branco */

/* AI - Conexão.AI (Roxo) */
--ai-primary: 262 83% 58%;           /* Roxo vibrante */
--ai-secondary: 280 68% 50%;         /* Roxo secundário */
--ai-glow: 262 80% 60%;              /* Efeito glow */

/* Money - Monetização (Verde) */
--money-primary: 142 76% 36%;        /* Verde dinheiro */
--money-secondary: 158 64% 52%;      /* Verde claro */

/* Base Neutral - Fundos e cards */
--neutral-50: 0 0% 98%;
--neutral-100: 220 13% 95%;
--neutral-200: 220 13% 91%;
--neutral-800: 220 20% 12%;
--neutral-900: 220 20% 8%;
```

### Sidebar Tokens (baseados em brand)

```css
/* Sidebar - Identidade visual forte */
--sidebar-background: 200 65% 12%;      /* Brand escuro */
--sidebar-foreground: 0 0% 98%;
--sidebar-active-bg: 200 50% 20%;       /* Brand + destaque */
--sidebar-active-indicator: var(--cta-primary);
--sidebar-hover: 200 50% 18%;
--sidebar-border: 200 40% 20%;
```

---

## 2. Tailwind Config - Novos Tokens

### Atualizar tailwind.config.ts

Adicionar novos aliases de cor:

```typescript
colors: {
  // ... existing colors
  
  // Brand identity
  brand: {
    DEFAULT: "hsl(var(--brand-primary))",
    secondary: "hsl(var(--brand-secondary))",
    accent: "hsl(var(--brand-accent))",
  },
  
  // CTA / Actions
  cta: {
    DEFAULT: "hsl(var(--cta-primary))",
    hover: "hsl(var(--cta-hover))",
    foreground: "hsl(var(--cta-foreground))",
  },
  
  // AI module
  ai: {
    DEFAULT: "hsl(var(--ai-primary))",
    secondary: "hsl(var(--ai-secondary))",
    glow: "hsl(var(--ai-glow))",
  },
  
  // Monetization
  money: {
    DEFAULT: "hsl(var(--money-primary))",
    secondary: "hsl(var(--money-secondary))",
  },
}
```

---

## 3. Sidebar - Identidade da Marca

### Mudanças em AdminSidebar.tsx

**Sidebar Container:**
- Fundo: `bg-sidebar` (que será `--brand-primary` escuro)
- Borda: sutil com `--sidebar-border`

**Item Ativo:**
- Fundo mais claro: `bg-sidebar-active-bg`
- Indicador lateral: barra de 3px à esquerda com `--cta-primary`
- Texto: branco com opacidade total

**Item Inativo:**
- Texto: branco com 70% opacidade
- Hover: fundo `--sidebar-hover`

**Badges Semânticos:**
- Badge "IA": `bg-ai text-white`
- Badge "Premium": `bg-money text-white`

**Código de referência:**
```tsx
// Active item styling
<NavLink
  className={cn(
    "relative flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
    "text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-foreground",
  )}
  activeClassName={cn(
    "bg-sidebar-active-bg text-sidebar-foreground font-medium",
    "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
    "before:h-6 before:w-1 before:rounded-r-full before:bg-cta"
  )}
>
```

---

## 4. Dashboard e Cards

### Princípios

**Cards:**
- Fundo sempre neutro: `bg-card` (branco/cinza claro)
- Sem fundos coloridos competindo visualmente
- Bordas sutis: `border-border`

**Ícones e Badges Semânticos:**
- Editorial/Conteúdo: `text-brand`
- Audiência: `text-brand-secondary`
- IA/Automação: `text-ai` 
- Monetização: `text-money`
- CTA/Ações: `text-cta`

### Mudanças nos Cards do Dashboard

**DashboardProductionCard.tsx:**
- Header icon: `text-brand` (não primary/laranja)
- Stats icons: cores semânticas por contexto
  - Rascunhos: `text-muted-foreground`
  - Em Revisão: `text-cta` (ação necessária)
  - Agendadas: `text-brand`
  - Publicadas: `text-money` (sucesso)

**DashboardRevenueCard.tsx:**
- Header icon: `text-money` (verde)
- Todos os valores monetários: `text-money`
- Título do card com badge verde

**DashboardAudienceCard.tsx:**
- Header icon: `text-brand-secondary`
- Métricas de engajamento: `text-brand`

### Remover Fundos Pastel

Substituir:
```tsx
// ANTES - fundos pastel competindo
bgColor: "bg-emerald-500/10"
bgColor: "bg-blue-500/10"
bgColor: "bg-purple-500/10"
bgColor: "bg-orange-500/10"

// DEPOIS - fundos neutros, ícones coloridos
bgColor: "bg-muted"  // ou sem fundo
iconColor: "text-brand" // cor semântica no ícone apenas
```

---

## 5. Botões e Ações

### Regra de Uso do CTA (Laranja)

**CTA Primary (Laranja) - APENAS para:**
- "Criar"
- "Nova Notícia"
- "Publicar"
- "Ativar"
- "Salvar e Publicar"

**Secondary/Outline - Para:**
- "Cancelar"
- "Voltar"
- "Ver mais"
- "Editar"

**Ghost - Para:**
- Ações de toolbar
- Ícones de navegação
- Toggles

### Atualizar Button Component

O componente Button já usa `--primary`. Precisamos garantir que:
- `variant="default"` = CTA (laranja) → para ações principais
- Não usar `variant="default"` para navegação ou ações secundárias

---

## 6. Classes Utilitárias Semânticas

### Adicionar em index.css

```css
/* ============ UTILITY CLASSES SEMÂNTICAS ============ */

/* AI Elements */
.text-ai { color: hsl(var(--ai-primary)); }
.bg-ai { background-color: hsl(var(--ai-primary)); }
.border-ai { border-color: hsl(var(--ai-primary)); }
.glow-ai { box-shadow: 0 0 12px hsl(var(--ai-glow) / 0.4); }

/* Money/Monetization */
.text-money { color: hsl(var(--money-primary)); }
.bg-money { background-color: hsl(var(--money-primary)); }
.border-money { border-color: hsl(var(--money-primary)); }

/* Brand */
.text-brand { color: hsl(var(--brand-primary)); }
.bg-brand { background-color: hsl(var(--brand-primary)); }
.border-brand { border-color: hsl(var(--brand-primary)); }

/* CTA */
.text-cta { color: hsl(var(--cta-primary)); }
.bg-cta { background-color: hsl(var(--cta-primary)); }
.border-cta { border-color: hsl(var(--cta-primary)); }

/* Semantic Badges */
.badge-ai {
  @apply bg-ai text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full;
}

.badge-premium {
  @apply bg-money text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full;
}

.badge-brand {
  @apply bg-brand text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full;
}

/* Sidebar specific */
.sidebar-item-active {
  @apply relative;
}

.sidebar-item-active::before {
  content: "";
  @apply absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full;
  background-color: hsl(var(--cta-primary));
}
```

---

## 7. Arquivos a Modificar

| Arquivo | Ação | Mudança Principal |
|---------|------|-------------------|
| `src/index.css` | REFATORAR | Adicionar tokens globais (brand, cta, ai, money) |
| `tailwind.config.ts` | ATUALIZAR | Adicionar aliases de cores semânticas |
| `src/components/admin/AdminSidebar.tsx` | REFATORAR | Aplicar brand colors, indicador ativo, badges |
| `src/pages/admin/Dashboard.tsx` | REFATORAR | Remover fundos pastel, usar cores semânticas |
| `src/components/admin/dashboard/DashboardProductionCard.tsx` | ATUALIZAR | Header brand, ícones semânticos |
| `src/components/admin/dashboard/DashboardRevenueCard.tsx` | ATUALIZAR | Usar money-primary consistentemente |
| `src/components/admin/dashboard/DashboardAudienceCard.tsx` | ATUALIZAR | Usar brand para audiência |

---

## 8. Validação Visual Final

### Checklist de Identidade

| Elemento | Cor Esperada | Token |
|----------|--------------|-------|
| Sidebar fundo | Azul petróleo escuro | `--brand-primary` (dark) |
| Sidebar item ativo | Indicador laranja | `--cta-primary` |
| Badge "IA" | Roxo | `--ai-primary` |
| Badge "Premium" | Verde | `--money-primary` |
| Cards fundo | Neutro (branco/cinza) | `--card` |
| Ícone monetização | Verde | `--money-primary` |
| Ícone IA | Roxo | `--ai-primary` |
| Ícone editorial | Azul petróleo | `--brand-primary` |
| Botões principais | Laranja | `--cta-primary` |

### Regra de Reconhecimento Imediato

- **IA** = Roxo → imediatamente reconhecível
- **Monetização** = Verde → imediatamente reconhecível
- **Marca/Editorial** = Azul petróleo → identidade própria
- **Ações** = Laranja → apenas CTAs importantes

---

## 9. Resultado Esperado

```text
✅ Sidebar com identidade de marca (azul petróleo, não genérico)
✅ Item ativo com indicador lateral laranja
✅ Cards neutros sem competição visual
✅ IA imediatamente reconhecível (roxo)
✅ Monetização imediatamente reconhecível (verde)
✅ CTA laranja apenas para ações principais
✅ Aspecto de plataforma premium, não admin template
✅ Tokens globais consumidos por todos os componentes
✅ Consistência visual em todo o dashboard
```

---

## 10. Paleta Final de Referência

```text
┌────────────────────────────────────────────────────────────┐
│ DESIGN TOKENS - PORTAL CONEXÃO NA CIDADE                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🔷 BRAND (Azul Petróleo)                                  │
│     Primary:   hsl(200, 65%, 25%)  ████████                │
│     Secondary: hsl(200, 50%, 35%)  ████████                │
│     Accent:    hsl(200, 40%, 45%)  ████████                │
│                                                            │
│  🟠 CTA (Laranja)                                          │
│     Primary:   hsl(25, 95%, 53%)   ████████                │
│     Hover:     hsl(25, 95%, 48%)   ████████                │
│                                                            │
│  🟣 AI (Roxo)                                              │
│     Primary:   hsl(262, 83%, 58%)  ████████                │
│     Secondary: hsl(280, 68%, 50%)  ████████                │
│                                                            │
│  🟢 MONEY (Verde)                                          │
│     Primary:   hsl(142, 76%, 36%)  ████████                │
│     Secondary: hsl(158, 64%, 52%)  ████████                │
│                                                            │
│  ⬜ NEUTRAL                                                │
│     50:        hsl(0, 0%, 98%)     ████████                │
│     900:       hsl(220, 20%, 8%)   ████████                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```
