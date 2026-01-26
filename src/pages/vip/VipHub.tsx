import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  Map,
  Users,
  Target,
  ArrowRight,
  Sparkles,
  BookOpen,
  MessageCircle,
  Trophy,
} from "lucide-react";

const VIP_SECTIONS = [
  {
    id: "tools",
    title: "Ferramentas",
    description: "Acesse ferramentas exclusivas para potencializar seu portal",
    icon: Wrench,
    href: "/vip/tools",
    color: "blue",
    badge: "12 disponíveis",
  },
  {
    id: "trilhas",
    title: "Trilhas de Aprendizado",
    description: "Siga trilhas guiadas para dominar cada aspecto da plataforma",
    icon: Map,
    href: "/vip/trilhas",
    color: "green",
    badge: "5 trilhas",
  },
  {
    id: "comunidade",
    title: "Comunidade",
    description: "Conecte-se com outros membros, tire dúvidas e compartilhe ideias",
    icon: Users,
    href: "/vip/comunidade",
    color: "purple",
    badge: null,
  },
  {
    id: "missoes",
    title: "Missões",
    description: "Complete missões para ganhar pontos e desbloquear recursos",
    icon: Target,
    href: "/vip/missoes",
    color: "amber",
    badge: "3 ativas",
  },
];

export default function VipHub() {
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Área VIP</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Comunidade VIP</h1>
        <p className="text-muted-foreground">
          Acesse conteúdos exclusivos, ferramentas avançadas e conecte-se com outros membros.
        </p>
      </div>

      {/* Cards de seções */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {VIP_SECTIONS.map((section) => {
          const IconComponent = section.icon;
          
          return (
            <Card key={section.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-${section.color}-500/10`}>
                    <IconComponent className={`h-6 w-6 text-${section.color}-500`} />
                  </div>
                  {section.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {section.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl mt-4">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="group-hover:bg-primary/10 w-full justify-between">
                  <Link to={section.href}>
                    Acessar
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        <Card className="text-center p-4">
          <BookOpen className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
          <div className="text-2xl font-bold">12</div>
          <div className="text-xs text-muted-foreground">Conteúdos lidos</div>
        </Card>
        <Card className="text-center p-4">
          <MessageCircle className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
          <div className="text-2xl font-bold">5</div>
          <div className="text-xs text-muted-foreground">Participações</div>
        </Card>
        <Card className="text-center p-4">
          <Trophy className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
          <div className="text-2xl font-bold">230</div>
          <div className="text-xs text-muted-foreground">Pontos VIP</div>
        </Card>
      </div>
    </div>
  );
}
