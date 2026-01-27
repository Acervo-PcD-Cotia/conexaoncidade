
# Plano: Implementação do Módulo "Publidoor Partner"

## Resumo Executivo

Criar uma área exclusiva para anunciantes chamada **Publidoor Partner**, separada do dashboard administrativo, permitindo que parceiros gerenciem sua Presença Digital Urbana de forma autônoma, com fluxo de aprovação editorial. Reutilizaremos 100% das entidades existentes do módulo Publidoor.

---

## 1. Alteração no Banco de Dados

### 1.1 Adicionar coluna `user_id` na tabela `publidoor_advertisers`

Atualmente a tabela não possui vínculo com usuários autenticados. Precisamos adicionar:

```sql
-- Adicionar coluna user_id para vincular advertiser ao usuário parceiro
ALTER TABLE publidoor_advertisers
ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Criar índice para performance
CREATE INDEX idx_publidoor_advertisers_user_id ON publidoor_advertisers(user_id);
```

### 1.2 Políticas RLS para Parceiros

```sql
-- Permitir que parceiros vejam apenas seus próprios dados
CREATE POLICY "Partners can view own advertiser"
ON publidoor_advertisers FOR SELECT
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'commercial')
));

-- Permitir que parceiros atualizem seus próprios dados
CREATE POLICY "Partners can update own advertiser"
ON publidoor_advertisers FOR UPDATE
USING (auth.uid() = user_id);

-- Permitir que parceiros vejam seus próprios Publidoors
CREATE POLICY "Partners can view own publidoor items"
ON publidoor_items FOR SELECT
USING (
  advertiser_id IN (
    SELECT id FROM publidoor_advertisers WHERE user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'commercial')
  )
);

-- Permitir que parceiros criem/atualizem seus Publidoors
CREATE POLICY "Partners can insert own publidoor items"
ON publidoor_items FOR INSERT
WITH CHECK (
  advertiser_id IN (SELECT id FROM publidoor_advertisers WHERE user_id = auth.uid())
);

CREATE POLICY "Partners can update own publidoor items"
ON publidoor_items FOR UPDATE
USING (
  advertiser_id IN (SELECT id FROM publidoor_advertisers WHERE user_id = auth.uid())
);

-- Políticas para métricas (somente leitura para parceiros)
CREATE POLICY "Partners can view own metrics"
ON publidoor_metrics FOR SELECT
USING (
  publidoor_id IN (
    SELECT pi.id FROM publidoor_items pi
    JOIN publidoor_advertisers pa ON pi.advertiser_id = pa.id
    WHERE pa.user_id = auth.uid()
  )
);

-- Políticas para schedules (somente leitura para parceiros)
CREATE POLICY "Partners can view own schedules"
ON publidoor_schedules FOR SELECT
USING (
  publidoor_id IN (
    SELECT pi.id FROM publidoor_items pi
    JOIN publidoor_advertisers pa ON pi.advertiser_id = pa.id
    WHERE pa.user_id = auth.uid()
  )
);
```

---

## 2. Estrutura de Arquivos

### 2.1 Páginas (Partner Portal)

```text
src/pages/partner/publidoor/
├── PartnerLogin.tsx           # Login exclusivo para parceiros
├── PartnerLayout.tsx          # Layout com sidebar do parceiro
├── PartnerVitrine.tsx         # Home: Minha Vitrine
├── PartnerEditor.tsx          # Criar/Editar Publidoor
├── PartnerAgenda.tsx          # Agenda de Exibição (readonly)
├── PartnerMetrics.tsx         # Métricas simplificadas
├── PartnerBusiness.tsx        # Meu Negócio (dados do anunciante)
└── PartnerPlan.tsx            # Plano & Renovação
```

### 2.2 Componentes

```text
src/components/partner/
├── PartnerSidebar.tsx         # Menu lateral do parceiro
├── PartnerHeader.tsx          # Header com logo e logout
├── PartnerStatusBadge.tsx     # Badge de status (Ativo, Em análise, etc)
├── PartnerPreview.tsx         # Preview do Publidoor (reutiliza PublidoorPreview)
├── PartnerMetricsCard.tsx     # Card de métricas simplificadas
└── PartnerProtectedRoute.tsx  # Guarda de rota para parceiros
```

### 2.3 Hooks

```text
src/hooks/
├── usePartnerAuth.ts          # Hook de autenticação do parceiro
├── usePartnerPublidoor.ts     # Operações específicas do parceiro
└── usePartnerAdvertiser.ts    # Dados do anunciante vinculado
```

### 2.4 Contexto

```text
src/contexts/
└── PartnerContext.tsx         # Contexto com dados do parceiro logado
```

---

## 3. Rotas (App.tsx)

```typescript
// Partner Routes (fora do AdminLayout)
<Route path="/partner" element={<PartnerLayout />}>
  <Route index element={<Navigate to="/partner/publidoor" replace />} />
  <Route path="publidoor" element={<PartnerVitrine />} />
  <Route path="publidoor/editar" element={<PartnerEditor />} />
  <Route path="publidoor/editar/:id" element={<PartnerEditor />} />
  <Route path="publidoor/agenda" element={<PartnerAgenda />} />
  <Route path="publidoor/metricas" element={<PartnerMetrics />} />
  <Route path="publidoor/negocio" element={<PartnerBusiness />} />
  <Route path="publidoor/plano" element={<PartnerPlan />} />
</Route>

// Partner Auth (público)
<Route path="/partner/login" element={<PartnerLogin />} />
```

---

## 4. Detalhamento das Páginas

### 4.1 PartnerLogin.tsx

| Item | Descrição |
|------|-----------|
| **Layout** | Similar ao CommunityAuth, visual premium e urbano |
| **Autenticação** | Email + Senha (usa AuthContext existente) |
| **Validação** | Após login, verifica se user_id existe em publidoor_advertisers |
| **Erro** | Se não for parceiro, exibe mensagem e link para contato |
| **Sucesso** | Redireciona para /partner/publidoor |

### 4.2 PartnerVitrine.tsx (Home)

**Cards exibidos:**
- Status atual do Publidoor (badge colorido)
- Próxima data de exibição
- Local contratado (somente leitura)
- Tipo de Publidoor
- Cliques e Impressões (últimos 7 dias)

**CTAs:**
- "Editar Vitrine" → /partner/publidoor/editar/:id
- "Renovar Presença" → /partner/publidoor/plano

**Status possíveis:**
- `draft` → "Rascunho" (cinza)
- `review` → "Em Análise" (amarelo/laranja)
- `approved` → "Aprovado" (azul)
- `published` → "Ativo" (verde)

### 4.3 PartnerEditor.tsx

**Campos disponíveis para parceiro:**
- Frase 1 (principal) *
- Frase 2 (secundária)
- Frase 3 (opcional)
- Upload de imagem ou vídeo
- Logo da empresa
- Texto do botão (CTA)
- Link de destino *

**Campos bloqueados (definidos pelo admin):**
- Tipo de Publidoor
- Local de exibição
- Exclusividade
- Template

**Comportamento:**
- Toda edição salva o Publidoor com status `review`
- Preview em tempo real (desktop/mobile)
- Reutiliza componente `PublidoorPreview`

### 4.4 PartnerAgenda.tsx

**Exibição (somente leitura):**
- Data de início e fim da campanha
- Dias da semana de exibição
- Faixas de horário
- Contador de dias restantes

### 4.5 PartnerMetrics.tsx

**Métricas exibidas:**
- Total de Impressões
- Total de Cliques
- CTR (%)
- Filtro por período: 7, 15, 30 dias

**Gráfico:**
- Linha simples de impressões/cliques ao longo do tempo

### 4.6 PartnerBusiness.tsx

**Formulário editável:**
- Nome da empresa *
- Bairro / Cidade
- Categoria
- WhatsApp
- Website
- Link Google Maps
- Logotipo (upload)

**Comportamento:**
- Dados salvos alimentam automaticamente os Publidoors vinculados

### 4.7 PartnerPlan.tsx

**Exibição:**
- Plano atual (nome, benefícios)
- Data de vencimento
- Histórico de pagamentos (placeholder/futuro)

**CTAs:**
- "Renovar Plano"
- "Solicitar Upgrade"
- "Falar com Atendimento" (WhatsApp)

---

## 5. PartnerLayout.tsx

```text
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
│ [Logo Publidoor Partner]              [Nome] [Sair]         │
├───────────────┬─────────────────────────────────────────────┤
│ SIDEBAR       │ CONTENT                                     │
│               │                                             │
│ 🏪 Minha      │                                             │
│   Vitrine     │    <Outlet />                               │
│               │                                             │
│ ✏️ Editar     │                                             │
│   Vitrine     │                                             │
│               │                                             │
│ 📅 Agenda     │                                             │
│               │                                             │
│ 📊 Métricas   │                                             │
│               │                                             │
│ 🏢 Meu        │                                             │
│   Negócio     │                                             │
│               │                                             │
│ 💳 Plano      │                                             │
│               │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

---

## 6. Hook usePartnerAuth.ts

```typescript
export function usePartnerAuth() {
  const { user, isLoading } = useAuth();
  
  // Busca advertiser vinculado ao user
  const { data: advertiser, isLoading: loadingAdvertiser } = useQuery({
    queryKey: ['partner-advertiser', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('publidoor_advertisers')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
  });
  
  return {
    user,
    advertiser,
    isPartner: !!advertiser,
    isLoading: isLoading || loadingAdvertiser,
  };
}
```

---

## 7. Hook usePartnerPublidoor.ts

```typescript
// Buscar Publidoors do parceiro
export function usePartnerPublidoors(advertiserId: string) {
  return useQuery({
    queryKey: ['partner-publidoors', advertiserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('publidoor_items')
        .select(`
          *,
          campaign:publidoor_campaigns(*),
          template:publidoor_templates(*)
        `)
        .eq('advertiser_id', advertiserId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!advertiserId,
  });
}

// Criar/Atualizar Publidoor como parceiro (sempre vai para 'review')
export function usePartnerUpdatePublidoor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const updateData = {
        ...data,
        status: 'review', // Sempre volta para análise
      };
      // ... update logic
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-publidoors'] });
      toast.success('Sua vitrine foi enviada para análise!');
    },
  });
}
```

---

## 8. Terminologia (Regras de UX)

| Evitar | Usar |
|--------|------|
| Anúncio | Vitrine, Presença |
| Banner | Exibição |
| Publicidade | Presença Digital Urbana |
| Campanha (para parceiro) | Período de exibição |
| Impressões (técnico) | Visualizações |

---

## 9. Fluxo de Aprovação

```text
┌─────────────────┐
│  PARCEIRO cria  │
│  ou edita       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Status muda    │
│  para "review"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ADMIN vê no    │
│  painel de      │
│  aprovações     │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│Aprova │ │Rejeita│
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│approved│ │ draft │
│ + auto │ │(volta)│
│ agenda │ └───────┘
└───────┘
```

---

## 10. Design Visual

**Princípios:**
- Visual premium e urbano
- Tipografia forte (Plus Jakarta Sans)
- Cores: fundo escuro, destaques em laranja (primary)
- Animações suaves (Framer Motion)
- Cards com glassmorphism sutil
- Destaque visual para status e CTAs
- Mobile-first, responsivo

---

## 11. Arquivos a Criar/Modificar

### Novos Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/partner/publidoor/PartnerLogin.tsx` | Página de login |
| `src/pages/partner/publidoor/PartnerLayout.tsx` | Layout com sidebar |
| `src/pages/partner/publidoor/PartnerVitrine.tsx` | Home do parceiro |
| `src/pages/partner/publidoor/PartnerEditor.tsx` | Criar/editar Publidoor |
| `src/pages/partner/publidoor/PartnerAgenda.tsx` | Agenda (readonly) |
| `src/pages/partner/publidoor/PartnerMetrics.tsx` | Métricas |
| `src/pages/partner/publidoor/PartnerBusiness.tsx` | Meu Negócio |
| `src/pages/partner/publidoor/PartnerPlan.tsx` | Plano & Renovação |
| `src/components/partner/PartnerSidebar.tsx` | Menu lateral |
| `src/components/partner/PartnerHeader.tsx` | Header |
| `src/components/partner/PartnerStatusBadge.tsx` | Badge de status |
| `src/hooks/usePartnerAuth.ts` | Hook de autenticação |
| `src/hooks/usePartnerPublidoor.ts` | Hook de operações |
| `src/contexts/PartnerContext.tsx` | Contexto do parceiro |

### Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/App.tsx` | Adicionar rotas /partner/* |
| `src/types/publidoor.ts` | Adicionar `user_id` ao tipo Advertiser |
| SQL Migration | Adicionar coluna e políticas RLS |

---

## 12. Ordem de Implementação

### Fase 1: Infraestrutura
1. Criar migration SQL (user_id + RLS policies)
2. Atualizar types.ts após migration
3. Criar hooks (usePartnerAuth, usePartnerPublidoor)
4. Criar PartnerContext

### Fase 2: Layout e Autenticação
5. Criar PartnerLogin.tsx
6. Criar PartnerLayout.tsx
7. Criar PartnerSidebar.tsx e PartnerHeader.tsx
8. Adicionar rotas no App.tsx

### Fase 3: Páginas
9. Criar PartnerVitrine.tsx (Home)
10. Criar PartnerEditor.tsx
11. Criar PartnerBusiness.tsx
12. Criar PartnerAgenda.tsx
13. Criar PartnerMetrics.tsx
14. Criar PartnerPlan.tsx

### Fase 4: Polimento
15. Aplicar design premium
16. Adicionar animações
17. Testes e ajustes finais

---

## 13. Resultado Esperado

```text
✅ Área exclusiva /partner/publidoor funcional
✅ Login separado para parceiros
✅ Visualização e edição de Publidoors próprios
✅ Fluxo de aprovação funcionando
✅ Métricas simplificadas
✅ Agenda em modo leitura
✅ Gestão do negócio (dados do anunciante)
✅ Página de plano e renovação
✅ RLS garantindo isolamento de dados
✅ Design premium e urbano
✅ Sem duplicação de tabelas
✅ Terminologia correta (sem "anúncio")
```
