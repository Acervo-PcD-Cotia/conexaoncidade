import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/hooks/useCommunity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Heart, Ticket, Brain, Users, Loader2, CheckCircle, XCircle } from "lucide-react";
import { SuperQuiz } from "@/components/community/SuperQuiz";

type PageStep = "welcome" | "invite" | "quiz";

/**
 * CommunityUnlock page - Dedicated page for community onboarding
 */
export default function CommunityUnlock() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    hasAccess, 
    isLoading,
    validateInviteCode,
    isUsingInvite,
    completeQuiz,
    isCompletingQuiz
  } = useCommunity();
  
  const [step, setStep] = useState<PageStep>("welcome");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Redirect if user already has access
  if (!isLoading && hasAccess) {
    navigate("/comunidade");
    return null;
  }

  const handleInviteValidate = async () => {
    if (!inviteCode.trim()) {
      setInviteError("Digite um código de convite");
      return;
    }
    
    setInviteError(null);
    
    if (user) {
      try {
        await validateInviteCode(inviteCode);
        navigate("/comunidade");
      } catch {
        setInviteError("Código inválido ou já utilizado");
      }
    } else {
      navigate(`/auth-comunidade?invite=${encodeURIComponent(inviteCode)}`);
    }
  };

  const handleQuizComplete = async () => {
    if (user) {
      await completeQuiz();
      navigate("/comunidade");
    } else {
      navigate("/auth-comunidade?quiz_completed=true");
    }
  };

  const handleBack = () => {
    if (step === "welcome") {
      navigate("/");
    } else {
      setStep("welcome");
      setInviteCode("");
      setInviteError(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-lg mx-auto px-4 py-12">
        {step === "welcome" && (
          <div className="space-y-8 text-center">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-10 w-10 text-primary" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight">
                Bem-vindo(a) à Comunidade
              </h1>
              <p className="text-lg text-muted-foreground">
                Conexão na Cidade
              </p>
              <p className="text-muted-foreground max-w-md mx-auto">
                Este é um espaço exclusivo para leitores engajados. Participe de discussões, 
                ganhe pontos, desbloqueie recompensas e conecte-se com outros membros.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <Users className="h-6 w-6 text-secondary-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">Networking</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-secondary-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">Recompensas</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <Brain className="h-6 w-6 text-secondary-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">Desafios</span>
              </div>
            </div>

            {/* Access Options */}
            <div className="space-y-3 pt-4">
              <Button 
                onClick={() => setStep("invite")} 
                className="w-full h-14 text-base gap-3"
                variant="default"
              >
                <Ticket className="h-5 w-5" />
                Tenho um código de convite
              </Button>
              
              <Button 
                onClick={() => setStep("quiz")} 
                className="w-full h-14 text-base gap-3"
                variant="outline"
              >
                <Brain className="h-5 w-5" />
                Responder Super Quiz
              </Button>
            </div>

            {/* Info */}
            <p className="text-xs text-muted-foreground pt-4">
              Não tem convite? Complete o Super Quiz para ganhar acesso!
            </p>
          </div>
        )}

        {step === "invite" && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Ticket className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle>Código de Convite</CardTitle>
              <CardDescription>
                Digite o código que você recebeu de um membro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Ex: CONEXAO2024"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value.toUpperCase());
                    setInviteError(null);
                  }}
                  className="h-12 text-center text-lg font-mono uppercase"
                  disabled={isUsingInvite}
                />
                {inviteError && (
                  <div className="flex items-center gap-2 text-destructive text-sm justify-center">
                    <XCircle className="h-4 w-4" />
                    {inviteError}
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleInviteValidate} 
                className="w-full h-12"
                disabled={isUsingInvite || !inviteCode.trim()}
              >
                {isUsingInvite ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validando...
                  </>
                ) : (
                  "Validar código"
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => setStep("welcome")} 
                className="w-full"
                disabled={isUsingInvite}
              >
                Voltar
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "quiz" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Super Quiz</h2>
              <p className="text-muted-foreground">
                Responda corretamente para desbloquear seu acesso
              </p>
            </div>
            
            <SuperQuiz 
              onComplete={handleQuizComplete}
              isSubmitting={isCompletingQuiz}
            />
            
            <Button 
              variant="ghost" 
              onClick={() => setStep("welcome")} 
              className="w-full"
              disabled={isCompletingQuiz}
            >
              Voltar
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
