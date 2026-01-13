import { MapPin, Search, TrendingUp, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface CampaignEditorialSectionProps {
  onStartQuiz: () => void;
}

export function CampaignEditorialSection({ onStartQuiz }: CampaignEditorialSectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">Campanha Conexão na Cidade</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Divulgue seu Negócio no <span className="text-primary">Google Maps</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Aumente sua visibilidade local, apareça nas buscas e atraia mais clientes — gratuito para membros da comunidade.
          </p>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              size="lg" 
              onClick={onStartQuiz}
              className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Quero aparecer no Google Maps
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-center mb-12">
                Por que seu negócio pode estar <span className="text-destructive">invisível</span>?
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="font-semibold mb-2">Perfil Incompleto</h3>
                  <p className="text-muted-foreground text-sm">
                    Falta de descrição, categoria errada ou informações desatualizadas prejudicam seu posicionamento.
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="font-semibold mb-2">Fotos Desatualizadas</h3>
                  <p className="text-muted-foreground text-sm">
                    Perfis sem fotos ou com imagens antigas recebem menos cliques e visitas.
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="font-semibold mb-2">Avaliações Ignoradas</h3>
                  <p className="text-muted-foreground text-sm">
                    Não responder avaliações sinaliza ao Google que o negócio está inativo.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-center mb-4">
                Pequenos ajustes, <span className="text-primary">grandes resultados</span>
              </h2>
              <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                O Conexão na Cidade pode ajudar você a corrigir sua presença no Google Maps gratuitamente.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  'Mais visitas físicas ao seu estabelecimento',
                  'Aumento de ligações e mensagens de clientes',
                  'Melhor posicionamento nas buscas locais',
                  'Destaque frente aos concorrentes da região',
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-4 bg-card rounded-lg border"
                  >
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-12">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    onClick={onStartQuiz}
                    className="text-lg px-8 py-6 rounded-full"
                  >
                    Fazer diagnóstico gratuito
                  </Button>
                </motion.div>
                <p className="text-sm text-muted-foreground mt-4">
                  Sem compromisso • Resposta em 2 minutos
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
