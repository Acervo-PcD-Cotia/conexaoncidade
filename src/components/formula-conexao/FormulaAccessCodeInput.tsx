import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useFormulaConexao } from "@/contexts/FormulaConexaoContext";
import { ArrowLeft, KeyRound, AlertTriangle } from "lucide-react";

interface Props {
  onValid: () => void;
  onBack: () => void;
  onExpired: () => void;
}

export function FormulaAccessCodeInput({ onValid, onBack, onExpired }: Props) {
  const { setData } = useFormulaConexao();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);

  async function handleSubmit() {
    if (code.trim().length < 3) {
      setError("Digite um código válido.");
      return;
    }
    setLoading(true);
    setError("");

    const { data: row, error: dbErr } = await supabase
      .from("formula_access_codes" as any)
      .select("*")
      .eq("codigo", code.trim().toUpperCase())
      .maybeSingle();

    if (dbErr || !row) {
      setError("Código não encontrado. Verifique e tente novamente.");
      setLoading(false);
      return;
    }

    const rec = row as any;
    const expiresAt = new Date(rec.expires_at);
    if (expiresAt < new Date()) {
      setExpired(true);
      setLoading(false);
      onExpired();
      return;
    }

    setData((prev) => ({
      ...prev,
      nome: rec.nome || "",
      negocio: rec.nome_negocio || "",
      nicho: rec.nicho || "",
      codigo: rec.codigo || "",
      cpfCnpj: rec.cpf_cnpj || "",
      email: rec.email || "",
      whatsapp: rec.whatsapp || "",
    }));
    setLoading(false);
    onValid();
  }

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0F172A" }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md text-center">
          <AlertTriangle size={48} className="mx-auto mb-4" style={{ color: "#EF4444" }} />
          <h2 className="text-2xl font-bold text-white mb-2">Código Expirado</h2>
          <p className="mb-6" style={{ color: "#ffffffaa" }}>
            Seu período de 36h encerrou. O valor exclusivo de fundador não está mais disponível.
          </p>
          <p className="text-3xl font-extrabold mb-6" style={{ color: "#EF4444" }}>
            R$ 5.997
          </p>
          <Button
            onClick={() => window.open("https://wa.me/5511999999999?text=Olá! Meu código expirou, quero falar com um consultor.", "_blank")}
            className="w-full h-12 font-bold"
            style={{ background: "#25D366", color: "#fff" }}
          >
            Falar com Consultor
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0F172A" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-2 text-sm mb-6" style={{ color: "#ffffff88" }}>
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="rounded-2xl p-6 shadow-2xl" style={{ background: "#1E293B" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#FF6600" }}>
              <KeyRound size={20} color="#fff" />
            </div>
            <h2 className="text-lg font-semibold text-white">Insira seu Código de Acesso</h2>
          </div>

          <Input
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
            placeholder="Ex: FC2024-001"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 text-base font-mono tracking-wider"
            maxLength={20}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 h-12 text-base font-bold"
            style={{ background: "#FF6600", color: "#fff" }}
          >
            {loading ? "Verificando..." : "Validar Código"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
