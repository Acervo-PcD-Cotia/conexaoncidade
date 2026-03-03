import { useFormulaCountdown } from "@/hooks/useFormulaCountdown";
import { Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function DigitBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-0.5">
        {value.split("").map((d, i) => (
          <motion.span
            key={`${label}-${i}-${d}`}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center justify-center w-8 h-10 md:w-10 md:h-12 rounded-lg text-lg md:text-xl font-mono font-bold text-white"
            style={{
              background: "rgba(249, 115, 22, 0.15)",
              border: "1px solid rgba(249, 115, 22, 0.3)",
              textShadow: "0 0 10px rgba(249, 115, 22, 0.5)",
            }}
          >
            {d}
          </motion.span>
        ))}
      </div>
      <span className="text-[10px] uppercase tracking-widest text-white/40 font-medium">
        {label}
      </span>
    </div>
  );
}

export function FormulaCountdown({ cpfCnpj }: { cpfCnpj: string }) {
  const { hours, minutes, seconds, isExpired } = useFormulaCountdown(cpfCnpj);
  const isUrgent = !isExpired && hours === 0 && minutes < 60;

  return (
    <motion.div
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        background: isExpired
          ? "rgba(127, 29, 29, 0.8)"
          : "rgba(0, 0, 0, 0.7)",
        borderColor: isExpired
          ? "rgba(239, 68, 68, 0.3)"
          : "rgba(249, 115, 22, 0.3)",
      }}
      animate={isUrgent ? { boxShadow: ["0 0 20px rgba(249,115,22,0.1)", "0 0 30px rgba(249,115,22,0.3)", "0 0 20px rgba(249,115,22,0.1)"] } : {}}
      transition={isUrgent ? { duration: 2, repeat: Infinity } : {}}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 md:gap-4 py-3 px-4">
        {isExpired ? (
          <div className="flex items-center gap-2 text-white font-bold text-sm md:text-base">
            <AlertTriangle size={18} className="text-red-400" />
            <span>⏰ Tempo esgotado — Condição de Parceiro Fundador encerrada</span>
          </div>
        ) : (
          <>
            <Clock size={16} className="text-orange-400" />
            <span className="text-white/70 text-xs md:text-sm font-medium hidden sm:inline">
              Oferta expira em
            </span>
            <div className="flex items-center gap-2 md:gap-3">
              <DigitBox value={pad(hours)} label="horas" />
              <span className="text-orange-400 font-bold text-xl animate-pulse">:</span>
              <DigitBox value={pad(minutes)} label="min" />
              <span className="text-orange-400 font-bold text-xl animate-pulse">:</span>
              <DigitBox value={pad(seconds)} label="seg" />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
