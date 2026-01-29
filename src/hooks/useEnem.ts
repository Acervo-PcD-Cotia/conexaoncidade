/**
 * React Query hooks for ENEM 2026 Module
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type {
  EnemModule,
  EnemWeek,
  EnemLesson,
  EnemProgress,
  EnemWeeklyProgress,
  EnemSubmission,
  SubmitEssayFormData,
  CorrectorFeedback,
  TutorFeedback,
} from "@/types/enem";

// Helper to safely cast JSONB to types
const asCorrectorFeedback = (data: unknown): CorrectorFeedback | null => {
  if (!data || typeof data !== 'object') return null;
  return data as CorrectorFeedback;
};

const asTutorFeedback = (data: unknown): TutorFeedback | null => {
  if (!data || typeof data !== 'object') return null;
  return data as TutorFeedback;
};

// =============================================
// MODULES
// =============================================

export function useEnemModules() {
  return useQuery({
    queryKey: ["enem-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enem_modules")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as EnemModule[];
    },
  });
}

export function useEnemModule(slug: string) {
  return useQuery({
    queryKey: ["enem-module", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enem_modules")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data as EnemModule;
    },
    enabled: !!slug,
  });
}

// =============================================
// WEEKS
// =============================================

export function useEnemWeeks(moduleId: string) {
  return useQuery({
    queryKey: ["enem-weeks", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enem_weeks")
        .select("*")
        .eq("module_id", moduleId)
        .eq("is_active", true)
        .order("week_number", { ascending: true });

      if (error) throw error;
      return data as EnemWeek[];
    },
    enabled: !!moduleId,
  });
}

export function useEnemWeek(weekId: string) {
  return useQuery({
    queryKey: ["enem-week", weekId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enem_weeks")
        .select(`
          *,
          lessons:enem_lessons(*)
        `)
        .eq("id", weekId)
        .single();

      if (error) throw error;
      
      // Sort lessons by sort_order
      if (data.lessons) {
        data.lessons.sort((a: EnemLesson, b: EnemLesson) => a.sort_order - b.sort_order);
      }
      
      return data as EnemWeek & { lessons: EnemLesson[] };
    },
    enabled: !!weekId,
  });
}

// =============================================
// LESSONS
// =============================================

export function useEnemLessons(weekId: string) {
  return useQuery({
    queryKey: ["enem-lessons", weekId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enem_lessons")
        .select("*")
        .eq("week_id", weekId)
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as EnemLesson[];
    },
    enabled: !!weekId,
  });
}

export function useEnemLesson(lessonId: string) {
  return useQuery({
    queryKey: ["enem-lesson", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enem_lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      if (error) throw error;
      return data as EnemLesson;
    },
    enabled: !!lessonId,
  });
}

// =============================================
// PROGRESS
// =============================================

export function useEnemProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["enem-progress", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("enem_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as EnemProgress[];
    },
    enabled: !!user?.id,
  });
}

export function useEnemWeeklyProgress(moduleId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["enem-weekly-progress", user?.id, moduleId],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("enem_weekly_progress")
        .select(`
          *,
          week:enem_weeks(*)
        `)
        .eq("user_id", user.id);

      if (moduleId) {
        query = query.eq("week.module_id", moduleId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (EnemWeeklyProgress & { week: EnemWeek })[];
    },
    enabled: !!user?.id,
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      lessonId,
      status,
      progressPercent,
    }: {
      lessonId: string;
      status: EnemProgress["status"];
      progressPercent?: number;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("enem_progress")
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          status,
          progress_percent: progressPercent || (status === "completed" ? 100 : 0),
          started_at: status === "in_progress" ? new Date().toISOString() : undefined,
          completed_at: status === "completed" ? new Date().toISOString() : undefined,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enem-progress"] });
      queryClient.invalidateQueries({ queryKey: ["enem-weekly-progress"] });
    },
  });
}

export function useCompleteLesson() {
  const updateProgress = useUpdateProgress();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      return updateProgress.mutateAsync({
        lessonId,
        status: "completed",
        progressPercent: 100,
      });
    },
  });
}

// =============================================
// SUBMISSIONS
// =============================================

export function useEnemSubmissions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["enem-submissions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("enem_submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      
      return data.map((submission) => ({
        ...submission,
        feedback_corretora: asCorrectorFeedback(submission.feedback_corretora),
        feedback_tutor: asTutorFeedback(submission.feedback_tutor),
      })) as EnemSubmission[];
    },
    enabled: !!user?.id,
  });
}

export function useEnemSubmission(submissionId: string) {
  return useQuery({
    queryKey: ["enem-submission", submissionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enem_submissions")
        .select("*")
        .eq("id", submissionId)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        feedback_corretora: asCorrectorFeedback(data.feedback_corretora),
        feedback_tutor: asTutorFeedback(data.feedback_tutor),
      } as EnemSubmission;
    },
    enabled: !!submissionId,
  });
}

export function useSubmitEssay() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (formData: SubmitEssayFormData) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Calculate word count
      const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;

      // Insert submission
      const { data: submission, error: insertError } = await supabase
        .from("enem_submissions")
        .insert({
          user_id: user.id,
          theme: formData.theme,
          content: formData.content,
          word_count: wordCount,
          lesson_id: formData.lesson_id || null,
          week_id: formData.week_id || null,
          correction_status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Trigger AI correction via Edge Function
      const { error: correctionError } = await supabase.functions.invoke(
        "enem-correct-essay",
        {
          body: { submission_id: submission.id },
        }
      );

      if (correctionError) {
        console.error("Error triggering correction:", correctionError);
        // Don't throw - submission was saved, correction can be retried
      }

      return submission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enem-submissions"] });
    },
  });
}

export function useRetryCorrection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      // Update status to pending
      await supabase
        .from("enem_submissions")
        .update({ correction_status: "pending" })
        .eq("id", submissionId);

      // Trigger AI correction
      const { error } = await supabase.functions.invoke("enem-correct-essay", {
        body: { submission_id: submissionId },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enem-submissions"] });
    },
  });
}

// =============================================
// STATS
// =============================================

export function useStudentStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["enem-student-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: submissions, error } = await supabase
        .from("enem_submissions")
        .select("*")
        .eq("user_id", user.id)
        .eq("correction_status", "completed")
        .order("submitted_at", { ascending: true });

      if (error) throw error;
      if (!submissions || submissions.length === 0) return null;

      const scores = submissions
        .filter((s) => s.score_total !== null)
        .map((s) => s.score_total as number);

      const competencyScores = {
        c1: submissions.filter((s) => s.score_c1).map((s) => s.score_c1 as number),
        c2: submissions.filter((s) => s.score_c2).map((s) => s.score_c2 as number),
        c3: submissions.filter((s) => s.score_c3).map((s) => s.score_c3 as number),
        c4: submissions.filter((s) => s.score_c4).map((s) => s.score_c4 as number),
        c5: submissions.filter((s) => s.score_c5).map((s) => s.score_c5 as number),
      };

      const avg = (arr: number[]) =>
        arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

      const averageScore = avg(scores);
      const latestLevel = submissions[submissions.length - 1]?.diagnosis_level;

      return {
        totalSubmissions: submissions.length,
        averageScore: Math.round(averageScore),
        bestScore: Math.max(...scores, 0),
        lastSubmissionDate: submissions[submissions.length - 1]?.submitted_at || null,
        scoreEvolution: submissions
          .filter((s) => s.score_total !== null)
          .map((s) => ({
            date: s.submitted_at,
            score: s.score_total as number,
          })),
        competencyAverages: {
          c1: Math.round(avg(competencyScores.c1)),
          c2: Math.round(avg(competencyScores.c2)),
          c3: Math.round(avg(competencyScores.c3)),
          c4: Math.round(avg(competencyScores.c4)),
          c5: Math.round(avg(competencyScores.c5)),
        },
        currentLevel: (latestLevel as 'iniciante' | 'intermediário' | 'avançado') || "iniciante",
      };
    },
    enabled: !!user?.id,
  });
}
