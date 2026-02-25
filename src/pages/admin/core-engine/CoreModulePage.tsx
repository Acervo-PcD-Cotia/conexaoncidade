import { useParams, Navigate } from "react-router-dom";
import { 
  Search, TrendingUp, Shield, Zap, BarChart3, Bell, 
  FileText, ImageIcon, Users, ArrowRightLeft, Code2, 
  HardDrive, UserCog, Bot, ArrowLeft, Cpu
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const moduleConfig: Record<string, {
  title: string;
  icon: React.ElementType;
  color: string;
  status: string;
  features: { name: string; done: boolean }[];
}> = {
  seo: {
    title: "SEO Profissional",
    icon: Search,
    color: "text-blue-500",
    status: "Parcial",
    features: [
      { name: "Meta título e descrição automáticos", done: true },
      { name: "Slug inteligente", done: true },
      { name: "Canonical automático", done: true },
      { name: "Sitemap dinâmico", done: true },
      { name: "Index/noindex por post", done: true },
      { name: "Open Graph automático", done: true },
      { name: "Twitter Cards", done: true },
      { name: "Google News marcação", done: true },
      { name: "Score SEO visual em tempo real", done: false },
      { name: "Score de legibilidade", done: false },
      { name: "Controle de robots.txt", done: false },
      { name: "Breadcrumb estruturado", done: false },
      { name: "Análise de keywords", done: false },
    ],
  },
  ads: {
    title: "Monetização Avançada",
    icon: TrendingUp,
    color: "text-green-500",
    status: "Ativo",
    features: [
      { name: "15 formatos de anúncio", done: true },
      { name: "Campanhas 360°", done: true },
      { name: "Agendamento de campanhas", done: true },
      { name: "Controle por categoria", done: true },
      { name: "Controle por dispositivo", done: true },
      { name: "Controle por geolocalização", done: true },
      { name: "Métricas de impressões e cliques", done: true },
      { name: "CTR automático", done: true },
      { name: "Controle de prioridade", done: true },
      { name: "Integração Google Ad Manager", done: true },
      { name: "Integração Adsense", done: true },
      { name: "Identificação visual PUBLICIDADE", done: true },
    ],
  },
  performance: {
    title: "Performance",
    icon: Zap,
    color: "text-yellow-500",
    status: "Parcial",
    features: [
      { name: "Minificação CSS/JS (Vite)", done: true },
      { name: "Compressão GZIP", done: true },
      { name: "Lazy load avançado", done: true },
      { name: "Cache inteligente (React Query)", done: true },
      { name: "CDN ready", done: true },
      { name: "Painel Core Web Vitals", done: false },
      { name: "Monitor de performance por página", done: false },
      { name: "Alertas de degradação", done: false },
      { name: "Preload inteligente", done: false },
    ],
  },
  security: {
    title: "Segurança",
    icon: Shield,
    color: "text-red-500",
    status: "Parcial",
    features: [
      { name: "RLS rigoroso (Row Level Security)", done: true },
      { name: "Sanitização DOMPurify", done: true },
      { name: "Proteção SQL injection", done: true },
      { name: "Roles e permissões granulares", done: true },
      { name: "Log de atividades admin", done: true },
      { name: "Proteção XSS", done: true },
      { name: "Painel de segurança centralizado", done: false },
      { name: "Monitor de login falhos", done: false },
      { name: "Bloqueio automático de IP", done: false },
      { name: "2FA (TOTP)", done: false },
      { name: "Scanner interno", done: false },
    ],
  },
  analytics: {
    title: "Analytics Interno",
    icon: BarChart3,
    color: "text-purple-500",
    status: "Novo",
    features: [
      { name: "Contagem de views por notícia", done: true },
      { name: "Ranking mais lidas", done: true },
      { name: "Métricas básicas de ads", done: true },
      { name: "Usuários online em tempo real", done: false },
      { name: "Visitas por matéria (gráfico)", done: false },
      { name: "Tempo médio de permanência", done: false },
      { name: "Origem de tráfego", done: false },
      { name: "Dispositivo (mobile/desktop)", done: false },
      { name: "CTR por slot de anúncio", done: false },
      { name: "Receita estimada por bloco", done: false },
      { name: "Integração GA4", done: false },
      { name: "Integração Search Console", done: false },
      { name: "Integração Meta Pixel", done: false },
    ],
  },
  push: {
    title: "Push Notifications",
    icon: Bell,
    color: "text-orange-500",
    status: "Ativo",
    features: [
      { name: "Push web nativo (VAPID)", done: true },
      { name: "Permissão simplificada", done: true },
      { name: "Segmentação por categoria", done: true },
      { name: "Agendamento", done: true },
      { name: "Envio automático ao publicar", done: true },
      { name: "Estatísticas de entrega", done: true },
      { name: "Segmentação por geolocalização", done: false },
      { name: "A/B de título push", done: false },
    ],
  },
  editorial: {
    title: "Editorial Avançado",
    icon: FileText,
    color: "text-indigo-500",
    status: "Ativo",
    features: [
      { name: "Score de qualidade editorial", done: true },
      { name: "Checklist de publicação", done: true },
      { name: "Campo obrigatório de SEO", done: true },
      { name: "Campo obrigatório de imagem hero", done: true },
      { name: "Sugestão automática de tags", done: true },
      { name: "Controle de revisão", done: true },
      { name: "Histórico de edição", done: true },
      { name: "Controle de autor", done: true },
      { name: "Rascunho colaborativo", done: false },
    ],
  },
  media: {
    title: "Mídia Inteligente",
    icon: ImageIcon,
    color: "text-pink-500",
    status: "Parcial",
    features: [
      { name: "Compressão automática", done: true },
      { name: "Conversão WebP (parcial)", done: true },
      { name: "Geração Hero/OG/Card", done: true },
      { name: "ALT automático", done: true },
      { name: "Biblioteca por categoria", done: false },
      { name: "Detecção de duplicata", done: false },
      { name: "Estatísticas de uso", done: false },
      { name: "Limpeza de mídia órfã", done: false },
    ],
  },
  leads: {
    title: "Captação de Leads",
    icon: Users,
    color: "text-teal-500",
    status: "Parcial",
    features: [
      { name: "Formulários básicos", done: true },
      { name: "Integração WhatsApp", done: true },
      { name: "Push para engajamento", done: true },
      { name: "Formulário configurável", done: false },
      { name: "Segmentação de listas", done: false },
      { name: "Exportação CSV", done: false },
      { name: "Autoresponder", done: false },
      { name: "Integração e-mail marketing", done: false },
      { name: "Dashboard de leads com funil", done: false },
    ],
  },
  redirect: {
    title: "Redirecionamento",
    icon: ArrowRightLeft,
    color: "text-amber-500",
    status: "Novo",
    features: [
      { name: "Redirecionamento 301", done: false },
      { name: "Redirecionamento 302", done: false },
      { name: "Monitoramento de 404", done: false },
      { name: "Sugestão automática", done: false },
      { name: "Importação/exportação CSV", done: false },
    ],
  },
  schema: {
    title: "Schema & Dados Estruturados",
    icon: Code2,
    color: "text-cyan-500",
    status: "Parcial",
    features: [
      { name: "Article", done: true },
      { name: "NewsArticle", done: true },
      { name: "Organization (parcial)", done: true },
      { name: "LocalBusiness", done: false },
      { name: "FAQ", done: false },
      { name: "Breadcrumb", done: false },
      { name: "Validador Rich Results", done: false },
    ],
  },
  backup: {
    title: "Backup",
    icon: HardDrive,
    color: "text-slate-500",
    status: "Cloud",
    features: [
      { name: "Backup automático diário", done: true },
      { name: "Gerenciado por Lovable Cloud", done: true },
    ],
  },
  roles: {
    title: "Controle de Acesso",
    icon: UserCog,
    color: "text-violet-500",
    status: "Ativo",
    features: [
      { name: "Super Admin", done: true },
      { name: "Admin", done: true },
      { name: "Editor-Chefe", done: true },
      { name: "Jornalista / Repórter", done: true },
      { name: "Colunista", done: true },
      { name: "Comercial", done: true },
      { name: "Moderador", done: true },
      { name: "Permissões granulares por módulo", done: true },
    ],
  },
  automation: {
    title: "Automação",
    icon: Bot,
    color: "text-emerald-500",
    status: "Ativo",
    features: [
      { name: "Publicação programada", done: true },
      { name: "Atualização automática de sitemap", done: true },
      { name: "Envio para indexação Google", done: true },
      { name: "Notificação automática", done: true },
      { name: "Auto Post PRO", done: true },
      { name: "Score SEO automático", done: false },
    ],
  },
};

export default function CoreModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  
  if (!moduleId || !moduleConfig[moduleId]) {
    return <Navigate to="/spah/painel/core-engine" replace />;
  }

  const mod = moduleConfig[moduleId];
  const Icon = mod.icon;
  const doneCount = mod.features.filter(f => f.done).length;
  const totalCount = mod.features.length;
  const progress = Math.round((doneCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <NavLink to="/spah/painel/core-engine">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </NavLink>
        <div className={cn("p-2.5 rounded-xl bg-muted", mod.color)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{mod.title}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-xs">{mod.status}</Badge>
            <span className="text-xs text-muted-foreground">{doneCount}/{totalCount} funcionalidades</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso de implementação</span>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full rounded-full bg-primary transition-all" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-sm">Funcionalidades</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {mod.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 px-4 py-3">
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                  feature.done 
                    ? "bg-green-500/10 text-green-500" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {feature.done ? "✓" : "○"}
                </div>
                <span className={cn(
                  "text-sm",
                  !feature.done && "text-muted-foreground"
                )}>
                  {feature.name}
                </span>
                {!feature.done && (
                  <Badge variant="outline" className="ml-auto text-[10px]">Pendente</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
