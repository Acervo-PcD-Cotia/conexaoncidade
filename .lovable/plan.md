

# Plano: Sistema de Vendas "Fórmula Conexão"

## Visão Geral

Criar um funil de vendas completo em uma nova rota `/formula-conexao` com quiz de captura de leads, countdown de 36h persistente por CNPJ, e landing page hiper-personalizada com o nome do negócio. Seguiremos o padrão já existente na campanha Google Maps (step-based flow com componentes separados).

## Arquitetura

```text
/formula-conexao
  ├── FormulaConexaoPage.tsx        (orquestrador de steps: quiz → confetti → landing)
  ├── contexts/FormulaConexaoContext.tsx  (estado global: nome, CNPJ, etc.)
  ├── components/formula-conexao/
  │   ├── FormulaQuizWizard.tsx     (5 steps com validação + máscaras)
  │   ├── FormulaCountdown.tsx      (hook useCountdown + banner sticky)
  │   ├── FormulaLandingPage.tsx    (LP personalizada com 5 pilares)
  │   ├── FormulaPriceSection.tsx   (preço dinâmico baseado no countdown)
  │   ├── FormulaPillarCards.tsx    (cards dos 5 pilares com ícones Lucide)
  │   └── FormulaConfetti.tsx      (efeito canvas confetti na transição)
  └── hooks/useFormulaCountdown.ts  (lógica de 36h persistida por CNPJ)
```

## Módulos

### 1. Quiz Interativo (Lead Capture)
- 5 telas step-by-step com `framer-motion` (como PhoneQuizWizard existente)
- Campos: Nome Completo, Nome do Negócio, CPF/CNPJ (máscara + validação de dígitos), E-mail, WhatsApp (máscara DDD)
- Validação com regex para CNPJ e telefone
- Barra de progresso (componente `Progress` existente)
- Ao concluir: efeito confetti via canvas + transição fade-in para a LP

### 2. Hook `useFormulaCountdown`
- Inicia cronômetro de 36h ao concluir o quiz
- Persiste no `localStorage` com chave vinculada ao CPF/CNPJ
- Se recarregar, calcula tempo restante a partir do timestamp salvo
- Retorna `{ hours, minutes, seconds, isExpired }`
- Se expirado: preço muda de R$ 1.997 para R$ 5.997, CTA bloqueado

### 3. Landing Page Personalizada
- **Header dinâmico**: "🚀 [Nome do Negócio], sua vaga está reservada!"
- **Banner sticky** no topo com countdown HH:MM:SS em fundo laranja (#FF6600)
- **5 Pillar Cards** com ícones Lucide: Tecnologia (Bot), Mídia (Radio), Evento (Award), Promoção (Gift), Social (Heart)
- **Seção de preços**: R$ 5.997 riscado + R$ 1.997 em destaque (ou invertido se expirado)
- **CTA principal**: "QUERO GARANTIR A VAGA DA [NOME] NA FÓRMULA CONEXÃO" → link externo Mercado Pago
- Design mobile-first, scroll vertical sem distrações laterais
- Paleta: Laranja #FF6600, Branco #FFFFFF, Cinza Escuro #1A1A1A

### 4. Persistência de Leads (Banco)
- Tabela `formula_conexao_leads` com campos: id, nome, negocio, cpf_cnpj, email, whatsapp, quiz_completed_at, created_at
- RLS: insert para anon (formulário público), select/update para authenticated admins
- Salvar lead ao concluir quiz (antes de mostrar LP)

### 5. Rota e Integração
- Adicionar lazy import e rota `/formula-conexao` no `App.tsx` dentro do `PublicLayout`
- Contexto `FormulaConexaoContext` para compartilhar nome do negócio entre componentes

## Detalhes Técnicos

- **Confetti**: Canvas nativo leve (sem biblioteca externa), ~50 linhas de código
- **Máscaras**: CNPJ (`XX.XXX.XXX/XXXX-XX`) e WhatsApp (`(XX) XXXXX-XXXX`) via funções puras
- **Validação CNPJ**: Algoritmo de dígitos verificadores
- **Countdown**: `setInterval` de 1s + `localStorage` com key `formula_countdown_{cnpj_limpo}`
- **Responsividade**: Grid de pilares 1 col mobile, 2 cols tablet, 3 cols desktop

## Arquivos a Criar/Editar

| Ação | Arquivo |
|------|---------|
| Criar | `src/pages/campaigns/FormulaConexaoPage.tsx` |
| Criar | `src/contexts/FormulaConexaoContext.tsx` |
| Criar | `src/components/formula-conexao/FormulaQuizWizard.tsx` |
| Criar | `src/components/formula-conexao/FormulaCountdown.tsx` |
| Criar | `src/components/formula-conexao/FormulaLandingPage.tsx` |
| Criar | `src/components/formula-conexao/FormulaPriceSection.tsx` |
| Criar | `src/components/formula-conexao/FormulaPillarCards.tsx` |
| Criar | `src/components/formula-conexao/FormulaConfetti.tsx` |
| Criar | `src/hooks/useFormulaCountdown.ts` |
| Editar | `src/App.tsx` (adicionar rota `/formula-conexao`) |
| Migration | Tabela `formula_conexao_leads` |

