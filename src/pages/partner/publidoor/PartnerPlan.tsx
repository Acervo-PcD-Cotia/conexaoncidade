// Plano & Renovação
import { motion } from 'framer-motion';
import { CreditCard, Check, MessageCircle, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';
import { usePartnerPublidoors } from '@/hooks/usePartnerPublidoor';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PLAN_BENEFITS = [
  'Vitrine digital em posições estratégicas',
  'Métricas detalhadas em tempo real',
  'Suporte dedicado via WhatsApp',
  'Edição ilimitada de conteúdo',
  'Badge "Conteúdo de Marca"',
];

const WHATSAPP_NUMBER = '5511999999999';

export default function PartnerPlan() {
  const { advertiser } = usePartnerAuth();
  const { data: publidoors = [] } = usePartnerPublidoors(advertiser?.id);
  
  const mainPublidoor = publidoors[0];
  const campaign = mainPublidoor?.campaign;
  
  const expirationDate = campaign?.ends_at ? parseISO(campaign.ends_at) : null;
  const daysRemaining = expirationDate ? differenceInDays(expirationDate, new Date()) : null;
  const isExpiring = daysRemaining !== null && daysRemaining <= 7;
  const isExpired = daysRemaining !== null && daysRemaining < 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Plano & Renovação</h1>
        <p className="text-muted-foreground">
          Gerencie sua assinatura e mantenha sua presença ativa
        </p>
      </div>

      {/* Current Plan Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl border ${
          isExpired 
            ? 'bg-destructive/10 border-destructive/30' 
            : isExpiring 
              ? 'bg-yellow-500/10 border-yellow-500/30'
              : 'bg-gradient-to-br from-primary/10 via-card to-card border-border'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${isExpired ? 'bg-destructive/20' : 'bg-primary/20'}`}>
                <CreditCard className={`h-6 w-6 ${isExpired ? 'text-destructive' : 'text-primary'}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Plano Presença Digital</h2>
                <p className="text-sm text-muted-foreground">
                  {isExpired ? 'Expirado' : isExpiring ? 'Expira em breve' : 'Ativo'}
                </p>
              </div>
            </div>
            
            {expirationDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Válido até: {format(expirationDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>
          
          {daysRemaining !== null && !isExpired && (
            <div className={`text-center p-4 rounded-xl ${isExpiring ? 'bg-yellow-500/20' : 'bg-primary/20'}`}>
              <p className={`text-3xl font-bold ${isExpiring ? 'text-yellow-500' : 'text-primary'}`}>
                {daysRemaining}
              </p>
              <p className="text-sm text-muted-foreground">dias restantes</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-card border border-border"
      >
        <h3 className="text-lg font-bold mb-4">O que está incluído</h3>
        <ul className="space-y-3">
          {PLAN_BENEFITS.map((benefit, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-500" />
              </div>
              <span className="text-muted-foreground">{benefit}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2"
      >
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Gostaria de renovar meu plano Publidoor Partner.`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 rounded-2xl bg-primary hover:bg-primary/90 transition-colors text-primary-foreground text-center"
        >
          <CreditCard className="h-8 w-8 mx-auto mb-3" />
          <h4 className="font-bold mb-1">Renovar Plano</h4>
          <p className="text-sm opacity-80">
            Mantenha sua presença ativa
          </p>
        </a>
        
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Gostaria de saber mais sobre upgrade do meu plano Publidoor Partner.`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors text-center"
        >
          <TrendingUp className="h-8 w-8 mx-auto mb-3 text-primary" />
          <h4 className="font-bold mb-1">Solicitar Upgrade</h4>
          <p className="text-sm text-muted-foreground">
            Amplie seu alcance
          </p>
        </a>
      </motion.div>

      {/* Support */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-muted/50 border border-border"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-green-500" />
            <div>
              <h4 className="font-bold">Precisa de ajuda?</h4>
              <p className="text-sm text-muted-foreground">
                Nossa equipe está disponível para te atender
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Preciso de ajuda com minha conta Publidoor Partner.`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Falar com Atendimento
            </a>
          </Button>
        </div>
      </motion.div>

      {/* Payment History Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl bg-card border border-border"
      >
        <h3 className="text-lg font-bold mb-4">Histórico de Pagamentos</h3>
        <div className="text-center py-8">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            O histórico de pagamentos estará disponível em breve.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
