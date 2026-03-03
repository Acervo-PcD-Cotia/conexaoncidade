import { useState } from "react";
import { FormulaConexaoProvider } from "@/contexts/FormulaConexaoContext";
import { FormulaQuizWizard } from "@/components/formula-conexao/FormulaQuizWizard";
import { FormulaLandingPage } from "@/components/formula-conexao/FormulaLandingPage";
import { FormulaConfetti } from "@/components/formula-conexao/FormulaConfetti";
import { Helmet } from "react-helmet-async";

function FormulaConexaoInner() {
  const [phase, setPhase] = useState<"quiz" | "confetti" | "landing">("quiz");

  function handleQuizComplete() {
    setPhase("confetti");
    setTimeout(() => setPhase("landing"), 2500);
  }

  return (
    <>
      <Helmet>
        <title>Fórmula Conexão — Parceiro Fundador | Conexão na Cidade</title>
        <meta name="description" content="Garanta sua vaga como Parceiro Fundador da Fórmula Conexão. IA, Mídia, Evento, Promoção e Impacto Social para seu negócio em Cotia." />
      </Helmet>

      <FormulaConfetti active={phase === "confetti"} />

      {phase === "quiz" && <FormulaQuizWizard onComplete={handleQuizComplete} />}
      {phase === "confetti" && (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#1A1A1A" }}>
          <div className="text-center">
            <p className="text-5xl mb-4">🎉</p>
            <h2 className="text-2xl font-bold text-white">Vaga Reservada!</h2>
            <p className="mt-2" style={{ color: "#FFFFFF99" }}>Preparando sua oferta exclusiva...</p>
          </div>
        </div>
      )}
      {phase === "landing" && <FormulaLandingPage />}
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
