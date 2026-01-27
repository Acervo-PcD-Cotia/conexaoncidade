import { Star, Radio, Tv } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AcademyCourse } from "@/types/academy";

interface AcademyPrioritySectionProps {
  courses: AcademyCourse[];
  progressMap: Record<string, number>;
}

export function AcademyPrioritySection({ courses, progressMap }: AcademyPrioritySectionProps) {
  const navigate = useNavigate();
  
  if (courses.length === 0) return null;
  
  const getCourseIcon = (title: string) => {
    if (title.toLowerCase().includes("rádio")) return Radio;
    if (title.toLowerCase().includes("tv")) return Tv;
    return Radio;
  };
  
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        <h2 className="text-xl font-bold">Comece por Aqui</h2>
        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
          Recomendado
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => {
          const Icon = getCourseIcon(course.title);
          const progress = progressMap[course.id] || 0;
          const isStarted = progress > 0;
          const isCompleted = progress >= 100;
          
          return (
            <div
              key={course.id}
              className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-card via-card to-primary/5 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Cover Image or Gradient */}
              <div className="relative h-32 overflow-hidden">
                {course.cover_url ? (
                  <img 
                    src={course.cover_url} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center">
                    <Icon className="h-16 w-16 text-primary/40" />
                  </div>
                )}
                
                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-yellow-500 text-yellow-950 hover:bg-yellow-500">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Prioridade
                  </Badge>
                </div>
                
                {/* Completion Badge */}
                {isCompleted && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-green-500 text-white hover:bg-green-500">
                      ✓ Concluído
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg line-clamp-1">{course.title}</h3>
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {course.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {course.lessons?.length || 0} aulas
                    </span>
                    <span className="font-medium text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                {/* Action Button */}
                <Button 
                  className="w-full"
                  variant={isStarted ? "default" : "outline"}
                  onClick={() => navigate(`/admin/academy/curso/${course.slug}`)}
                >
                  {isCompleted ? "Revisar Curso" : isStarted ? "Continuar" : "Começar Agora"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
