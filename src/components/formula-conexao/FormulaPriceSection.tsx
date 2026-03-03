import { useFormulaCountdown } from "@/hooks/useFormulaCountdown";
import { useFormulaConexao } from "@/contexts/FormulaConexaoContext";
import { Shield, CheckCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";

const CHECKOUT_URL = "https://mpago.la/formulaconexao";

const benefits = [
  "IA Aikeedo + Site Profissional com SSL",
  "Exposição Mídia 360º (Portal + Rádio + TV + Google)",
  "Evento Presencial + Selo de Empresa Verificada",
  "Caminhão de Prêmios — Máquina de Fidelização",
  'Selo "Empresa Amiga do PCD" — Impacto Social',
  "Pague 10, Use 13 — Mensalidades bônus inclusas",
];

export function FormulaPriceSection() {
  const { data } = useFormulaConexao();
  const { isExpired } = useFormulaCountdown(data.cpfCnpj);
  const businessName = data.negocio.toUpperCase();

  return (
    <section className="py-20 px-4" id="preco">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-lg mx-auto"
      >
        {/* Card */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(249, 115, 22, 0.25)",
            boxShadow: "0 0 60px rgba(249, 115, 22, 0.08)",
          }}
        >
          {/* Header */}
          <div
            className="py-4 px-6 flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, rgba(249,115,22,0.9), rgba(234,88,12,0.9))",
            }}
          >
            <Shield size={20} className="text-white" />
            <span className="text-white font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Parceiro Fundador — Cotia
            </span>
          </div>

          <div className="p-8 md:p-10">
            {/* Pricing */}
            <div className="text-center mb-8">
              <p className="text-white/40 line-through text-xl mb-1">
                {isExpired ? "R$ 1.997,00" : "R$ 5.997,00"}
              </p>
              <motion.p
                className="text-5xl md:text-6xl font-extrabold mb-2"
                style={{
                  color: isExpired ? "rgb(239, 68, 68)" : "rgb(34, 197, 94)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  textShadow: isExpired
                    ? "0 0 30px rgba(239,68,68,0.3)"
                    : "0 0 30px rgba(34,197,94,0.3)",
                }}
                animate={!isExpired ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {isExpired ? "R$ 5.997,00" : "R$ 1.997,00"}
              </motion.p>
              <p className="text-sm text-white/50">
                {isExpired
                  ? "Lote de Parceiro Fundador encerrado"
                  : "ou 12x de R$ 199,00 no cartão"}
              </p>
            </div>

            {/* Benefits */}
            <ul className="space-y-3 mb-10">
              {benefits.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-3 text-white/80 text-sm"
                >
                  <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{b}</span>
                </motion.li>
              ))}
            </ul>

            {/* CTA */}
            {isExpired ? (
              <button
                disabled
                className="w-full py-4 rounded-xl font-bold text-lg cursor-not-allowed text-white/30"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                LOTE ENCERRADO
              </button>
            ) : (
              <motion.a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-full py-4 rounded-xl font-bold text-base md:text-lg text-center text-white overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  boxShadow: "0 0 30px rgba(249,115,22,0.4)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(249,115,22,0.3)",
                    "0 0 40px rgba(249,115,22,0.5)",
                    "0 0 20px rgba(249,115,22,0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Zap size={20} />
                  QUERO GARANTIR A VAGA DA {businessName} E O SELO DE AUTORIDADE
                </span>
              </motion.a>
            )}

            <p className="text-center text-white/30 text-xs mt-4">
              🔒 Pagamento 100% seguro via Mercado Pago
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
