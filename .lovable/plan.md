

# Plano: Fórmula Conexão — Sistema Completo com Nichos, Tour e Códigos de Acesso

## Visão Geral

Transformação completa do funil em um sistema com: tela de entrada dupla (código/quiz), seleção de nicho, 8 sites premium dinâmicos, tour guiado, códigos de acesso com validade 36h, e página de regulamento. A arquitetura atual (quiz, countdown, contexto) será expandida significativamente.

---

## Mudanças no Banco de Dados

### Tabela `formula_access_codes` (nova)
```sql
CREATE TABLE formula_access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  nome_negocio TEXT NOT NULL,
  nicho TEXT NOT NULL,
  cpf_cnpj TEXT,
  email TEXT,
  whatsapp TEXT,
  nome TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '36 hours',
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE formula_access_codes ENABLE ROW LEVEL SECURITY;
-- Public insert (para geração), admin select
CREATE POLICY "Public can read own code" ON formula_access_codes FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert" ON formula_access_codes FOR INSERT TO public WITH CHECK (true);
```

### Tabela `formula_conexao_leads` — adicionar coluna `nicho`
```sql
ALTER TABLE formula_conexao_leads ADD COLUMN IF NOT EXISTS nicho TEXT;
```

---

## Arquitetura de Componentes

```text
src/
├── contexts/FormulaConexaoContext.tsx      ← EXPANDIR (adicionar nicho, codigo)
├── hooks/useFormulaCountdown.ts           ← SEM ALTERAÇÃO
├── pages/campaigns/
│   ├── FormulaConexaoPage.tsx             ← REESCREVER (orquestrador de fases)
│   └── RegulamentoCaminhaoPage.tsx        ← CRIAR
├── components/formula-conexao/
│   ├── FormulaEntryScreen.tsx             ← CRIAR (2 botões: código/quiz)
│   ├── FormulaAccessCodeInput.tsx         ← CRIAR (input + validação DB)
│   ├── FormulaQuizWizard.tsx              ← SEM ALTERAÇÃO SIGNIFICATIVA
│   ├── FormulaNicheSelector.tsx           ← CRIAR (9 cards de nicho)
│   ├── FormulaNicheSite.tsx               ← CRIAR (site premium dinâmico)
│   ├── FormulaNicheData.ts                ← CRIAR (dados dos 8+1 nichos)
│   ├── FormulaTourGuide.tsx               ← CRIAR (overlay de tour 8 passos)
│   ├── FormulaCheckoutModal.tsx           ← CRIAR (modal final com preço)
│   ├── FormulaConfetti.tsx                ← SEM ALTERAÇÃO
│   ├── FormulaCountdown.tsx               ← SEM ALTERAÇÃO
│   └── (demais componentes existentes permanecem como fallback)
```

---

## Fluxo de Fases (FormulaConexaoPage)

```text
entry → [código válido?] → nicheSite + tour
      → [quiz] → nicheSelect → nicheSite + tour → checkoutModal
```

**Fases**: `entry` | `code-input` | `quiz` | `confetti` | `niche-select` | `niche-site`

---

## Detalhes dos Módulos

### 1. FormulaEntryScreen
- 2 botões sobre fundo slate-950
- "🔑 Tenho Código de Acesso" → fase `code-input`
- "🚀 Quero Conhecer" → fase `quiz`

### 2. FormulaAccessCodeInput
- Input estilizado para código (ex: FC2024-001)
- Busca na tabela `formula_access_codes` por código
- Se válido e dentro de 36h → preenche contexto (nome, negocio, nicho) → abre site do nicho
- Se expirado → mostra preço cheio R$ 5.997 e botão "Falar com Consultor"

### 3. FormulaNicheSelector
- Grid de 9 cards (8 nichos + "Outro")
- Ao clicar → salva nicho no contexto → avança para `niche-site`

### 4. FormulaNicheData.ts
- Objeto com dados de cada nicho: hero text, serviços, depoimentos (3 cada), CTA, ícone
- Os 8 nichos: clinica, escola, restaurante, salao, comercio, advocacia, academia, imobiliaria
- "Outro" usa template genérico

### 5. FormulaNicheSite
- Site completo renderizado dinamicamente baseado no nicho selecionado
- Seções: Hero (com nomeNegocio), Serviços, Conexão AI, Depoimentos, Mapa placeholder, Selo Verificado, Selo PCD, WhatsApp CTA, Footer
- IDs nas seções para o tour guiado poder referenciá-las

### 6. FormulaTourGuide
- Implementação leve sem dependência externa (tooltip posicionado + backdrop)
- 8 passos com highlight de seção + texto explicativo
- Passo final abre FormulaCheckoutModal

### 7. FormulaCheckoutModal
- Modal com preço dinâmico (R$ 1.997 ou R$ 5.997 baseado no countdown)
- Lista de benefícios
- CTA: "QUERO GARANTIR A VAGA DA [NEGÓCIO] AGORA" → link Mercado Pago
- Se expirado → "Falar com Consultor"

### 8. RegulamentoCaminhaoPage
- Rota `/regulamento-caminhao-premios`
- Página estática com o regulamento completo (campanha Set-Dez, cupons, regras)

---

## Contexto Expandido

```typescript
interface FormulaConexaoData {
  nome: string;
  negocio: string;
  cpfCnpj: string;
  email: string;
  whatsapp: string;
  nicho: string;       // NOVO
  codigo: string;      // NOVO
}
```

---

## Arquivos a Criar/Editar

| Ação | Arquivo |
|------|---------|
| Editar | `src/contexts/FormulaConexaoContext.tsx` (add nicho, codigo) |
| Reescrever | `src/pages/campaigns/FormulaConexaoPage.tsx` (novo fluxo de fases) |
| Criar | `src/components/formula-conexao/FormulaEntryScreen.tsx` |
| Criar | `src/components/formula-conexao/FormulaAccessCodeInput.tsx` |
| Criar | `src/components/formula-conexao/FormulaNicheSelector.tsx` |
| Criar | `src/components/formula-conexao/FormulaNicheData.ts` |
| Criar | `src/components/formula-conexao/FormulaNicheSite.tsx` |
| Criar | `src/components/formula-conexao/FormulaTourGuide.tsx` |
| Criar | `src/components/formula-conexao/FormulaCheckoutModal.tsx` |
| Criar | `src/pages/campaigns/RegulamentoCaminhaoPage.tsx` |
| Editar | `src/App.tsx` (rota regulamento) |
| Editar | `src/components/formula-conexao/FormulaQuizWizard.tsx` (remover redirect para landing, chamar onComplete sem landing) |
| Migration | `formula_access_codes` table + nicho column |

Componentes existentes (FormulaLandingPage, FormulaPillarCards, etc.) permanecem no projeto mas não serão usados no fluxo principal — o novo fluxo usa o FormulaNicheSite.

---

## Escopo Excluído (já existente ou não necessário agora)
- Hook useFormulaCountdown: sem alteração
- Edge function WhatsApp: já implementada
- Confetti: reutilizado

