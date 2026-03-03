import { motion } from "framer-motion";
import { BadgeCheck, Star } from "lucide-react";

const testimonials = [
  {
    name: "Marcos Almeida",
    business: "Auto Elétrica Almeida",
    text: "Em 3 semanas, a IA já tinha qualificado mais leads do que meu time em 2 meses. O investimento se pagou no primeiro mês.",
    avatar: "MA",
  },
  {
    name: "Carla Santos",
    business: "Estética Belle Femme",
    text: "O selo de verificada mudou a percepção das clientes. Agora elas confiam mais e indicam para as amigas. Resultado real.",
    avatar: "CS",
  },
  {
    name: "Roberto Lima",
    business: "Lima Materiais de Construção",
    text: "O caminhão de prêmios trouxe gente que nunca tinha pisado na loja. Fidelizamos clientes que antes iam na concorrência.",
    avatar: "RL",
  },
];

export function FormulaTestimonials() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-orange-400 font-semibold">
            Prova Social
          </span>
          <h2
            className="text-3xl md:text-4xl font-extrabold text-white mt-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Empresas Verificadas
          </h2>
        </motion.div>

        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="min-w-[280px] snap-center rounded-2xl p-6 backdrop-blur-xl flex flex-col"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} size={14} className="text-yellow-500 fill-yellow-500" />
                ))}
              </div>

              <p className="text-white/70 text-sm leading-relaxed flex-1 mb-5">
                "{t.text}"
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "rgba(249, 115, 22, 0.2)", border: "1px solid rgba(249, 115, 22, 0.3)" }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <BadgeCheck size={14} className="text-blue-400" />
                  </div>
                  <span className="text-xs text-white/40">{t.business}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
