import { Play, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";
import type { AcademyCourse } from "@/types/academy";

interface AcademyCourseCardProps {
  course: AcademyCourse;
  progress?: number;
  className?: string;
}

export function AcademyCourseCard({ course, progress = 0, className }: AcademyCourseCardProps) {
  const isCompleted = progress >= 100;

  return (
    <Link
      to={`/admin/academy/curso/${course.slug}`}
      className={cn(
        "group relative block rounded-lg overflow-hidden transition-all duration-300",
        "bg-zinc-900 hover:bg-zinc-800 hover:scale-105 hover:shadow-xl hover:shadow-primary/10",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        className
      )}
    >
      {/* Cover Image */}
      <AspectRatio ratio={16 / 9}>
        {course.cover_url ? (
          <img
            src={course.cover_url}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
            <Play className="h-12 w-12 text-primary/50" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Play className="h-6 w-6 text-primary-foreground fill-current ml-1" />
          </div>
        </div>

        {/* Completed Badge */}
        {isCompleted && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Concluído
          </div>
        )}

        {/* Progress Bar */}
        {progress > 0 && progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </AspectRatio>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-zinc-100 line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          {course.instructor_name && (
            <span className="truncate">{course.instructor_name}</span>
          )}
          {course.duration_minutes > 0 && (
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3" />
              {course.duration_minutes} min
            </span>
          )}
        </div>

        {/* Progress indicator */}
        {progress > 0 && progress < 100 && (
          <div className="mt-2">
            <Progress value={progress} className="h-1" />
            <p className="text-xs text-zinc-500 mt-1">{progress}% concluído</p>
          </div>
        )}
      </div>
    </Link>
  );
}
