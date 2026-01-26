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

// Helper to safely parse external_links
function parseExternalLinks(links: Json | null | undefined): AcademyExternalLink[] {
  if (!links) return [];
  if (Array.isArray(links)) {
    return links.map(item => {
      const obj = item as Record<string, unknown>;
      return {
        label: String(obj.label || ''),
        url: String(obj.url || ''),
      };
    });
  }
  return [];
}

// ============= CATEGORIES =============

export function useAcademyCategories() {
  return useQuery({
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
  return useQuery({
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
      
      return data.map(course => ({
        ...course,
        category: course.category as unknown as AcademyCategory | undefined,
      })) as AcademyCourse[];
    },
  });
}

export function useAcademyCourse(slug: string) {
  return useQuery({
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
      
      // Parse and sort lessons
      const lessons = (data.lessons || [])
        .map((lesson: Record<string, unknown>) => ({
          ...lesson,
          external_links: parseExternalLinks(lesson.external_links as Json),
        }))
        .sort((a: AcademyLesson, b: AcademyLesson) => a.sort_order - b.sort_order);
      
      return {
        ...data,
        category: data.category as unknown as AcademyCategory | undefined,
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
  return useQuery({
    queryKey: ["academy-lessons", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      
      return data.map(lesson => ({
        ...lesson,
        external_links: parseExternalLinks(lesson.external_links),
      })) as AcademyLesson[];
    },
    enabled: !!courseId,
  });
}

export function useAcademyLesson(lessonId: string) {
  return useQuery({
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
        course: data.course as unknown as AcademyCourse | undefined,
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

  return useQuery({
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

  return useQuery({
    queryKey: ["academy-continue-watching", user?.id],
    queryFn: async (): Promise<ContinueWatchingItem[]> => {
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

      return progress
        .filter((p) => p.lesson && p.lesson.course)
        .map((p) => {
          const lessonData = p.lesson as Record<string, unknown>;
          return {
            lesson: {
              ...lessonData,
              external_links: parseExternalLinks(lessonData.external_links as Json),
            } as AcademyLesson,
            course: lessonData.course as AcademyCourse,
            progress: {
              id: p.id,
              user_id: p.user_id,
              lesson_id: p.lesson_id,
              progress_percent: p.progress_percent,
              completed_at: p.completed_at,
              last_watched_at: p.last_watched_at,
              created_at: p.created_at,
            } as AcademyProgress,
          };
        });
    },
    enabled: !!user,
  });
}

export function useCourseProgress(courseId: string) {
  const { user } = useAuth();

  return useQuery({
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
