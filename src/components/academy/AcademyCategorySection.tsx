import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Newspaper, 
  Calendar, 
  Share2, 
  User, 
  Briefcase, 
  CheckCircle,
  LucideIcon 
} from "lucide-react";
import type { AcademyCourse, AcademyCategory } from "@/types/academy";

interface AcademyCategorySectionProps {
  category: AcademyCategory;
  courses: AcademyCourse[];
  progressMap: Record<string, number>;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "onboarding": BookOpen,
  "por-modulo": Newspaper,
  "por-perfil": User,
};

const COURSE_ICONS: Record<string, LucideIcon> = {
  "noticias": Newspaper,
  "eventos": Calendar,
  "sindicacao": Share2,
  "jornalista": User,
  "editor": BookOpen,
  "comercial": Briefcase,
};

export function AcademyCategorySection({ category, courses, progressMap }: AcademyCategorySectionProps) {
  const navigate = useNavigate();
  
  const CategoryIcon = CATEGORY_ICONS[category.slug] || BookOpen;
  
  const getCourseIcon = (course: AcademyCourse) => {
    const slug = course.slug.toLowerCase();
    for (const [key, icon] of Object.entries(COURSE_ICONS)) {
      if (slug.includes(key)) return icon;
    }
    return BookOpen;
  };
  
  if (courses.length === 0) return null;
  
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <CategoryIcon className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">{category.name}</h2>
        {category.description && (
          <span className="text-sm text-muted-foreground hidden sm:block">
            — {category.description}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {courses.map((course) => {
          const Icon = getCourseIcon(course);
          const progress = progressMap[course.id] || 0;
          const isCompleted = progress >= 100;
          
          return (
            <div
              key={course.id}
              onClick={() => navigate(`/spah/painel/academy/curso/${course.slug}`)}
              className="group cursor-pointer rounded-lg border bg-card hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Cover */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                {course.cover_url ? (
                  <img 
                    src={course.cover_url} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                    <Icon className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                
                {/* Completion Badge */}
                {isCompleted && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-500/90 text-white hover:bg-green-500 text-xs px-1.5 py-0.5">
                      <CheckCircle className="h-3 w-3" />
                    </Badge>
                  </div>
                )}
                
                {/* Progress Bar */}
                {progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0">
                    <div className="h-1 bg-black/30">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-3 space-y-1">
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{course.lessons?.length || 0} aulas</span>
                  {progress > 0 && <span>{progress}%</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
