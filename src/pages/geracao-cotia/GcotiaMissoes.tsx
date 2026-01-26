import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Clock, Star, CheckCircle2 } from "lucide-react";

const MOCK_MISSOES = [
  {
    id: "1",
    title: "Complete uma aula hoje",
    description: "Assista qualquer aula das suas trilhas ativas",
    points: 20,
    type: "daily",
    status: "pending",
    expiresIn: "12h",
  },
  {
    id: "2",
    title: "Leia 3 notícias",
    description: "Leia 3 notícias completas no portal",
    points: 15,
    type: "daily",
    status: "in_progress",
    progress: "2/3",
    expiresIn: "12h",
  },
  {
    id: "3",
    title: "Compartilhe um conteúdo",
    description: "Compartilhe qualquer conteúdo nas redes sociais",
    points: 10,
    type: "daily",
    status: "completed",
  },
  {
    id: "4",
    title: "Complete a trilha de SEO",
    description: "Finalize todas as aulas da trilha de SEO",
    points: 100,
    type: "weekly",
    status: "pending",
    expiresIn: "5 dias",
  },
];

export default function GcotiaMissoes() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <Target className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Missões</h1>
          <p className="text-muted-foreground">Complete desafios e ganhe pontos</p>
        </div>
      </div>

      {/* Missões Diárias */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Missões Diárias
        </h2>
        <div className="grid gap-3">
          {MOCK_MISSOES.filter(m => m.type === "daily").map((missao) => (
            <Card key={missao.id} className={missao.status === "completed" ? "opacity-60" : ""}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    missao.status === "completed" 
                      ? "bg-green-500/10" 
                      : "bg-amber-500/10"
                  }`}>
                    {missao.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Target className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{missao.title}</h3>
                    <p className="text-sm text-muted-foreground">{missao.description}</p>
                    {missao.progress && (
                      <p className="text-xs text-primary mt-1">Progresso: {missao.progress}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={missao.status === "completed" ? "secondary" : "default"}>
                    <Star className="h-3 w-3 mr-1" />
                    +{missao.points}
                  </Badge>
                  {missao.expiresIn && (
                    <p className="text-xs text-muted-foreground mt-1">Expira em {missao.expiresIn}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Missões Semanais */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Star className="h-5 w-5 text-muted-foreground" />
          Missões Semanais
        </h2>
        <div className="grid gap-3">
          {MOCK_MISSOES.filter(m => m.type === "weekly").map((missao) => (
            <Card key={missao.id} className="border-2 border-primary/20">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-purple-500/10">
                    <Target className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{missao.title}</h3>
                    <p className="text-sm text-muted-foreground">{missao.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-purple-500">
                    <Star className="h-3 w-3 mr-1" />
                    +{missao.points}
                  </Badge>
                  {missao.expiresIn && (
                    <p className="text-xs text-muted-foreground mt-1">Expira em {missao.expiresIn}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
