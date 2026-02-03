import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import logoFull from "@/assets/logo-full.png";
import { LoginPanelAd } from '@/components/auth/LoginPanelAd';

const ADMIN_ROLES = ['super_admin', 'admin', 'editor', 'editor_chief', 'reporter', 'columnist', 'moderator', 'commercial', 'financial'];

// Redirecionamento específico por perfil
const ROLE_ROUTES: Record<string, string> = {
  super_admin: '/admin',
  admin: '/admin',
  editor_chief: '/admin',
  editor: '/admin/news',
  reporter: '/admin/news',
  columnist: '/admin/news',
  moderator: '/admin',
  commercial: '/admin/ads',
  financial: '/admin/financial',
};

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export default function Auth() {
  const { user, signIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    if (user) {
      // Verificar se o usuário tem papel administrativo e redirecionar
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data && ADMIN_ROLES.includes(data.role)) {
            // Redirecionar para rota específica do perfil
            const route = ROLE_ROUTES[data.role] || '/admin';
            navigate(route);
          } else {
            navigate('/');
          }
        });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = loginSchema.safeParse({
      email: loginEmail,
      password: loginPassword,
    });
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      let message = 'Erro ao fazer login';
      if (error.message.includes('Invalid login credentials')) {
        message = 'Email ou senha incorretos';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Por favor, confirme seu email antes de fazer login';
      }
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: message,
      });
    } else {
      toast({
        title: 'Bem-vindo!',
        description: 'Login realizado com sucesso',
      });
    }
    
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col lg:grid lg:grid-cols-[60%_40%]">
      {/* Coluna Esquerda - Dynamic Campaign Creative or Branding */}
      <div className="relative hidden lg:flex lg:border-r lg:border-border/30 overflow-hidden">
        {/* LoginPanelAd will render campaign creative if available */}
        <LoginPanelAd className="absolute inset-0" />
        
        {/* Fallback branding shown when no campaign is active (LoginPanelAd returns null) */}
        <div className="flex flex-col items-center justify-center w-full h-full py-12 px-6">
          <div className="flex flex-col items-center gap-6 max-w-md text-center">
            <img 
              src={logoFull} 
              alt="Conexão na Cidade" 
              className="h-20 lg:h-28 w-auto"
            />
            <div className="space-y-2">
              <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">
                Acesse sua conta
              </h1>
              <p className="text-muted-foreground text-base lg:text-lg">
                Painel Conexões
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header - shows when no left panel */}
      <div className="flex flex-col items-center justify-center py-12 px-6 lg:hidden">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <img 
            src={logoFull} 
            alt="Conexão na Cidade" 
            className="h-20 w-auto"
          />
          <div className="space-y-2">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Acesse sua conta
            </h1>
            <p className="text-muted-foreground text-base">
              Painel Conexões
            </p>
          </div>
        </div>
      </div>

      {/* Coluna Direita - Card de Login */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-background border border-border/50 shadow-lg rounded-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Campo Email */}
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-sm font-medium">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="pl-10 h-11"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            
            {/* Campo Senha */}
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            
            {/* Botão Entrar */}
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
            
            {/* Link Esqueceu Senha */}
            <div className="text-center">
              <Link 
                to="/reset-password" 
                className="text-sm text-primary hover:underline"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </form>
          
          {/* Separador e Texto Admin */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground text-center">
              Não tem uma conta?{' '}
              <span className="font-medium">
                Entre em contato com o administrador.
              </span>
            </p>
          </div>
          
          {/* Footer Copyright */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              © Conexão na Cidade - Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
