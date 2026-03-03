import { motion } from "framer-motion";
import { Zap, Award, Gift } from "lucide-react";

const milestones = [
  {
    icon: Zap,
    time: "Imediato",
    title: "Ativação Digital",
    desc: "IA Aikeedo configurada, site no ar, mídia ativada no portal, rádio e TV.",
    color: "rgb(59, 130, 246)",
  },
  {
    icon: Award,
    time: "Setembro 2025",
    title: "Evento & Selo",
    desc: "Cerimônia presencial com entrega do Selo de Empresa Verificada e networking de elite.",
    color: "rgb(234, 179, 8)",
  },
  {
    icon: Gift,
    time: "Dezembro 2025",
    title: "Caminhão de Prêmios",
    desc: "Sorteio televisionado. Seus clientes concorrem e sua marca explode em visibilidade.",
    color: "rgb(34, 197, 94)",
  },
];

export function FormulaTimeline() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-orange-400 font-semibold">
            Roadmap
          </span>
          <h2
            className="text-3xl md:text-4xl font-extrabold text-white mt-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Sua Jornada de Resultados
          </h2>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-6 md:left-8 top-0 bottom-0 w-px"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />

          <div className="space-y-12">
            {milestones.map((m, i) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.title}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="relative flex gap-6 items-start pl-2"
                >
                  {/* Node */}
                  <div
                    className="relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${m.color}15`,
                      border: `1px solid ${m.color}40`,
                      boxShadow: `0 0 20px ${m.color}20`,
                    }}
                  >
                    <Icon size={20} style={{ color: m.color }} />
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 rounded-2xl p-5 backdrop-blur-xl"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <span
                      className="text-xs font-bold tracking-wider uppercase"
                      style={{ color: m.color }}
                    >
                      {m.time}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{m.title}</h3>
                    <p className="text-white/50 text-sm mt-1">{m.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
