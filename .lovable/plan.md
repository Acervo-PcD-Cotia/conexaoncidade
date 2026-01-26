
# Plano de Correção: Erros de Tipo no Academy

## Diagnóstico

Após análise detalhada, identifiquei **5 categorias de problemas** de tipagem no módulo Conexão Academy:

### Problemas Encontrados

| # | Problema | Localização | Impacto |
|---|----------|-------------|---------|
| 1 | `parseExternalLinks` aceita `Json` mas não valida objetos | `useAcademy.ts:19-31` | Type guard incompleto |
| 2 | Cast `as unknown as Json` funciona, mas sem type guard | `useAcademy.ts:316, 349` | OK mas pode melhorar |
| 3 | Joins retornam tipos "any-like" | `useAcademy.ts:144, 176` | Falta tipagem explícita |
| 4 | `useContinueWatching` usa `Record<string, unknown>` sem type guard | `useAcademy.ts:504-524` | Acesso inseguro a propriedades |
| 5 | Falta tipagem explícita em `useQuery` | Múltiplos hooks | TypeScript não infere corretamente |

## Estratégia de Correção

A correção será **cirúrgica e isolada** no arquivo `useAcademy.ts`, seguindo o padrão já existente no projeto (`src/types/json.ts`).

---

## Correções Detalhadas

### 1. Melhorar `parseExternalLinks` com Type Guard Robusto

O helper atual está correto na lógica, mas podemos torná-lo mais defensivo:

```typescript
// Tipo utilitário para objetos genéricos
type AnyObj = Record<string, unknown>;

// Type guard para verificar se é objeto
function isObj(v: unknown): v is AnyObj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// Helper melhorado
function parseExternalLinks(input: unknown): AcademyExternalLink[] {
  if (!input) return [];

  // Supabase pode entregar string JSON em alguns casos
  let value: unknown = input;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (Array.isArray(value)) {
    return value
      .filter(isObj)
      .map((item) => ({
        label: typeof item.label === "string" ? item.label : "",
        url: typeof item.url === "string" ? item.url : "",
      }))
      .filter((link) => link.label && link.url);
  }

  return [];
}
```

**Mudanças:**
- Aceita `unknown` ao invés de `Json` (mais flexível)
- Adiciona type guard `isObj` para validação
- Trata string JSON potencial
- Filtra links inválidos (sem label ou url)

---

### 2. Tipagem Explícita nos Hooks de Query

Adicionar tipos genéricos explícitos em todos os `useQuery`:

```typescript
// Antes
return useQuery({
  queryKey: ["academy-categories"],
  queryFn: async () => { ... }
});

// Depois
return useQuery<AcademyCategory[]>({
  queryKey: ["academy-categories"],
  queryFn: async () => { ... }
});
```

**Hooks a corrigir:**
- `useAcademyCategories` → `<AcademyCategory[]>`
- `useAcademyCourses` → `<AcademyCourse[]>`
- `useAcademyCourse` → `<AcademyCourse | null>`
- `useAcademyLessons` → `<AcademyLesson[]>`
- `useAcademyLesson` → `<AcademyLesson | null>`
- `useAcademyProgress` → `<AcademyProgress[]>`
- `useContinueWatching` → `<ContinueWatchingItem[]>`
- `useCourseProgress` → `<{completed: number; total: number; percent: number}>`

---

### 3. Normalização Consistente nos Joins

Para hooks que fazem JOIN (cursos com categoria, aulas com curso), aplicar normalização explícita:

```typescript
// useAcademyCourses
return data.map((course: any) => ({
  ...course,
  category: course.category || undefined,
})) as AcademyCourse[];

// useAcademyCourse
const lessons: AcademyLesson[] = (data.lessons || [])
  .map((lesson: any) => ({
    ...lesson,
    external_links: parseExternalLinks(lesson.external_links),
  }))
  .sort((a, b) => a.sort_order - b.sort_order);

return {
  ...data,
  category: data.category || undefined,
  lessons,
} as AcademyCourse;
```

---

### 4. Correção do `useContinueWatching`

Este hook tem a lógica mais complexa. A correção:

```typescript
export function useContinueWatching() {
  const { user } = useAuth();

  return useQuery<ContinueWatchingItem[]>({
    queryKey: ["academy-continue-watching", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: progress, error } = await supabase
        .from("academy_progress")
        .select(`
          *,
          lesson:academy_lessons(
            *,
            course:academy_courses(*)
          )
        `)
        .eq("user_id", user.id)
        .lt("progress_percent", 100)
        .order("last_watched_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      return (progress || [])
        .filter((p: any) => p.lesson && p.lesson.course)
        .map((p: any) => {
          const lessonRaw = p.lesson as AnyObj;
          const courseRaw = lessonRaw.course as AnyObj;

          const lesson: AcademyLesson = {
            id: String(lessonRaw.id),
            course_id: String(lessonRaw.course_id),
            title: String(lessonRaw.title),
            description: lessonRaw.description as string | null,
            content_html: lessonRaw.content_html as string | null,
            video_embed: lessonRaw.video_embed as string | null,
            external_links: parseExternalLinks(lessonRaw.external_links),
            duration_minutes: Number(lessonRaw.duration_minutes) || 0,
            sort_order: Number(lessonRaw.sort_order) || 0,
            is_published: Boolean(lessonRaw.is_published),
            created_at: String(lessonRaw.created_at),
            updated_at: String(lessonRaw.updated_at),
          };

          const course: AcademyCourse = {
            id: String(courseRaw.id),
            category_id: courseRaw.category_id as string | null,
            title: String(courseRaw.title),
            slug: String(courseRaw.slug),
            description: courseRaw.description as string | null,
            cover_url: courseRaw.cover_url as string | null,
            instructor_name: courseRaw.instructor_name as string | null,
            duration_minutes: Number(courseRaw.duration_minutes) || 0,
            visibility: (courseRaw.visibility as 'all' | 'partners' | 'admin') || 'all',
            is_published: Boolean(courseRaw.is_published),
            sort_order: Number(courseRaw.sort_order) || 0,
            created_at: String(courseRaw.created_at),
            updated_at: String(courseRaw.updated_at),
          };

          const progressItem: AcademyProgress = {
            id: p.id,
            user_id: p.user_id,
            lesson_id: p.lesson_id,
            progress_percent: p.progress_percent,
            completed_at: p.completed_at,
            last_watched_at: p.last_watched_at,
            created_at: p.created_at,
          };

          return { lesson, course, progress: progressItem };
        });
    },
    enabled: !!user,
  });
}
```

**Alternativa simplificada (mantendo casts):**

Se a abordagem acima for muito verbosa, podemos usar uma versão mais pragmática:

```typescript
.map((p: any) => ({
  lesson: {
    ...(p.lesson as any),
    external_links: parseExternalLinks(p.lesson?.external_links),
  } as AcademyLesson,
  course: p.lesson?.course as AcademyCourse,
  progress: {
    id: p.id,
    user_id: p.user_id,
    lesson_id: p.lesson_id,
    progress_percent: p.progress_percent,
    completed_at: p.completed_at,
    last_watched_at: p.last_watched_at,
    created_at: p.created_at,
  } as AcademyProgress,
}))
```

---

## Arquivos a Modificar

| Arquivo | Modificações |
|---------|--------------|
| `src/hooks/useAcademy.ts` | Todas as correções (único arquivo) |

---

## Checklist de Validação

Após as correções:

- [ ] `parseExternalLinks()` usa type guard `isObj`
- [ ] Todos os `useQuery` têm tipo genérico explícito
- [ ] Nenhum `as unknown as Record` (sem genéricos) existe
- [ ] `useContinueWatching` retorna tipo correto
- [ ] Escrita usa `as unknown as Json` (já está correto)
- [ ] Build passa sem erros de tipo

---

## Impacto

- **Escopo**: Isolado em 1 arquivo
- **Risco**: Baixo (refatoração de tipos, não de lógica)
- **Benefício**: Elimina erros de tipo, melhora manutenibilidade
- **Compatibilidade**: Mantém comportamento atual
