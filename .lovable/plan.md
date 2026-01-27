
# Plano de Unificação: Conexão Academy como Centro Único de Aprendizado

## Resumo Executivo

Unificar todo o sistema de treinamento do Portal Conexão, eliminando duplicidades e transformando o **Conexão Academy** no ÚNICO centro de aprendizado. O conteúdo da "Universidade Conexão" (TrainingHub) será migrado e integrado ao Academy.

---

## 1. Estado Atual (Diagnóstico)

### Sistemas Duplicados Identificados

| Sistema | Rota | Tabelas DB | Conteúdo |
|---------|------|------------|----------|
| **Conexão Academy** | `/admin/academy` | `academy_courses`, `academy_lessons`, `academy_progress` | 2 cursos (WebRádio, WebTV), 18 aulas |
| **Universidade Conexão** | `/admin/training` | `training_modules`, `training_steps`, `training_progress` | 10 módulos, 31 etapas |

### Conteúdo do Training (a ser migrado)

**getting_started:**
- Começar Agora
- Como Publicar
- Como Monetizar
- Como Crescer

**by_module:**
- Módulo Notícias
- Módulo Eventos
- Sindicação

**by_profile:**
- Trilha Jornalista
- Trilha Editor
- Trilha Comercial

---

## 2. Mudanças no Sidebar (`AdminSidebar.tsx`)

### 2.1 Remover do `businessItems`

```typescript
// REMOVER estas linhas:
{ title: "Treinamento", url: "/admin/training", icon: GraduationCap },
// E TAMBÉM remover Academy e AI deste array
{ title: "Conexão Academy", url: "/admin/academy", icon: PlayCircle },
{ title: "Conexão.AI", url: "/admin/conexao-ai", icon: Sparkles },
```

### 2.2 Criar Novos Grupos de Primeiro Nível

Adicionar dois novos grupos na configuração `sidebarGroups`, posicionados APÓS "Conexão Streaming" e ANTES de "Negócios":

```typescript
// Novo grupo: Academy (primeiro nível, sem subgrupos)
{
  id: "academy",
  title: "Conexão Academy",
  icon: GraduationCap,
  items: [
    { title: "Dashboard", url: "/admin/academy", icon: LayoutDashboard },
    { title: "Categorias", url: "/admin/academy/admin/categorias", icon: FolderTree },
    { title: "Cursos", url: "/admin/academy/admin/cursos", icon: BookOpen },
  ],
},

// Novo grupo: Conexão.AI (primeiro nível)
{
  id: "conexao-ai",
  title: "Conexão.AI",
  icon: Sparkles,
  items: [
    { title: "Dashboard", url: "/admin/conexao-ai", icon: LayoutDashboard },
    { title: "Assistente", url: "/admin/conexao-ai/assistente", icon: Bot },
    { title: "Criador", url: "/admin/conexao-ai/criador", icon: FilePlus2 },
    { title: "Ferramentas", url: "/admin/conexao-ai/ferramentas", icon: Zap },
    { title: "Automações", url: "/admin/conexao-ai/automacoes", icon: Play },
    { title: "Insights", url: "/admin/conexao-ai/insights", icon: BarChart3 },
  ],
},
```

### 2.3 Nova Estrutura do Sidebar

```text
┌─────────────────────────────────┐
│ Principal                       │
│ Editorial                       │
│ Publidoor                       │
│ Conexão Streaming               │
├─────────────────────────────────┤
│ 🎓 Conexão Academy   ← PRIMEIRO NÍVEL (NOVO)
│ ✨ Conexão.AI        ← PRIMEIRO NÍVEL (NOVO)
├─────────────────────────────────┤
│ Negócios (sem Academy/AI/Training)
│ Transporte Escolar              │
│ Configurações do Portal         │
│ Administração                   │
└─────────────────────────────────┘
```

---

## 3. Redirecionamentos de Rotas (`App.tsx`)

### 3.1 Substituir rota `/training`

```typescript
// REMOVER:
<Route path="training" element={<TrainingHub />} />

// ADICIONAR redirects:
<Route path="training" element={<Navigate to="/admin/academy" replace />} />
<Route path="training/*" element={<Navigate to="/admin/academy" replace />} />
<Route path="universidade" element={<Navigate to="/admin/academy" replace />} />
<Route path="treinamento" element={<Navigate to="/admin/academy" replace />} />
```

### 3.2 Manter rotas do Academy

As rotas existentes do Academy permanecem inalteradas:
- `/admin/academy` → AcademyDashboard
- `/admin/academy/curso/:slug` → AcademyCourse
- `/admin/academy/aula/:id` → AcademyLesson
- `/admin/academy/admin/*` → Admin pages

---

## 4. Migração de Dados (SQL Migration)

### 4.1 Criar Categorias no Academy

```sql
-- Criar categorias para organizar o conteúdo migrado
INSERT INTO academy_categories (name, slug, description, sort_order, is_active) VALUES
  ('Começar Agora', 'onboarding', 'Primeiros passos essenciais no Portal Conexão', 10, true),
  ('Por Módulo', 'por-modulo', 'Aprenda cada funcionalidade em detalhes', 20, true),
  ('Por Perfil', 'por-perfil', 'Trilhas personalizadas para seu papel', 30, true)
ON CONFLICT (slug) DO NOTHING;
```

### 4.2 Migrar Módulos como Cursos

Cada `training_module` será convertido em um `academy_course`:

```sql
-- Migrar módulos de getting_started
INSERT INTO academy_courses (title, slug, description, category_id, sort_order, is_published)
SELECT 
  tm.title,
  tm.key,
  tm.description,
  (SELECT id FROM academy_categories WHERE slug = 'onboarding'),
  tm.sort_order + 100,
  true
FROM training_modules tm
WHERE tm.category = 'getting_started'
ON CONFLICT (slug) DO NOTHING;

-- Migrar módulos de by_module
INSERT INTO academy_courses (title, slug, description, category_id, sort_order, is_published)
SELECT 
  tm.title,
  tm.key,
  tm.description,
  (SELECT id FROM academy_categories WHERE slug = 'por-modulo'),
  tm.sort_order + 100,
  true
FROM training_modules tm
WHERE tm.category = 'by_module'
ON CONFLICT (slug) DO NOTHING;

-- Migrar módulos de by_profile
INSERT INTO academy_courses (title, slug, description, category_id, sort_order, is_published)
SELECT 
  tm.title,
  tm.key,
  tm.description,
  (SELECT id FROM academy_categories WHERE slug = 'por-perfil'),
  tm.sort_order + 100,
  true
FROM training_modules tm
WHERE tm.category = 'by_profile'
ON CONFLICT (slug) DO NOTHING;
```

### 4.3 Migrar Steps como Lessons

```sql
-- Migrar training_steps para academy_lessons
INSERT INTO academy_lessons (course_id, title, content_html, sort_order, is_published)
SELECT 
  ac.id,
  ts.title,
  ts.content_html,
  ts.sort_order,
  true
FROM training_steps ts
JOIN training_modules tm ON ts.module_id = tm.id
JOIN academy_courses ac ON ac.slug = tm.key
ON CONFLICT DO NOTHING;
```

### 4.4 Migrar Progresso do Usuário

```sql
-- Mapear progresso de training para academy
INSERT INTO academy_progress (user_id, lesson_id, progress_percent, completed_at, created_at)
SELECT 
  tp.user_id,
  al.id,
  100,
  tp.completed_at,
  COALESCE(tp.completed_at, NOW())
FROM training_progress tp
JOIN training_steps ts ON tp.step_id = ts.id
JOIN training_modules tm ON ts.module_id = tm.id
JOIN academy_courses ac ON ac.slug = tm.key
JOIN academy_lessons al ON al.course_id = ac.id AND al.title = ts.title
ON CONFLICT DO NOTHING;
```

---

## 5. Refatorar AcademyDashboard (`AcademyDashboard.tsx`)

### 5.1 Nova Interface com Tabs/Seções

```text
┌─────────────────────────────────────────────────────────────────┐
│ 🎓 Conexão Academy                                              │
│ "O centro oficial de aprendizado do Portal Conexão"            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SEU PROGRESSO GERAL                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ✓ 15 aulas concluídas  │  📈 42% completo              │   │
│  │ Próximo: Checklist WebRádio                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  🎯 COMECE POR AQUI                                             │
│  ┌───────────────────┐  ┌───────────────────┐                  │
│  │ 📻 WebRádio       │  │ 📺 WebTV          │                  │
│  │ do zero ao ar     │  │ do zero ao ar     │                  │
│  │ ▓▓▓▓▓▓▓▓░░ 75%   │  │ ▓▓▓▓░░░░░░ 40%   │                  │
│  │ [Continuar]       │  │ [Continuar]       │                  │
│  │ ⭐ Recomendado    │  │ ⭐ Recomendado    │                  │
│  └───────────────────┘  └───────────────────┘                  │
│                                                                 │
│  📚 COMEÇAR AGORA (ONBOARDING)                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │
│  │Começar │ │Publicar│ │Monetizar││ Crescer│                   │
│  │  60%   │ │  0%    │ │   0%   │ │   0%   │                   │
│  └────────┘ └────────┘ └────────┘ └────────┘                   │
│                                                                 │
│  🧩 POR MÓDULO                                                  │
│  [Notícias] [Eventos] [Sindicação]                              │
│                                                                 │
│  👤 POR PERFIL                                                  │
│  [Jornalista] [Editor] [Comercial]                              │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Adicionar Card de Progresso Geral

Novo componente que exibe:
- Total de aulas concluídas
- Percentual geral de progresso
- Próxima aula recomendada
- Barra de progresso visual

### 5.3 Destacar WebRádio e WebTV

Os cursos sem categoria (WebRádio e WebTV) serão exibidos:
- No TOPO da página, antes de qualquer categoria
- Com badge "⭐ Recomendado" ou "🎯 Comece por aqui"
- Estilo visual diferenciado (cards maiores, destaque)

---

## 6. Componentes a Criar/Modificar

### 6.1 Novos Componentes

| Componente | Localização | Função |
|------------|-------------|--------|
| `AcademyProgressSummary.tsx` | `src/components/academy/` | Card de progresso geral do usuário |
| `AcademyPrioritySection.tsx` | `src/components/academy/` | Seção destacada de WebRádio/WebTV |
| `AcademyCategorySection.tsx` | `src/components/academy/` | Grid de cursos por categoria |

### 6.2 Componentes a Modificar

| Componente | Modificação |
|------------|-------------|
| `AcademyDashboard.tsx` | Adicionar progresso geral, seção prioritária, categorias |
| `AcademyCourseGrid.tsx` | Suportar badge "Recomendado" |

---

## 7. Atualizar useSidebarPersistence (`useSidebarPersistence.ts`)

### Modificar mapeamento de rotas

```typescript
// REMOVER:
"/admin/training": "negocios",

// ADICIONAR:
"/admin/academy": "academy",
"/admin/academy/curso": "academy",
"/admin/academy/aula": "academy",
"/admin/academy/admin": "academy",
"/admin/conexao-ai": "conexao-ai",
"/admin/conexao-ai/assistente": "conexao-ai",
"/admin/conexao-ai/criador": "conexao-ai",
"/admin/conexao-ai/ferramentas": "conexao-ai",
"/admin/conexao-ai/automacoes": "conexao-ai",
"/admin/conexao-ai/insights": "conexao-ai",
```

---

## 8. Atualização de Textos/Branding

### 8.1 Substituições de Texto

| Arquivo | De | Para |
|---------|-----|------|
| `AcademyDashboard.tsx` | "Treinamentos operacionais" | "O centro oficial de aprendizado do Portal Conexão" |
| Qualquer referência | "Universidade Conexão" | "Conexão Academy" |
| Qualquer referência | "Treinamento" (como título) | "Conexão Academy" |

### 8.2 Frase Padrão

> "O Conexão Academy é o centro oficial de aprendizado do Portal Conexão."

---

## 9. Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/migrations/xxx_unify_academy.sql` | CRIAR - Migration de dados |
| `src/components/admin/AdminSidebar.tsx` | MODIFICAR - Reestruturar grupos |
| `src/hooks/useSidebarPersistence.ts` | MODIFICAR - Atualizar mapeamentos |
| `src/App.tsx` | MODIFICAR - Adicionar redirects, remover rota training |
| `src/pages/admin/academy/AcademyDashboard.tsx` | MODIFICAR - Nova interface |
| `src/components/academy/AcademyProgressSummary.tsx` | CRIAR |
| `src/components/academy/AcademyPrioritySection.tsx` | CRIAR |
| `src/components/academy/AcademyCategorySection.tsx` | CRIAR |

### Arquivos a MANTER (não deletar)

- `src/pages/admin/TrainingHub.tsx` → Mantido para referência histórica
- `src/hooks/useTraining.ts` → Mantido para migração de dados
- Tabelas `training_*` → Mantidas para não perder dados

---

## 10. Ordem de Implementação

### Fase 1: Infraestrutura de Dados
1. Criar migration SQL para categorias e migração de dados
2. Executar migration

### Fase 2: Sidebar e Rotas
3. Modificar `AdminSidebar.tsx` - remover Training, criar grupos Academy e AI
4. Modificar `useSidebarPersistence.ts` - atualizar mapeamentos
5. Modificar `App.tsx` - adicionar redirects, remover rota training

### Fase 3: Interface do Academy
6. Criar `AcademyProgressSummary.tsx`
7. Criar `AcademyPrioritySection.tsx`
8. Refatorar `AcademyDashboard.tsx` com nova interface

### Fase 4: Branding
9. Atualizar textos e descrições

---

## 11. Resultado Final Esperado

```text
✅ ZERO menus duplicados de treinamento
✅ 1 único centro de aprendizado: Conexão Academy
✅ WebRádio e WebTV no topo como prioridade absoluta
✅ Conteúdo migrado: 10 módulos + 31 etapas → cursos e aulas
✅ Progresso do usuário preservado
✅ Academy e AI como itens de primeiro nível no sidebar
✅ Redirects funcionando para rotas antigas
✅ Navegação limpa e organizada
✅ Plataforma madura e profissional
```

---

## 12. Detalhes Técnicos Importantes

### 12.1 Preservação de Dados

- Todas as tabelas `training_*` serão MANTIDAS
- Os dados serão COPIADOS para `academy_*`, não movidos
- Progresso existente será migrado para `academy_progress`
- Nenhuma funcionalidade será perdida

### 12.2 RLS (Row Level Security)

- As políticas RLS existentes nas tabelas `academy_*` já estão configuradas
- Cada usuário só verá seu próprio progresso
- Admins podem gerenciar todo o conteúdo

### 12.3 Backward Compatibility

- URLs antigas (`/admin/training`) redirecionam automaticamente
- Componentes antigos mantidos para referência
- Sem breaking changes para usuários existentes
