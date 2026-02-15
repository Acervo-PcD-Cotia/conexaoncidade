import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAcademyCourse, useCourseProgress, useAcademyProgress } from "@/hooks/useAcademy";
import { AcademyHero } from "@/components/academy/AcademyHero";
import { AcademyModuleAccordion } from "@/components/academy/AcademyModuleAccordion";

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
          <Link to="/spah/painel/academy">Voltar para Academy</Link>
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
          <Link to="/spah/painel/academy">
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

      {/* Lessons List with Module Accordion */}
      <div className="container py-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Conteúdo do Curso
          <Badge variant="secondary" className="ml-2">
            {lessons.length} {lessons.length === 1 ? "aula" : "aulas"}
          </Badge>
        </h2>

        <AcademyModuleAccordion
          lessons={lessons}
          lessonProgressMap={lessonProgressMap}
        />
      </div>
    </div>
  );
}
