import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Briefcase, Users, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";

const MOCK_PROJETOS = [
  {
    id: "1",
    title: "Portal de Notícias Local",
    description: "Crie um mini portal com 5 notícias sobre sua cidade",
    status: "in_progress",
    progress: 60,
    deadline: "15/02/2026",
    participants: 3,
    tasks: { completed: 6, total: 10 },
  },
  {
    id: "2",
    title: "Podcast Cidadão",
    description: "Produza um episódio de podcast sobre um tema comunitário",
    status: "pending",
    progress: 0,
    deadline: "28/02/2026",
    participants: 2,
    tasks: { completed: 0, total: 8 },
  },
  {
    id: "3",
    title: "Campanha de Conscientização",
    description: "Crie materiais de comunicação para uma causa local",
    status: "completed",
    progress: 100,
    deadline: "01/01/2026",
    participants: 4,
    tasks: { completed: 12, total: 12 },
  },
];

export default function GcotiaProjetos() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600">Concluído</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">Em andamento</Badge>;
      default:
        return <Badge variant="outline">Não iniciado</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Briefcase className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Projetos</h1>
            <p className="text-muted-foreground">Aplique o conhecimento em projetos reais</p>
          </div>
        </div>
        <Button>
          Novo Projeto
        </Button>
      </div>

      <div className="grid gap-4">
        {MOCK_PROJETOS.map((projeto) => (
          <Card key={projeto.id} className={projeto.status === "completed" ? "opacity-75" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  {getStatusBadge(projeto.status)}
                  <CardTitle className="mt-2">{projeto.title}</CardTitle>
                  <CardDescription>{projeto.description}</CardDescription>
                </div>
                {projeto.status !== "completed" && (
                  <Button size="sm" variant="outline">
                    {projeto.status === "in_progress" ? "Continuar" : "Iniciar"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {projeto.status === "completed" && (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {projeto.participants} participantes
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Prazo: {projeto.deadline}
                  </span>
                  <span>
                    {projeto.tasks.completed}/{projeto.tasks.total} tarefas
                  </span>
                </div>
                {projeto.status !== "pending" && (
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progresso</span>
                      <span>{projeto.progress}%</span>
                    </div>
                    <Progress value={projeto.progress} className="h-2" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
