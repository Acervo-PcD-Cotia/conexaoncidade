import { motion } from "framer-motion";
import { 
  Gift, 
  Eye, 
  BadgeCheck, 
  Wrench, 
  Radio, 
  Building2,
  Lightbulb
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const partnerBenefits = [
  { icon: Eye, text: "Visibilidade no Portal Conexão" },
  { icon: BadgeCheck, text: "Selo de parceiro verificado" },
  { icon: Wrench, text: "Ferramentas digitais premium" },
  { icon: Radio, text: "Web Rádio e/ou Web TV inclusas" },
  { icon: Building2, text: "Infraestrutura profissional sem custo extra" },
];

export function PartnerExplanation() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="max-w-4xl mx-auto overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-orange-500/5">
        <CardContent className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left side - Title and explanation */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
                  <Gift className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  💼 Por que isso é <span className="text-primary">GRÁTIS</span>?
                </h2>
              </div>

              <p className="text-lg text-muted-foreground mb-6">
                Porque faz parte do <strong className="text-foreground">Plano Parceiro Conexão</strong>.
              </p>

              <p className="text-muted-foreground mb-6">
                Ao se tornar parceiro, você ganha acesso a um ecossistema completo de ferramentas 
                e benefícios que impulsionam seu negócio ou projeto.
              </p>

              {/* Benefits list */}
              <div className="space-y-3">
                {partnerBenefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="p-1.5 rounded-full bg-primary/10">
                      <benefit.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right side - Highlight box */}
            <div className="w-full md:w-80 shrink-0">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-orange-500/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">Importante</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong className="text-foreground">Você não paga pela rádio ou TV.</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Você ativa como benefício do ecossistema Conexão. É um diferencial exclusivo 
                  para quem faz parte da nossa rede de parceiros.
                </p>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground mb-1">Valor estimado de mercado</p>
                <p className="text-lg font-bold line-through text-muted-foreground">R$ 299/mês</p>
                <p className="text-2xl font-bold text-primary">GRÁTIS</p>
                <p className="text-xs text-muted-foreground">para Parceiros Conexão</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
