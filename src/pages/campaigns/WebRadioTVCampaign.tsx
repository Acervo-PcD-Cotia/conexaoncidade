import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { RadioTVHero } from "@/components/campaigns/radiotv/RadioTVHero";
import { RadioBenefitsGrid } from "@/components/campaigns/radiotv/RadioBenefitsGrid";
import { TVBenefitsGrid } from "@/components/campaigns/radiotv/TVBenefitsGrid";
import { TargetAudienceSection } from "@/components/campaigns/radiotv/TargetAudienceSection";
import { PartnerExplanation } from "@/components/campaigns/radiotv/PartnerExplanation";
import { ActivationCTAs } from "@/components/campaigns/radiotv/ActivationCTAs";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  Globe, 
  Heart, 
  Sparkles,
  TrendingUp,
  Shield
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function WebRadioTVCampaign() {
  const differentials = [
    { icon: Globe, text: "Tudo integrado ao Portal Conexão" },
    { icon: Heart, text: "Sem mensalidade extra" },
    { icon: Sparkles, text: "Sem limite de criatividade" },
    { icon: Shield, text: "Estrutura profissional" },
    { icon: TrendingUp, text: "Tecnologia usada por rádios e TVs digitais" },
    { icon: Zap, text: "Suporte e evolução contínua" },
  ];

  return (
    <>
      <Helmet>
        <title>Web Rádio / TV Grátis | Parceiro Conexão</title>
        <meta 
          name="description" 
          content="Crie sua Web Rádio e TV profissional gratuitamente. AutoDJ, transmissão ao vivo, playlists, chat e muito mais. Benefício exclusivo para Parceiros Conexão." 
        />
        <meta property="og:title" content="Sua emissora digital completa - Web Rádio / TV Conexão" />
        <meta property="og:description" content="Rádio online 24h + TV ao vivo. Grátis para Parceiros Conexão." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://conexaonacidade.com.br/web-radio-tv" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <RadioTVHero />

        {/* Radio Benefits */}
        <motion.section 
          className="py-16 md:py-24 bg-muted/30"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                🔊 Web Rádio Profissional
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tudo o que você precisa para ter sua rádio online funcionando 24 horas por dia
              </p>
            </div>
            <RadioBenefitsGrid />
          </div>
        </motion.section>

        <Separator />

        {/* TV Benefits */}
        <motion.section 
          className="py-16 md:py-24"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                📺 Web TV Completa
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transmita vídeos ao vivo e sob demanda com qualidade profissional
              </p>
            </div>
            <TVBenefitsGrid />
          </div>
        </motion.section>

        <Separator />

        {/* Target Audience */}
        <motion.section 
          className="py-16 md:py-24 bg-muted/30"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                👥 Para quem é essa solução?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                De podcasters a prefeituras, nossa plataforma atende diferentes necessidades
              </p>
            </div>
            <TargetAudienceSection />
          </div>
        </motion.section>

        <Separator />

        {/* Why It's Free */}
        <motion.section 
          className="py-16 md:py-24"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="container">
            <PartnerExplanation />
          </div>
        </motion.section>

        <Separator />

        {/* Differentials */}
        <motion.section 
          className="py-16 md:py-24 bg-muted/30"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                🎯 Diferenciais Exclusivos
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {differentials.map((diff, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="p-2 rounded-full bg-primary/10">
                    <diff.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{diff.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section 
          className="py-20 md:py-32 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="container text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Quem comunica melhor, <span className="text-primary">cresce mais.</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              No Conexão, sua voz vira canal, sua ideia vira mídia.
            </p>
            <ActivationCTAs variant="large" />
          </div>
        </motion.section>
      </div>
    </>
  );
}
