import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

const TOUR_STEPS = [
  { target: "tour-hero", title: "Site Premium", text: "Este é o site premium do seu negócio. Ele já está pronto para ser ativado em até 24h." },
  { target: "tour-conexao-ai", title: "Conexão AI", text: "A Conexão AI vai atender seus clientes no WhatsApp 24h por dia com linguagem própria do seu nicho." },
  { target: "tour-servicos", title: "Serviços", text: "Seu catálogo profissional já está otimizado para aparecer no Google." },
  { target: "tour-midia", title: "Mídia Conexão", text: "Sua empresa será divulgada no Portal Conexão, Rádio e TV Web." },
  { target: "tour-selo", title: "Selo Verificado", text: "Este é o Selo que você recebe no evento presencial em Setembro." },
  { target: "tour-caminhao", title: "Caminhão de Prêmios", text: "Seus clientes participam do nosso Caminhão de Prêmios. R$20 = 1 cupom." },
  { target: "tour-pcd", title: "Impacto Social PCD", text: "Sua empresa apoia as famílias PCD de Cotia e recebe o Selo Empresa Amiga do PCD." },
  { target: null, title: "Garanta sua Vaga!", text: "Tudo pronto! Garanta sua vaga como Parceiro Fundador agora." },
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={() => {}} />

        {/* Tooltip */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-6 left-4 right-4 z-[10000] pointer-events-auto"
        >
          <div className="max-w-md mx-auto rounded-2xl p-5 shadow-2xl" style={{ background: "#1E293B", border: "1px solid #FF660044" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-mono mb-1" style={{ color: "#FF6600" }}>
                  {step + 1}/{TOUR_STEPS.length}
                </p>
                <h3 className="text-lg font-bold text-white">{current.title}</h3>
              </div>
              <button onClick={onFinish} className="p-1 rounded hover:bg-white/10">
                <X size={18} style={{ color: "#ffffff66" }} />
              </button>
            </div>
            <p className="text-sm mb-4" style={{ color: "#ffffffbb" }}>{current.text}</p>

            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="outline" size="sm" onClick={() => setStep(step - 1)} className="gap-1" style={{ borderColor: "#ffffff22", color: "#ffffffaa" }}>
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
