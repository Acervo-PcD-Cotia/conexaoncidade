
# Plano de Implementação: Módulo Publidoor

## Visão Geral

O **Publidoor** será um módulo completo de outdoor digital urbano, permitindo transformar espaços de exibição em anúncios dinâmicos, premium e editoriais. O módulo será totalmente independente dos sistemas de anúncios existentes (Ads, Banners, Banner Campaigns).

---

## Arquitetura do Módulo

```text
┌──────────────────────────────────────────────────────────────────┐
│                      PUBLIDOOR - Arquitetura                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BANCO DE DADOS                    FRONTEND                      │
│  ┌─────────────────┐              ┌─────────────────────────┐    │
│  │ publidoor_items │◄────────────►│ Páginas Admin           │    │
│  │ publidoor_      │              │ (/admin/publidoor/*)    │    │
│  │   campaigns     │              └─────────────────────────┘    │
│  │ publidoor_      │              ┌─────────────────────────┐    │
│  │   locations     │◄────────────►│ Componentes UI          │    │
│  │ publidoor_      │              │ (src/components/        │    │
│  │   schedules     │              │  publidoor/)            │    │
│  │ publidoor_      │              └─────────────────────────┘    │
│  │   advertisers   │              ┌─────────────────────────┐    │
│  │ publidoor_      │◄────────────►│ Hook Principal          │    │
│  │   templates     │              │ usePublidoor.ts         │    │
│  │ publidoor_      │              └─────────────────────────┘    │
│  │   metrics       │                                             │
│  │ publidoor_      │              ┌─────────────────────────┐    │
│  │   approvals     │◄────────────►│ Renderização Pública    │    │
│  └─────────────────┘              │ PublidoorSlot.tsx       │    │
│                                   └─────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 1. Estrutura de Banco de Dados

### 1.1 Tabela Principal: `publidoor_items`

Armazena cada Publidoor individual.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único |
| `internal_name` | TEXT | Nome interno para gestão |
| `type` | ENUM | narrativo, contextual, geografico, editorial, impacto_total |
| `advertiser_id` | UUID | Referência ao anunciante |
| `category_id` | UUID | Categoria opcional (notícias, esportes, etc.) |
| `phrase_1` | TEXT | Primeira frase principal |
| `phrase_2` | TEXT | Segunda frase |
| `phrase_3` | TEXT | Terceira frase (opcional) |
| `media_url` | TEXT | Imagem ou vídeo curto |
| `media_type` | TEXT | image, video |
| `logo_url` | TEXT | Logo do anunciante (opcional) |
| `cta_text` | TEXT | Texto do CTA personalizado |
| `cta_link` | TEXT | URL de destino |
| `status` | ENUM | draft, review, approved, published |
| `campaign_id` | UUID | Campanha vinculada (opcional) |
| `template_id` | UUID | Modelo visual aplicado |
| `created_by` | UUID | Usuário criador |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Última atualização |

### 1.2 Tabela: `publidoor_campaigns`

Agrupa múltiplos Publidoors em campanhas.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único |
| `name` | TEXT | Nome da campanha |
| `theme` | TEXT | Tema (Natal, Volta às Aulas, etc.) |
| `starts_at` | TIMESTAMPTZ | Data de início |
| `ends_at` | TIMESTAMPTZ | Data de término |
| `priority` | INTEGER | Prioridade de exibição (1-10) |
| `is_exclusive` | BOOLEAN | Exclusividade de exibição |
| `status` | ENUM | draft, active, paused, ended |
| `created_at` | TIMESTAMPTZ | Data de criação |

### 1.3 Tabela: `publidoor_locations`

Define onde os Publidoors podem aparecer.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único |
| `name` | TEXT | Nome do local (Topo da Home, Entre Notícias, etc.) |
| `slug` | TEXT | Identificador único (home_top, news_between, etc.) |
| `description` | TEXT | Descrição do local |
| `max_items` | INTEGER | Máximo de Publidoors simultâneos |
| `allows_rotation` | BOOLEAN | Permite rotação automática |
| `device_target` | TEXT | all, desktop, mobile |
| `is_premium` | BOOLEAN | Local premium (apenas 1 por vez) |
| `is_active` | BOOLEAN | Local ativo para exibição |

### 1.4 Tabela: `publidoor_location_assignments`

Vincula Publidoors a locais específicos.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único |
| `publidoor_id` | UUID | Referência ao Publidoor |
| `location_id` | UUID | Referência ao local |
| `is_exclusive` | BOOLEAN | Exclusividade neste local |
| `sort_order` | INTEGER | Ordem de exibição |

### 1.5 Tabela: `publidoor_schedules`

Programação inteligente de exibição.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único |
| `publidoor_id` | UUID | Referência ao Publidoor |
| `schedule_type` | TEXT | specific_dates, weekdays, time_range, business_hours, weekends, holidays |
| `days_of_week` | INTEGER[] | Dias da semana (0-6) |
| `time_start` | TIME | Horário de início |
| `time_end` | TIME | Horário de término |
| `specific_dates` | DATE[] | Datas específicas |
| `is_active` | BOOLEAN | Programação ativa |

### 1.6 Tabela: `publidoor_advertisers`

Cadastro de anunciantes.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único |
| `company_name` | TEXT | Nome da empresa |
| `neighborhood` | TEXT | Bairro |
| `city` | TEXT | Cidade |
| `category` | TEXT | Categoria do negócio |
| `whatsapp` | TEXT | Número WhatsApp |
| `website` | TEXT | Site |
| `google_maps_url` | TEXT | Link Google Maps |
| `logo_url` | TEXT | Logo da empresa |
| `status` | TEXT | active, inactive |
| `created_at` | TIMESTAMPTZ | Data de cadastro |

### 1.7 Tabela: `publidoor_templates`

Modelos visuais reutilizáveis.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único |
| `name` | TEXT | Nome do modelo |
| `slug` | TEXT | outdoor_urbano, manchete_editorial, minimal_premium, impacto_total, bairro_local |
| `description` | TEXT | Descrição |
| `font_family` | TEXT | Fonte principal |
| `font_size` | TEXT | Tamanho base |
| `color_palette` | JSONB | Paleta de cores |
| `has_animations` | BOOLEAN | Animações suaves |
| `preview_url` | TEXT | Preview do modelo |
| `is_active` | BOOLEAN | Modelo disponível |

### 1.8 Tabela: `publidoor_metrics`

Métricas de desempenho.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único |
| `publidoor_id` | UUID | Referência ao Publidoor |
| `date` | DATE | Data da métrica |
| `impressions` | INTEGER | Visualizações |
| `clicks` | INTEGER | Cliques |
| `device` | TEXT | desktop, mobile, tablet |
| `avg_time_on_screen` | NUMERIC | Tempo médio em tela (segundos) |

### 1.9 Tabela: `publidoor_approvals`

Fluxo de aprovação editorial.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único |
| `publidoor_id` | UUID | Referência ao Publidoor |
| `reviewer_id` | UUID | Usuário revisor |
| `action` | TEXT | submitted, approved, rejected, revision_requested |
| `comment` | TEXT | Comentário do revisor |
| `created_at` | TIMESTAMPTZ | Data da ação |

### 1.10 Tabela: `publidoor_settings`

Configurações globais do módulo.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único |
| `key` | TEXT | Chave da configuração |
| `value` | JSONB | Valor |
| `description` | TEXT | Descrição |

---

## 2. Políticas RLS (Row Level Security)

```sql
-- Leitura pública: Publidoors publicados
CREATE POLICY "Public can view published publidoors"
ON publidoor_items FOR SELECT
USING (status = 'published');

-- Leitura autenticada: Todos os publidoors (para dashboard)
CREATE POLICY "Authenticated users can view all"
ON publidoor_items FOR SELECT TO authenticated
USING (true);

-- Escrita: Apenas admins/editores
CREATE POLICY "Admins can manage publidoors"
ON publidoor_items FOR ALL TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

-- Métricas: Inserção pública (tracking), leitura admin
CREATE POLICY "Public can insert metrics"
ON publidoor_metrics FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can read metrics"
ON publidoor_metrics FOR SELECT TO authenticated
USING (public.is_admin_or_editor(auth.uid()));
```

---

## 3. Estrutura de Arquivos

### 3.1 Páginas Admin

```text
src/pages/admin/publidoor/
├── PublidoorDashboard.tsx      # Visão Geral
├── PublidoorCreate.tsx         # Criar Publidoor
├── PublidoorEdit.tsx           # Editar Publidoor
├── PublidoorCampaigns.tsx      # Campanhas
├── PublidoorLocations.tsx      # Locais de Exibição
├── PublidoorSchedules.tsx      # Agenda & Programação
├── PublidoorAdvertisers.tsx    # Anunciantes
├── PublidoorMetrics.tsx        # Métricas
├── PublidoorTemplates.tsx      # Modelos & Estilos
├── PublidoorApprovals.tsx      # Aprovações
└── PublidoorSettings.tsx       # Configurações
```

### 3.2 Componentes UI

```text
src/components/publidoor/
├── PublidoorCard.tsx           # Card de preview
├── PublidoorPreview.tsx        # Preview em tempo real
├── PublidoorForm.tsx           # Formulário principal
├── PublidoorTypeSelector.tsx   # Seletor de tipo
├── PublidoorScheduleEditor.tsx # Editor de programação
├── PublidoorMetricsChart.tsx   # Gráficos de métricas
├── PublidoorApprovalFlow.tsx   # Fluxo de aprovação
├── PublidoorSlot.tsx           # Componente de renderização pública
└── PublidoorBadge.tsx          # Badge "Conteúdo de Marca"
```

### 3.3 Hooks e Types

```text
src/hooks/
└── usePublidoor.ts             # Hook principal com React Query

src/types/
└── publidoor.ts                # Tipos TypeScript
```

---

## 4. Menu do Sidebar

Será adicionado um novo grupo "Publidoor" ao sidebar:

```typescript
const publidoorItems: MenuItem[] = [
  { title: "Visão Geral", url: "/admin/publidoor", icon: LayoutDashboard },
  { title: "Criar Publidoor", url: "/admin/publidoor/criar", icon: Plus },
  { title: "Campanhas", url: "/admin/publidoor/campanhas", icon: FolderOpen },
  { title: "Locais", url: "/admin/publidoor/locais", icon: MapPin },
  { title: "Agenda", url: "/admin/publidoor/agenda", icon: Calendar },
  { title: "Anunciantes", url: "/admin/publidoor/anunciantes", icon: Building2 },
  { title: "Métricas", url: "/admin/publidoor/metricas", icon: BarChart3 },
  { title: "Modelos", url: "/admin/publidoor/modelos", icon: Palette },
  { title: "Aprovações", url: "/admin/publidoor/aprovacoes", icon: CheckCircle },
  { title: "Configurações", url: "/admin/publidoor/config", icon: Settings },
];
```

Posicionamento: Após o grupo "Editorial" e antes de "Conexão Streaming".

---

## 5. Interface das Páginas Principais

### 5.1 Dashboard (Visão Geral)

```text
┌─────────────────────────────────────────────────────────────────┐
│ 📢 Publidoor                                     [+ Novo]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  RESUMO                                                         │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐        │
│  │    12     │ │     5     │ │     8     │ │     3     │        │
│  │  Ativos   │ │ Agendados │ │ Espaços   │ │ Campanhas │        │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘        │
│                                                                 │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐        │
│  │  45.2K    │ │   1.2K    │ │   2.8%    │ │  R$ 12K   │        │
│  │ Impressões│ │  Cliques  │ │    CTR    │ │  Receita  │        │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘        │
│                                                                 │
│  ALERTAS                                                        │
│  ⚠️ 2 Publidoors expiram em 3 dias                              │
│  ⚠️ 1 local sem exibição há 7 dias                              │
│                                                                 │
│  PUBLIDOORS ATIVOS                                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Preview │ Nome        │ Tipo    │ Local   │ Status │ ⋮ │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ [img]   │ Black Week  │ Impacto │ Topo    │ Ativo  │ ⋮ │    │
│  │ [img]   │ Oferta Shop │ Local   │ Entre   │ Ativo  │ ⋮ │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Criar Publidoor (Fluxo Guiado)

```text
┌─────────────────────────────────────────────────────────────────┐
│ ← Voltar                    Criar Publidoor                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────┐  ┌─────────────────────────────┐ │
│  │ FORMULÁRIO                │  │ PREVIEW EM TEMPO REAL       │ │
│  │                           │  │                             │ │
│  │ Nome Interno              │  │  ┌─────────────────────┐    │ │
│  │ [                       ] │  │  │                     │    │ │
│  │                           │  │  │  📢 PUBLIDOOR       │    │ │
│  │ Tipo                      │  │  │                     │    │ │
│  │ ○ Narrativo               │  │  │  Sua frase aqui     │    │ │
│  │ ○ Contextual              │  │  │  Segunda linha      │    │ │
│  │ ○ Geográfico              │  │  │                     │    │ │
│  │ ○ Editorial               │  │  │  [CTA Button]       │    │ │
│  │ ● Impacto Total           │  │  │                     │    │ │
│  │                           │  │  │  Conteúdo de Marca  │    │ │
│  │ Anunciante                │  │  └─────────────────────┘    │ │
│  │ [Selecionar...         ▼] │  │                             │ │
│  │                           │  │  Desktop    │    Mobile     │ │
│  │ Frase 1 *                 │  │  [=======]      [===]       │ │
│  │ [                       ] │  │                             │ │
│  │                           │  └─────────────────────────────┘ │
│  │ Frase 2 *                 │                                  │
│  │ [                       ] │                                  │
│  │                           │                                  │
│  │ Frase 3 (opcional)        │                                  │
│  │ [                       ] │                                  │
│  │                           │                                  │
│  │ [📷 Upload Mídia]         │                                  │
│  │                           │                                  │
│  │ CTA Personalizado         │                                  │
│  │ [Saiba mais            ]  │                                  │
│  │                           │                                  │
│  │ Link de Destino *         │                                  │
│  │ [https://...            ] │                                  │
│  │                           │                                  │
│  │ [Salvar Rascunho] [Enviar para Análise]                      │
│  └───────────────────────────┘                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Tipos de Publidoor

| Tipo | Descrição | Uso Ideal |
|------|-----------|-----------|
| **Narrativo** | Conta uma história em 2-3 frases | Lançamentos, novidades |
| **Contextual** | Aparece relacionado ao conteúdo | Notícias relacionadas |
| **Geográfico** | Segmentado por bairro/região | Comércio local |
| **Editorial** | Estilo de manchete jornalística | Conteúdo patrocinado |
| **Impacto Total** | Ocupação máxima, visual premium | Campanhas de alto impacto |

---

## 7. Locais de Exibição Padrão

```typescript
const DEFAULT_LOCATIONS = [
  { slug: 'home_top', name: 'Topo da Home', is_premium: true, max_items: 1 },
  { slug: 'news_between', name: 'Entre Blocos de Notícias', is_premium: false, max_items: 3 },
  { slug: 'news_inside', name: 'Dentro da Notícia', is_premium: true, max_items: 1 },
  { slug: 'category_page', name: 'Página de Categoria', is_premium: false, max_items: 2 },
  { slug: 'neighborhood_page', name: 'Página de Bairro', is_premium: false, max_items: 2 },
  { slug: 'mobile_only', name: 'Mobile Only', device_target: 'mobile', max_items: 1 },
  { slug: 'desktop_only', name: 'Desktop Only', device_target: 'desktop', max_items: 1 },
];
```

---

## 8. Fluxo de Aprovação

```text
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Rascunho │───►│ Em Análise│───►│ Aprovado │───►│Publicado │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │                │
                     │  Rejeitar      │  Despublicar
                     ▼                ▼
               ┌──────────┐    ┌──────────┐
               │ Revisão  │    │ Rascunho │
               │Solicitada│    │          │
               └──────────┘    └──────────┘
```

---

## 9. Configurações Globais

| Configuração | Tipo | Padrão |
|--------------|------|--------|
| `max_per_page` | number | 3 |
| `min_display_time` | number | 5 (segundos) |
| `exclusivity_enabled` | boolean | true |
| `require_brand_badge` | boolean | true |
| `brand_badge_text` | string | "Conteúdo de Marca" |
| `analytics_enabled` | boolean | true |
| `whatsapp_integration` | boolean | true |

---

## 10. Ordem de Implementação

### Fase 1: Infraestrutura (Migration + Types + Hook)
1. Migration SQL com todas as tabelas e RLS
2. Tipos TypeScript (`src/types/publidoor.ts`)
3. Hook principal (`src/hooks/usePublidoor.ts`)

### Fase 2: Páginas Essenciais
4. Dashboard (Visão Geral)
5. Criar/Editar Publidoor (com preview)
6. Anunciantes

### Fase 3: Gestão Avançada
7. Campanhas
8. Locais de Exibição
9. Agenda & Programação

### Fase 4: Qualidade e Analytics
10. Modelos & Estilos
11. Aprovações
12. Métricas

### Fase 5: Integração
13. Configurações
14. Sidebar menu
15. Rotas no App.tsx
16. Componente público `PublidoorSlot`

---

## 11. Terminologia do Módulo

| Evitar | Usar |
|--------|------|
| Anúncio | Publidoor |
| Banner | Exibição |
| Propaganda | Presença |
| Ad | Campanha |
| Publicidade | Conteúdo de Marca |

---

## 12. Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/migrations/xxx_publidoor.sql` | Criar |
| `src/types/publidoor.ts` | Criar |
| `src/hooks/usePublidoor.ts` | Criar |
| `src/pages/admin/publidoor/*.tsx` | Criar (10 arquivos) |
| `src/components/publidoor/*.tsx` | Criar (9 arquivos) |
| `src/components/admin/AdminSidebar.tsx` | Modificar |
| `src/App.tsx` | Modificar (rotas) |

**Total: ~25 arquivos novos + 2 modificações**

---

## 13. Critérios de Aceite

### Funcionalidade
- [ ] Dashboard exibe métricas e publidoors ativos
- [ ] Criação com preview em tempo real funciona
- [ ] Fluxo de aprovação operacional
- [ ] Agendamento de exibição por horário/dia
- [ ] Métricas de impressões e cliques
- [ ] Gestão de anunciantes completa

### UI/UX
- [ ] Visual premium e limpo
- [ ] Animações discretas
- [ ] Badge "Conteúdo de Marca" visível
- [ ] Responsivo (desktop e mobile)

### Integração
- [ ] Menu no sidebar funcionando
- [ ] Rotas registradas e acessíveis
- [ ] Não afeta módulos existentes
- [ ] RLS configurado corretamente

