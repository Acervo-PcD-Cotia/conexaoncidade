import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Check, Clock } from "lucide-react";
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
  const { isExpired } = useFormulaCountdown(data.cpfCnpj);
  const nome = data.negocio || "Seu Negócio";

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/70"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-lg rounded-2xl p-6 overflow-y-auto max-h-[90vh]"
          style={{ background: "#0F172A", border: "1px solid #FF660033" }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded hover:bg-white/10">
            <X size={20} style={{ color: "#ffffff66" }} />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-white mb-1">
              Garanta a vaga da <span style={{ color: "#FF6600" }}>{nome}</span>
            </h2>
            <p className="text-sm" style={{ color: "#ffffff88" }}>Parceiro Fundador · Cotia</p>
          </div>

          {/* Price */}
          <div className="text-center mb-6 p-4 rounded-xl" style={{ background: "#1E293B" }}>
            {isExpired ? (
              <>
                <p className="text-sm line-through mb-1" style={{ color: "#ffffff44" }}>Oferta expirada</p>
                <p className="text-4xl font-extrabold" style={{ color: "#EF4444" }}>R$ 5.997</p>
              </>
            ) : (
              <>
                <p className="text-sm line-through mb-1" style={{ color: "#ffffff44" }}>De R$ 5.997</p>
                <p className="text-4xl font-extrabold" style={{ color: "#22C55E" }}>R$ 1.997</p>
                <p className="text-sm mt-1" style={{ color: "#ffffffaa" }}>ou 12x de R$ 199</p>
              </>
            )}
          </div>

          {/* Benefits */}
          <div className="space-y-2 mb-6">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-2">
                <Check size={16} style={{ color: "#22C55E" }} />
                <span className="text-sm text-white">{b}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {isExpired ? (
            <Button
              onClick={() => window.open("https://wa.me/5511999999999?text=Olá! Quero falar sobre a Fórmula Conexão.", "_blank")}
              className="w-full h-14 text-base font-bold"
              style={{ background: "#25D366", color: "#fff" }}
            >
              Falar com Consultor
            </Button>
          ) : (
            <Button
              onClick={() => window.open("https://mpago.la/formulaconexao", "_blank")}
              className="w-full h-14 text-base font-bold"
              style={{ background: "#FF6600", color: "#fff" }}
            >
              🔥 QUERO GARANTIR A VAGA DA {nome.toUpperCase()} AGORA
            </Button>
          )}

          <p className="text-center text-xs mt-4" style={{ color: "#ffffff44" }}>
            <Clock size={12} className="inline mr-1" />
            Pagamento seguro · Mercado Pago
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
