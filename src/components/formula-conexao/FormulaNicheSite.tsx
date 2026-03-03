import { useFormulaConexao } from "@/contexts/FormulaConexaoContext";
import { getNicheByKey } from "./FormulaNicheData";
import { FormulaCountdown } from "./FormulaCountdown";
import {
  Shield, Heart, MapPin, Phone, Star, MessageCircle, Sparkles,
  LayoutGrid, CheckCircle2, Gift, Radio, Tv, Globe, Bot, BadgeCheck,
  ArrowRight, Accessibility,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Props {
  onOpenCheckout: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

export function FormulaNicheSite({ onOpenCheckout }: Props) {
  const { data } = useFormulaConexao();
  const niche = getNicheByKey(data.nicho);
  const nome = data.negocio || "Seu Negócio";
  const accent = niche.accentColor;

  return (
    <div className="min-h-screen" style={{ background: "#0A0F1E", color: "#E2E8F0" }}>
      <FormulaCountdown cpfCnpj={data.cpfCnpj} />

      {/* ─── HERO ─── */}
      <section id="tour-hero" className="relative py-24 md:py-32 px-4 text-center overflow-hidden">
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -10%, hsl(${accent} / 0.25) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 50% 100%, hsl(24 95% 50% / 0.1) 0%, transparent 60%)`,
        }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        <motion.div className="relative max-w-3xl mx-auto" initial="hidden" animate="visible">
          <motion.span variants={fadeUp} custom={0} className="text-6xl mb-6 block">{niche.icon}</motion.span>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 font-[Plus_Jakarta_Sans]">
            <span style={{ color: `hsl(${accent})` }}>{nome}</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-lg md:text-2xl font-medium text-white/70 max-w-xl mx-auto">
            {niche.heroText}
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="mt-8">
            <Button
              onClick={onOpenCheckout}
              className="h-14 px-8 text-base font-bold gap-2 rounded-xl shadow-lg"
              style={{ background: `hsl(${accent})`, color: "#fff", boxShadow: `0 8px 30px hsl(${accent} / 0.35)` }}
            >
              <Phone size={18} /> {niche.cta} <ArrowRight size={16} />
            </Button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div variants={fadeUp} custom={4} className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {[
              { icon: <BadgeCheck size={16} />, label: "Empresa Verificada" },
              { icon: <Accessibility size={16} />, label: "Selo PCD" },
              { icon: <Bot size={16} />, label: "Conexão AI 24h" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-1.5 text-xs font-medium text-white/50">
                <span style={{ color: `hsl(${accent})` }}>{b.icon}</span>
                {b.label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ─── SERVIÇOS ─── */}
      <section id="tour-servicos" className="py-20 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
            <motion.div variants={fadeUp} custom={0} className="flex items-center gap-2 justify-center mb-2">
              <LayoutGrid size={20} style={{ color: `hsl(${accent})` }} />
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-[Plus_Jakarta_Sans]">Nossos Serviços</h2>
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {niche.servicos.map((s, i) => (
              <motion.div
                key={s}
                variants={fadeUp}
                custom={i}
                className="group relative rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 cursor-default"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {i === 0 && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-0.5 rounded-full" style={{ background: `hsl(${accent})`, color: "#fff" }}>
                    Destaque
                  </span>
                )}
                <p className="font-semibold text-white text-sm">{s}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CONEXÃO AI ─── */}
      <section id="tour-conexao-ai" className="py-20 md:py-24 px-4" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
            <motion.div variants={fadeUp} custom={0}>
              <Sparkles size={28} className="mx-auto mb-3" style={{ color: `hsl(${accent})` }} />
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-[Plus_Jakarta_Sans]">Conexão AI</h2>
              <p className="mt-2 text-white/60 max-w-lg mx-auto">{niche.conexaoAI}</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={1}
            className="max-w-md mx-auto rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: `0 0 40px hsl(${accent} / 0.1), 0 0 80px hsl(${accent} / 0.05)`,
            }}
          >
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `hsl(${accent} / 0.2)` }}>
                <Bot size={16} style={{ color: `hsl(${accent})` }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{nome}</p>
                <p className="text-[10px] text-white/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Online agora
                </p>
              </div>
              <div className="ml-auto">
                <MessageCircle size={16} className="text-white/30" />
              </div>
            </div>

            {/* Chat messages */}
            <div className="px-5 py-4 space-y-3">
              {niche.conexaoAIChatPreview.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.2 }}
                  viewport={{ once: true }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm"
                    style={{
                      background: msg.role === "user" ? `hsl(${accent} / 0.15)` : "rgba(255,255,255,0.06)",
                      color: msg.role === "user" ? `hsl(${accent})` : "#E2E8F0",
                      borderBottomRightRadius: msg.role === "user" ? "4px" : undefined,
                      borderBottomLeftRadius: msg.role === "ai" ? "4px" : undefined,
                    }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Badge */}
            <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-center gap-2 text-xs font-medium" style={{ color: `hsl(${accent})` }}>
                <MessageCircle size={14} />
                Atendimento 24h no WhatsApp
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── MÍDIA ─── */}
      <section id="tour-midia" className="py-20 md:py-24 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} custom={0} className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-[Plus_Jakarta_Sans]">Mídia Conexão</h2>
            <p className="mt-2 text-white/60">Sua empresa divulgada em múltiplos canais</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: <Globe size={24} />, title: "Portal Web", desc: "Publicações no Portal Conexão na Cidade" },
              { icon: <Radio size={24} />, title: "Rádio Web", desc: "Spots e menções na rádio digital" },
              { icon: <Tv size={24} />, title: "TV Web", desc: "Destaque na TV Web Conexão" },
            ].map((m, i) => (
              <motion.div
                key={m.title}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: `hsl(${accent} / 0.1)`, color: `hsl(${accent})` }}>
                  {m.icon}
                </div>
                <p className="font-bold text-white text-sm">{m.title}</p>
                <p className="text-xs text-white/50 mt-1">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── DEPOIMENTOS ─── */}
      <section id="tour-depoimentos" className="py-20 md:py-24 px-4" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-[Plus_Jakarta_Sans]">
              O que dizem nossos parceiros
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-4">
            {niche.depoimentos.map((d, i) => (
              <motion.div
                key={d.nome}
                variants={fadeUp}
                custom={i}
                className={`rounded-2xl p-6 ${i === 0 ? "md:row-span-1" : ""}`}
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} fill={`hsl(${accent})`} style={{ color: `hsl(${accent})` }} />
                  ))}
                </div>
                <p className="text-sm text-white/75 mb-4 leading-relaxed">"{d.texto}"</p>
                <div className="flex items-center gap-3">
                  <Avatar name={d.nome} color={niche.avatarColors[i] || "#F97316"} />
                  <div>
                    <p className="text-sm font-bold text-white">{d.nome}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={10} style={{ color: `hsl(${accent})` }} />
                      <span className="text-[10px] text-white/40">Verificado</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── SELO VERIFICADO + PCD ─── */}
      <section id="tour-selo" className="py-20 md:py-24 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-4">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={0}
            className="rounded-2xl p-8 text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(34,197,94,0.15)" }}
          >
            <Shield size={40} className="mx-auto mb-4 text-green-400" />
            <h3 className="text-xl font-extrabold text-white mb-2">Selo Empresa Verificada</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Entregue no evento presencial em Setembro. Credibilidade e confiança para seus clientes.
            </p>
          </motion.div>

          <motion.div
            id="tour-pcd"
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={1}
            className="rounded-2xl p-8 text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(236,72,153,0.15)" }}
          >
            <Heart size={40} className="mx-auto mb-4 text-pink-400" />
            <h3 className="text-xl font-extrabold text-white mb-2">Selo Empresa Amiga do PCD</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Apoie a rede de suporte às famílias PCD de Cotia. Ativado automaticamente após o pagamento.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── CAMINHÃO DE PRÊMIOS ─── */}
      <section id="tour-caminhao" className="py-20 md:py-24 px-4" style={{ background: "rgba(255,255,255,0.02)" }}>
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={fadeUp} custom={0}
          className="max-w-3xl mx-auto rounded-2xl p-8 md:p-10 text-center relative overflow-hidden"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 30% 50%, hsl(${accent} / 0.5), transparent 60%)` }} />
          <div className="relative">
            <Gift size={40} className="mx-auto mb-4" style={{ color: `hsl(${accent})` }} />
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3 font-[Plus_Jakarta_Sans]">Caminhão de Prêmios</h2>
            <p className="text-white/60 mb-5 max-w-md mx-auto">
              Seus clientes participam do nosso Caminhão de Prêmios. Sorteio ao vivo pela TV Web Conexão.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full px-6 py-3 mb-4" style={{ background: `hsl(${accent} / 0.1)`, border: `1px solid hsl(${accent} / 0.2)` }}>
              <span className="text-lg font-extrabold" style={{ color: `hsl(${accent})` }}>R$20 = 1 cupom</span>
            </div>
            <div>
              <a href="/regulamento-caminhao-premios" className="text-sm font-medium underline underline-offset-4" style={{ color: `hsl(${accent})` }}>
                Ver regulamento completo →
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── MAPA ─── */}
      <section className="py-20 md:py-24 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="max-w-3xl mx-auto text-center">
          <MapPin size={28} className="mx-auto mb-3" style={{ color: `hsl(${accent})` }} />
          <h2 className="text-2xl font-extrabold tracking-tight text-white mb-2 font-[Plus_Jakarta_Sans]">Localização</h2>
          <p className="text-white/50 mb-6">Cotia e região · Grande São Paulo</p>
          <div className="h-48 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-center">
              <MapPin size={24} className="mx-auto mb-2 animate-bounce" style={{ color: `hsl(${accent})` }} />
              <p className="text-sm text-white/30">Mapa será exibido após ativação</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── WHATSAPP CTA FINAL ─── */}
      <section className="py-20 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, hsl(${accent} / 0.08), transparent 50%, hsl(${accent} / 0.05))`,
        }} />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative max-w-md mx-auto text-center">
          <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3 font-[Plus_Jakarta_Sans]">
            Pronto para transformar seu negócio?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-white/50 mb-6">
            Garanta sua vaga como Parceiro Fundador agora.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Button
              onClick={onOpenCheckout}
              className="w-full h-14 text-base font-bold gap-2 rounded-xl shadow-lg animate-pulse"
              style={{ background: `hsl(${accent})`, color: "#fff", boxShadow: `0 8px 30px hsl(${accent} / 0.35)` }}
            >
              <Phone size={18} /> {niche.cta}
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 px-4 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-xs text-white/30">
          © {new Date().getFullYear()} {nome} · Powered by <span style={{ color: `hsl(${accent})` }}>Conexão na Cidade</span>
        </p>
      </footer>
    </div>
  );
}
