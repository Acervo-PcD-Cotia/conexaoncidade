import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Clock, CheckCircle, Lock, BookOpen, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAcademyCourse, useCourseProgress, useAcademyProgress } from "@/hooks/useAcademy";
import { AcademyHero } from "@/components/academy/AcademyHero";
import type { AcademyLesson } from "@/types/academy";

export default function AcademyCourse() {
  const { slug } = useParams<{ slug: string }>();
  const { data: course, isLoading } = useAcademyCourse(slug || "");
  const { data: progress } = useCourseProgress(course?.id || "");
  const { data: lessonProgress } = useAcademyProgress();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Curso não encontrado</h1>
        <Button asChild>
          <Link to="/admin/academy">Voltar para Academy</Link>
        </Button>
      </div>
    );
  }

  const lessons = (course.lessons || []).filter(l => l.is_published);
  
  // Map lesson progress
  const lessonProgressMap = new Map(
    lessonProgress?.map(p => [p.lesson_id, p.progress_percent]) || []
  );

  // Find first unwatched lesson
  const firstUnwatchedLesson = lessons.find(lesson => {
    const percent = lessonProgressMap.get(lesson.id) || 0;
    return percent < 100;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container py-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/academy">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
      </div>

      {/* Hero */}
      <div className="container pb-6">
        <AcademyHero
          course={course}
          lessons={lessons}
          progress={progress}
          firstUnwatchedLesson={firstUnwatchedLesson}
        />
      </div>

      {/* Lessons List */}
      <div className="container py-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Conteúdo do Curso
          <Badge variant="secondary" className="ml-2">
            {lessons.length} {lessons.length === 1 ? "aula" : "aulas"}
          </Badge>
        </h2>

        <div className="space-y-2">
          {lessons.map((lesson, index) => {
            const lessonPercent = lessonProgressMap.get(lesson.id) || 0;
            const isCompleted = lessonPercent >= 100;
            const isInProgress = lessonPercent > 0 && lessonPercent < 100;

            return (
              <Link
                key={lesson.id}
                to={`/admin/academy/aula/${lesson.id}`}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
              >
                {/* Number/Status */}
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  ) : isInProgress ? (
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center relative">
                      <svg className="absolute inset-0 w-10 h-10 -rotate-90">
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray={`${lessonPercent} 100`}
                          className="opacity-30"
                        />
                      </svg>
                      <Play className="h-4 w-4 fill-current" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                    {lesson.title}
                  </h3>
                  {lesson.description && (
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {lesson.description}
                    </p>
                  )}
                </div>

                {/* Duration */}
                {lesson.duration_minutes > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                    <Clock className="h-4 w-4" />
                    <span>{lesson.duration_minutes} min</span>
                  </div>
                )}

                {/* Play Icon */}
                <Play className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>

        {lessons.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Nenhuma aula disponível neste curso</p>
          </div>
        )}
      </div>
    </div>
  );
}
