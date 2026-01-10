import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/hooks/useCommunity";
import { useToast } from "@/hooks/use-toast";
import logoFull from "@/assets/logo-full.png";

export default function CommunityAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp } = useAuth();
  const { 
    hasAccess, 
    isLoading: communityLoading,
    processInviteAfterLogin,
    processQuizAfterLogin
  } = useCommunity();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingAccess, setIsProcessingAccess] = useState(false);

  // Get onboarding params from URL
  const inviteCode = searchParams.get("invite");
  const quizCompleted = searchParams.get("quiz_completed") === "true";

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // Process community access after user logs in
  useEffect(() => {
    const processCommunityAccess = async () => {
      if (!user || isProcessingAccess) return;
      
      // If user already has access, redirect
      if (hasAccess) {
        navigate("/comunidade");
        return;
      }
      
      // Check if there's onboarding to process
      if (inviteCode || quizCompleted) {
        setIsProcessingAccess(true);
        try {
          if (inviteCode) {
            await processInviteAfterLogin(inviteCode);
          } else if (quizCompleted) {
            await processQuizAfterLogin();
          }
          navigate("/comunidade");
        } catch (error) {
          console.error("Error processing community access:", error);
          toast({
            variant: "destructive",
            title: "Erro",
            description: error instanceof Error ? error.message : "Erro ao processar acesso",
          });
        } finally {
          setIsProcessingAccess(false);
        }
      }
    };
    
    if (user && !communityLoading) {
      processCommunityAccess();
    }
  }, [user, hasAccess, communityLoading, inviteCode, quizCompleted]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setIsSubmitting(true);
    try {
      await signIn(loginEmail, loginPassword);
      toast({
        title: "Bem-vindo de volta!",
        description: "Entrando na comunidade...",
      });
      // Navigation handled by useEffect after user state updates
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: error instanceof Error ? error.message : "Verifique suas credenciais",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEmail || !registerPassword) return;

    setIsSubmitting(true);
    try {
      await signUp(registerEmail, registerPassword, registerName || "");
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo à Comunidade Conexão na Cidade!",
      });
      // Navigation handled by useEffect after user state updates
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading if processing access
  if (isProcessingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Liberando seu acesso...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={logoFull}
            alt="Conexão na Cidade"
            className="h-12 mx-auto mb-6"
          />
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            Área Exclusiva da Comunidade
          </h1>
          <p className="text-muted-foreground text-sm">
            Entre ou crie sua conta para participar dos debates, grupos e
            benefícios exclusivos.
          </p>
          
          {/* Show indicator if user completed quiz or has invite */}
          {(inviteCode || quizCompleted) && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg text-sm">
              <span>✓</span>
              <span>
                {inviteCode ? "Código de convite validado!" : "Quiz completado!"}
              </span>
            </div>
          )}
        </div>

        {/* Auth Card */}
        <div className="bg-card border rounded-xl p-6 shadow-lg">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Entrando..." : "Entrar na Comunidade"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nome completo</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Seu nome"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="pl-10 pr-10"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Criando conta..." : "Criar conta e entrar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar ao portal
          </button>
        </div>
      </motion.div>
    </div>
  );
}
