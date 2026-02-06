import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { sanitizeHtml, sanitizeEmbed } from "@/hooks/useSanitizedHtml";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Play,
  FileText,
  Send,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  useEnemLesson,
  useEnemProgress,
  useCompleteLesson,
  useSubmitEssay,
} from "@/hooks/useEnem";
import { cn } from "@/lib/utils";

const MIN_WORDS = 400;
const MAX_WORDS = 600;

export default function EnemLesson() {
  const { slug, weekNumber, lessonId } = useParams<{
    slug: string;
    weekNumber: string;
    lessonId: string;
  }>();
  const navigate = useNavigate();

  const { data: lesson, isLoading } = useEnemLesson(lessonId || "");
  const { data: progress } = useEnemProgress();
  const completeLesson = useCompleteLesson();
  const submitEssay = useSubmitEssay();

  // Essay state
  const [essayContent, setEssayContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lessonProgress = progress?.find((p) => p.lesson_id === lessonId);
  const isCompleted = lessonProgress?.status === "completed";

  const wordCount = essayContent.trim().split(/\s+/).filter(Boolean).length;
  const isValidLength = wordCount >= MIN_WORDS && wordCount <= MAX_WORDS;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Aula não encontrada</h1>
        <Button asChild>
          <Link to={`/admin/academy/enem/${slug}/semana/${weekNumber}`}>
            Voltar para a Semana
          </Link>
        </Button>
      </div>
    );
  }

  const handleMarkComplete = async () => {
    try {
      await completeLesson.mutateAsync(lessonId!);
      toast.success("Aula marcada como concluída!");
    } catch (error) {
      toast.error("Erro ao marcar aula como concluída");
    }
  };

  const handleSubmitEssay = async () => {
    if (!isValidLength) {
      toast.error(`A redação deve ter entre ${MIN_WORDS} e ${MAX_WORDS} palavras`);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitEssay.mutateAsync({
        theme: lesson.title,
        content: essayContent,
        lesson_id: lessonId,
        week_id: lesson.week_id,
      });

      await completeLesson.mutateAsync(lessonId!);
      
      toast.success("Redação enviada para correção!");
      navigate(`/admin/academy/enem/${slug}/minhas-redacoes`);
    } catch (error) {
      toast.error("Erro ao enviar redação");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/admin/academy/enem/${slug}/semana/${weekNumber}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Semana {weekNumber}
          </Link>
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{lesson.type.toUpperCase()}</Badge>
              {lesson.duration_minutes > 0 && (
                <Badge variant="outline">{lesson.duration_minutes} min</Badge>
              )}
              {isCompleted && (
                <Badge className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Concluída
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-muted-foreground mt-1">{lesson.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {lesson.type === "video" && lesson.video_embed && (
        <Card>
          <CardContent className="pt-6">
            <div
              className="aspect-video rounded-lg overflow-hidden"
              dangerouslySetInnerHTML={{ __html: sanitizeEmbed(lesson.video_embed) }}
            />
          </CardContent>
        </Card>
      )}

      {lesson.type === "video" && lesson.video_url && !lesson.video_embed && (
        <Card>
          <CardContent className="pt-6">
            <video
              src={lesson.video_url}
              controls
              className="w-full aspect-video rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      {(lesson.type === "texto" || lesson.content_html) && lesson.content_html && (
        <Card>
          <CardContent className="pt-6">
            <div
              className="prose prose-neutral dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content_html) }}
            />
          </CardContent>
        </Card>
      )}

      {/* Essay Submission */}
      {lesson.type === "redacao" && !isCompleted && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Escreva sua Redação
            </CardTitle>
            <CardDescription>
              Escreva entre {MIN_WORDS} e {MAX_WORDS} palavras. Após enviar, sua
              redação será corrigida pela IA Corretora seguindo os critérios
              oficiais do ENEM.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Digite sua redação aqui..."
              value={essayContent}
              onChange={(e) => setEssayContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />

            {/* Word Counter */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span
                  className={cn(
                    "flex items-center gap-1",
                    wordCount < MIN_WORDS && "text-amber-600",
                    wordCount > MAX_WORDS && "text-red-600",
                    isValidLength && "text-green-600"
                  )}
                >
                  {wordCount < MIN_WORDS && (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {wordCount > MAX_WORDS && (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {isValidLength && <CheckCircle className="h-4 w-4" />}
                  {wordCount} palavras
                </span>
                <span className="text-muted-foreground">
                  Meta: {MIN_WORDS}-{MAX_WORDS}
                </span>
              </div>
              <Progress
                value={Math.min((wordCount / MAX_WORDS) * 100, 100)}
                className={cn(
                  "h-2",
                  wordCount < MIN_WORDS && "[&>div]:bg-amber-500",
                  wordCount > MAX_WORDS && "[&>div]:bg-red-500",
                  isValidLength && "[&>div]:bg-green-500"
                )}
              />
            </div>

            <Button
              onClick={handleSubmitEssay}
              disabled={!isValidLength || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar para Correção
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mark as Complete Button */}
      {lesson.type !== "redacao" && !isCompleted && (
        <div className="flex justify-center">
          <Button
            onClick={handleMarkComplete}
            disabled={completeLesson.isPending}
            size="lg"
            className="px-8"
          >
            {completeLesson.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como Concluída
              </>
            )}
          </Button>
        </div>
      )}

      {isCompleted && lesson.type === "redacao" && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">Redação Enviada!</h3>
            <p className="text-muted-foreground mt-1">
              Acesse "Minhas Redações" para ver o feedback da correção.
            </p>
            <Button asChild className="mt-4">
              <Link to={`/admin/academy/enem/${slug}/minhas-redacoes`}>
                Ver Minhas Redações
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
