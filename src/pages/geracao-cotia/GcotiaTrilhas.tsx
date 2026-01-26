import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Map, BookOpen, CheckCircle, Clock, ArrowRight } from "lucide-react";

const MOCK_TRILHAS = [
  {
    id: "1",
    title: "Jornalismo Digital",
    description: "Aprenda os fundamentos do jornalismo na era digital",
    progress: 65,
    lessons: 12,
    completed: 8,
    duration: "4h 30min",
    category: "Fundamentos",
  },
  {
    id: "2",
    title: "SEO para Notícias",
    description: "Otimize seu conteúdo para mecanismos de busca",
    progress: 30,
    lessons: 8,
    completed: 2,
    duration: "2h 15min",
    category: "Avançado",
  },
  {
    id: "3",
    title: "Redes Sociais para Jornalistas",
    description: "Domine as estratégias de distribuição em redes sociais",
    progress: 0,
    lessons: 10,
    completed: 0,
    duration: "3h",
    category: "Distribuição",
  },
];

export default function GcotiaTrilhas() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-teal-500/10">
          <Map className="h-5 w-5 text-teal-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Trilhas de Aprendizado</h1>
          <p className="text-muted-foreground">Continue de onde parou</p>
        </div>
      </div>

      <div className="grid gap-4">
        {MOCK_TRILHAS.map((trilha) => (
          <Card key={trilha.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">{trilha.category}</Badge>
                  <CardTitle>{trilha.title}</CardTitle>
                  <CardDescription>{trilha.description}</CardDescription>
                </div>
                <Button size="sm">
                  {trilha.progress > 0 ? "Continuar" : "Começar"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {trilha.lessons} aulas
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {trilha.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {trilha.completed} concluídas
                    </span>
                  </div>
                  <span className="font-medium">{trilha.progress}%</span>
                </div>
                <Progress value={trilha.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
