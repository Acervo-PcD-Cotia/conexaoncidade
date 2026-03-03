import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Check, Clock, Shield, Zap } from "lucide-react";
import { useFormulaConexao } from "@/contexts/FormulaConexaoContext";
import { useFormulaCountdown } from "@/hooks/useFormulaCountdown";

interface Props {
  open: boolean;
  onClose: () => void;
}

const BENEFITS = [
  "Site Premium ativado em 24h",
  "Conexão AI 24h no WhatsApp",
  "Divulgação no Portal, Rádio e TV Web",
  "Selo Empresa Verificada",
  "Caminhão de Prêmios para seus clientes",
  "Selo Empresa Amiga do PCD",
  "Suporte prioritário 12 meses",
];

export function FormulaCheckoutModal({ open, onClose }: Props) {
  const { data } = useFormulaConexao();
  const { hours, minutes, seconds, isExpired } = useFormulaCountdown(data.cpfCnpj);
  const nome = data.negocio || "Seu Negócio";

  if (!open) return null;

  function pad(n: number) { return n.toString().padStart(2, "0"); }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          style={{ background: "#0A0F1E", border: "1px solid rgba(249,115,22,0.15)" }}
        >
          {/* Header */}
          <div className="p-6 pb-0">
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <X size={18} className="text-white/40" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight font-[Plus_Jakarta_Sans]">
                Garanta a vaga da <span style={{ color: "#FF6600" }}>{nome}</span>
              </h2>
              <p className="text-xs text-white/40 mt-1">Parceiro Fundador · Cotia</p>
            </div>
          </div>

          {/* Price Card */}
          <div className="mx-6 mb-4 rounded-xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {isExpired ? (
              <div className="text-center">
                <p className="text-xs line-through text-white/30 mb-1">Oferta expirada</p>
                <p className="text-4xl font-extrabold text-red-400">R$ 5.997</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs line-through text-white/30 mb-1">De R$ 5.997</p>
                <p className="text-4xl font-extrabold text-green-400">R$ 1.997</p>
                <p className="text-sm text-white/50 mt-1">ou 12x de R$ 199</p>

                {/* Savings badge */}
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold"
                  style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22C55E" }}>
                  <Zap size={12} /> Você economiza R$ 4.000
                </div>

                {/* Inline timer */}
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/40">
                  <Clock size={12} style={{ color: "#FF6600" }} />
                  <span>Oferta expira em</span>
                  <span className="font-mono font-bold" style={{ color: "#FF6600" }}>
                    {pad(hours)}:{pad(minutes)}:{pad(seconds)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="mx-6 mb-4 space-y-2">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(34,197,94,0.1)" }}>
                  <Check size={12} className="text-green-400" />
                </div>
                <span className="text-sm text-white/80">{b}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="p-6 pt-2">
            {isExpired ? (
              <Button
                onClick={() => window.open("https://wa.me/5511999999999?text=Olá! Quero falar sobre a Fórmula Conexão.", "_blank")}
                className="w-full h-14 text-base font-bold rounded-xl"
                style={{ background: "#25D366", color: "#fff" }}
              >
                Falar com Consultor
              </Button>
            ) : (
              <Button
                onClick={() => window.open("https://mpago.la/formulaconexao", "_blank")}
                className="w-full h-14 text-base font-bold rounded-xl shadow-lg"
                style={{ background: "#FF6600", color: "#fff", boxShadow: "0 8px 30px rgba(249,115,22,0.35)" }}
              >
                🔥 QUERO GARANTIR A VAGA AGORA
              </Button>
            )}

            {/* Trust */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-1 text-[10px] text-white/30">
                <Shield size={10} /> Pagamento seguro
              </div>
              <div className="flex items-center gap-1 text-[10px] text-white/30">
                <Clock size={10} /> Mercado Pago
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
