
# Plano de Implementacao: Dashboard Premium + Menus Especiais ENEM 2026 e Brasileirao

## Resumo Executivo

Este plano abrange tres areas principais:
1. **Dashboard Admin Premium** - Redesign com visual institucional moderno
2. **Sistema de Temas Completo** - Claro/Escuro/Sistema ja implementado, apenas refinamentos
3. **Menus Especiais Publicos** - Adicionar ENEM 2026 e Brasileirao na barra de servicos

---

## Diagnostico Atual

### O que ja existe e funciona:
- Sistema de temas com 3 modos (light/dark/system) e 2 presets (institutional/tech)
- ThemeToggle no header admin com dropdown funcional
- Pagina `/admin/settings/appearance` com UI de cards para escolha de tema
- Tokens CSS bem estruturados em `index.css` (light/dark)
- Rotas publicas do Brasileirao (`/esportes/brasileirao/*`) implementadas
- Dashboard atual com GradientKpiCard, RecentArticlesPanel, etc.

### O que falta ou precisa ajuste:
- Dashboard nao tem busca global nem botao "Nova Noticia" no header
- KPIs usam gradientes coloridos (conflita com visual "quiet premium")
- Chips de servicos especiais nao incluem ENEM 2026 nem Brasileirao
- Nao existe landing publica `/enem-2026`

---

## Fase 1: Menus Especiais - ENEM 2026 e Brasileirao (Prioridade Alta)

### 1.1 Atualizar Header.tsx - Barra de Servicos

**Arquivo:** `src/components/layout/Header.tsx`

Adicionar dois novos chips na barra de servicos (linhas 268-313):

```text
Chips atuais:
[Apareca no Google] [Censo PcD] [Conexoes] [Web Radio/TV] [Fake News] [Transporte Escolar]

Chips novos:
[ENEM 2026] [Brasileirao]
```

**Especificacao dos chips:**
- ENEM 2026: icone `GraduationCap`, cor indigo (azul educacional)
- Brasileirao: icone `Trophy`, cor emerald (verde esportivo)

### 1.2 Criar Landing Publica ENEM 2026

**Arquivo novo:** `src/pages/public/Enem2026Landing.tsx`

Estrutura da pagina:
1. Hero com titulo "ENEM 2026" e subtitulo motivacional
2. Card principal "Redacao Nota 1000" com CTA para `/admin/academy/enem/redacao-nota-1000`
3. Grid de modulos "Em breve" (Linguagens, Humanas, Matematica, Natureza)
4. Secao "Como funciona" com 3 passos
5. FAQ basico
6. CTA final para login/registro

### 1.3 Registrar Rota Publica

**Arquivo:** `src/App.tsx`

Adicionar rota dentro do PublicLayout:
```tsx
<Route path="/enem-2026" element={<Enem2026Landing />} />
```

---

## Fase 2: Dashboard Premium (Prioridade Alta)

### 2.1 Atualizar Header do Dashboard

**Arquivo:** `src/pages/admin/Dashboard.tsx`

O header atual e simples. Vamos adicionar:
- Subtitulo "Visao geral do sistema"
- Botao "Nova Noticia" (usa `useNewsCreationModal`)
- Busca global com Ctrl+K hint

### 2.2 Refinar KpiCards para Visual Premium

**Arquivo:** `src/components/admin/dashboard/GradientKpiCard.tsx`

Problema: Os gradientes coloridos competem visualmente.

Solucao: Criar variante "premium" com:
- Fundo neutro (`bg-card`)
- Borda sutil
- Icone em badge com cor de destaque (laranja) em baixa opacidade
- Remover gradientes excessivos

Nova variante:
```tsx
// Modo Premium: fundo neutro, icone com primary-soft
const premiumStyle = "bg-card border border-border hover:shadow-md transition-shadow";
```

### 2.3 Reorganizar Layout do Dashboard

**Arquivo:** `src/pages/admin/Dashboard.tsx`

Layout atual:
- 4 KPIs em linha
- Grid 5+7 (Acessibilidade/Trending/Users | Artigos Recentes)
- Footer 2 colunas (Logs | Stats)

Layout Premium proposto:
- Header compacto com acoes
- 4 KPIs em linha (visual neutro)
- Grid 8+4:
  - Coluna principal (8): Artigos Recentes + Acoes Rapidas
  - Coluna lateral (4): Mais Lidas + Estatisticas
- Footer: Logs de Importacao (full width)

### 2.4 Atualizar Componente QuickActionsGrid

**Arquivo:** `src/components/admin/dashboard/QuickActionsGrid.tsx`

Garantir que acoes usem `variant="outline"` para visual limpo, com icone e texto.

---

## Fase 3: Refinamentos do Sistema de Temas (Prioridade Media)

### 3.1 Status Atual

O sistema ja esta implementado:
- `ThemeProvider` em `src/contexts/ThemeContext.tsx`
- `useThemeMode` hook com persistencia localStorage
- `ThemeToggle` componente com modos e presets
- Tokens CSS em `index.css` para light/dark
- Presets "institutional" e "tech" via `data-preset`

### 3.2 Pequenos Ajustes Necessarios

**index.css** - Adicionar tokens faltantes:
```css
--primary-contrast: 0 0% 100%; /* texto sobre laranja */
```

**ThemeToggle.tsx** - Ja funciona, sem alteracoes necessarias.

**AppearanceSettings.tsx** - Ja funciona, sem alteracoes necessarias.

---

## Fase 4: Atualizacao do Header Mobile

### 4.1 Adicionar ENEM 2026 e Brasileirao no Menu Mobile

**Arquivo:** `src/components/layout/Header.tsx`

Na secao de "Special Links for Mobile" (linhas 70-118), adicionar:
```tsx
<Link to="/enem-2026" ...>
  <GraduationCap /> ENEM 2026
</Link>
<Link to="/esportes/brasileirao" ...>
  <Trophy /> Brasileirao
</Link>
```

---

## Arquivos a Criar/Modificar

### Novos Arquivos:
1. `src/pages/public/Enem2026Landing.tsx` - Landing publica ENEM

### Arquivos a Modificar:
1. `src/components/layout/Header.tsx` - Adicionar chips ENEM e Brasileirao
2. `src/pages/admin/Dashboard.tsx` - Header com busca e "Nova Noticia"
3. `src/components/admin/dashboard/GradientKpiCard.tsx` - Variante premium
4. `src/App.tsx` - Registrar rota `/enem-2026`
5. `src/index.css` - Token `--primary-contrast` (se necessario)

---

## Criterios de Aceite

| # | Criterio | Status |
|---|----------|--------|
| 1 | Chips "ENEM 2026" e "Brasileirao" aparecem na barra de servicos (desktop) | A fazer |
| 2 | Chips aparecem no menu mobile | A fazer |
| 3 | Clique em ENEM 2026 abre `/enem-2026` | A fazer |
| 4 | Clique em Brasileirao abre `/esportes/brasileirao` | A fazer |
| 5 | Landing ENEM 2026 com hero, cards e CTA | A fazer |
| 6 | Dashboard com header premium (busca + Nova Noticia) | A fazer |
| 7 | KPIs com visual neutro/premium | A fazer |
| 8 | Tema Claro/Escuro/Sistema funcionando | Ja funciona |
| 9 | Toggle no header + pagina de aparencia | Ja funciona |
| 10 | Visual respeita identidade laranja | Ja funciona |

---

## Ordem de Execucao

1. Criar `Enem2026Landing.tsx`
2. Registrar rota no `App.tsx`
3. Atualizar `Header.tsx` (desktop + mobile)
4. Refinar `GradientKpiCard.tsx`
5. Atualizar `Dashboard.tsx` (header + layout)
6. Testar todos os fluxos

---

## Secao Tecnica

### Dependencias
Nenhuma nova dependencia necessaria. Projeto ja possui:
- lucide-react (icones)
- react-router-dom (rotas)
- Componentes UI Shadcn

### Imports Necessarios no Header.tsx
```tsx
import { GraduationCap, Trophy } from "lucide-react";
```

### Estrutura da Landing ENEM 2026
```tsx
// Hero
<section className="bg-gradient-to-br from-indigo-600 to-purple-700">
  <h1>ENEM 2026</h1>
  <p>Prepare-se para conquistar sua vaga</p>
</section>

// Modulo Principal
<Card>
  <CardHeader>Redacao Nota 1000</CardHeader>
  <Button asChild><Link to="/admin/academy/enem/redacao-nota-1000">Comecar</Link></Button>
</Card>

// Modulos Em Breve
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {["Linguagens", "Humanas", "Matematica", "Natureza"].map(m => (
    <Card className="opacity-60"><Badge>Em breve</Badge>{m}</Card>
  ))}
</div>
```

### Estilo dos Chips de Servico
```tsx
// ENEM 2026
<Link
  to="/enem-2026"
  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors border border-indigo-200 dark:border-indigo-800"
>
  <GraduationCap className="h-4 w-4" />
  ENEM 2026
</Link>

// Brasileirao
<Link
  to="/esportes/brasileirao"
  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-200 dark:border-emerald-800"
>
  <Trophy className="h-4 w-4" />
  Brasileirao
</Link>
```
