import { motion } from "framer-motion";
import { useFormulaConexao } from "@/contexts/FormulaConexaoContext";
import { NICHES } from "./FormulaNicheData";

interface Props {
  onSelect: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.4 } }),
};

export function FormulaNicheSelector({ onSelect }: Props) {
  const { setData } = useFormulaConexao();

  function handlePick(key: string) {
    setData((prev) => ({ ...prev, nicho: key }));
    onSelect();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: "#0A0F1E" }}>
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      <motion.div initial="hidden" animate="visible" className="w-full max-w-2xl relative">
        <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-extrabold text-center text-white mb-2 tracking-tight font-[Plus_Jakarta_Sans]">
          Qual melhor descreve o seu negócio?
        </motion.h2>
        <motion.p variants={fadeUp} custom={1} className="text-center mb-8 text-white/50 text-sm">
          Vamos personalizar tudo para o seu nicho.
        </motion.p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {NICHES.map((n, i) => (
            <motion.button
              key={n.key}
              variants={fadeUp}
              custom={i + 2}
              onClick={() => handlePick(n.key)}
              className="rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 active:scale-95 group"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `hsl(${n.accentColor} / 0.4)`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px hsl(${n.accentColor} / 0.1)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <span className="text-3xl block mb-2">{n.icon}</span>
              <span className="text-sm font-bold text-white block">{n.label}</span>
              <span className="text-[11px] text-white/35 mt-1 block">{n.description}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
