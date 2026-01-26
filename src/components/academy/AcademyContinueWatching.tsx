import { Play, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ContinueWatchingItem } from "@/types/academy";

interface AcademyContinueWatchingProps {
  items: ContinueWatchingItem[];
  className?: string;
}

export function AcademyContinueWatching({ items, className }: AcademyContinueWatchingProps) {
  if (items.length === 0) return null;

  return (
    <section className={cn("mb-8", className)}>
      <h2 className="text-xl font-bold text-zinc-100 mb-4">Continue Assistindo</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map(({ lesson, course, progress }) => (
          <Link
            key={lesson.id}
            to={`/admin/academy/aula/${lesson.id}`}
            className="group relative block rounded-lg overflow-hidden bg-zinc-900 hover:bg-zinc-800 transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            <div className="flex gap-3 p-3">
              {/* Thumbnail */}
              <div className="relative w-32 shrink-0">
                <AspectRatio ratio={16 / 9}>
                  {course.cover_url ? (
                    <img
                      src={course.cover_url}
                      alt={course.title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 rounded flex items-center justify-center">
                      <Play className="h-6 w-6 text-primary/50" />
                    </div>
                  )}

                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Play className="h-4 w-4 text-primary-foreground fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800 rounded-b">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${progress.progress_percent}%` }}
                    />
                  </div>
                </AspectRatio>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="font-medium text-sm text-zinc-100 line-clamp-2 group-hover:text-primary transition-colors">
                  {lesson.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 truncate">{course.title}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                  <span>{progress.progress_percent}% concluído</span>
                  {lesson.duration_minutes > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.ceil(lesson.duration_minutes * (1 - progress.progress_percent / 100))} min restantes
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
