import { useState } from "react";
import { Link } from "react-router-dom";
import {
  PenTool,
  BookOpen,
  Globe,
  Calculator,
  FlaskConical,
  ArrowRight,
  Lock,
  CheckCircle,
  Loader2,
  Trophy,
  Target,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEnemModules, useStudentStats } from "@/hooks/useEnem";

const ICON_MAP: Record<string, React.ElementType> = {
  PenTool,
  BookOpen,
  Globe,
  Calculator,
  FlaskConical,
};

export default function AcademyEnem() {
  const { data: modules, isLoading } = useEnemModules();
  const { data: stats } = useStudentStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const redacaoModule = modules?.find((m) => m.slug === "redacao-nota-1000");
  const otherModules = modules?.filter((m) => m.slug !== "redacao-nota-1000") || [];

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">ENEM 2026</h1>
        <p className="text-muted-foreground">
          Formação estratégica completa para o Exame Nacional do Ensino Médio
        </p>
      </div>

      {/* Stats Card (if user has submissions) */}
      {stats && stats.totalSubmissions > 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.totalSubmissions}</div>
                <div className="text-sm text-muted-foreground">Redações</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.averageScore}</div>
                <div className="text-sm text-muted-foreground">Média</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.bestScore}</div>
                <div className="text-sm text-muted-foreground">Melhor Nota</div>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {stats.currentLevel === "avançado" && <Trophy className="h-4 w-4 mr-1" />}
                  {stats.currentLevel.charAt(0).toUpperCase() + stats.currentLevel.slice(1)}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">Nível</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Redação Nota 1000 - Featured */}
      {redacaoModule && (
        <Card className="border-2 border-primary/50 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <PenTool className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{redacaoModule.title}</CardTitle>
                <CardDescription className="text-base">
                  {redacaoModule.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Target className="h-3 w-3 mr-1" />
                  10 Semanas
                </Badge>
                <Badge variant="secondary">IA Corretora</Badge>
                <Badge variant="secondary">IA Tutor</Badge>
                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              </div>
              <Button asChild size="lg">
                <Link to={`/admin/academy/enem/${redacaoModule.slug}`}>
                  Acessar Curso
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Modules - Coming Soon */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Outros Módulos</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {otherModules.map((module) => {
            const Icon = ICON_MAP[module.icon] || BookOpen;
            return (
              <Card key={module.id} className="opacity-60">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{module.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="gap-1">
                      <Lock className="h-3 w-3" />
                      Em breve
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
