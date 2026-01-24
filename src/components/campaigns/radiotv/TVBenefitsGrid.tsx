import { motion } from "framer-motion";
import { 
  Tv, 
  Film, 
  Upload, 
  ListVideo, 
  PlayCircle, 
  CalendarCheck,
  Smartphone,
  Link,
  Save,
  BarChart,
  MapPin,
  Globe
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const tvBenefits = [
  {
    icon: Tv,
    title: "Vídeo ao vivo",
    description: "Transmissão profissional de vídeo"
  },
  {
    icon: Film,
    title: "Programação VOD",
    description: "Vídeo sob demanda automatizado"
  },
  {
    icon: Upload,
    title: "Upload de vídeos",
    description: "Gerenciamento de biblioteca completo"
  },
  {
    icon: ListVideo,
    title: "Playlists de vídeos",
    description: "Organize sua grade de programação"
  },
  {
    icon: PlayCircle,
    title: "Comerciais em vídeo",
    description: "Monetize sua TV com anúncios"
  },
  {
    icon: CalendarCheck,
    title: "Agendamento",
    description: "Programe exibições automáticas"
  },
  {
    icon: Smartphone,
    title: "Player multi-dispositivo",
    description: "Celular, site e Smart TV"
  },
  {
    icon: Link,
    title: "Links RTMP/M3U8/HLS",
    description: "Compatibilidade total com players"
  },
  {
    icon: Save,
    title: "Gravação de lives",
    description: "Arquivo automático de transmissões"
  },
  {
    icon: BarChart,
    title: "Estatísticas de audiência",
    description: "Métricas detalhadas em tempo real"
  },
  {
    icon: MapPin,
    title: "Restrição GeoIP",
    description: "Controle geográfico de acesso"
  },
  {
    icon: Globe,
    title: "Integração Portal",
    description: "TV integrada ao Portal Conexão"
  }
];

export function TVBenefitsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tvBenefits.map((benefit, index) => (
        <motion.div
          key={benefit.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="h-full hover:shadow-lg hover:border-orange-500/50 transition-all duration-300 group">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-950/50 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <benefit.icon className="h-6 w-6 text-orange-600 dark:text-orange-400 group-hover:text-white" />
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
