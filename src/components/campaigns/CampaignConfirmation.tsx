import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface CampaignConfirmationProps {
  businessName: string;
  wantsCommunity?: 'yes' | 'yes_support' | 'only_free';
}

export function CampaignConfirmation({ businessName, wantsCommunity }: CampaignConfirmationProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-8 pb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="h-10 w-10 text-primary" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-2">
              Obrigado!
            </h2>
            <p className="text-muted-foreground mb-6">
              Suas informações foram recebidas com sucesso.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Próximos passos para {businessName}:
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  Nosso time analisará suas informações
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  Verificaremos seu perfil no Google Maps
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  Realizaremos as correções e melhorias autorizadas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  Você receberá atualizações por email ou WhatsApp
                </li>
              </ul>
            </div>

            {(wantsCommunity === 'yes' || wantsCommunity === 'yes_support') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6 p-4 border border-primary/20 bg-primary/5 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Comunidade Conexão na Cidade</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Você demonstrou interesse em participar da nossa comunidade! 
                  Em breve entraremos em contato com mais informações.
                </p>
              </motion.div>
            )}

            <div className="space-y-3">
              <Link to="/comunidade/desbloqueio" className="block">
                <Button className="w-full" size="lg">
                  <Users className="mr-2 h-4 w-4" />
                  Acessar a Comunidade
                </Button>
              </Link>

              <Link to="/" className="block">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Voltar ao Portal
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Em caso de dúvidas, entre em contato pelo WhatsApp ou email informado em nosso site.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
