import { motion } from "framer-motion";
import { Crown, CalendarCheck } from "lucide-react";

export function FormulaFounderPact() {
  return (
    <section className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        <div
          className="relative rounded-3xl p-8 md:p-10 backdrop-blur-xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(249, 115, 22, 0.3)",
            boxShadow: "0 0 60px rgba(249, 115, 22, 0.06)",
          }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-bold tracking-wider uppercase"
            style={{
              background: "rgba(249, 115, 22, 0.1)",
              border: "1px solid rgba(249, 115, 22, 0.3)",
              color: "rgb(249, 115, 22)",
              boxShadow: "0 0 20px rgba(249, 115, 22, 0.15)",
            }}
            animate={{
              boxShadow: [
                "0 0 15px rgba(249,115,22,0.1)",
                "0 0 25px rgba(249,115,22,0.25)",
                "0 0 15px rgba(249,115,22,0.1)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Crown size={14} />
            Exclusivo Fundadores
          </motion.div>

          <h2
            className="text-2xl md:text-3xl font-extrabold text-white mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            O Pacto do Parceiro Fundador
          </h2>

          <p className="text-white/60 text-sm leading-relaxed mb-6">
            Como Parceiro Fundador, você não paga apenas pelos meses contratados. 
            Você entra em um pacto de crescimento mútuo com a Conexão na Cidade.
          </p>

          {/* Highlight box */}
          <div
            className="rounded-2xl p-6 flex items-start gap-4"
            style={{
              background: "rgba(249, 115, 22, 0.08)",
              border: "1px solid rgba(249, 115, 22, 0.15)",
            }}
          >
            <CalendarCheck size={28} className="text-orange-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Pague 10, Use 13
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                As mensalidades <strong className="text-white">11, 12</strong> e a{" "}
                <strong className="text-white">1ª do próximo ano</strong> estão inclusas 
                no seu pacote de fundador. São 3 meses extras de IA, mídia e tecnologia 
                trabalhando pelo seu negócio — sem custo adicional.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
