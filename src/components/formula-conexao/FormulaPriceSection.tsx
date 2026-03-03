import { useFormulaCountdown } from "@/hooks/useFormulaCountdown";
import { useFormulaConexao } from "@/contexts/FormulaConexaoContext";
import { Shield, CheckCircle } from "lucide-react";

const CHECKOUT_URL = "https://mpago.la/formulaconexao"; // placeholder

export function FormulaPriceSection() {
  const { data } = useFormulaConexao();
  const { isExpired } = useFormulaCountdown(data.cpfCnpj);
  const businessName = data.negocio.toUpperCase();

  return (
    <section className="py-16 px-4">
      <div className="max-w-lg mx-auto text-center">
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#222" }}>
          {/* Header */}
          <div className="py-4 px-6" style={{ background: "#FF6600" }}>
            <p className="text-white font-bold text-lg flex items-center justify-center gap-2">
              <Shield size={20} /> Parceiro Fundador — Cotia
            </p>
          </div>

          <div className="p-8">
            {/* Old price */}
            <p className="text-white/50 line-through text-2xl mb-1">
              {isExpired ? "R$ 1.997,00" : "R$ 5.997,00"}
            </p>

            {/* Current price */}
            <p className="text-5xl font-extrabold mb-2" style={{ color: isExpired ? "#EF4444" : "#00CC66" }}>
              {isExpired ? "R$ 5.997,00" : "R$ 1.997,00"}
            </p>
            <p className="text-sm mb-6" style={{ color: "#FFFFFF99" }}>
              {isExpired
                ? "Lote de Parceiro Fundador encerrado"
                : "ou 12x de R$ 199,00 no cartão"}
            </p>

            {/* Benefits */}
            <ul className="text-left space-y-3 mb-8">
              {["IA + Site Profissional", "Exposição Mídia Regional", "Evento + Selo Verificado", "Caminhão de Prêmios", "Selo Empresa Amiga PCD"].map((b) => (
                <li key={b} className="flex items-center gap-2 text-white text-sm">
                  <CheckCircle size={16} style={{ color: "#00CC66" }} /> {b}
                </li>
              ))}
            </ul>

            {/* CTA */}
            {isExpired ? (
              <button
                disabled
                className="w-full py-4 rounded-xl font-bold text-lg bg-white/10 text-white/40 cursor-not-allowed"
              >
                LOTE ENCERRADO
              </button>
            ) : (
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 rounded-xl font-bold text-lg text-center text-white transition-transform hover:scale-[1.02]"
                style={{ background: "#FF6600" }}
              >
                QUERO GARANTIR A VAGA DA {businessName} NA FÓRMULA CONEXÃO
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
