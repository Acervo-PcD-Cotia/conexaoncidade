import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Share2, 
  Users, 
  MessageSquare, 
  Vote, 
  Trophy,
  Sparkles,
  Gift,
  ArrowRight,
  Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/hooks/useCommunity";
import { UnlockProgress } from "@/components/community/UnlockProgress";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AccessibilityPanel } from "@/components/accessibility/AccessibilityPanel";

const benefits = [
  {
    icon: MessageSquare,
    title: "Participar de debates exclusivos",
    description: "Discuta pautas importantes com outros membros da comunidade",
  },
  {
    icon: Vote,
    title: "Opinar sobre pautas",
    description: "Vote em enquetes e ajude a definir a agenda do portal",
  },
  {
    icon: Users,
    title: "Fazer parte de grupos temáticos",
    description: "Conecte-se com pessoas que compartilham seus interesses",
  },
  {
    icon: Trophy,
    title: "Ganhar pontos e selos",
    description: "Seja reconhecido por suas contribuições à comunidade",
  },
];

export default function CommunityUnlock() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    hasAccess, 
    shareProgress, 
    sharesRemaining, 
    useInvite, 
    isUsingInvite,
    ensureMembership,
    isLoading 
  } = useCommunity();
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth?redirect=/comunidade/desbloquear");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (hasAccess) {
      navigate("/comunidade");
    }
  }, [hasAccess, navigate]);

  useEffect(() => {
    if (user) {
      ensureMembership();
    }
  }, [user]);

  const handleUseInvite = () => {
    if (inviteCode.trim()) {
      useInvite(inviteCode.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-12 flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </main>
        <Footer />
        <AccessibilityPanel />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Desbloqueie a Comunidade</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A Comunidade é um espaço exclusivo para leitores engajados. 
              Complete o desafio ou use um código de convite para entrar.
            </p>
          </div>

          {/* Progress Card */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Desafio de Desbloqueio
              </CardTitle>
              <CardDescription>
                Compartilhe 12 conteúdos do portal para desbloquear seu acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <UnlockProgress current={shareProgress} total={12} size="lg" />
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">
                  {sharesRemaining > 0 ? (
                    <>
                      Faltam apenas <span className="text-primary font-bold">{sharesRemaining}</span> compartilhamentos!
                    </>
                  ) : (
                    <span className="text-green-600">🎉 Você completou o desafio!</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Compartilhe notícias, projetos ou campanhas usando os botões de compartilhamento em cada página.
                </p>
              </div>

              <Button 
                onClick={() => navigate("/")} 
                variant="outline" 
                className="w-full"
              >
                Ver notícias para compartilhar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">ou</span>
            <Separator className="flex-1" />
          </div>

          {/* Invite Code Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Código de Convite
              </CardTitle>
              <CardDescription>
                Recebeu um convite de um membro? Digite o código abaixo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o código (ex: ABC123)"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="uppercase"
                  maxLength={10}
                />
                <Button 
                  onClick={handleUseInvite} 
                  disabled={!inviteCode.trim() || isUsingInvite}
                >
                  {isUsingInvite ? "Validando..." : "Usar Convite"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">
              <Sparkles className="inline h-5 w-5 mr-2 text-primary" />
              Benefícios da Comunidade
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <benefit.icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Founding Member Badge Info */}
          <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Gift className="h-8 w-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                    Selo "Membro Fundador"
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Complete o desafio de 12 compartilhamentos e ganhe o selo exclusivo 
                    de Membro Fundador, que ficará visível em seu perfil para sempre!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </main>
      <Footer />
      <AccessibilityPanel />
    </div>
  );
}
