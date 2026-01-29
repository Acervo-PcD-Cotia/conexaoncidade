import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Target,
  TrendingUp,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useEnemSubmission } from "@/hooks/useEnem";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const COMPETENCY_NAMES = [
  { id: 1, name: "Norma Padrão", description: "Domínio da modalidade escrita formal da língua portuguesa" },
  { id: 2, name: "Compreensão do Tema", description: "Compreender a proposta e aplicar conceitos das áreas de conhecimento" },
  { id: 3, name: "Argumentação", description: "Selecionar, relacionar e organizar informações em defesa de um ponto de vista" },
  { id: 4, name: "Coesão e Coerência", description: "Demonstrar conhecimento dos mecanismos linguísticos necessários" },
  { id: 5, name: "Proposta de Intervenção", description: "Elaborar proposta de intervenção para o problema abordado" },
];

function getScoreColor(score: number, max: number = 200) {
  const percent = (score / max) * 100;
  if (percent >= 80) return "text-green-600";
  if (percent >= 50) return "text-amber-600";
  return "text-red-600";
}

function getScoreBackground(score: number, max: number = 200) {
  const percent = (score / max) * 100;
  if (percent >= 80) return "bg-green-500";
  if (percent >= 50) return "bg-amber-500";
  return "bg-red-500";
}

export default function EnemSubmissionDetail() {
  const { slug, submissionId } = useParams<{ slug: string; submissionId: string }>();
  const { data: submission, isLoading } = useEnemSubmission(submissionId || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Redação não encontrada</h1>
        <Button asChild>
          <Link to={`/admin/academy/enem/${slug}/minhas-redacoes`}>
            Voltar para Minhas Redações
          </Link>
        </Button>
      </div>
    );
  }

  const feedback = submission.feedback_corretora;
  const tutor = submission.feedback_tutor;

  const competencies = [
    { ...COMPETENCY_NAMES[0], score: submission.score_c1, feedback: feedback?.competency1 },
    { ...COMPETENCY_NAMES[1], score: submission.score_c2, feedback: feedback?.competency2 },
    { ...COMPETENCY_NAMES[2], score: submission.score_c3, feedback: feedback?.competency3 },
    { ...COMPETENCY_NAMES[3], score: submission.score_c4, feedback: feedback?.competency4 },
    { ...COMPETENCY_NAMES[4], score: submission.score_c5, feedback: feedback?.competency5 },
  ];

  return (
    <div className="container py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/admin/academy/enem/${slug}/minhas-redacoes`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Minhas Redações
          </Link>
        </Button>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">
              {format(new Date(submission.submitted_at), "dd/MM/yyyy", { locale: ptBR })}
            </Badge>
            <Badge variant="outline">{submission.word_count} palavras</Badge>
          </div>
          <h1 className="text-2xl font-bold">{submission.theme}</h1>
        </div>
      </div>

      {/* Score Overview */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="text-sm text-muted-foreground mb-1">Nota Final</div>
              <div
                className={cn(
                  "text-5xl font-bold",
                  getScoreColor(submission.score_total || 0, 1000)
                )}
              >
                {submission.score_total || 0}
              </div>
              <div className="text-sm text-muted-foreground">/1000</div>
            </div>

            <div className="flex-1 max-w-md">
              <div className="grid grid-cols-5 gap-2">
                {competencies.map((comp) => (
                  <div key={comp.id} className="text-center">
                    <div
                      className={cn(
                        "text-xl font-bold",
                        getScoreColor(comp.score || 0)
                      )}
                    >
                      {comp.score || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">C{comp.id}</div>
                    <Progress
                      value={((comp.score || 0) / 200) * 100}
                      className={cn("h-1 mt-1", `[&>div]:${getScoreBackground(comp.score || 0)}`)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {submission.diagnosis_level && (
              <Badge
                className={cn(
                  "text-base px-4 py-2",
                  submission.diagnosis_level === "avançado"
                    ? "bg-green-500"
                    : submission.diagnosis_level === "intermediário"
                    ? "bg-amber-500"
                    : "bg-red-500"
                )}
              >
                {submission.diagnosis_level.charAt(0).toUpperCase() +
                  submission.diagnosis_level.slice(1)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diagnosis Summary */}
      {feedback?.diagnosis && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                Ponto Forte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{feedback.diagnosis.strongPoint}</p>
            </CardContent>
          </Card>

          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                Ponto Fraco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{feedback.diagnosis.weakPoint}</p>
            </CardContent>
          </Card>

          <Card className="border-red-500/30 bg-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                <XCircle className="h-4 w-4" />
                Erro Recorrente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{feedback.diagnosis.recurringError}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* What Prevents Perfect Score */}
      {feedback?.whatPreventsPerfectScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              O que impede o 1000
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{feedback.whatPreventsPerfectScore}</p>
            {feedback.pointsLostWhere && feedback.pointsLostWhere.length > 0 && (
              <ul className="mt-4 space-y-2">
                {feedback.pointsLostWhere.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-red-500">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Competency Feedback */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Análise por Competência</h2>
        {competencies.map((comp) => (
          <Card key={comp.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Competência {comp.id}: {comp.name}
                  </CardTitle>
                  <CardDescription>{comp.description}</CardDescription>
                </div>
                <div className="text-right">
                  <div className={cn("text-2xl font-bold", getScoreColor(comp.score || 0))}>
                    {comp.score || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Nível {comp.feedback?.level || 0}/5
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {comp.feedback?.feedback && (
                <p className="text-sm">{comp.feedback.feedback}</p>
              )}

              {comp.feedback?.errors && comp.feedback.errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-600 mb-2">Erros Identificados:</h4>
                  <ul className="space-y-1">
                    {comp.feedback.errors.map((error, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {comp.feedback?.suggestions && comp.feedback.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-green-600 mb-2">Sugestões de Melhoria:</h4>
                  <ul className="space-y-1">
                    {comp.feedback.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Proposal Analysis */}
      {feedback?.proposalAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Análise da Proposta de Intervenção (A.A.M.F.D)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: "Agente", key: "hasAgent" },
                { label: "Ação", key: "hasAction" },
                { label: "Meio", key: "hasMeans" },
                { label: "Finalidade", key: "hasPurpose" },
                { label: "Detalhamento", key: "hasDetail" },
              ].map((item) => {
                const hasItem = feedback.proposalAnalysis[item.key as keyof typeof feedback.proposalAnalysis];
                return (
                  <div
                    key={item.key}
                    className={cn(
                      "text-center p-3 rounded-lg",
                      hasItem ? "bg-green-500/10" : "bg-red-500/10"
                    )}
                  >
                    {hasItem ? (
                      <CheckCircle className="h-6 w-6 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 mx-auto" />
                    )}
                    <div className="text-sm mt-1">{item.label}</div>
                  </div>
                );
              })}
            </div>

            {(feedback.proposalAnalysis.isGeneric || feedback.proposalAnalysis.isInviable) && (
              <div className="flex gap-2">
                {feedback.proposalAnalysis.isGeneric && (
                  <Badge variant="destructive">Proposta Genérica</Badge>
                )}
                {feedback.proposalAnalysis.isInviable && (
                  <Badge variant="destructive">Proposta Inviável</Badge>
                )}
              </div>
            )}

            {feedback.proposalAnalysis.feedback && (
              <p className="text-sm text-muted-foreground">
                {feedback.proposalAnalysis.feedback}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Tutor Feedback */}
      {tutor && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Orientação da IA Tutor
          </h2>

          {/* Weekly Focus */}
          {tutor.weeklyFocus && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">Foco desta Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{tutor.weeklyFocus.mainPoint}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {tutor.weeklyFocus.linkedToModule}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Targeted Exercise */}
          {tutor.targetedExercise && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{tutor.targetedExercise.title}</CardTitle>
                <CardDescription>
                  Tempo estimado: {tutor.targetedExercise.estimatedTime} •{" "}
                  Foco: {tutor.targetedExercise.focusArea}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{tutor.targetedExercise.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Guidance */}
          {tutor.guidance && (
            <div className="grid md:grid-cols-3 gap-4">
              {tutor.guidance.toKeep && tutor.guidance.toKeep.length > 0 && (
                <Card className="border-green-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-green-700">Manter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {tutor.guidance.toKeep.map((item, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {tutor.guidance.toStop && tutor.guidance.toStop.length > 0 && (
                <Card className="border-red-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-red-700">Parar de Fazer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {tutor.guidance.toStop.map((item, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {tutor.guidance.toAdjust && tutor.guidance.toAdjust.length > 0 && (
                <Card className="border-amber-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-amber-700">Ajustar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {tutor.guidance.toAdjust.map((item, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Original Essay */}
      <Card>
        <CardHeader>
          <CardTitle>Sua Redação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap font-mono text-sm bg-muted/50 p-4 rounded-lg">
            {submission.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
