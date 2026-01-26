import { Link } from "react-router-dom";
import { ChevronDown, Play, CheckCircle, Circle, Clock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { AcademyLesson } from "@/types/academy";

interface AcademyModuleAccordionProps {
  lessons: AcademyLesson[];
  lessonProgressMap: Map<string, number>;
}

interface Module {
  id: string;
  name: string;
  lessons: AcademyLesson[];
}

// Group lessons into modules based on sort_order ranges
function groupLessonsIntoModules(lessons: AcademyLesson[]): Module[] {
  if (lessons.length === 0) return [];

  // Simple grouping: every 3 lessons form a module
  const modules: Module[] = [];
  const moduleNames = ["Preparação", "Implantação", "Publicação e Distribuição"];
  
  let currentModuleIndex = 0;
  let currentLessons: AcademyLesson[] = [];

  lessons.forEach((lesson, index) => {
    currentLessons.push(lesson);
    
    // Every 3 lessons or at the end, create a module
    if ((index + 1) % 3 === 0 || index === lessons.length - 1) {
      modules.push({
        id: `module-${currentModuleIndex + 1}`,
        name: moduleNames[currentModuleIndex] || `Módulo ${currentModuleIndex + 1}`,
        lessons: currentLessons,
      });
      currentModuleIndex++;
      currentLessons = [];
    }
  });

  return modules;
}

export function AcademyModuleAccordion({ lessons, lessonProgressMap }: AcademyModuleAccordionProps) {
  const modules = groupLessonsIntoModules(lessons);

  if (modules.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhuma aula disponível neste curso</p>
      </div>
    );
  }

  // Find module with first unwatched lesson
  const defaultOpenModule = modules.find((module) =>
    module.lessons.some((lesson) => {
      const progress = lessonProgressMap.get(lesson.id) || 0;
      return progress < 100;
    })
  );

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpenModule?.id || modules[0]?.id}
      className="space-y-3"
    >
      {modules.map((module, moduleIndex) => {
        const completedLessons = module.lessons.filter((l) => {
          const progress = lessonProgressMap.get(l.id) || 0;
          return progress >= 100;
        }).length;
        const isModuleComplete = completedLessons === module.lessons.length;

        return (
          <AccordionItem
            key={module.id}
            value={module.id}
            className="border rounded-lg bg-card overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50 [&[data-state=open]>div>svg]:rotate-180">
              <div className="flex items-center gap-3 w-full">
                {/* Module number indicator */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                    isModuleComplete
                      ? "bg-green-500/10 text-green-500"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {isModuleComplete ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    `M${moduleIndex + 1}`
                  )}
                </div>

                <div className="flex-1 text-left">
                  <div className="font-medium">{module.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {completedLessons}/{module.lessons.length} aulas concluídas
                  </div>
                </div>

                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-0">
              <div className="divide-y">
                {module.lessons.map((lesson, lessonIndex) => {
                  const lessonProgress = lessonProgressMap.get(lesson.id) || 0;
                  const isCompleted = lessonProgress >= 100;
                  const isInProgress = lessonProgress > 0 && lessonProgress < 100;
                  const globalIndex = modules
                    .slice(0, moduleIndex)
                    .reduce((acc, m) => acc + m.lessons.length, 0) + lessonIndex + 1;

                  return (
                    <Link
                      key={lesson.id}
                      to={`/admin/academy/aula/${lesson.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors group"
                    >
                      {/* Status indicator */}
                      <div className="shrink-0">
                        {isCompleted ? (
                          <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        ) : isInProgress ? (
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center relative">
                            <Play className="h-4 w-4 fill-current" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
                            {globalIndex}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                          {lesson.title}
                        </h4>
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {lesson.description}
                          </p>
                        )}
                      </div>

                      {/* Duration */}
                      {lesson.duration_minutes > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                          <Clock className="h-4 w-4" />
                          <span>{lesson.duration_minutes} min</span>
                        </div>
                      )}

                      <Play className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
