import { useFormulaCountdown } from "@/hooks/useFormulaCountdown";
import { Clock } from "lucide-react";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function FormulaCountdown({ cpfCnpj }: { cpfCnpj: string }) {
  const { hours, minutes, seconds, isExpired } = useFormulaCountdown(cpfCnpj);

  return (
    <div
      className="sticky top-0 z-40 flex items-center justify-center gap-3 py-3 px-4 text-white font-bold text-sm md:text-base"
      style={{ background: isExpired ? "#991B1B" : "#FF6600" }}
    >
      <Clock size={18} />
      {isExpired ? (
        <span>⏰ Tempo esgotado — Condição especial encerrada</span>
      ) : (
        <span>
          🔥 Oferta expira em{" "}
          <span className="font-mono text-lg">
            {pad(hours)}:{pad(minutes)}:{pad(seconds)}
          </span>
        </span>
      )}
    </div>
  );
}
