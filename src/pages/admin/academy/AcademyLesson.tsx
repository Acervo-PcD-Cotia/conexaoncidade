import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAcademyLesson, useAcademyLessons, useUpdateLessonProgress, useAcademyProgress } from "@/hooks/useAcademy";
import { AcademyLessonPlayer } from "@/components/academy/AcademyLessonPlayer";
import { AcademyLessonNav } from "@/components/academy/AcademyLessonNav";

export default function AcademyLesson() {
  const { id } = useParams<{ id: string }>();
  const { data: lesson, isLoading } = useAcademyLesson(id || "");
  const { data: allLessons } = useAcademyLessons(lesson?.course_id || "");
  const { data: progressData } = useAcademyProgress();
  const updateProgress = useUpdateLessonProgress();

  // Get current lesson progress
  const currentProgress = progressData?.find(p => p.lesson_id === id);
  const isCompleted = (currentProgress?.progress_percent || 0) >= 100;

  // Find previous and next lessons
  const currentIndex = allLessons?.findIndex(l => l.id === id) ?? -1;
  const previousLesson = currentIndex > 0 ? allLessons?.[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < (allLessons?.length || 0) - 1 
    ? allLessons?.[currentIndex + 1] 
    : null;

  // Mark as started when viewing
  useEffect(() => {
    if (lesson && !currentProgress) {
      updateProgress.mutate({ lessonId: lesson.id, progressPercent: 5 });
    }
  }, [lesson?.id]);

  const handleMarkComplete = () => {
    if (!lesson) return;
    updateProgress.mutate({ lessonId: lesson.id, progressPercent: 100 });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Aula não encontrada</h1>
        <Button asChild>
          <Link to="/admin/academy">Voltar para Academy</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link to={lesson.course ? `/admin/academy/curso/${lesson.course.slug}` : "/admin/academy"}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao curso
              </Link>
            </Button>

            <Button
              onClick={handleMarkComplete}
              disabled={isCompleted || updateProgress.isPending}
              variant={isCompleted ? "secondary" : "default"}
              size="sm"
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Concluída
                </>
              ) : (
                "Marcar como concluída"
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Video Player */}
          {lesson.video_embed && (
            <AcademyLessonPlayer embedCode={lesson.video_embed} />
          )}

          {/* Title & Description */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-muted-foreground">{lesson.description}</p>
            )}
          </div>

          {/* External Links */}
          {lesson.external_links && lesson.external_links.length > 0 && (
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-semibold mb-3">Links Externos</h3>
              <div className="flex flex-wrap gap-2">
                {lesson.external_links.map((link, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.label}
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          {lesson.content_html && (
            <div 
              className="prose prose-sm dark:prose-invert max-w-none bg-card rounded-lg p-6 border"
              dangerouslySetInnerHTML={{ __html: lesson.content_html }}
            />
          )}

          <Separator />

          {/* Navigation */}
          <AcademyLessonNav
            previousLesson={previousLesson}
            nextLesson={nextLesson}
          />
        </div>
      </div>
    </div>
  );
}
