import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const regions = [
  { name: "Centro de Cotia", slots: 2, status: "limited" as const },
  { name: "Granja Viana", slots: 0, status: "sold_out" as const },
  { name: "Caucaia do Alto", slots: 4, status: "limited" as const },
  { name: "Jardim da Glória", slots: 3, status: "limited" as const },
  { name: "Raposo Tavares", slots: 1, status: "critical" as const },
  { name: "Atalaia Park", slots: 0, status: "sold_out" as const },
];

function StatusBadge({ region }: { region: (typeof regions)[0] }) {
  if (region.status === "sold_out") {
    return (
      <span className="text-xs font-semibold text-white/30 line-through">
        🚫 Esgotado
      </span>
    );
  }
  const isCritical = region.status === "critical" || region.slots <= 2;
  return (
    <motion.span
      className="text-xs font-bold"
      style={{ color: isCritical ? "rgb(249, 115, 22)" : "rgb(34, 197, 94)" }}
      animate={isCritical ? { opacity: [1, 0.5, 1] } : {}}
      transition={isCritical ? { duration: 1.5, repeat: Infinity } : {}}
    >
      🔥 Apenas {region.slots} {region.slots === 1 ? "vaga" : "vagas"}
    </motion.span>
  );
}

export function FormulaAvailability() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-orange-400 font-semibold">
            Disponibilidade
          </span>
          <h2
            className="text-3xl md:text-4xl font-extrabold text-white mt-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Vagas por Região
          </h2>
          <p className="text-white/50 text-sm mt-3">
            Apenas um número limitado de parceiros fundadores por região.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {regions.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between rounded-xl px-5 py-4"
              style={{
                background: r.status === "sold_out"
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                opacity: r.status === "sold_out" ? 0.5 : 1,
              }}
            >
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-white/30" />
                <span className={`text-sm font-medium ${r.status === "sold_out" ? "text-white/30" : "text-white/80"}`}>
                  {r.name}
                </span>
              </div>
              <StatusBadge region={r} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
