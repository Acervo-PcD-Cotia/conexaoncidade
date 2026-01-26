import { Play, Clock, BookOpen, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { AcademyCourse, AcademyLesson } from "@/types/academy";

interface AcademyHeroProps {
  course: AcademyCourse;
  lessons?: AcademyLesson[];
  progress?: { completed: number; total: number; percent: number };
  firstUnwatchedLesson?: AcademyLesson;
  className?: string;
}

export function AcademyHero({ course, lessons = [], progress, firstUnwatchedLesson, className }: AcademyHeroProps) {
  const lessonCount = lessons.length;
  const targetLesson = firstUnwatchedLesson || lessons[0];

  return (
    <div className={cn("relative rounded-xl overflow-hidden", className)}>
      {/* Background Image */}
      <div className="absolute inset-0">
        {course.cover_url ? (
          <img
            src={course.cover_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative p-6 md:p-8 lg:p-12 min-h-[300px] md:min-h-[400px] flex flex-col justify-end">
        <div className="max-w-2xl">
          {/* Category */}
          {course.category && (
            <span className="inline-block px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded mb-3">
              {course.category.name}
            </span>
          )}

          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
            {course.title}
          </h1>

          {/* Description */}
          {course.description && (
            <p className="text-zinc-300 text-sm md:text-base line-clamp-2 mb-4">
              {course.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-6">
            {course.instructor_name && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {course.instructor_name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {lessonCount} {lessonCount === 1 ? "aula" : "aulas"}
            </span>
            {course.duration_minutes > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {course.duration_minutes} min
              </span>
            )}
          </div>

          {/* Progress */}
          {progress && progress.total > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-zinc-400">Seu progresso</span>
                <span className="text-white font-medium">
                  {progress.completed}/{progress.total} aulas ({progress.percent}%)
                </span>
              </div>
              <Progress value={progress.percent} className="h-2" />
            </div>
          )}

          {/* CTA */}
          {targetLesson && (
            <Button asChild size="lg" className="gap-2">
              <Link to={`/admin/academy/aula/${targetLesson.id}`}>
                <Play className="h-5 w-5 fill-current" />
                {progress && progress.completed > 0 ? "Continuar" : "Começar"}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
