import { Link } from "react-router-dom";
import { Clock, BookOpen, ArrowRight, Radio, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { AcademyCourse } from "@/types/academy";

interface AcademyCourseGridProps {
  courses: AcademyCourse[];
  progressMap: Record<string, number>;
  title?: string;
}

export function AcademyCourseGrid({ courses, progressMap, title }: AcademyCourseGridProps) {
  if (courses.length === 0) return null;

  // Determine icon based on course title
  const getCourseIcon = (courseTitle: string) => {
    if (courseTitle.toLowerCase().includes("webrádio") || courseTitle.toLowerCase().includes("radio")) {
      return <Radio className="h-10 w-10 text-primary" />;
    }
    if (courseTitle.toLowerCase().includes("webtv") || courseTitle.toLowerCase().includes("tv")) {
      return <Tv className="h-10 w-10 text-primary" />;
    }
    return <BookOpen className="h-10 w-10 text-primary" />;
  };

  return (
    <section>
      {title && (
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          {title}
        </h2>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          const progress = progressMap[course.id] || 0;
          const lessonCount = course.lessons?.length || course.lesson_count || 0;

          return (
            <div
              key={course.id}
              className="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Cover Image or Icon */}
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                {course.cover_url ? (
                  <img
                    src={course.cover_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  getCourseIcon(course.title)
                )}
                
                {/* Progress overlay */}
                {progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <div className="flex items-center justify-between text-white text-xs mb-1">
                      <span>Progresso</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-white/30" />
                  </div>
                )}

                {/* Badge for new courses */}
                {isNewCourse(course.created_at) && progress === 0 && (
                  <Badge className="absolute top-3 right-3 bg-primary">
                    Novo
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>

                {course.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                )}

                {/* Meta info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{lessonCount} aulas</span>
                  </div>
                  {course.duration_minutes > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration_minutes} min</span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Button asChild className="w-full group/btn">
                  <Link to={`/admin/academy/curso/${course.slug}`}>
                    {progress > 0 && progress < 100 ? "Continuar" : "Começar"}
                    <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function isNewCourse(createdAt: string): boolean {
  const created = new Date(createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return created > thirtyDaysAgo;
}
