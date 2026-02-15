import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Lock,
  CheckCircle,
  Play,
  FileText,
  HelpCircle,
  PenTool,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEnemModule, useEnemWeeks, useEnemWeeklyProgress } from "@/hooks/useEnem";
import { cn } from "@/lib/utils";

const LESSON_TYPE_ICONS: Record<string, React.ElementType> = {
  video: Play,
  texto: FileText,
  exercicio: HelpCircle,
  redacao: PenTool,
};

export default function EnemModule() {
  const { slug } = useParams<{ slug: string }>();
  const { data: module, isLoading: loadingModule } = useEnemModule(slug || "");
  const { data: weeks, isLoading: loadingWeeks } = useEnemWeeks(module?.id || "");
  const { data: weeklyProgress } = useEnemWeeklyProgress(module?.id);

  if (loadingModule || loadingWeeks) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Módulo não encontrado</h1>
        <Button asChild>
          <Link to="/spah/painel/academy/enem">Voltar para ENEM 2026</Link>
        </Button>
      </div>
    );
  }

  // Build progress map
  const progressMap = new Map(
    weeklyProgress?.map((p) => [p.week_id, p]) || []
  );

  // Determine which weeks are unlocked
  const getWeekStatus = (weekNumber: number) => {
    if (weekNumber === 1) return "available";
    
    // Check if previous week is completed
    const prevWeek = weeks?.find((w) => w.week_number === weekNumber - 1);
    if (prevWeek) {
      const prevProgress = progressMap.get(prevWeek.id);
      if (prevProgress?.status === "completed") return "available";
    }
    
    return "locked";
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/spah/painel/academy/enem">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>

        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-primary/10">
            <PenTool className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{module.title}</h1>
            <p className="text-muted-foreground">{module.description}</p>
          </div>
        </div>
      </div>

      {/* Weeks Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Semanas de Estudo</h2>
        <div className="grid gap-4">
          {weeks?.map((week) => {
            const status = getWeekStatus(week.week_number);
            const progress = progressMap.get(week.id);
            const isLocked = status === "locked";
            const isCompleted = progress?.status === "completed";

            return (
              <Card
                key={week.id}
                className={cn(
                  "transition-all",
                  isLocked && "opacity-60",
                  isCompleted && "border-green-500/50 bg-green-500/5"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isLocked
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary text-primary-foreground"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : isLocked ? (
                          <Lock className="h-5 w-5" />
                        ) : (
                          week.week_number
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Semana {week.week_number}: {week.title}
                        </CardTitle>
                        <CardDescription>{week.description}</CardDescription>
                      </div>
                    </div>

                    {!isLocked && (
                      <Button asChild variant={isCompleted ? "outline" : "default"}>
                        <Link to={`/spah/painel/academy/enem/${slug}/semana/${week.week_number}`}>
                          {isCompleted ? "Revisar" : "Começar"}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardHeader>

                {progress && progress.lessons_total > 0 && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {progress.lessons_completed} de {progress.lessons_total} aulas
                        </span>
                        <span className="font-medium">
                          {Math.round((progress.lessons_completed / progress.lessons_total) * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={(progress.lessons_completed / progress.lessons_total) * 100}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
