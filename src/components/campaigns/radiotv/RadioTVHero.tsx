import { motion } from "framer-motion";
import { Radio, Tv, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ActivationCTAs } from "./ActivationCTAs";

export function RadioTVHero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/10 to-transparent dark:from-red-950/40 dark:via-orange-950/20" />
      
      {/* Animated circles */}
      <motion.div 
        className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Icon */}
          <motion.div 
            className="mb-8 relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-red-500/30">
              <Radio className="h-10 w-10 md:h-14 md:w-14 text-white absolute -left-1" />
              <Tv className="h-10 w-10 md:h-14 md:w-14 text-white absolute -right-1" />
            </div>
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </motion.div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge 
              variant="outline" 
              className="mb-6 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-yellow-600 dark:text-yellow-400"
            >
              🎁 Grátis para Parceiros Conexão
            </Badge>
          </motion.div>

          {/* Title */}
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Web Rádio / TV Conexão
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-xl md:text-2xl lg:text-3xl font-medium text-foreground/80 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Sua emissora digital completa, pronta para entrar no ar
          </motion.p>

          {/* Description */}
          <motion.p 
            className="text-lg text-muted-foreground mb-10 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Transforme sua voz, conteúdo ou instituição em uma <strong>Web Rádio e/ou TV profissional</strong>, 
            sem custo adicional, exclusiva para <strong>Parceiros Conexão</strong>.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ActivationCTAs />
          </motion.div>

          {/* Value proposition */}
          <motion.p 
            className="mt-8 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            💡 Valor de mercado alto, benefício destravado no plano
          </motion.p>
        </div>
      </div>
    </section>
  );
}
