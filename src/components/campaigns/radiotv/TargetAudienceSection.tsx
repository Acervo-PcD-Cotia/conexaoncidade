import { motion } from "framer-motion";
import { 
  Newspaper, 
  Headphones, 
  Church, 
  Sparkles, 
  GraduationCap,
  Landmark
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const audiences = [
  {
    icon: Newspaper,
    title: "Jornalistas e Portais de Notícias",
    color: "blue",
    items: [
      "Programas ao vivo",
      "Debates, entrevistas e análises",
      "Rádio e TV próprias do portal",
      "Conteúdo local com autoridade"
    ]
  },
  {
    icon: Headphones,
    title: "Podcasters",
    color: "purple",
    items: [
      "Podcast ao vivo",
      "Rádio 24h com episódios",
      "Distribuição centralizada",
      "Engajamento com chat e pedidos"
    ]
  },
  {
    icon: Church,
    title: "Igrejas e Comunidades Religiosas",
    color: "emerald",
    items: [
      "Cultos ao vivo",
      "Programação semanal automática",
      "Rádio gospel 24h",
      "Alcance além do templo"
    ]
  },
  {
    icon: Sparkles,
    title: "Influenciadores e Criadores",
    color: "pink",
    items: [
      "Lives profissionais",
      "Programas próprios",
      "Monetização com patrocinadores",
      "Presença além das redes sociais"
    ]
  },
  {
    icon: GraduationCap,
    title: "Escolas e Projetos Sociais",
    color: "amber",
    items: [
      "Comunicação institucional",
      "Programação educativa",
      "Eventos ao vivo",
      "Rádio e TV como canal oficial"
    ]
  },
  {
    icon: Landmark,
    title: "Prefeituras e Órgãos Públicos",
    color: "slate",
    items: [
      "Transparência pública",
      "Audiências ao vivo",
      "Comunicação com a população",
      "Canal oficial permanente"
    ]
  }
];

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  blue: {
    bg: "bg-blue-100 dark:bg-blue-950/50",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800"
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-950/50",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800"
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-950/50",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800"
  },
  pink: {
    bg: "bg-pink-100 dark:bg-pink-950/50",
    text: "text-pink-600 dark:text-pink-400",
    border: "border-pink-200 dark:border-pink-800"
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-950/50",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800"
  },
  slate: {
    bg: "bg-slate-100 dark:bg-slate-800/50",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-700"
  }
};

export function TargetAudienceSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {audiences.map((audience, index) => {
        const colors = colorClasses[audience.color];
        return (
          <motion.div
            key={audience.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`h-full hover:shadow-lg transition-all duration-300 border-2 ${colors.border}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${colors.bg}`}>
                    <audience.icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <CardTitle className="text-lg">{audience.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {audience.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.bg.replace('bg-', 'bg-').replace('/50', '')}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
