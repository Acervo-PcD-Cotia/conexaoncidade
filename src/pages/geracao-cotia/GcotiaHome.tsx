import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Map,
  Target,
  Trophy,
  Briefcase,
  ArrowRight,
  Flame,
  Star,
  TrendingUp,
  Medal,
} from "lucide-react";

const GC_SECTIONS = [
  {
    id: "trilhas",
    title: "Minhas Trilhas",
    description: "Continue seu aprendizado de onde parou",
    icon: Map,
    href: "/geracao-cotia/trilhas",
    color: "teal",
    progress: 65,
  },
  {
    id: "missoes",
    title: "Missões do Dia",
    description: "Complete desafios diários para ganhar pontos",
    icon: Target,
    href: "/geracao-cotia/missoes",
    color: "amber",
    badge: "3 pendentes",
  },
  {
    id: "ranking",
    title: "Ranking",
    description: "Veja sua posição no ranking geral",
    icon: Trophy,
    href: "/geracao-cotia/ranking",
    color: "purple",
    position: 12,
  },
  {
    id: "projetos",
    title: "Projetos",
    description: "Aplique o conhecimento em projetos reais",
    icon: Briefcase,
    href: "/geracao-cotia/projetos",
    color: "blue",
    badge: "2 em andamento",
  },
];

export default function GcotiaHome() {
  return (
    <div className="space-y-8 p-6">
      {/* Header com streak */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500/10 to-cyan-500/10 text-teal-600 dark:text-teal-400 mb-4">
          <Medal className="h-4 w-4" />
          <span className="text-sm font-medium">Geração Cotia</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Olá, Estudante! 👋</h1>
        <p className="text-muted-foreground">
          Continue sua jornada de aprendizado e conquiste novos conhecimentos.
        </p>

        {/* Streak Card */}
        <Card className="mt-6 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-200 dark:border-orange-800">
          <CardContent className="flex items-center justify-center gap-4 p-4">
            <div className="flex items-center gap-2">
              <Flame className="h-8 w-8 text-orange-500" />
              <div className="text-left">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">7 dias</div>
                <div className="text-xs text-muted-foreground">Sequência ativa</div>
              </div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-amber-500" />
              <div className="text-left">
                <div className="text-xl font-bold">1.250</div>
                <div className="text-xs text-muted-foreground">Pontos</div>
              </div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <div className="text-left">
                <div className="text-xl font-bold">#12</div>
                <div className="text-xs text-muted-foreground">Ranking</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de seções */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {GC_SECTIONS.map((section) => {
          const IconComponent = section.icon;
          
          return (
            <Card key={section.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-${section.color}-500/10`}>
                    <IconComponent className={`h-6 w-6 text-${section.color}-500`} />
                  </div>
                  {section.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {section.badge}
                    </Badge>
                  )}
                  {'position' in section && (
                    <Badge variant="outline" className="text-xs">
                      #{section.position}º lugar
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl mt-4">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
                
                {'progress' in section && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progresso</span>
                      <span>{section.progress}%</span>
                    </div>
                    <Progress value={section.progress} className="h-2" />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="group-hover:bg-primary/10 w-full justify-between">
                  <Link to={section.href}>
                    Acessar
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Próxima missão */}
      <Card className="max-w-4xl mx-auto border-2 border-dashed border-primary/30">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Missão do Momento</h3>
              <p className="text-sm text-muted-foreground">Complete a trilha de Jornalismo Digital</p>
            </div>
          </div>
          <div className="text-right">
            <Badge className="bg-primary">+50 pontos</Badge>
            <p className="text-xs text-muted-foreground mt-1">Expira em 2 dias</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
