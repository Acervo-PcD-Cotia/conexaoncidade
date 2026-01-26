import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  AcademyCategory,
  AcademyCourse,
  AcademyLesson,
  AcademyProgress,
  AcademyCategoryFormData,
  AcademyCourseFormData,
  AcademyLessonFormData,
  AcademyExternalLink,
  ContinueWatchingItem,
} from "@/types/academy";
import type { Json } from "@/integrations/supabase/types";

// Type utility for generic objects
type AnyObj = Record<string, unknown>;

// Type guard to verify if value is an object
function isObj(v: unknown): v is AnyObj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// Helper to safely parse external_links with robust type guard
function parseExternalLinks(input: unknown): AcademyExternalLink[] {
  if (!input) return [];

  // Supabase may deliver JSON string in some cases
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

// ============= CATEGORIES =============

export function useAcademyCategories() {
  return useQuery<AcademyCategory[]>({
    queryKey: ["academy-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as AcademyCategory[];
    },
  });
}

export function useCreateAcademyCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: AcademyCategoryFormData) => {
      const { data, error } = await supabase
        .from("academy_categories")
        .insert(formData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academy-categories"] });
      toast.success("Categoria criada com sucesso");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar categoria: ${error.message}`);
    },
  });
}

export function useUpdateAcademyCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...formData }: AcademyCategoryFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("academy_categories")
        .update(formData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academy-categories"] });
      toast.success("Categoria atualizada com sucesso");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar categoria: ${error.message}`);
    },
  });
}

export function useDeleteAcademyCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("academy_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academy-categories"] });
      toast.success("Categoria excluída com sucesso");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir categoria: ${error.message}`);
    },
  });
}

// ============= COURSES =============

export function useAcademyCourses(categoryId?: string) {
  return useQuery<AcademyCourse[]>({
    queryKey: ["academy-courses", categoryId],
    queryFn: async () => {
      let query = supabase
        .from("academy_courses")
        .select(`
          *,
          category:academy_categories(id, name, slug)
        `)
        .order("sort_order", { ascending: true });

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map((course: any) => ({
        ...course,
        category: course.category || undefined,
      })) as AcademyCourse[];
    },
  });
}

export function useAcademyCourse(slug: string) {
  return useQuery<AcademyCourse | null>({
    queryKey: ["academy-course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_courses")
        .select(`
          *,
          category:academy_categories(id, name, slug),
          lessons:academy_lessons(*)
        `)
        .eq("slug", slug)
        .single();

      if (error) throw error;
      
      // Parse and sort lessons with proper typing
      const lessons: AcademyLesson[] = ((data.lessons as any[]) || [])
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
    },
    enabled: !!slug,
  });
}

export function useCreateAcademyCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: AcademyCourseFormData) => {
      const { data, error } = await supabase
        .from("academy_courses")
        .insert(formData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academy-courses"] });
      toast.success("Curso criado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar curso: ${error.message}`);
    },
  });
}

export function useUpdateAcademyCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...formData }: AcademyCourseFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("academy_courses")
        .update(formData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academy-courses"] });
      toast.success("Curso atualizado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar curso: ${error.message}`);
    },
  });
}

export function useDeleteAcademyCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("academy_courses")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academy-courses"] });
      toast.success("Curso excluído com sucesso");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir curso: ${error.message}`);
    },
  });
}

// ============= LESSONS =============

export function useAcademyLessons(courseId: string) {
  return useQuery<AcademyLesson[]>({
    queryKey: ["academy-lessons", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      
      return (data || []).map((lesson: any) => ({
        ...lesson,
        external_links: parseExternalLinks(lesson.external_links),
      })) as AcademyLesson[];
    },
    enabled: !!courseId,
  });
}

export function useAcademyLesson(lessonId: string) {
  return useQuery<AcademyLesson | null>({
    queryKey: ["academy-lesson", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_lessons")
        .select(`
          *,
          course:academy_courses(*)
        `)
        .eq("id", lessonId)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        external_links: parseExternalLinks(data.external_links),
        course: data.course || undefined,
      } as AcademyLesson;
    },
    enabled: !!lessonId,
  });
}

export function useCreateAcademyLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: AcademyLessonFormData) => {
      const { data, error } = await supabase
        .from("academy_lessons")
        .insert({
          course_id: formData.course_id,
          title: formData.title,
          description: formData.description,
          content_html: formData.content_html,
          video_embed: formData.video_embed,
          external_links: formData.external_links as unknown as Json,
          duration_minutes: formData.duration_minutes,
          is_published: formData.is_published,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["academy-lessons", variables.course_id] });
      toast.success("Aula criada com sucesso");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar aula: ${error.message}`);
    },
  });
}

export function useUpdateAcademyLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...formData }: AcademyLessonFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("academy_lessons")
        .update({
          course_id: formData.course_id,
          title: formData.title,
          description: formData.description,
          content_html: formData.content_html,
          video_embed: formData.video_embed,
          external_links: formData.external_links as unknown as Json,
          duration_minutes: formData.duration_minutes,
          is_published: formData.is_published,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["academy-lessons"] });
      queryClient.invalidateQueries({ queryKey: ["academy-lesson", variables.id] });
      toast.success("Aula atualizada com sucesso");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar aula: ${error.message}`);
    },
  });
}

export function useDeleteAcademyLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, courseId }: { id: string; courseId: string }) => {
      const { error } = await supabase
        .from("academy_lessons")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { courseId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["academy-lessons", data.courseId] });
      toast.success("Aula excluída com sucesso");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir aula: ${error.message}`);
    },
  });
}

export function useUpdateLessonOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessons, courseId }: { lessons: { id: string; sort_order: number }[]; courseId: string }) => {
      const updates = lessons.map(({ id, sort_order }) =>
        supabase
          .from("academy_lessons")
          .update({ sort_order })
          .eq("id", id)
      );

      await Promise.all(updates);
      return { courseId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["academy-lessons", data.courseId] });
    },
  });
}

// ============= PROGRESS =============

export function useAcademyProgress() {
  const { user } = useAuth();

  return useQuery<AcademyProgress[]>({
    queryKey: ["academy-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("academy_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as AcademyProgress[];
    },
    enabled: !!user,
  });
}

export function useUpdateLessonProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      progressPercent,
    }: {
      lessonId: string;
      progressPercent: number;
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const completed = progressPercent >= 100;

      const { data, error } = await supabase
        .from("academy_progress")
        .upsert(
          {
            user_id: user.id,
            lesson_id: lessonId,
            progress_percent: progressPercent,
            completed_at: completed ? new Date().toISOString() : null,
            last_watched_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,lesson_id",
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academy-progress"] });
      queryClient.invalidateQueries({ queryKey: ["academy-continue-watching"] });
    },
  });
}

export function useContinueWatching() {
  const { user } = useAuth();

  return useQuery<ContinueWatchingItem[]>({
    queryKey: ["academy-continue-watching", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: progress, error: progressError } = await supabase
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

      if (progressError) throw progressError;

      return (progress || [])
        .filter((p: any) => p.lesson && p.lesson.course)
        .map((p: any) => {
          const lessonRaw = p.lesson as AnyObj;
          const courseRaw = (lessonRaw.course ?? {}) as AnyObj;

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

type CourseProgressResult = { completed: number; total: number; percent: number };

export function useCourseProgress(courseId: string) {
  const { user } = useAuth();

  return useQuery<CourseProgressResult>({
    queryKey: ["academy-course-progress", courseId, user?.id],
    queryFn: async () => {
      if (!user) return { completed: 0, total: 0, percent: 0 };

      // Get all lessons for this course
      const { data: lessons, error: lessonsError } = await supabase
        .from("academy_lessons")
        .select("id")
        .eq("course_id", courseId)
        .eq("is_published", true);

      if (lessonsError) throw lessonsError;

      const lessonIds = lessons.map((l) => l.id);

      if (lessonIds.length === 0) {
        return { completed: 0, total: 0, percent: 0 };
      }

      // Get progress for these lessons
      const { data: progress, error: progressError } = await supabase
        .from("academy_progress")
        .select("*")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds)
        .gte("progress_percent", 100);

      if (progressError) throw progressError;

      return {
        completed: progress.length,
        total: lessons.length,
        percent: lessons.length > 0 ? Math.round((progress.length / lessons.length) * 100) : 0,
      };
    },
    enabled: !!user && !!courseId,
  });
}
