import { CheckCircle, TrendingUp, ArrowRight, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { AcademyCourse, AcademyProgress, AcademyLesson } from "@/types/academy";

interface AcademyProgressSummaryProps {
  courses: AcademyCourse[];
  progress: AcademyProgress[];
}

export function AcademyProgressSummary({ courses, progress }: AcademyProgressSummaryProps) {
  const navigate = useNavigate();
  
  // Calculate total lessons and completed lessons
  const allLessons: AcademyLesson[] = courses.flatMap(c => c.lessons || []);
  const totalLessons = allLessons.length;
  
  const completedLessons = progress.filter(
    p => allLessons.some(l => l.id === p.lesson_id) && p.progress_percent >= 100
  ).length;
  
  const progressPercent = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100) 
    : 0;
  
  // Find next recommended lesson (first incomplete lesson from priority courses)
  const findNextLesson = () => {
    // Priority: courses without category (WebRádio/WebTV), then by sort_order
    const sortedCourses = [...courses].sort((a, b) => {
      if (!a.category_id && b.category_id) return -1;
      if (a.category_id && !b.category_id) return 1;
      return (a.sort_order || 0) - (b.sort_order || 0);
    });
    
    for (const course of sortedCourses) {
      const lessons = course.lessons || [];
      for (const lesson of lessons.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))) {
        const lessonProgress = progress.find(p => p.lesson_id === lesson.id);
        if (!lessonProgress || lessonProgress.progress_percent < 100) {
          return { lesson, course };
        }
      }
    }
    return null;
  };
  
  const nextLesson = findNextLesson();
  
  if (totalLessons === 0) return null;
  
  return (
    <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-card to-primary/10 p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Stats */}
        <div className="flex-1 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Seu Progresso Geral
          </h2>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{completedLessons}</span>
              <span className="text-muted-foreground">aulas concluídas</span>
            </div>
            
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{progressPercent}%</span>
              <span className="text-muted-foreground">completo</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {completedLessons} de {totalLessons} aulas
            </p>
          </div>
        </div>
        
        {/* Next Step */}
        {nextLesson && (
          <div className="lg:w-80 bg-background/50 rounded-lg p-4 border border-primary/20">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Próxima aula
            </p>
            <h3 className="font-medium mb-1 line-clamp-1">{nextLesson.lesson.title}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
              {nextLesson.course.title}
            </p>
            <Button 
              size="sm" 
              onClick={() => navigate(`/admin/academy/aula/${nextLesson.lesson.id}`)}
              className="w-full"
            >
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
