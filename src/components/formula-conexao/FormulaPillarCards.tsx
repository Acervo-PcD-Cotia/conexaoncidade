import { motion } from "framer-motion";
import { Bot, Radio, Award, Gift, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Pillar {
  num: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  details: string[];
  color: string;
  gradient: string;
}

const pillars: Pillar[] = [
  {
    num: "01",
    icon: Bot,
    title: "O Cérebro Digital",
    subtitle: "IA Aikeedo + Site Profissional",
    details: [
      "Ecossistema de IA treinado com dados específicos do seu negócio",
      "Qualificação automática de leads 24h via WhatsApp",
      "Site profissional com infraestrutura SSL e hospedagem premium",
      "Painel de métricas em tempo real para acompanhar resultados",
    ],
    color: "rgb(59, 130, 246)",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    num: "02",
    icon: Radio,
    title: "Domínio de Mídia 360º",
    subtitle: "Onipresença Regional Garantida",
    details: [
      "Banner rotativo no Portal com 100.000+ acessos mensais",
      "Presença na Rádio Web e TV Web Conexão na Cidade",
      'Google Meu Negócio otimizado para o topo das buscas em Cotia',
      "Conteúdo editorial dedicado ao seu negócio",
    ],
    color: "rgb(249, 115, 22)",
    gradient: "from-orange-500/20 to-amber-500/20",
  },
  {
    num: "03",
    icon: Award,
    title: "Selo de Autoridade",
    subtitle: "Evento Presencial — Setembro 2025",
    details: [
      "Suba ao palco para receber o Selo de Empresa Verificada",
      "Networking de elite com outros empresários fundadores",
      "Cobertura fotográfica e de vídeo profissional",
      "Material de divulgação exclusivo pós-evento",
    ],
    color: "rgb(234, 179, 8)",
    gradient: "from-yellow-500/20 to-orange-500/20",
  },
  {
    num: "04",
    icon: Gift,
    title: "Máquina de Vendas",
    subtitle: "Caminhão de Prêmios — Dezembro 2025",
    details: [
      "Mecânica: a cada R$ 20 em compras, seu cliente ganha 1 cupom",
      "Ferramenta de fechamento de contratos e fidelização",
      "Sorteio televisionado com cobertura completa da mídia local",
      "Seus clientes associam sua marca a prêmios e oportunidades",
    ],
    color: "rgb(34, 197, 94)",
    gradient: "from-emerald-500/20 to-green-500/20",
  },
  {
    num: "05",
    icon: Heart,
    title: "Manifesto Social",
    subtitle: 'Selo "Empresa Amiga do PCD"',
    details: [
      "Sua empresa financia a rede de apoio PCD em Cotia",
      "Elevação da reputação moral da marca na cidade",
      "Selo exclusivo para uso em fachada, redes e materiais",
      "Impacto social real e mensurável na comunidade",
    ],
    color: "rgb(236, 72, 153)",
    gradient: "from-pink-500/20 to-rose-500/20",
  },
];

function PillarSection({ pillar, index }: { pillar: Pillar; index: number }) {
  const Icon = pillar.icon;
  const isReversed = index % 2 === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="relative"
    >
      <div
        className={`flex flex-col ${isReversed ? "md:flex-row-reverse" : "md:flex-row"} gap-8 items-center`}
      >
        {/* Icon side */}
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <span
            className="text-xs font-bold tracking-[0.3em] uppercase px-3 py-1 rounded-full"
            style={{
              color: pillar.color,
              background: `${pillar.color}15`,
              border: `1px solid ${pillar.color}30`,
            }}
          >
            PILAR {pillar.num}
          </span>
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${pillar.color}20, ${pillar.color}05)`,
              border: `1px solid ${pillar.color}30`,
              boxShadow: `0 0 30px ${pillar.color}15`,
            }}
          >
            <Icon size={36} style={{ color: pillar.color }} />
          </div>
        </div>

        {/* Content side */}
        <div
          className="flex-1 rounded-2xl p-6 md:p-8 backdrop-blur-xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {pillar.title}
          </h3>
          <p className="text-sm font-medium mb-5" style={{ color: pillar.color }}>
            {pillar.subtitle}
          </p>
          <ul className="space-y-3">
            {pillar.details.map((detail, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-3 text-white/70 text-sm leading-relaxed"
              >
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: pillar.color }}
                />
                {detail}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export function FormulaPillarCards() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-orange-400 font-semibold">
            Ecossistema completo
          </span>
          <h2
            className="text-3xl md:text-4xl font-extrabold text-white mt-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Os 5 Pilares de Impacto
          </h2>
          <p className="text-white/50 mt-3 max-w-xl mx-auto text-sm">
            Cada pilar foi projetado para atacar uma frente estratégica do seu negócio em Cotia.
          </p>
        </motion.div>

        <div className="space-y-12 md:space-y-16">
          {pillars.map((p, i) => (
            <PillarSection key={p.num} pillar={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
