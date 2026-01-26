
# Plano de Implementação: Conexão Academy

## Visão Geral

O **Conexão Academy** será uma plataforma de aprendizado estilo Netflix integrada ao painel administrativo, com foco em cursos em vídeo e treinamentos para os diferentes perfis de usuário do Portal Conexão.

---

## Arquitetura do Sistema

### Diferença do módulo existente (Treinamento)

| Aspecto | Treinamento Atual | Conexão Academy |
|---------|-------------------|-----------------|
| Layout | Cards em grid tradicional | Carrossel estilo Netflix |
| Foco | Documentação/Tutoriais | Cursos em vídeo |
| Estrutura | Módulos > Etapas | Categorias > Cursos > Aulas |
| Visual | Institucional | Streaming/EAD moderno |
| Administração | Limitada | CRUD completo |

### Novas Tabelas no Banco de Dados

```text
academy_categories
├── id (UUID, PK)
├── name (TEXT)
├── slug (TEXT, UNIQUE)
├── description (TEXT)
├── cover_url (TEXT)
├── sort_order (INTEGER)
├── is_active (BOOLEAN)
└── created_at / updated_at

academy_courses
├── id (UUID, PK)
├── category_id (UUID, FK → academy_categories)
├── title (TEXT)
├── slug (TEXT, UNIQUE)
├── description (TEXT)
├── cover_url (TEXT)
├── instructor_name (TEXT)
├── duration_minutes (INTEGER)
├── visibility ('all' | 'partners' | 'admin')
├── is_published (BOOLEAN)
├── sort_order (INTEGER)
└── created_at / updated_at

academy_lessons
├── id (UUID, PK)
├── course_id (UUID, FK → academy_courses)
├── title (TEXT)
├── description (TEXT)
├── content_html (TEXT) — editor rico
├── video_embed (TEXT) — iframe YouTube/Vimeo/Drive
├── external_links (JSONB) — [{ label, url }]
├── duration_minutes (INTEGER)
├── sort_order (INTEGER)
├── is_published (BOOLEAN)
└── created_at / updated_at

academy_progress
├── id (UUID, PK)
├── user_id (UUID)
├── lesson_id (UUID, FK → academy_lessons)
├── progress_percent (INTEGER) — 0-100
├── completed_at (TIMESTAMPTZ)
├── last_watched_at (TIMESTAMPTZ)
└── UNIQUE(user_id, lesson_id)
```

---

## Políticas de Segurança (RLS)

| Tabela | Operação | Regra |
|--------|----------|-------|
| `academy_categories` | SELECT | Público (anon + authenticated) |
| `academy_courses` | SELECT | Público para `visibility = 'all'`, verificar role para outros |
| `academy_lessons` | SELECT | Baseado na visibilidade do curso pai |
| `academy_progress` | SELECT/INSERT/UPDATE | Apenas para o próprio `user_id` |
| Todas | INSERT/UPDATE/DELETE | Apenas para admins/editores |

---

## Estrutura de Arquivos

```text
src/
├── pages/admin/academy/
│   ├── AcademyDashboard.tsx      # Página principal estilo Netflix
│   ├── AcademyCourse.tsx         # Visualização de curso + lista de aulas
│   ├── AcademyLesson.tsx         # Player de aula + navegação
│   ├── AcademyAdminCategories.tsx
│   ├── AcademyAdminCourses.tsx
│   ├── AcademyAdminLessons.tsx
│   └── AcademyAdminLessonEditor.tsx
│
├── components/academy/
│   ├── AcademyHero.tsx           # Banner do curso em destaque
│   ├── AcademyCarousel.tsx       # Carrossel horizontal de cursos
│   ├── AcademyCourseCard.tsx     # Card do curso (capa, título, progresso)
│   ├── AcademyLessonPlayer.tsx   # Player de vídeo (iframe seguro)
│   ├── AcademyLessonNav.tsx      # Navegação anterior/próximo
│   ├── AcademyProgressBar.tsx    # Barra de progresso do curso
│   └── AcademyContinueWatching.tsx # Seção "Continue assistindo"
│
├── hooks/
│   └── useAcademy.ts             # Hooks para cursos, aulas e progresso
│
└── types/
    └── academy.ts                # Tipagens TypeScript
```

---

## Etapas de Implementação

### Fase 1: Banco de Dados

1. Criar migração SQL com as 4 tabelas
2. Habilitar RLS em todas as tabelas
3. Criar políticas de leitura pública para categorias e cursos publicados
4. Criar políticas de escrita para administradores
5. Adicionar índices para performance (slug, category_id, course_id)

### Fase 2: Sistema de Tipos e Hooks

1. Criar `src/types/academy.ts` com interfaces TypeScript
2. Criar `src/hooks/useAcademy.ts` com:
   - `useAcademyCategories()` — lista todas as categorias
   - `useAcademyCourses(categoryId?)` — lista cursos
   - `useAcademyCourse(slug)` — detalhes de um curso
   - `useAcademyLessons(courseId)` — aulas de um curso
   - `useAcademyLesson(lessonId)` — detalhes de uma aula
   - `useAcademyProgress()` — progresso do usuário
   - `useUpdateLessonProgress()` — marcar progresso
   - `useContinueWatching()` — últimas aulas assistidas

### Fase 3: Componentes UI

1. **AcademyCarousel** — Carrossel horizontal com Embla
2. **AcademyCourseCard** — Card com capa, título, progresso circular
3. **AcademyHero** — Banner do curso em destaque (gradiente + CTA)
4. **AcademyLessonPlayer** — Wrapper seguro para iframes de vídeo
5. **AcademyLessonNav** — Botões anterior/próximo entre aulas

### Fase 4: Páginas do Aluno

1. **AcademyDashboard** (`/admin/academy`)
   - Seção "Continue Assistindo" (baseado em progresso)
   - Seções por categoria (carrosséis horizontais)
   - Filtro de busca

2. **AcademyCourse** (`/admin/academy/curso/:slug`)
   - Hero com capa e descrição
   - Lista de aulas com checkmarks de conclusão
   - Barra de progresso geral

3. **AcademyLesson** (`/admin/academy/aula/:id`)
   - Player de vídeo (iframe)
   - Conteúdo em texto (HTML rico)
   - Links externos
   - Navegação entre aulas

### Fase 5: Páginas de Administração

1. **AcademyAdminCategories** (`/admin/academy/admin/categorias`)
   - CRUD de categorias com drag-and-drop para ordenação

2. **AcademyAdminCourses** (`/admin/academy/admin/cursos`)
   - Lista de cursos com filtros
   - Criar/editar curso
   - Upload de capa
   - Definir visibilidade

3. **AcademyAdminLessons** (`/admin/academy/admin/cursos/:id/aulas`)
   - Lista de aulas do curso
   - Reordenação via drag-and-drop

4. **AcademyAdminLessonEditor** (`/admin/academy/admin/aulas/:id`)
   - Editor rico para conteúdo
   - Campo para embed de vídeo
   - Gerenciador de links externos

### Fase 6: Integração ao Sistema

1. **Sidebar**: Adicionar item "Conexão Academy" no grupo "Negócios"
2. **Rotas**: Registrar rotas no App.tsx
3. **Módulo**: Adicionar `ACADEMY` ao sistema de módulos (opcional)
4. **Permissões**: Verificar roles para administração

---

## Design Visual

### Paleta de Cores (Estilo Streaming)

- **Background**: `bg-zinc-950` (escuro)
- **Cards**: `bg-zinc-900` com hover `bg-zinc-800`
- **Destaque**: Gradiente primário do tema
- **Texto**: `text-zinc-100` (principal), `text-zinc-400` (secundário)

### Componentes Visuais

- Carrossel com Embla Carousel (já instalado)
- Cards com aspect-ratio 16:9 para capas
- Hover effects com scale e shadow
- Progress rings para indicar conclusão
- Badges para status (novo, em progresso, concluído)

---

## Integrações de Vídeo

O campo `video_embed` aceita iframes de:

- YouTube (embed)
- Vimeo (embed)
- Google Drive (embed viewer)
- Panda Video
- Qualquer player que suporte iframe

O componente `AcademyLessonPlayer` sanitiza o HTML usando a mesma lógica do módulo de streaming (`sanitizeEmbedCode`).

---

## Migração SQL Completa

```sql
-- 1. Categorias
CREATE TABLE public.academy_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Cursos
CREATE TABLE public.academy_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.academy_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_url TEXT,
  instructor_name TEXT,
  duration_minutes INTEGER DEFAULT 0,
  visibility TEXT DEFAULT 'all' CHECK (visibility IN ('all', 'partners', 'admin')),
  is_published BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Aulas
CREATE TABLE public.academy_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_html TEXT,
  video_embed TEXT,
  external_links JSONB DEFAULT '[]'::jsonb,
  duration_minutes INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Progresso
CREATE TABLE public.academy_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
  progress_percent INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_watched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Índices
CREATE INDEX idx_academy_courses_category ON public.academy_courses(category_id);
CREATE INDEX idx_academy_lessons_course ON public.academy_lessons(course_id);
CREATE INDEX idx_academy_progress_user ON public.academy_progress(user_id);

-- RLS
ALTER TABLE public.academy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;

-- Policies: Leitura pública
CREATE POLICY "Categories are public" ON public.academy_categories
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Published courses are public" ON public.academy_courses
  FOR SELECT TO public USING (is_published = true);

CREATE POLICY "Lessons from published courses are public" ON public.academy_lessons
  FOR SELECT TO public USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM public.academy_courses
      WHERE id = academy_lessons.course_id AND is_published = true
    )
  );

-- Policy: Progresso do próprio usuário
CREATE POLICY "Users manage own progress" ON public.academy_progress
  FOR ALL TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies: Admin pode tudo
CREATE POLICY "Admins manage categories" ON public.academy_categories
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

CREATE POLICY "Admins manage courses" ON public.academy_courses
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

CREATE POLICY "Admins manage lessons" ON public.academy_lessons
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );
```

---

## Menu Lateral (Sidebar)

Adicionar ao grupo "Negócios" em `AdminSidebar.tsx`:

```typescript
const businessItems: MenuItem[] = [
  // ... itens existentes
  { title: "Conexão Academy", url: "/admin/academy", icon: PlayCircle },
];
```

Adicionar grupo de administração:

```typescript
const academyAdminItems: MenuItem[] = [
  { title: "Dashboard", url: "/admin/academy", icon: PlayCircle },
  { title: "Categorias", url: "/admin/academy/admin/categorias", icon: FolderTree },
  { title: "Cursos", url: "/admin/academy/admin/cursos", icon: BookOpen },
];
```

---

## Rotas no App.tsx

```typescript
{/* Conexão Academy Routes */}
<Route path="academy" element={<AcademyDashboard />} />
<Route path="academy/curso/:slug" element={<AcademyCourse />} />
<Route path="academy/aula/:id" element={<AcademyLesson />} />
<Route path="academy/admin/categorias" element={<AcademyAdminCategories />} />
<Route path="academy/admin/cursos" element={<AcademyAdminCourses />} />
<Route path="academy/admin/cursos/:id/aulas" element={<AcademyAdminLessons />} />
<Route path="academy/admin/aulas/:id" element={<AcademyAdminLessonEditor />} />
```

---

## Critérios de Aceite

- [ ] Tabelas criadas com RLS ativo
- [ ] Dashboard estilo Netflix funcional
- [ ] Carrosséis de cursos por categoria
- [ ] Seção "Continue Assistindo" baseada em progresso
- [ ] Player de vídeo com suporte a múltiplas plataformas
- [ ] Navegação entre aulas (anterior/próximo)
- [ ] Conteúdo rico com editor HTML
- [ ] CRUD completo para categorias, cursos e aulas
- [ ] Ordenação via drag-and-drop
- [ ] Controle de visibilidade (todos/parceiros/admin)
- [ ] Menu lateral integrado
- [ ] Design responsivo e moderno

---

## Estimativa de Esforço

| Fase | Complexidade | Descrição |
|------|-------------|-----------|
| Banco de Dados | Baixa | 4 tabelas + RLS |
| Tipos/Hooks | Média | ~10 hooks |
| Componentes UI | Alta | 7 componentes visuais |
| Páginas Aluno | Média | 3 páginas |
| Páginas Admin | Alta | 4 páginas CRUD |
| Integração | Baixa | Sidebar + Rotas |

