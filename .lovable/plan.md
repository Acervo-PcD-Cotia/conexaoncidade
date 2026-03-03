

# Plano: Premium Visual Overhaul — Sites de Nicho Fórmula Conexão

## Objetivo

Transformar o `FormulaNicheSite` de um layout funcional básico em uma landing page premium estilo Apple/Stripe, com glassmorphism, animações, tipografia refinada e CTAs de alta conversão. Também melhorar os componentes auxiliares (EntryScreen, NicheSelector, TourGuide, CheckoutModal, Countdown).

---

## Componentes a Reescrever

### 1. `FormulaNicheSite.tsx` — Reescrita completa

**Hero Section:**
- Background com gradient radial multi-camada (niche-colored accent + deep navy)
- Headline massiva (text-5xl/6xl) com font-family Plus Jakarta Sans, tracking-tight
- Trust badges row abaixo do CTA (Empresa Verificada ✓ | Selo PCD ✓ | Conexão AI 24h ✓)
- Animações de entrada com framer-motion staggered

**Conexão AI Section:**
- Card estilo "AI Dashboard" com glassmorphism (backdrop-blur, bg-white/5, border white/10)
- Preview de chat simulado (3 mensagens fictícias do nicho)
- Borda com glow sutil animado (box-shadow pulsante em laranja)
- Badge "24h no WhatsApp" com ícone animado

**Services Grid:**
- Cards grandes com ícones Lucide por serviço (mapeamento no NicheData)
- Efeito hover: lift (translateY -4px) + shadow increase
- Glassmorphism sutil nos cards
- Tag "Destaque" no primeiro serviço

**Testimonials:**
- Layout Bento Grid (1 grande + 2 menores) em desktop, carousel em mobile
- Avatares gerados (iniciais coloridas em círculos)
- Checkmark verificado ao lado do nome
- Stars com preenchimento gradual

**Selo Verificado + PCD:**
- Lado a lado em desktop, empilhados em mobile
- Cards com ícone grande, borda premium, gradiente sutil

**Caminhão de Prêmios:**
- Card hero-style com ilustração abstrata
- Destaque "R$20 = 1 cupom" em badge grande
- Link para regulamento

**Mapa:**
- Placeholder estilizado com gradiente e pin animado

**WhatsApp CTA Final:**
- Full-width section com gradient background
- Botão com pulse animation
- Texto de urgência com countdown inline

**Footer:**
- Redesign com links úteis e branding Conexão

### 2. `FormulaNicheData.ts` — Expandir dados

- Adicionar array `servicoIcons: string[]` (nomes de ícones Lucide para cada serviço)
- Adicionar `accentColor: string` por nicho (ex: clinica = blue, restaurante = amber)
- Adicionar `avatarColors: string[]` para depoimentos

### 3. `FormulaEntryScreen.tsx` — Premium upgrade

- Background com pattern sutil (dots/grid via CSS)
- Logo/badge animado no topo
- Cards em vez de botões simples (glassmorphism)
- Animação de entrada staggered

### 4. `FormulaNicheSelector.tsx` — Premium cards

- Cards maiores com hover glow effect
- Ícone + label + descrição curta
- Glassmorphism com backdrop-blur
- Animação de entrada em cascade

### 5. `FormulaTourGuide.tsx` — Visual upgrade

- Tooltip com glassmorphism mais forte
- Progress bar visual (dots ou barra)
- Ícone por passo
- Animação de transição melhorada

### 6. `FormulaCheckoutModal.tsx` — High-conversion redesign

- Glassmorphism card
- Preço com efeito "savings" (mostrar economia: "Você economiza R$ 4.000")
- Timer inline no modal
- Garantia / selo de segurança visual
- Urgência textual dinâmica

### 7. `FormulaCountdown.tsx` — Sticky bar premium

- Mais compacto e elegante
- Gradient background sutil
- Botão CTA inline no countdown bar

---

## Padrões Visuais Globais

- **Cores**: Deep Navy (#0A0F1E base), Slate (#1E293B surfaces), Orange (#FF6600 primary), sem preto puro
- **Glassmorphism**: `backdrop-blur-xl bg-white/[0.03] border border-white/[0.08]`
- **Shadows**: Layered (`shadow-lg shadow-black/20`)
- **Typography**: Plus Jakarta Sans headlines, Inter body, tracking-tight em títulos
- **Spacing**: Seções com py-24 md:py-32 (mais respiro)
- **Animações**: framer-motion whileInView com stagger, hover lift nos cards

---

## Arquivos Afetados

| Ação | Arquivo |
|------|---------|
| Reescrever | `src/components/formula-conexao/FormulaNicheSite.tsx` |
| Editar | `src/components/formula-conexao/FormulaNicheData.ts` |
| Reescrever | `src/components/formula-conexao/FormulaEntryScreen.tsx` |
| Reescrever | `src/components/formula-conexao/FormulaNicheSelector.tsx` |
| Reescrever | `src/components/formula-conexao/FormulaTourGuide.tsx` |
| Reescrever | `src/components/formula-conexao/FormulaCheckoutModal.tsx` |
| Editar | `src/components/formula-conexao/FormulaCountdown.tsx` |

Nenhuma mudança no banco de dados. Nenhuma nova dependência. Tudo com Tailwind + framer-motion + Lucide existentes.

