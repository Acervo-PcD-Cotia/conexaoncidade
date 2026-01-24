import { motion } from "framer-motion";
import { 
  Radio, 
  Zap, 
  Calendar, 
  ListMusic, 
  Music, 
  MessageCircle,
  BarChart,
  Smartphone,
  Mic,
  Save,
  Clock,
  Globe
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const radioBenefits = [
  {
    icon: Radio,
    title: "Rádio online 24h",
    description: "Transmissão contínua sem interrupções"
  },
  {
    icon: Zap,
    title: "AutoDJ inteligente",
    description: "Programação automática quando não há apresentador"
  },
  {
    icon: Calendar,
    title: "Programação ao vivo",
    description: "Transmita ao vivo pelo navegador ou OBS"
  },
  {
    icon: ListMusic,
    title: "Playlists e vinhetas",
    description: "Organize seu conteúdo profissionalmente"
  },
  {
    icon: Music,
    title: "Pedido de músicas",
    description: "Interação com ouvintes em tempo real"
  },
  {
    icon: MessageCircle,
    title: "Chat com ouvintes",
    description: "Engajamento durante as transmissões"
  },
  {
    icon: BarChart,
    title: "Estatísticas em tempo real",
    description: "Métricas detalhadas de audiência"
  },
  {
    icon: Smartphone,
    title: "Player moderno",
    description: "Compatível com site, celular e apps"
  },
  {
    icon: Mic,
    title: "Transmissão ao vivo",
    description: "Pelo navegador ou software OBS"
  },
  {
    icon: Save,
    title: "Gravação de programas",
    description: "Grave para replay automático"
  },
  {
    icon: Clock,
    title: "Agendamento de conteúdos",
    description: "Programe com antecedência"
  },
  {
    icon: Globe,
    title: "Integração Portal",
    description: "Rádio integrada ao Portal Conexão"
  }
];

export function RadioBenefitsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {radioBenefits.map((benefit, index) => (
        <motion.div
          key={benefit.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="h-full hover:shadow-lg hover:border-red-500/50 transition-all duration-300 group">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/50 group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <benefit.icon className="h-6 w-6 text-red-600 dark:text-red-400 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
