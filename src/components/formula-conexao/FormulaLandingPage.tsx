import { motion } from "framer-motion";
import { useFormulaConexao } from "@/contexts/FormulaConexaoContext";
import { FormulaCountdown } from "./FormulaCountdown";
import { FormulaPillarCards } from "./FormulaPillarCards";
import { FormulaPriceSection } from "./FormulaPriceSection";
import { FormulaTimeline } from "./FormulaTimeline";
import { FormulaFounderPact } from "./FormulaFounderPact";
import { FormulaAvailability } from "./FormulaAvailability";
import { FormulaTestimonials } from "./FormulaTestimonials";
import { Rocket, ShieldCheck } from "lucide-react";

export function FormulaLandingPage() {
  const { data } = useFormulaConexao();

  return (
    <div className="min-h-screen" style={{ background: "#0f172a" }}>
      <FormulaCountdown cpfCnpj={data.cpfCnpj} />

      {/* Hero */}
      <section className="py-20 md:py-28 px-4 text-center relative overflow-hidden">
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 60%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative max-w-3xl mx-auto"
        >
          <motion.div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 text-xs font-bold tracking-wider uppercase"
            style={{
              background: "rgba(249, 115, 22, 0.1)",
              border: "1px solid rgba(249, 115, 22, 0.25)",
              color: "rgb(249, 115, 22)",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <ShieldCheck size={14} /> Vaga Reservada como Parceiro Fundador
          </motion.div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <span style={{ color: "rgb(249, 115, 22)" }}>{data.negocio}</span>,{" "}
            sua vaga está reservada.
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            {data.nome}, este é o seu dossiê exclusivo. Veja como a{" "}
            <span className="text-orange-400 font-semibold">Fórmula Conexão</span>{" "}
            vai posicionar a <strong className="text-white">{data.negocio}</strong>{" "}
            como referência em Cotia.
          </p>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="max-w-xs mx-auto h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

      <FormulaPillarCards />
      <FormulaTimeline />
      <FormulaFounderPact />
      <FormulaAvailability />
      <FormulaTestimonials />
      <FormulaPriceSection />

      {/* Footer */}
      <footer className="py-10 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-white/60 text-sm mb-1">Idealizado por</p>
        <p className="text-lg font-bold text-orange-400" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Conexão na Cidade
        </p>
        <p className="text-white/30 text-xs mt-3">
          © {new Date().getFullYear()} Conexão na Cidade · Fórmula Conexão · Cotia-SP
        </p>
      </footer>
    </div>
  );
}
