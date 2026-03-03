

# Plano: Dossiê de Autoridade Premium — Fórmula Conexão

## Visão Geral

Transformar a landing page atual (pós-quiz) em uma experiência de venda consultiva de alto padrão com estética **Dark Premium/SaaS**, glassmorphism, scroll-reveal animations e seções de conversão avançadas (timeline, vagas por região, pacto do fundador, prova social).

Os componentes existentes (quiz, countdown hook, confetti, contexto) permanecem intactos. O foco é reescrever **FormulaLandingPage**, **FormulaPillarCards**, **FormulaPriceSection**, **FormulaCountdown** e criar novos componentes de conversão.

---

## Arquitetura de Componentes

```text
components/formula-conexao/
  ├── FormulaLandingPage.tsx       ← REESCREVER (orquestrador de seções)
  ├── FormulaCountdown.tsx         ← REESCREVER (sticky premium com glassmorphism)
  ├── FormulaPillarCards.tsx        ← REESCREVER (seções ricas com detalhes por pilar)
  ├── FormulaPriceSection.tsx       ← REESCREVER (card premium + CTA magnético)
  ├── FormulaTimeline.tsx           ← CRIAR (roadmap visual: Imediato → Set → Dez)
  ├── FormulaFounderPact.tsx        ← CRIAR (card "Pague 10, Use 13")
  ├── FormulaAvailability.tsx       ← CRIAR (vagas por região com status)
  ├── FormulaTestimonials.tsx       ← CRIAR (prova social com placeholders)
  ├── FormulaQuizWizard.tsx        (sem alteração)
  ├── FormulaConfetti.tsx          (sem alteração)
```

**Sem alteração**: contexto, hook useFormulaCountdown, quiz, confetti, rota, banco de dados.

---

## Módulos e Detalhes

### 1. Estética Dark Premium
- Fundo `slate-950` (#0f172a) em vez de `#1A1A1A`
- Cards com `backdrop-blur-xl`, `bg-white/5`, `border border-white/10`
- Acentos em `orange-500` (#f97316) para CTAs e destaques
- Tipografia: Inter (corpo) + Plus Jakarta Sans Bold (títulos) — ambas já instaladas via `@fontsource`
- Gradientes sutis em ícones e bordas de seção

### 2. FormulaCountdown (Reescrita)
- Sticky top com glassmorphism (`backdrop-blur-md bg-black/60 border-b border-orange-500/30`)
- Dígitos do timer em caixas individuais estilizadas (estilo flip-clock)
- Pulso suave animado no container quando < 1h restante

### 3. FormulaPillarCards (Reescrita — Seções Ricas)
- Cada pilar vira uma seção full-width com layout alternado (texto esquerda/direita)
- Conteúdo detalhado conforme o prompt:
  - **Cérebro Digital**: IA 24h no WhatsApp, SSL, hospedagem premium
  - **Mídia 360º**: Portal 100k+ acessos, Rádio, TV, Google Meu Negócio
  - **Selo de Autoridade**: Palco em Setembro, networking de elite
  - **Máquina de Vendas**: Mecânica de cupons R$20 = 1 cupom
  - **Manifesto Social**: Rede de apoio PCD, reputação moral
- Cards com glassmorphism, ícone com gradiente, badge de número do pilar
- Animação `framer-motion` scroll-triggered (whileInView)

### 4. FormulaTimeline (Novo)
- Linha vertical com 3 marcos: **Imediato** (IA + Mídia), **Setembro** (Evento + Selo), **Dezembro** (Sorteio + Vendas)
- Nós animados que aparecem ao scroll
- Cada nó com ícone, título e descrição curta

### 5. FormulaFounderPact (Novo)
- Card de destaque com borda gradiente laranja
- Título "O Pacto do Parceiro Fundador"
- Explicação "Pague 10, Use 13" — mensalidades 11, 12 e 1ª do próximo ano inclusas
- Badge "EXCLUSIVO FUNDADORES" com glow

### 6. FormulaAvailability (Novo)
- Grid de regiões de Cotia com status de vagas
- Centro de Cotia: 🔥 "Apenas 2 vagas" (texto laranja pulsante)
- Granja Viana: 🚫 "Esgotado" (texto cinza, riscado)
- Caucaia do Alto, Jardim da Glória: vagas limitadas
- Dados estáticos (hardcoded) — sem banco

### 7. FormulaTestimonials (Novo)
- 3 cards placeholder com avatar genérico, nome fictício, nome do negócio e depoimento
- Layout horizontal com scroll em mobile
- Badge "Empresa Verificada" em cada card

### 8. FormulaPriceSection (Reescrita)
- Card com borda gradiente e glassmorphism
- Preço riscado e preço ativo com tamanhos contrastantes
- Lista de benefícios com checkmarks animados
- **CTA magnético**: botão com `animate-pulse` suave + `box-shadow` glow laranja
- Texto dinâmico: "QUERO GARANTIR A VAGA DA [NEGÓCIO] E O SELO DE AUTORIDADE"

### 9. FormulaLandingPage (Reescrita)
- Orquestra todas as seções na ordem:
  1. Countdown sticky
  2. Hero com nome do negócio
  3. Pilares (5 seções)
  4. Timeline
  5. Pacto do Fundador
  6. Disponibilidade por região
  7. Depoimentos
  8. Preço + CTA
  9. Footer

---

## Arquivos a Criar/Editar

| Ação | Arquivo |
|------|---------|
| Reescrever | `src/components/formula-conexao/FormulaLandingPage.tsx` |
| Reescrever | `src/components/formula-conexao/FormulaCountdown.tsx` |
| Reescrever | `src/components/formula-conexao/FormulaPillarCards.tsx` |
| Reescrever | `src/components/formula-conexao/FormulaPriceSection.tsx` |
| Criar | `src/components/formula-conexao/FormulaTimeline.tsx` |
| Criar | `src/components/formula-conexao/FormulaFounderPact.tsx` |
| Criar | `src/components/formula-conexao/FormulaAvailability.tsx` |
| Criar | `src/components/formula-conexao/FormulaTestimonials.tsx` |

Nenhuma alteração em banco de dados, rotas, contexto ou hook.

