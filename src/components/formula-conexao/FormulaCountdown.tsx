import { useFormulaCountdown } from "@/hooks/useFormulaCountdown";
import { Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function FormulaCountdown({ cpfCnpj }: { cpfCnpj: string }) {
  const { hours, minutes, seconds, isExpired } = useFormulaCountdown(cpfCnpj);
  const isUrgent = !isExpired && hours === 0 && minutes < 60;

  return (
    <motion.div
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        background: isExpired
          ? "rgba(127, 29, 29, 0.7)"
          : "rgba(10, 15, 30, 0.85)",
        borderBottom: `1px solid ${isExpired ? "rgba(239,68,68,0.2)" : "rgba(249,115,22,0.15)"}`,
      }}
      animate={isUrgent ? { boxShadow: ["0 0 15px rgba(249,115,22,0.05)", "0 0 25px rgba(249,115,22,0.15)", "0 0 15px rgba(249,115,22,0.05)"] } : {}}
      transition={isUrgent ? { duration: 2, repeat: Infinity } : {}}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 py-2.5 px-4">
        {isExpired ? (
          <div className="flex items-center gap-2 text-white font-bold text-xs md:text-sm">
            <AlertTriangle size={14} className="text-red-400" />
            <span>Condição de Parceiro Fundador encerrada</span>
          </div>
        ) : (
          <>
            <Clock size={14} style={{ color: "#FF6600" }} />
            <span className="text-white/50 text-xs font-medium hidden sm:inline">
              Oferta expira em
            </span>
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold" style={{ color: "#FF6600" }}>
              <span>{pad(hours)}</span>
              <span className="animate-pulse">:</span>
              <span>{pad(minutes)}</span>
              <span className="animate-pulse">:</span>
              <span>{pad(seconds)}</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
