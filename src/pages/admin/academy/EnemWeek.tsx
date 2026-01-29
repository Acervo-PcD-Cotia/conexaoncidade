import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Play,
  FileText,
  HelpCircle,
  PenTool,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useEnemModule,
  useEnemWeeks,
  useEnemLessons,
  useEnemProgress,
} from "@/hooks/useEnem";
import { cn } from "@/lib/utils";

const LESSON_TYPE_ICONS: Record<string, React.ElementType> = {
  video: Play,
  texto: FileText,
  exercicio: HelpCircle,
  redacao: PenTool,
};

const LESSON_TYPE_LABELS: Record<string, string> = {
  video: "Vídeo",
  texto: "Leitura",
  exercicio: "Exercício",
  redacao: "Redação",
};

export default function EnemWeek() {
  const { slug, weekNumber } = useParams<{ slug: string; weekNumber: string }>();
  const weekNum = parseInt(weekNumber || "1", 10);

  const { data: module, isLoading: loadingModule } = useEnemModule(slug || "");
  const { data: weeks, isLoading: loadingWeeks } = useEnemWeeks(module?.id || "");
  const week = weeks?.find((w) => w.week_number === weekNum);
  const { data: lessons, isLoading: loadingLessons } = useEnemLessons(week?.id || "");
  const { data: progress } = useEnemProgress();

  if (loadingModule || loadingWeeks || loadingLessons) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!module || !week) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Semana não encontrada</h1>
        <Button asChild>
          <Link to={`/admin/academy/enem/${slug}`}>Voltar para o Módulo</Link>
        </Button>
      </div>
    );
  }

  // Build progress map
  const progressMap = new Map(progress?.map((p) => [p.lesson_id, p]) || []);

  const completedCount = lessons?.filter(
    (l) => progressMap.get(l.id)?.status === "completed"
  ).length || 0;

  const totalDuration = lessons?.reduce((sum, l) => sum + (l.duration_minutes || 0), 0) || 0;

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/admin/academy/enem/${slug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para {module.title}
          </Link>
        </Button>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Semana {week.week_number}</Badge>
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              {totalDuration} min
            </Badge>
            {completedCount === lessons?.length && lessons?.length > 0 && (
              <Badge className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Concluída
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold">{week.title}</h1>
          <p className="text-muted-foreground mt-1">{week.description}</p>
        </div>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {completedCount} / {lessons?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Aulas concluídas</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {Math.round((completedCount / (lessons?.length || 1)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Progresso</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Conteúdo da Semana</h2>
        <div className="space-y-3">
          {lessons?.map((lesson, index) => {
            const lessonProgress = progressMap.get(lesson.id);
            const isCompleted = lessonProgress?.status === "completed";
            const Icon = LESSON_TYPE_ICONS[lesson.type] || FileText;

            return (
              <Card
                key={lesson.id}
                className={cn(
                  "transition-all hover:shadow-md",
                  isCompleted && "border-green-500/50"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          isCompleted
                            ? "bg-green-500 text-white"
                            : lesson.type === "redacao"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {index + 1}. {lesson.title}
                          {lesson.is_mandatory && !isCompleted && (
                            <Badge variant="outline" className="text-xs">
                              Obrigatória
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {LESSON_TYPE_LABELS[lesson.type]}
                          </Badge>
                          {lesson.duration_minutes > 0 && (
                            <span className="text-xs">
                              {lesson.duration_minutes} min
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>

                    <Button
                      asChild
                      variant={isCompleted ? "outline" : "default"}
                      size="sm"
                    >
                      <Link
                        to={`/admin/academy/enem/${slug}/semana/${weekNumber}/aula/${lesson.id}`}
                      >
                        {isCompleted ? "Revisar" : lesson.type === "redacao" ? "Escrever" : "Iniciar"}
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        {weekNum > 1 && (
          <Button variant="outline" asChild>
            <Link to={`/admin/academy/enem/${slug}/semana/${weekNum - 1}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Semana {weekNum - 1}
            </Link>
          </Button>
        )}
        {weeks && weekNum < weeks.length && (
          <Button variant="outline" asChild className="ml-auto">
            <Link to={`/admin/academy/enem/${slug}/semana/${weekNum + 1}`}>
              Semana {weekNum + 1}
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
