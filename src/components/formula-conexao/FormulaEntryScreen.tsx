import { motion } from "framer-motion";
import { KeyRound, Rocket, Zap } from "lucide-react";

interface Props {
  onCode: () => void;
  onQuiz: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.5 } }),
};

export function FormulaEntryScreen({ onCode, onQuiz }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: "#0A0F1E" }}>
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />
      {/* Radial glow */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(249,115,22,0.12) 0%, transparent 70%)",
      }} />

      <motion.div
        initial="hidden"
        animate="visible"
        className="w-full max-w-md text-center relative"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} custom={0} className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
            style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", color: "#F97316" }}>
            <Zap size={12} /> Vagas limitadas · Cotia e região
          </div>
        </motion.div>

        <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 font-[Plus_Jakarta_Sans]" style={{ color: "#FF6600" }}>
          FÓRMULA CONEXÃO
        </motion.h1>
        <motion.p variants={fadeUp} custom={2} className="text-base md:text-lg mb-10 text-white/60">
          Reserve sua vaga como Parceiro Fundador em Cotia.
        </motion.p>

        <div className="space-y-3">
          <motion.button
            variants={fadeUp}
            custom={3}
            onClick={onCode}
            className="w-full rounded-2xl p-5 flex items-center gap-4 text-left transition-all duration-300 hover:-translate-y-0.5 group"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(249,115,22,0.2)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(249,115,22,0.1)" }}>
              <KeyRound size={22} style={{ color: "#FF6600" }} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">TENHO CÓDIGO DE ACESSO</p>
              <p className="text-xs text-white/40 mt-0.5">Já recebi um código exclusivo</p>
            </div>
          </motion.button>

          <motion.button
            variants={fadeUp}
            custom={4}
            onClick={onQuiz}
            className="w-full rounded-2xl p-5 flex items-center gap-4 text-left transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: "rgba(249,115,22,0.08)",
              border: "1px solid rgba(249,115,22,0.25)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(249,115,22,0.15)" }}>
              <Rocket size={22} style={{ color: "#FF6600" }} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "#FF6600" }}>QUERO CONHECER →</p>
              <p className="text-xs text-white/40 mt-0.5">Descubra o que preparamos para você</p>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
