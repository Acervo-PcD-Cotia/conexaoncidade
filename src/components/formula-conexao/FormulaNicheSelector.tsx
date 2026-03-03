import { motion } from "framer-motion";
import { useFormulaConexao } from "@/contexts/FormulaConexaoContext";
import { NICHES } from "./FormulaNicheData";

interface Props {
  onSelect: () => void;
}

export function FormulaNicheSelector({ onSelect }: Props) {
  const { setData } = useFormulaConexao();

  function handlePick(key: string) {
    setData((prev) => ({ ...prev, nicho: key }));
    onSelect();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#0F172A" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center text-white mb-2">
          Qual melhor descreve o seu negócio?
        </h2>
        <p className="text-center mb-8" style={{ color: "#ffffff88" }}>
          Vamos personalizar tudo para o seu nicho.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {NICHES.map((n, i) => (
            <motion.button
              key={n.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handlePick(n.key)}
              className="rounded-xl p-4 text-center transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-[#FF6600]/50"
              style={{ background: "#1E293B" }}
            >
              <span className="text-3xl block mb-2">{n.icon}</span>
              <span className="text-sm font-medium text-white">{n.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
