import { useFormulaConexao } from "@/contexts/FormulaConexaoContext";
import { getNicheByKey } from "./FormulaNicheData";
import { FormulaCountdown } from "./FormulaCountdown";
import { Shield, Heart, MapPin, Phone, Star, MessageCircle, Sparkles, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onOpenCheckout: () => void;
}

export function FormulaNicheSite({ onOpenCheckout }: Props) {
  const { data } = useFormulaConexao();
  const niche = getNicheByKey(data.nicho);
  const nome = data.negocio || "Seu Negócio";

  return (
    <div className="min-h-screen" style={{ background: "#0F172A", color: "#fff" }}>
      {/* Countdown bar */}
      <FormulaCountdown cpfCnpj={data.cpfCnpj} />

      {/* Hero */}
      <section id="tour-hero" className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 50% 0%, #FF6600 0%, transparent 60%)" }} />
        <div className="relative max-w-3xl mx-auto">
          <span className="text-5xl mb-4 block">{niche.icon}</span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
            <span style={{ color: "#FF6600" }}>{nome}</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium" style={{ color: "#ffffffcc" }}>
            {niche.heroText}
          </p>
        </div>
      </section>

      {/* Serviços */}
      <section id="tour-servicos" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <LayoutGrid size={24} style={{ color: "#FF6600" }} />
            <h2 className="text-2xl font-bold">Nossos Serviços</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {niche.servicos.map((s) => (
              <div key={s} className="rounded-xl p-5 text-center" style={{ background: "#1E293B" }}>
                <p className="font-semibold">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conexão AI */}
      <section id="tour-conexao-ai" className="py-16 px-4" style={{ background: "#1E293B" }}>
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles size={32} className="mx-auto mb-4" style={{ color: "#FF6600" }} />
          <h2 className="text-2xl font-bold mb-4">Conexão AI</h2>
          <p className="text-lg" style={{ color: "#ffffffbb" }}>{niche.conexaoAI}</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3" style={{ background: "#FF660022", border: "1px solid #FF660055" }}>
            <MessageCircle size={18} style={{ color: "#FF6600" }} />
            <span className="text-sm font-medium" style={{ color: "#FF6600" }}>Atendimento 24h no WhatsApp</span>
          </div>
        </div>
      </section>

      {/* Mídia */}
      <section id="tour-midia" className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">📡 Mídia Conexão</h2>
          <p style={{ color: "#ffffffbb" }}>
            Sua empresa será divulgada no <strong>Portal Conexão na Cidade</strong>, <strong>Rádio Web</strong> e <strong>TV Web Conexão</strong>.
          </p>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="tour-depoimentos" className="py-16 px-4" style={{ background: "#1E293B" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">O que dizem nossos parceiros</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {niche.depoimentos.map((d) => (
              <div key={d.nome} className="rounded-xl p-5" style={{ background: "#0F172A" }}>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map((s) => <Star key={s} size={14} fill="#FF6600" style={{ color: "#FF6600" }} />)}
                </div>
                <p className="text-sm mb-3" style={{ color: "#ffffffbb" }}>"{d.texto}"</p>
                <p className="text-xs font-bold" style={{ color: "#FF6600" }}>— {d.nome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selo Verificado */}
      <section id="tour-selo" className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Shield size={40} className="mx-auto mb-4" style={{ color: "#22C55E" }} />
          <h2 className="text-2xl font-bold mb-2">Selo Empresa Verificada</h2>
          <p style={{ color: "#ffffffbb" }}>
            Entregue no evento presencial em Setembro. Credibilidade e confiança para seus clientes.
          </p>
        </div>
      </section>

      {/* Caminhão de Prêmios */}
      <section id="tour-caminhao" className="py-16 px-4" style={{ background: "#1E293B" }}>
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-4xl block mb-4">🎁</span>
          <h2 className="text-2xl font-bold mb-2">Caminhão de Prêmios</h2>
          <p style={{ color: "#ffffffbb" }}>
            Seus clientes participam do nosso Caminhão de Prêmios. A cada R$20 em compras = 1 cupom de sorteio.
            Sorteio ao vivo pela TV Web Conexão.
          </p>
          <a href="/regulamento-caminhao-premios" className="inline-block mt-4 text-sm underline" style={{ color: "#FF6600" }}>
            Ver regulamento completo →
          </a>
        </div>
      </section>

      {/* PCD */}
      <section id="tour-pcd" className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Heart size={40} className="mx-auto mb-4" style={{ color: "#EC4899" }} />
          <h2 className="text-2xl font-bold mb-2">Selo Empresa Amiga do PCD</h2>
          <p style={{ color: "#ffffffbb" }}>
            Sua empresa apoia a rede de suporte às famílias PCD de Cotia, garantindo acesso a terapias, inclusão e suporte social.
            O Selo é ativado automaticamente após o pagamento.
          </p>
        </div>
      </section>

      {/* Mapa / Localização */}
      <section className="py-16 px-4" style={{ background: "#1E293B" }}>
        <div className="max-w-3xl mx-auto text-center">
          <MapPin size={32} className="mx-auto mb-4" style={{ color: "#FF6600" }} />
          <h2 className="text-2xl font-bold mb-2">Localização</h2>
          <p style={{ color: "#ffffffbb" }}>Cotia e região · Grande São Paulo</p>
          <div className="mt-4 h-48 rounded-xl flex items-center justify-center" style={{ background: "#0F172A" }}>
            <p style={{ color: "#ffffff44" }}>📍 Mapa será exibido após ativação</p>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <Button
            onClick={onOpenCheckout}
            className="w-full h-14 text-lg font-bold gap-2"
            style={{ background: "#FF6600", color: "#fff" }}
          >
            <Phone size={20} /> {niche.cta}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t" style={{ borderColor: "#ffffff11" }}>
        <p className="text-sm" style={{ color: "#ffffff55" }}>
          © {new Date().getFullYear()} {nome} · Powered by <span style={{ color: "#FF6600" }}>Conexão na Cidade</span>
        </p>
      </footer>
    </div>
  );
}
