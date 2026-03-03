import { motion } from "framer-motion";
import { KeyRound, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onCode: () => void;
  onQuiz: () => void;
}

export function FormulaEntryScreen({ onCode, onQuiz }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0F172A" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md text-center"
      >
        <h1 className="text-4xl font-extrabold mb-3" style={{ color: "#FF6600" }}>
          🚀 FÓRMULA CONEXÃO
        </h1>
        <p className="text-lg mb-10" style={{ color: "#ffffffcc" }}>
          Reserve sua vaga como Parceiro Fundador em Cotia.
        </p>

        <div className="space-y-4">
          <Button
            onClick={onCode}
            variant="outline"
            className="w-full h-14 text-base font-bold border-2 gap-3"
            style={{ borderColor: "#FF6600", color: "#FF6600", background: "transparent" }}
          >
            <KeyRound size={20} /> TENHO CÓDIGO DE ACESSO
          </Button>

          <Button
            onClick={onQuiz}
            className="w-full h-14 text-base font-bold gap-3"
            style={{ background: "#FF6600", color: "#fff" }}
          >
            <Rocket size={20} /> QUERO CONHECER →
          </Button>
        </div>

        <p className="text-xs mt-8" style={{ color: "#ffffff55" }}>
          Vagas limitadas · Cotia e região
        </p>
      </motion.div>
    </div>
  );
}
