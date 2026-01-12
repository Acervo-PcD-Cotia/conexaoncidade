import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/hooks/useCommunity";
import { useToast } from "@/hooks/use-toast";
import logoFull from "@/assets/logo-full.png";

// Validation schemas
const emailSchema = z.string()
  .min(1, "E-mail é obrigatório")
  .email("Digite um e-mail válido")
  .max(255, "E-mail muito longo");

const passwordSchema = z.string()
  .min(6, "A senha deve ter no mínimo 6 caracteres")
  .max(72, "Senha muito longa");

const registerSchema = z.object({
  name: z.string().max(100, "Nome muito longo").optional(),
  email: emailSchema,
  password: passwordSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória"),
});

type FieldErrors = {
  email?: string;
  password?: string;
  name?: string;
};

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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

  // Clear errors when switching tabs
  useEffect(() => {
    setFieldErrors({});
  }, [activeTab]);

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
    setFieldErrors({});

    // Validate with Zod
    const validation = loginSchema.safeParse({
      email: loginEmail.trim(),
      password: loginPassword,
    });

    if (!validation.success) {
      const errors: FieldErrors = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FieldErrors;
        if (field) {
          errors[field] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(loginEmail.trim(), loginPassword);
      toast({
        title: "Bem-vindo de volta!",
        description: "Entrando na comunidade...",
      });
      // Navigation handled by useEffect after user state updates
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";
      
      if (errorMessage.includes("Invalid login credentials")) {
        toast({
          variant: "destructive",
          title: "Credenciais inválidas",
          description: "E-mail ou senha incorretos. Verifique e tente novamente.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao entrar",
          description: "Ocorreu um erro. Tente novamente.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Validate with Zod
    const validation = registerSchema.safeParse({
      name: registerName.trim() || undefined,
      email: registerEmail.trim(),
      password: registerPassword,
    });

    if (!validation.success) {
      const errors: FieldErrors = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FieldErrors;
        if (field) {
          errors[field] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp(registerEmail.trim(), registerPassword, registerName.trim() || "");
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo à Comunidade Conexão na Cidade!",
      });
      // Navigation handled by useEffect after user state updates
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";
      
      // Handle email already registered
      if (
        errorMessage.includes("User already registered") ||
        errorMessage.includes("already been registered") ||
        errorMessage.includes("already exists") ||
        errorMessage.includes("already registered")
      ) {
        setFieldErrors({ email: "Este e-mail já está cadastrado. Tente fazer login." });
        toast({
          variant: "destructive",
          title: "E-mail já cadastrado",
          description: "Já existe uma conta com este e-mail. Use a aba 'Entrar' para fazer login.",
        });
      } else if (errorMessage.includes("Password should be at least")) {
        setFieldErrors({ password: "A senha deve ter no mínimo 6 caracteres." });
        toast({
          variant: "destructive",
          title: "Senha muito curta",
          description: "A senha deve ter no mínimo 6 caracteres.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: "Ocorreu um erro. Verifique os dados e tente novamente.",
        });
      }
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
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                      }}
                      className={`pl-10 ${fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      required
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-sm text-destructive">{fieldErrors.email}</p>
                  )}
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
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                      }}
                      className={`pl-10 pr-10 ${fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
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
                  {fieldErrors.password && (
                    <p className="text-sm text-destructive">{fieldErrors.password}</p>
                  )}
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
                    onChange={(e) => {
                      setRegisterName(e.target.value);
                      if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    className={fieldErrors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {fieldErrors.name && (
                    <p className="text-sm text-destructive">{fieldErrors.name}</p>
                  )}
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
                      onChange={(e) => {
                        setRegisterEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                      }}
                      className={`pl-10 ${fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      required
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-sm text-destructive">{fieldErrors.email}</p>
                  )}
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
                      onChange={(e) => {
                        setRegisterPassword(e.target.value);
                        if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                      }}
                      className={`pl-10 pr-10 ${fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
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
                  {fieldErrors.password && (
                    <p className="text-sm text-destructive">{fieldErrors.password}</p>
                  )}
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
