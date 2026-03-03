import { motion } from "framer-motion";
import { useFormulaConexao } from "@/contexts/FormulaConexaoContext";
import { FormulaCountdown } from "./FormulaCountdown";
import { FormulaPillarCards } from "./FormulaPillarCards";
import { FormulaPriceSection } from "./FormulaPriceSection";
import { Rocket } from "lucide-react";

export function FormulaLandingPage() {
  const { data } = useFormulaConexao();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="min-h-screen"
      style={{ background: "#1A1A1A" }}
    >
      <FormulaCountdown cpfCnpj={data.cpfCnpj} />

      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 text-sm font-semibold text-white" style={{ background: "#FF660033" }}>
            <Rocket size={16} style={{ color: "#FF6600" }} /> Vaga Reservada
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            🚀 {data.negocio}, sua vaga está reservada!
          </h1>
          <p className="text-lg" style={{ color: "#FFFFFF99" }}>
            {data.nome}, veja tudo o que a <span style={{ color: "#FF6600" }}>Fórmula Conexão</span> vai
            fazer pela <strong className="text-white">{data.negocio}</strong> em Cotia.
          </p>
        </div>
      </section>

      <FormulaPillarCards />

      {/* Social proof */}
      <section className="py-12 px-4 text-center">
        <p className="text-white/60 text-sm mb-2">Idealizado por</p>
        <p className="text-xl font-bold" style={{ color: "#FF6600" }}>
          Conexão na Cidade
        </p>
        <p className="text-white/50 text-sm mt-1">
          O ecossistema que une tecnologia, mídia e impacto social para empresários de Cotia.
        </p>
      </section>

      <FormulaPriceSection />

      {/* Footer */}
      <footer className="py-8 text-center" style={{ color: "#FFFFFF44" }}>
        <p className="text-xs">
          © {new Date().getFullYear()} Conexão na Cidade · Fórmula Conexão · Cotia-SP
        </p>
      </footer>
    </motion.div>
  );
}
