import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity, levelLabels } from "@/hooks/useCommunity";
import { Navigate, Link } from "react-router-dom";
import {
  Gift,
  Smartphone,
  Ticket,
  Star,
  Lock,
  ChevronRight,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface Benefit {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  pointsRequired: number;
  levelRequired: number;
  type: "feature" | "coupon" | "vip";
  href?: string;
  isAvailable: boolean;
}

export default function CommunityBenefits() {
  const { user, isLoading: authLoading } = useAuth();
  const { membership: member, isLoading } = useCommunity();

  if (authLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth-comunidade" replace />;
  }

  const currentLevel = member?.level || 1;
  const currentPoints = member?.points || 0;

  const benefits: Benefit[] = [
    {
      id: "phone-chooser",
      name: "Celular Ideal",
      description: "Descubra o smartphone perfeito para você com quiz personalizado",
      icon: Smartphone,
      pointsRequired: 0,
      levelRequired: 1,
      type: "feature",
      href: "/comunidade/beneficios/celular-ideal",
      isAvailable: true,
    },
    {
      id: "exclusive-content",
      name: "Conteúdo Exclusivo",
      description: "Acesso antecipado a notícias e matérias especiais",
      icon: Star,
      pointsRequired: 100,
      levelRequired: 2,
      type: "vip",
      isAvailable: currentLevel >= 2 && currentPoints >= 100,
    },
    {
      id: "local-coupons",
      name: "Cupons Locais",
      description: "Descontos exclusivos em comércios parceiros da cidade",
      icon: Ticket,
      pointsRequired: 200,
      levelRequired: 3,
      type: "coupon",
      isAvailable: currentLevel >= 3 && currentPoints >= 200,
    },
    {
      id: "vip-events",
      name: "Eventos VIP",
      description: "Convites para eventos exclusivos da comunidade",
      icon: Sparkles,
      pointsRequired: 500,
      levelRequired: 4,
      type: "vip",
      isAvailable: currentLevel >= 4 && currentPoints >= 500,
    },
    {
      id: "ambassador",
      name: "Embaixador",
      description: "Destaque no portal e benefícios especiais de embaixador",
      icon: Trophy,
      pointsRequired: 1000,
      levelRequired: 5,
      type: "vip",
      isAvailable: currentLevel >= 5 && currentPoints >= 1000,
    },
  ];

  const availableBenefits = benefits.filter((b) => b.isAvailable);
  const lockedBenefits = benefits.filter((b) => !b.isAvailable);

  return (
    <>
      <Helmet>
        <title>Benefícios | Comunidade Conexão na Cidade</title>
        <meta name="description" content="Desbloqueie benefícios exclusivos participando da comunidade" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6 text-pink-600" />
            Benefícios da Comunidade
          </h1>
          <p className="text-muted-foreground">
            Ganhe pontos participando e desbloqueie benefícios exclusivos
          </p>
        </div>

        {/* Current Status */}
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Seu nível atual</p>
                <h2 className="text-2xl font-bold">
                  {levelLabels[currentLevel] || `Nível ${currentLevel}`}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Pontos acumulados</p>
                <p className="text-2xl font-bold text-pink-600">{currentPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Benefits */}
        {availableBenefits.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-600" />
              Disponíveis para Você
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {availableBenefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <Card key={benefit.id} className="border-pink-200 dark:border-pink-900/30">
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-950/30">
                          <Icon className="h-6 w-6 text-pink-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {benefit.name}
                            <Badge className="bg-green-100 text-green-700">Disponível</Badge>
                          </CardTitle>
                          <CardDescription>{benefit.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {benefit.href ? (
                        <Link to={benefit.href}>
                          <Button className="w-full gap-2 bg-pink-600 hover:bg-pink-700">
                            Acessar
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      ) : (
                        <Button className="w-full gap-2 bg-pink-600 hover:bg-pink-700">
                          Resgatar Benefício
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Locked Benefits */}
        {lockedBenefits.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              Próximos Benefícios
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {lockedBenefits.map((benefit) => {
                const Icon = benefit.icon;
                const pointsProgress = Math.min((currentPoints / benefit.pointsRequired) * 100, 100);
                const pointsNeeded = Math.max(benefit.pointsRequired - currentPoints, 0);

                return (
                  <Card key={benefit.id} className="opacity-75">
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {benefit.name}
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </CardTitle>
                          <CardDescription>{benefit.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progresso</span>
                          <span>{currentPoints} / {benefit.pointsRequired} pts</span>
                        </div>
                        <Progress value={pointsProgress} className="h-2" />
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline">
                          Nível {benefit.levelRequired} necessário
                        </Badge>
                        {pointsNeeded > 0 && (
                          <Badge variant="outline">
                            Faltam {pointsNeeded} pts
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* How to Earn */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Como Desbloquear Benefícios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { action: "Participar de desafios", points: "Até 100 pts" },
                { action: "Completar o Censo PcD", points: "50 pts" },
                { action: "Interagir no feed", points: "5-10 pts" },
                { action: "Indicar novos membros", points: "100 pts" },
              ].map((item) => (
                <div
                  key={item.action}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                >
                  <span className="text-sm">{item.action}</span>
                  <Badge variant="secondary">{item.points}</Badge>
                </div>
              ))}
            </div>
            <Link to="/comunidade/como-ganhar-pontos">
              <Button variant="link" className="mt-4 gap-1 text-pink-600 p-0">
                Ver todas as formas de ganhar pontos
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
