import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AcademyLesson } from "@/types/academy";

interface AcademyLessonNavProps {
  previousLesson?: AcademyLesson | null;
  nextLesson?: AcademyLesson | null;
  className?: string;
}

export function AcademyLessonNav({ previousLesson, nextLesson, className }: AcademyLessonNavProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {previousLesson ? (
        <Button
          asChild
          variant="outline"
          className="flex-1 max-w-[250px] h-auto py-3 justify-start"
        >
          <Link to={`/admin/academy/aula/${previousLesson.id}`}>
            <ChevronLeft className="h-5 w-5 shrink-0 mr-2" />
            <div className="text-left truncate">
              <span className="text-xs text-muted-foreground block">Anterior</span>
              <span className="text-sm truncate">{previousLesson.title}</span>
            </div>
          </Link>
        </Button>
      ) : (
        <div className="flex-1 max-w-[250px]" />
      )}

      {nextLesson ? (
        <Button
          asChild
          variant="outline"
          className="flex-1 max-w-[250px] h-auto py-3 justify-end"
        >
          <Link to={`/admin/academy/aula/${nextLesson.id}`}>
            <div className="text-right truncate">
              <span className="text-xs text-muted-foreground block">Próxima</span>
              <span className="text-sm truncate">{nextLesson.title}</span>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 ml-2" />
          </Link>
        </Button>
      ) : (
        <div className="flex-1 max-w-[250px]" />
      )}
    </div>
  );
}
