import { 
  Search, TrendingUp, Shield, Zap, BarChart3, Bell, 
  FileText, ImageIcon, Users, ArrowRightLeft, Code2, 
  HardDrive, UserCog, Bot, CheckCircle, AlertTriangle, 
  Clock, ToggleLeft, Cpu
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface CoreModule {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: "active" | "partial" | "new" | "cloud";
  statusLabel: string;
  url: string;
  color: string;
}

const modules: CoreModule[] = [
  { id: "seo", title: "SEO Profissional", description: "Meta tags, score SEO, legibilidade, keywords, robots.txt, sugestões", icon: Search, status: "active", statusLabel: "Ativo", url: "/spah/painel/core-engine/seo", color: "text-blue-500" },
  { id: "ads", title: "Monetização Avançada", description: "15 formatos, campanhas, métricas, CTR, geolocalização", icon: TrendingUp, status: "active", statusLabel: "Ativo", url: "/spah/painel/core-engine/ads", color: "text-green-500" },
  { id: "performance", title: "Performance", description: "Core Web Vitals, LCP, cache, lazy load, CDN", icon: Zap, status: "partial", statusLabel: "Parcial", url: "/spah/painel/core-engine/performance", color: "text-yellow-500" },
  { id: "security", title: "Segurança", description: "Firewall, brute force, 2FA, logs, bloqueio IP", icon: Shield, status: "partial", statusLabel: "Parcial", url: "/spah/painel/core-engine/security", color: "text-red-500" },
  { id: "analytics", title: "Analytics Interno", description: "Tempo real, visitas, origem, dispositivo, receita", icon: BarChart3, status: "new", statusLabel: "Novo", url: "/spah/painel/core-engine/analytics", color: "text-purple-500" },
  { id: "push", title: "Push Notifications", description: "Web push, segmentação, agendamento, A/B", icon: Bell, status: "active", statusLabel: "Ativo", url: "/spah/painel/core-engine/push", color: "text-orange-500" },
  { id: "editorial", title: "Editorial Avançado", description: "Score qualidade, checklist, revisão, colaboração", icon: FileText, status: "active", statusLabel: "Ativo", url: "/spah/painel/core-engine/editorial", color: "text-indigo-500" },
  { id: "media", title: "Mídia Inteligente", description: "Biblioteca, estatísticas, duplicatas, limpeza órfãs", icon: ImageIcon, status: "active", statusLabel: "Ativo", url: "/spah/painel/core-engine/media", color: "text-pink-500" },
  { id: "leads", title: "Captação de Leads", description: "Formulários, WhatsApp, e-mail, segmentação, CSV", icon: Users, status: "partial", statusLabel: "Parcial", url: "/spah/painel/core-engine/leads", color: "text-teal-500" },
  { id: "redirect", title: "Redirecionamento", description: "301, 302, monitor 404, sugestões automáticas", icon: ArrowRightLeft, status: "new", statusLabel: "Novo", url: "/spah/painel/core-engine/redirect", color: "text-amber-500" },
  { id: "schema", title: "Schema & Dados", description: "Article, NewsArticle, FAQ, LocalBusiness, Breadcrumb", icon: Code2, status: "partial", statusLabel: "Parcial", url: "/spah/painel/core-engine/schema", color: "text-cyan-500" },
  { id: "backup", title: "Backup", description: "Backup automático diário, download, restauração", icon: HardDrive, status: "cloud", statusLabel: "Cloud", url: "/spah/painel/core-engine/backup", color: "text-slate-500" },
  { id: "roles", title: "Controle de Acesso", description: "Perfis, permissões granulares por módulo", icon: UserCog, status: "active", statusLabel: "Ativo", url: "/spah/painel/core-engine/roles", color: "text-violet-500" },
  { id: "automation", title: "Automação", description: "Agendamento, sitemap, indexação, notificações", icon: Bot, status: "active", statusLabel: "Ativo", url: "/spah/painel/core-engine/automation", color: "text-emerald-500" },
];

const statusConfig = {
  active: { badge: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle },
  partial: { badge: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock },
  new: { badge: "bg-primary/10 text-primary border-primary/20", icon: AlertTriangle },
  cloud: { badge: "bg-slate-500/10 text-slate-500 border-slate-500/20", icon: HardDrive },
};

export default function CoreEngineDashboard() {
  const activeCount = modules.filter(m => m.status === "active").length;
  const partialCount = modules.filter(m => m.status === "partial").length;
  const newCount = modules.filter(m => m.status === "new").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Cpu className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conexão Core Engine</h1>
          <p className="text-sm text-muted-foreground">
            Motor proprietário do portal — {modules.length} módulos integrados
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{partialCount}</p>
              <p className="text-xs text-muted-foreground">Parciais</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{newCount}</p>
              <p className="text-xs text-muted-foreground">Novos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted border-border">
          <CardContent className="p-3 flex items-center gap-3">
            <Cpu className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{modules.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => {
          const StatusIcon = statusConfig[mod.status].icon;
          return (
            <NavLink key={mod.id} to={mod.url} className="group">
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/30 group-hover:bg-accent/30">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("p-2 rounded-lg bg-muted", mod.color)}>
                        <mod.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{mod.title}</h3>
                        <Badge variant="outline" className={cn("text-[10px] mt-0.5", statusConfig[mod.status].badge)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {mod.statusLabel}
                        </Badge>
                      </div>
                    </div>
                    <Switch checked={mod.status === "active" || mod.status === "partial"} disabled className="pointer-events-none" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{mod.description}</p>
                </CardContent>
              </Card>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
