import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormulaConexao } from "@/contexts/FormulaConexaoContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, User, Building2, FileText, Mail, Phone } from "lucide-react";

// --- Masks ---
function maskCpfCnpj(v: string) {
  const d = v.replace(/\D/g, "");
  if (d.length <= 11) {
    return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2}\.\d{3})(\d)/, "$1.$2").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

// --- Validations ---
function validateCpfCnpj(v: string) {
  const d = v.replace(/\D/g, "");
  return d.length === 11 || d.length === 14;
}

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function validatePhone(v: string) {
  const d = v.replace(/\D/g, "");
  return d.length >= 10 && d.length <= 11;
}

const steps = [
  { field: "nome" as const, label: "Qual é o seu nome completo?", placeholder: "Ex: João da Silva", icon: User, validate: (v: string) => v.trim().length >= 3 },
  { field: "negocio" as const, label: "Qual é o nome do seu negócio?", placeholder: "Ex: Padaria do João", icon: Building2, validate: (v: string) => v.trim().length >= 2 },
  { field: "cpfCnpj" as const, label: "Informe seu CPF ou CNPJ", placeholder: "000.000.000-00", icon: FileText, validate: validateCpfCnpj, mask: maskCpfCnpj },
  { field: "email" as const, label: "Qual é o seu melhor e-mail?", placeholder: "joao@email.com", icon: Mail, validate: validateEmail },
  { field: "whatsapp" as const, label: "Seu WhatsApp com DDD", placeholder: "(11) 99999-9999", icon: Phone, validate: validatePhone, mask: maskPhone },
];

interface Props {
  onComplete: () => void;
}

export function FormulaQuizWizard({ onComplete }: Props) {
  const { data, setData } = useFormulaConexao();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const value = data[current.field];

  function handleChange(raw: string) {
    const masked = current.mask ? current.mask(raw) : raw;
    setData((prev) => ({ ...prev, [current.field]: masked }));
    setError("");
  }

  async function handleNext() {
    if (!current.validate(value)) {
      setError("Preencha este campo corretamente.");
      return;
    }
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setSaving(true);
      try {
        await supabase.from("formula_conexao_leads" as any).insert({
          nome: data.nome,
          negocio: data.negocio,
          cpf_cnpj: data.cpfCnpj.replace(/\D/g, ""),
          email: data.email,
          whatsapp: data.whatsapp.replace(/\D/g, ""),
        });

        // Send WhatsApp confirmation (best-effort, non-blocking)
        supabase.functions.invoke("send-whatsapp-confirmation", {
          body: { phone: data.whatsapp, nome: data.nome, negocio: data.negocio },
        }).catch(() => {});
      } catch {
        // silent fail — lead saved is best-effort
      }
      setSaving(false);
      onComplete();
    }
  }

  const Icon = current.icon;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#1A1A1A" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#FF6600" }}>
            Fórmula Conexão
          </h1>
          <p className="text-sm" style={{ color: "#FFFFFF99" }}>
            Reserve sua vaga como Parceiro Fundador
          </p>
        </div>

        <Progress value={progress} className="h-2 mb-8 bg-white/10" />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl p-6 shadow-2xl"
            style={{ background: "#222" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#FF6600" }}>
                <Icon size={20} color="#fff" />
              </div>
              <h2 className="text-lg font-semibold text-white">{current.label}</h2>
            </div>

            <Input
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={current.placeholder}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 text-base"
              maxLength={current.field === "cpfCnpj" ? 18 : current.field === "whatsapp" ? 15 : 100}
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
              autoFocus
            />

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

            <Button
              onClick={handleNext}
              disabled={saving}
              className="w-full mt-6 h-12 text-base font-bold"
              style={{ background: "#FF6600", color: "#fff" }}
            >
              {saving ? "Salvando..." : step < steps.length - 1 ? (
                <>Próximo <ArrowRight size={18} className="ml-2" /></>
              ) : (
                "🎉 Reservar Minha Vaga!"
              )}
            </Button>

            <p className="text-center text-xs mt-4" style={{ color: "#FFFFFF66" }}>
              Passo {step + 1} de {steps.length}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
