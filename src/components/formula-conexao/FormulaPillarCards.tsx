import { Bot, Radio, Award, Gift, Heart } from "lucide-react";

const pillars = [
  {
    icon: Bot,
    title: "Tecnologia",
    desc: "IA Aikeedo + Site Profissional para o seu negócio dominar o digital.",
    color: "#3399FF",
  },
  {
    icon: Radio,
    title: "Mídia",
    desc: "Exposição no Portal, Rádio, TV e Google da região de Cotia.",
    color: "#FF6600",
  },
  {
    icon: Award,
    title: "Evento",
    desc: "Selo de Verificado e presença no palco do evento de Setembro.",
    color: "#FFD700",
  },
  {
    icon: Gift,
    title: "Promoção",
    desc: "Caminhão de Prêmios — R$ 20 = 1 cupom para seus clientes.",
    color: "#00CC66",
  },
  {
    icon: Heart,
    title: "Impacto Social",
    desc: 'Selo "Empresa Amiga do PCD" — Impacto social real em Cotia.',
    color: "#FF69B4",
  },
];

export function FormulaPillarCards() {
  return (
    <section className="py-12 px-4">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
        Os 5 Pilares da Fórmula
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="rounded-2xl p-6 border transition-transform hover:scale-[1.03]"
              style={{ background: "#222", borderColor: p.color + "44" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: p.color + "22" }}
              >
                <Icon size={24} style={{ color: p.color }} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
              <p className="text-sm" style={{ color: "#FFFFFF99" }}>{p.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
