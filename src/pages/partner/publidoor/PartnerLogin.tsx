// Login exclusivo para parceiros Publidoor
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Store, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function PartnerLogin() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { isPartner, isLoading: partnerLoading } = usePartnerAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notPartnerError, setNotPartnerError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated as partner
  useEffect(() => {
    if (user && !partnerLoading) {
      if (isPartner) {
        navigate('/partner/publidoor');
      } else {
        setNotPartnerError(true);
      }
    }
  }, [user, isPartner, partnerLoading, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);
    setNotPartnerError(false);

    try {
      const { error: signInError } = await signIn(data.email, data.password);
      
      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos');
        } else {
          setError(signInError.message);
        }
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-background p-8 lg:p-16 flex flex-col justify-center"
      >
        <div className="max-w-md mx-auto lg:mx-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
              <Store className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Publidoor</h1>
              <p className="text-sm text-muted-foreground">Partner</p>
            </div>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Sua Presença Digital Urbana
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Gerencie sua vitrine digital, acompanhe métricas e amplie seu alcance na comunidade.
          </p>

          <div className="space-y-4">
            {['Gestão simplificada da sua vitrine', 'Métricas em tempo real', 'Suporte dedicado'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:w-1/2 p-8 lg:p-16 flex items-center justify-center"
      >
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Acessar sua conta
            </h3>
            <p className="text-muted-foreground">
              Entre com suas credenciais de parceiro
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {notPartnerError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Esta conta não está vinculada a nenhum perfil de parceiro.{' '}
                <a 
                  href="https://wa.me/5511999999999" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  Entre em contato conosco
                </a>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={isSubmitting || partnerLoading}
            >
              {isSubmitting ? (
                'Entrando...'
              ) : (
                <>
                  Entrar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Não é parceiro ainda?{' '}
              <a 
                href="https://wa.me/5511999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Fale conosco
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
