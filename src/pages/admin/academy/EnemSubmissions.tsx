import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEnemSubmissions, useRetryCorrection } from "@/hooks/useEnem";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_CONFIG = {
  pending: {
    label: "Aguardando",
    icon: Clock,
    color: "bg-amber-500/10 text-amber-600",
  },
  correcting: {
    label: "Corrigindo...",
    icon: Loader2,
    color: "bg-blue-500/10 text-blue-600",
  },
  completed: {
    label: "Corrigida",
    icon: CheckCircle,
    color: "bg-green-500/10 text-green-600",
  },
  error: {
    label: "Erro",
    icon: AlertCircle,
    color: "bg-red-500/10 text-red-600",
  },
};

export default function EnemSubmissions() {
  const { slug } = useParams<{ slug: string }>();
  const { data: submissions, isLoading } = useEnemSubmissions();
  const retryCorrection = useRetryCorrection();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/admin/academy/enem/${slug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o Módulo
          </Link>
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Minhas Redações</h1>
          <p className="text-muted-foreground mt-1">
            Histórico de redações enviadas e feedback de correção
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      {submissions && submissions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{submissions.length}</div>
              <div className="text-sm text-muted-foreground">Total de Redações</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">
                {submissions.filter((s) => s.correction_status === "completed").length}
              </div>
              <div className="text-sm text-muted-foreground">Corrigidas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">
                {submissions.filter((s) => s.score_total).length > 0
                  ? Math.round(
                      submissions
                        .filter((s) => s.score_total)
                        .reduce((sum, s) => sum + (s.score_total || 0), 0) /
                        submissions.filter((s) => s.score_total).length
                    )
                  : "-"}
              </div>
              <div className="text-sm text-muted-foreground">Média</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {submissions.filter((s) => s.score_total).length > 0
                  ? Math.max(...submissions.filter((s) => s.score_total).map((s) => s.score_total || 0))
                  : "-"}
              </div>
              <div className="text-sm text-muted-foreground">Melhor Nota</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submissions List */}
      {submissions && submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const status = STATUS_CONFIG[submission.correction_status] || STATUS_CONFIG.pending;
            const StatusIcon = status.icon;

            return (
              <Card key={submission.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-muted">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{submission.theme}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          {format(new Date(submission.submitted_at), "dd 'de' MMMM 'às' HH:mm", {
                            locale: ptBR,
                          })}
                          <span className="text-muted-foreground">•</span>
                          {submission.word_count} palavras
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {submission.score_total !== null && (
                        <div className="text-right">
                          <div
                            className={cn(
                              "text-2xl font-bold",
                              submission.score_total >= 800
                                ? "text-green-600"
                                : submission.score_total >= 500
                                ? "text-amber-600"
                                : "text-red-600"
                            )}
                          >
                            {submission.score_total}
                          </div>
                          <div className="text-xs text-muted-foreground">/1000</div>
                        </div>
                      )}

                      <Badge className={status.color}>
                        <StatusIcon
                          className={cn(
                            "h-3 w-3 mr-1",
                            submission.correction_status === "correcting" && "animate-spin"
                          )}
                        />
                        {status.label}
                      </Badge>

                      {submission.correction_status === "error" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryCorrection.mutate(submission.id)}
                          disabled={retryCorrection.isPending}
                        >
                          <RefreshCw
                            className={cn(
                              "h-4 w-4 mr-1",
                              retryCorrection.isPending && "animate-spin"
                            )}
                          />
                          Tentar Novamente
                        </Button>
                      )}

                      {submission.correction_status === "completed" && (
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/admin/academy/enem/${slug}/redacao/${submission.id}`}>
                            Ver Feedback
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {submission.correction_status === "completed" && submission.score_total !== null && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { label: "C1", score: submission.score_c1, name: "Norma" },
                        { label: "C2", score: submission.score_c2, name: "Tema" },
                        { label: "C3", score: submission.score_c3, name: "Argumento" },
                        { label: "C4", score: submission.score_c4, name: "Coesão" },
                        { label: "C5", score: submission.score_c5, name: "Proposta" },
                      ].map((comp) => (
                        <div
                          key={comp.label}
                          className="text-center p-2 rounded-lg bg-muted/50"
                        >
                          <div className="text-lg font-bold">{comp.score || 0}</div>
                          <div className="text-xs text-muted-foreground">{comp.name}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma redação enviada</h3>
            <p className="text-muted-foreground mb-4">
              Complete as semanas do curso e envie suas redações para correção.
            </p>
            <Button asChild>
              <Link to={`/admin/academy/enem/${slug}`}>Ir para o Curso</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
