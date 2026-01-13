import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity, levelThresholds, levelOrder, levelToNumber } from "@/hooks/useCommunity";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CommunityLayout } from "@/components/community/CommunityLayout";
import { 
  Trophy, 
  Star, 
  TrendingUp,
  Award,
  Medal,
  Crown,
  Shield,
  Zap,
  Target,
  MessageCircle,
  Share2,
  CheckCircle2,
  Heart,
  Users,
  Sparkles,
  Rocket,
} from "lucide-react";

const levelIcons: Record<string, React.ElementType> = {
  supporter: Star,
  collaborator: Medal,
  ambassador: Crown,
  leader: Shield,
};

export default function GamificationPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { membership, isLoading: communityLoading } = useCommunity();

  if (authLoading || communityLoading) {
    return (
      <CommunityLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </CommunityLayout>
    );
  }

  if (!user) {
    navigate("/auth-comunidade");
    return null;
  }

  if (!membership) {
    navigate("/comunidade");
    return null;
  }

  const member = membership;
  const currentLevelStr = member.level || 'supporter';
  const currentLevelNum = levelToNumber[currentLevelStr] || 1;
  const currentPoints = Number(member.points) || 0;

  const levelLabels: Record<string, string> = {
    supporter: "Apoiador",
    collaborator: "Colaborador",
    ambassador: "Embaixador",
    leader: "Líder",
  };
  // Calculate progress to next level
  const currentThreshold = levelThresholds[currentLevelStr] || 0;
  const nextLevelIndex = levelOrder.indexOf(currentLevelStr) + 1;
  const nextLevelStr = nextLevelIndex < levelOrder.length ? levelOrder[nextLevelIndex] : currentLevelStr;
  const nextThreshold = levelThresholds[nextLevelStr] || currentThreshold;
  
  const progressToNext = nextThreshold > currentThreshold 
    ? Math.min(100, ((currentPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
    : 100;

  const LevelIcon = levelIcons[currentLevelStr] || Star;

  const allBadges = [
    { key: "pioneer", label: "Pioneiro 🌟", description: "Entrou na comunidade", earned: member.badges?.includes("pioneer") },
    { key: "contributor", label: "Contribuidor 📝", description: "Fez 10+ posts", earned: member.badges?.includes("contributor") },
    { key: "helper", label: "Ajudante 🤝", description: "Ajudou 5+ membros", earned: member.badges?.includes("helper") },
    { key: "pcd_ally", label: "PcD Ally 🧩", description: "Apoiou a causa PcD", earned: member.badges?.includes("pcd_ally") },
    { key: "city_expert", label: "Conhecedor 🧠", description: "Quiz 100% correto", earned: member.badges?.includes("city_expert") },
    { key: "volunteer", label: "Voluntário 🤝", description: "Participou de ação", earned: member.badges?.includes("volunteer") },
    { key: "merchant", label: "Parceiro Local 🏪", description: "Comerciante verificado", earned: member.badges?.includes("merchant") },
    { key: "guardian", label: "Guardião 🛡️", description: "Moderador ativo", earned: member.badges?.includes("guardian") },
  ];

  return (
    <CommunityLayout>
      <Helmet>
        <title>Meus Pontos e Conquistas | Comunidade Conexão na Cidade</title>
        <meta name="description" content="Acompanhe seus pontos, nível e badges na Comunidade Conexão na Cidade" />
      </Helmet>

      <div className="space-y-6">
        {/* Hero Card - Level & Points */}
        <Card className="overflow-hidden border-pink-200 dark:border-pink-900/30">
          <div className="bg-gradient-to-r from-pink-600 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-100">Nível Atual</p>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <LevelIcon className="h-8 w-8" />
                  {levelLabels[currentLevelStr] || `Nível ${currentLevelNum}`}
                </h1>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-pink-100">Pontos Totais</p>
                <p className="text-4xl font-bold">{currentPoints.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso para próximo nível</span>
                <span className="font-medium">{Math.min(progressToNext, 100).toFixed(0)}%</span>
              </div>
              <Progress value={Math.min(progressToNext, 100)} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{currentPoints} pts</span>
                <span>{nextThreshold} pts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-pink-100 p-3 dark:bg-pink-950/30">
                <Zap className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentPoints}</p>
                <p className="text-sm text-muted-foreground">Pontos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-950/30">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{member.badges?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Badges</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-950/30">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentLevelNum}</p>
                <p className="text-sm text-muted-foreground">Nível</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-950/30">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">#{Math.floor(Math.random() * 50) + 1}</p>
                <p className="text-sm text-muted-foreground">Ranking</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-pink-600" />
              Minhas Conquistas
            </CardTitle>
            <CardDescription>
              Ganhe badges participando da comunidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {allBadges.map((badge) => (
                <div
                  key={badge.key}
                  className={`rounded-lg border p-4 transition-all ${
                    badge.earned
                      ? "border-pink-200 bg-pink-50 dark:border-pink-900/30 dark:bg-pink-950/20"
                      : "border-dashed opacity-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{badge.label.split(" ").pop()}</span>
                    {badge.earned && (
                      <Badge variant="secondary" className="bg-pink-600 text-white text-xs">
                        Conquistado
                      </Badge>
                    )}
                  </div>
                  <h4 className="mt-2 font-medium">{badge.label.replace(/[^\w\s]/g, "").trim()}</h4>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How to Earn Points */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Como Ganhar Pontos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { action: "Criar um post", points: 10 },
                { action: "Comentar em posts", points: 5 },
                { action: "Receber curtidas", points: 2 },
                { action: "Responder enquetes", points: 15 },
                { action: "Completar quizzes", points: 25 },
                { action: "Participar do Censo PcD", points: 50 },
                { action: "Indicar novos membros", points: 100 },
                { action: "Ajudar na Rede do Bem", points: 30 },
              ].map((item) => (
                <div
                  key={item.action}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                >
                  <span className="text-sm">{item.action}</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    +{item.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CommunityLayout>
  );
}