import { useNavigate } from "react-router-dom";
import { 
  Newspaper, 
  Store, 
  Accessibility, 
  Radio, 
  BarChart3, 
  Zap,
  Sparkles,
  MessageSquare,
  PenTool,
  Wrench
} from "lucide-react";
import { AIActionCard } from "@/components/conexao-ai/AIActionCard";

export default function ConexaoAIDashboard() {
  const navigate = useNavigate();

  const actionCards = [
    {
      title: "Criar notícia com IA",
      description: "Gere uma matéria completa no padrão Conexão a partir de um tema ou rascunho.",
      icon: Newspaper,
      route: "/spah/painel/conexao-ai/criador",
      gradient: "from-blue-500/20 to-blue-500/5",
    },
    {
      title: "Assistente Inteligente",
      description: "Tire dúvidas sobre o portal e receba orientações práticas.",
      icon: MessageSquare,
      route: "/spah/painel/conexao-ai/assistente",
      gradient: "from-purple-500/20 to-purple-500/5",
    },
    {
      title: "Divulgar negócio",
      description: "Quiz inteligente para cadastrar parceiros com recomendações personalizadas.",
      icon: Store,
      route: "/spah/painel/conexao-ai/ferramentas",
      gradient: "from-green-500/20 to-green-500/5",
    },
    {
      title: "Projeto PcD",
      description: "Cadastro assistido de serviços e recursos para pessoas com deficiência.",
      icon: Accessibility,
      route: "/spah/painel/conexao-ai/ferramentas",
      gradient: "from-violet-500/20 to-violet-500/5",
    },
    {
      title: "Configurar Rádio/TV",
      description: "Assistente para ativar e configurar canais de streaming.",
      icon: Radio,
      route: "/spah/painel/conexao-ai/ferramentas",
      gradient: "from-orange-500/20 to-orange-500/5",
    },
    {
      title: "Analisar desempenho",
      description: "Insights sobre conteúdos, módulos e oportunidades de crescimento.",
      icon: BarChart3,
      route: "/spah/painel/conexao-ai/insights",
      gradient: "from-cyan-500/20 to-cyan-500/5",
    },
  ];

  const quickLinks = [
    {
      title: "Ferramentas",
      description: "Gerador de pautas, checklists e formulários inteligentes",
      icon: Wrench,
      route: "/spah/painel/conexao-ai/ferramentas",
    },
    {
      title: "Automações",
      description: "Configure ações automáticas baseadas em eventos",
      icon: Zap,
      route: "/spah/painel/conexao-ai/automacoes",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Conexão.AI</h1>
          <p className="text-muted-foreground">
            Seu assistente inteligente para acelerar operações do portal
          </p>
        </div>
      </div>

      {/* Main action cards */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">O que você quer fazer?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actionCards.map((card) => (
            <AIActionCard
              key={card.title}
              title={card.title}
              description={card.description}
              icon={card.icon}
              onClick={() => navigate(card.route)}
              gradient={card.gradient}
            />
          ))}
        </div>
      </div>

      {/* Quick access */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Acesso rápido</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <button
              key={link.title}
              onClick={() => navigate(link.route)}
              className="flex items-center gap-4 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <link.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">{link.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {link.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-lg border bg-gradient-to-r from-primary/5 to-transparent p-4">
        <div className="flex items-start gap-3">
          <PenTool className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-medium">Dica do dia</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Use o <strong>Criador de Conteúdo</strong> para gerar notícias completas 
              com SEO otimizado e variantes para redes sociais em segundos!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
