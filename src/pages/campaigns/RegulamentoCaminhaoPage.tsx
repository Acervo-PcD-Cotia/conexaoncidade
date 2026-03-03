import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function RegulamentoCaminhaoPage() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "#0F172A", color: "#fff" }}>
      <Helmet>
        <title>Regulamento Caminhão de Prêmios | Conexão na Cidade</title>
        <meta name="description" content="Regulamento completo da campanha Caminhão de Prêmios do Conexão na Cidade em Cotia." />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <Link to="/formula-conexao" className="inline-flex items-center gap-2 text-sm mb-8" style={{ color: "#FF6600" }}>
          <ArrowLeft size={16} /> Voltar
        </Link>

        <h1 className="text-3xl font-extrabold mb-8" style={{ color: "#FF6600" }}>
          🎁 Regulamento — Caminhão de Prêmios
        </h1>

        <div className="space-y-6 text-base leading-relaxed" style={{ color: "#ffffffcc" }}>
          <section>
            <h2 className="text-xl font-bold text-white mb-2">1. Período da Campanha</h2>
            <p>A campanha "Caminhão de Prêmios" será válida de <strong>Setembro a Dezembro</strong> do ano vigente, com sorteios mensais e um grande sorteio final.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">2. Como Participar</h2>
            <p>A cada <strong>R$ 20,00</strong> em compras nos estabelecimentos parceiros cadastrados, o consumidor recebe <strong>1 cupom</strong> para concorrer aos prêmios.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">3. Sorteios</h2>
            <p>Os sorteios serão transmitidos ao vivo pela <strong>TV Web Conexão</strong>. As datas serão divulgadas com antecedência no Portal Conexão na Cidade.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">4. Prêmios</h2>
            <p>Todos os prêmios são fornecidos pelo <strong>Conexão na Cidade</strong>. O comerciante parceiro apenas distribui os cupons — <strong>sem custo adicional</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">5. Cupons</h2>
            <p><strong>Não há limitação</strong> de cupons por cliente. Quanto mais comprar nos parceiros, mais chances de ganhar.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">6. Estabelecimentos Participantes</h2>
            <p>Participam apenas estabelecimentos <strong>cadastrados como Parceiros Fundadores</strong> na Fórmula Conexão.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">7. Dúvidas</h2>
            <p>Consultas podem ser feitas diretamente pela <strong>Conexão AI</strong> no WhatsApp ou pelo Portal Conexão na Cidade.</p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs" style={{ color: "#ffffff44" }}>
            © {new Date().getFullYear()} Conexão na Cidade · Cotia, SP
          </p>
        </div>
      </div>
    </div>
  );
}
