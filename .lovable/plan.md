
# Plano: Organizar Menus Especiais em Ordem Alfabetica com Cores Distintas

## Objetivo
Reorganizar os 8 chips de servicos especiais em ordem alfabetica e atribuir cores unicas e harmoniosas para cada um, mantendo destaque visual diferenciado.

---

## Ordem Alfabetica Final

| # | Menu | Cor | Icone |
|---|------|-----|-------|
| 1 | Apareça no Google | Azul (blue) | MapPin |
| 2 | Brasileirão | Verde esmeralda (emerald) | Trophy |
| 3 | Censo PcD | Roxo (purple) | Accessibility |
| 4 | Conexões | Rosa (pink) | Users |
| 5 | ENEM 2026 | Indigo | GraduationCap |
| 6 | Fake News | Verde (green) | ShieldCheck |
| 7 | Transporte Escolar | Laranja (orange) | Bus |
| 8 | Web Radio / TV | Vermelho (red) | Radio + Tv |

---

## Cores e Estilos Distintos

Para garantir diferenciacao visual clara, cada chip tera:
- **Cor de fundo** unica (tom claro no light, tom escuro no dark)
- **Cor de texto** correspondente
- **Borda** na mesma familia de cor

### Paleta de Cores (8 cores distintas)

```text
1. Apareça no Google  -> blue (azul)
2. Brasileirão        -> emerald (verde esmeralda)
3. Censo PcD          -> purple (roxo)
4. Conexões           -> pink (rosa)
5. ENEM 2026          -> indigo (azul escuro)
6. Fake News          -> green (verde limao)
7. Transporte Escolar -> amber (amarelo/dourado) - MUDAR de orange para amber
8. Web Rádio / TV     -> red (vermelho)
```

**Nota:** Vou alterar "Transporte Escolar" de `orange` para `amber` (amarelo/dourado) para evitar conflito visual com a cor primaria do portal (laranja).

---

## Alteracoes no Arquivo

**Arquivo:** `src/components/layout/Header.tsx`

### Desktop (linhas 281-341)
Reordenar os `<Link>` na ordem alfabetica e ajustar Transporte Escolar para `amber`.

### Mobile (linhas 70-132)
Reordenar os `<Link>` na mesma ordem alfabetica e aplicar as mesmas cores.

---

## Estrutura Final dos Chips (Desktop)

```text
Container: flex items-center justify-center gap-3

1. [Apareça no Google]  - blue
2. [Brasileirão]        - emerald  
3. [Censo PcD]          - purple
4. [Conexões]           - pink
5. [ENEM 2026]          - indigo
6. [Fake News]          - green
7. [Transporte Escolar] - amber
8. [Web Rádio / TV]     - red (com animate-pulse de destaque)
```

---

## Secao Tecnica

### Exemplo de Estilos por Cor

```tsx
// Apareça no Google (blue)
className="text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800"

// Brasileirão (emerald)
className="text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800"

// Transporte Escolar (amber - NOVO)
className="text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800"
```

### Ordem de Implementacao

1. Editar secao Desktop (linhas 281-341) - reordenar chips
2. Editar secao Mobile (linhas 70-132) - reordenar links
3. Alterar cor de Transporte Escolar de `orange` para `amber`

---

## Criterios de Aceite

| # | Criterio | Status |
|---|----------|--------|
| 1 | Chips ordenados alfabeticamente (A-Z) | A fazer |
| 2 | Cada chip com cor unica | A fazer |
| 3 | Transporte Escolar com cor `amber` (diferente do laranja do portal) | A fazer |
| 4 | Ordem consistente entre desktop e mobile | A fazer |
| 5 | Web Radio/TV mantém destaque com `animate-pulse` | A fazer |
