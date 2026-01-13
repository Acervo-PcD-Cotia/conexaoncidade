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
  confirmPassword: z.string().min(1, "Confirme sua senha"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória"),
});

type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
};

export default function CommunityAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, resetPassword, signInWithGoogle } = useAuth();
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
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  // Clear errors when switching tabs
  useEffect(() => {
    setFieldErrors({});
  }, [activeTab]);

  // Process community access after user logs in - ALWAYS redirect to /comunidade
  useEffect(() => {
    const processCommunityAccess = async () => {
      if (!user || isProcessingAccess) return;
      
      // If user already has access, redirect immediately
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
      
      // ALWAYS redirect to community (CommunityHub handles unlock screen if needed)
      navigate("/comunidade");
    };
    
    if (user && !communityLoading) {
      processCommunityAccess();
    }
  }, [user, hasAccess, communityLoading, inviteCode, quizCompleted, navigate]);

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
      confirmPassword: registerConfirmPassword,
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

  const handleForgotPassword = async () => {
    const email = loginEmail.trim();
    
    if (!email) {
      setFieldErrors({ email: "Digite seu e-mail para recuperar a senha" });
      toast({
        variant: "destructive",
        title: "E-mail necessário",
        description: "Digite seu e-mail no campo acima para recuperar a senha.",
      });
      return;
    }

    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      setFieldErrors({ email: "Digite um e-mail válido" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await resetPassword(email);
      if (error) throw error;

      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar e-mail",
        description: "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // Redirect handled by OAuth flow
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao conectar com Google",
        description: "Tente novamente.",
      });
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

  const GoogleIcon = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

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

                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isSubmitting}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Entrando..." : "Entrar na Comunidade"}
                </Button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
                  </div>
                </div>

                {/* Google Login */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                >
                  <GoogleIcon />
                  <span className="ml-2">Continuar com Google</span>
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

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirmar senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite novamente"
                      value={registerConfirmPassword}
                      onChange={(e) => {
                        setRegisterConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                      }}
                      className={`pl-10 pr-10 ${fieldErrors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      required
                    />
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
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

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
                  </div>
                </div>

                {/* Google Login */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                >
                  <GoogleIcon />
                  <span className="ml-2">Continuar com Google</span>
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
