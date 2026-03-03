import { useState } from "react";
import { FormulaConexaoProvider } from "@/contexts/FormulaConexaoContext";
import { FormulaEntryScreen } from "@/components/formula-conexao/FormulaEntryScreen";
import { FormulaAccessCodeInput } from "@/components/formula-conexao/FormulaAccessCodeInput";
import { FormulaQuizWizard } from "@/components/formula-conexao/FormulaQuizWizard";
import { FormulaNicheSelector } from "@/components/formula-conexao/FormulaNicheSelector";
import { FormulaNicheSite } from "@/components/formula-conexao/FormulaNicheSite";
import { FormulaTourGuide } from "@/components/formula-conexao/FormulaTourGuide";
import { FormulaCheckoutModal } from "@/components/formula-conexao/FormulaCheckoutModal";
import { FormulaConfetti } from "@/components/formula-conexao/FormulaConfetti";
import { Helmet } from "react-helmet-async";

type Phase = "entry" | "code-input" | "quiz" | "confetti" | "niche-select" | "niche-site";

function FormulaConexaoInner() {
  const [phase, setPhase] = useState<Phase>("entry");
  const [tourActive, setTourActive] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  function handleQuizComplete() {
    setPhase("confetti");
    setTimeout(() => setPhase("niche-select"), 2500);
  }

  function handleNicheSelected() {
    setPhase("niche-site");
    setTimeout(() => setTourActive(true), 800);
  }

  function handleCodeValid() {
    setPhase("niche-site");
    setTimeout(() => setTourActive(true), 800);
  }

  function handleTourFinish() {
    setTourActive(false);
    setCheckoutOpen(true);
  }

  return (
    <>
      <Helmet>
        <title>Fórmula Conexão — Parceiro Fundador | Conexão na Cidade</title>
        <meta name="description" content="Garanta sua vaga como Parceiro Fundador da Fórmula Conexão. IA, Mídia, Evento, Promoção e Impacto Social para seu negócio em Cotia." />
      </Helmet>

      <FormulaConfetti active={phase === "confetti"} />

      {phase === "entry" && (
        <FormulaEntryScreen
          onCode={() => setPhase("code-input")}
          onQuiz={() => setPhase("quiz")}
        />
      )}

      {phase === "code-input" && (
        <FormulaAccessCodeInput
          onValid={handleCodeValid}
          onBack={() => setPhase("entry")}
          onExpired={() => {}}
        />
      )}

      {phase === "quiz" && <FormulaQuizWizard onComplete={handleQuizComplete} />}

      {phase === "confetti" && (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#0F172A" }}>
          <div className="text-center">
            <p className="text-5xl mb-4">🎉</p>
            <h2 className="text-2xl font-bold text-white">Vaga Reservada!</h2>
            <p className="mt-2" style={{ color: "#FFFFFF99" }}>Preparando seu site premium...</p>
          </div>
        </div>
      )}

      {phase === "niche-select" && <FormulaNicheSelector onSelect={handleNicheSelected} />}

      {phase === "niche-site" && (
        <>
          <FormulaNicheSite onOpenCheckout={() => setCheckoutOpen(true)} />
          <FormulaTourGuide active={tourActive} onFinish={handleTourFinish} />
          <FormulaCheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
        </>
      )}
    </>
  );
}

export default function FormulaConexaoPage() {
  return (
    <FormulaConexaoProvider>
      <FormulaConexaoInner />
    </FormulaConexaoProvider>
  );
}
