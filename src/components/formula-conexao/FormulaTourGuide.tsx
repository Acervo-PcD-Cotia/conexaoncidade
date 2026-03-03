import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, ArrowLeft, Globe, Bot, LayoutGrid, Radio, Shield, Gift, Heart, Rocket } from "lucide-react";

const TOUR_STEPS = [
  { target: "tour-hero", title: "Site Premium", text: "Este é o site premium do seu negócio. Pronto para ser ativado em até 24h.", icon: <Globe size={18} /> },
  { target: "tour-conexao-ai", title: "Conexão AI", text: "A IA vai atender seus clientes no WhatsApp 24h com linguagem do seu nicho.", icon: <Bot size={18} /> },
  { target: "tour-servicos", title: "Serviços", text: "Catálogo profissional otimizado para o Google.", icon: <LayoutGrid size={18} /> },
  { target: "tour-midia", title: "Mídia Conexão", text: "Divulgação no Portal, Rádio e TV Web Conexão.", icon: <Radio size={18} /> },
  { target: "tour-selo", title: "Selo Verificado", text: "Entregue no evento presencial em Setembro.", icon: <Shield size={18} /> },
  { target: "tour-caminhao", title: "Caminhão de Prêmios", text: "R$20 = 1 cupom. Sorteio ao vivo pela TV Web.", icon: <Gift size={18} /> },
  { target: "tour-pcd", title: "Impacto Social PCD", text: "Apoie famílias PCD e receba o Selo Empresa Amiga.", icon: <Heart size={18} /> },
  { target: null, title: "Garante sua Vaga!", text: "Tudo pronto! Garanta como Parceiro Fundador agora.", icon: <Rocket size={18} /> },
];

interface Props {
  active: boolean;
  onFinish: () => void;
}

export function FormulaTourGuide({ active, onFinish }: Props) {
  const [step, setStep] = useState(0);

  const scrollToTarget = useCallback((targetId: string | null) => {
    if (!targetId) return;
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  useEffect(() => {
    if (active) {
      setStep(0);
      scrollToTarget(TOUR_STEPS[0].target);
    }
  }, [active, scrollToTarget]);

  useEffect(() => {
    if (active && TOUR_STEPS[step]?.target) {
      scrollToTarget(TOUR_STEPS[step].target);
    }
  }, [step, active, scrollToTarget]);

  if (!active) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const progress = ((step + 1) / TOUR_STEPS.length) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <div className="absolute inset-0 bg-black/60 pointer-events-auto" />

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-6 left-4 right-4 z-[10000] pointer-events-auto"
        >
          <div className="max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(249,115,22,0.2)", backdropFilter: "blur(20px)" }}>

            {/* Progress bar */}
            <div className="h-1 w-full" style={{ background: "rgba(255,255,255,0.05)" }}>
              <motion.div
                className="h-full"
                style={{ background: "#FF6600" }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(249,115,22,0.1)", color: "#FF6600" }}>
                    {current.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-white/30 mb-0.5">
                      {step + 1} de {TOUR_STEPS.length}
                    </p>
                    <h3 className="text-base font-bold text-white">{current.title}</h3>
                  </div>
                </div>
                <button onClick={onFinish} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                  <X size={16} className="text-white/40" />
                </button>
              </div>

              <p className="text-sm text-white/60 mb-4 leading-relaxed">{current.text}</p>

              {/* Step dots */}
              <div className="flex gap-1 mb-4">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full flex-1 transition-all duration-300"
                    style={{ background: i <= step ? "#FF6600" : "rgba(255,255,255,0.08)" }}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {step > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep(step - 1)}
                    className="gap-1 border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
                  >
                    <ArrowLeft size={14} /> Anterior
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => isLast ? onFinish() : setStep(step + 1)}
                  className="ml-auto gap-1 font-bold"
                  style={{ background: "#FF6600", color: "#fff" }}
                >
                  {isLast ? "🎯 Ver Oferta" : <>Próximo <ArrowRight size={14} /></>}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
