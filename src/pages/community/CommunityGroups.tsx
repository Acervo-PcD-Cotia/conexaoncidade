import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/hooks/useCommunity";
import { Navigate } from "react-router-dom";
import { Users, Plus, Lock, Globe, MessageCircle, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Group {
  id: string;
  name: string;
  description: string;
  icon: string;
  memberCount: number;
  isPublic: boolean;
  isJoined: boolean;
  recentActivity?: string;
}

// Placeholder groups - will come from database
const placeholderGroups: Group[] = [
  {
    id: "1",
    name: "PcD Cotia",
    description: "Grupo de apoio para pessoas com deficiência e familiares",
    icon: "♿",
    memberCount: 124,
    isPublic: true,
    isJoined: true,
    recentActivity: "Nova discussão sobre acessibilidade",
  },
  {
    id: "2",
    name: "Comerciantes Locais",
    description: "Rede de comerciantes e empreendedores da cidade",
    icon: "🏪",
    memberCount: 89,
    isPublic: true,
    isJoined: false,
    recentActivity: "Feira de negócios marcada para próximo mês",
  },
  {
    id: "3",
    name: "Mães e Pais de Cotia",
    description: "Comunidade para pais e mães trocarem experiências",
    icon: "👨‍👩‍👧‍👦",
    memberCount: 256,
    isPublic: true,
    isJoined: true,
    recentActivity: "Dicas de atividades para as férias",
  },
  {
    id: "4",
    name: "Voluntários Ativos",
    description: "Para quem quer fazer a diferença na comunidade",
    icon: "🤝",
    memberCount: 67,
    isPublic: true,
    isJoined: false,
    recentActivity: "Campanha de arrecadação em andamento",
  },
  {
    id: "5",
    name: "Transporte Escolar",
    description: "Grupo exclusivo para transportadores escolares",
    icon: "🚌",
    memberCount: 34,
    isPublic: false,
    isJoined: false,
  },
];

export default function CommunityGroups() {
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading } = useCommunity();

  if (authLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth-comunidade" replace />;
  }

  const myGroups = placeholderGroups.filter((g) => g.isJoined);
  const discoverGroups = placeholderGroups.filter((g) => !g.isJoined);

  return (
    <>
      <Helmet>
        <title>Grupos | Comunidade Conexão na Cidade</title>
        <meta name="description" content="Participe de grupos temáticos na comunidade de Cotia" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-pink-600" />
              Grupos da Comunidade
            </h1>
            <p className="text-muted-foreground">
              Conecte-se com pessoas que compartilham seus interesses
            </p>
          </div>
          <Button className="gap-2 bg-pink-600 hover:bg-pink-700">
            <Plus className="h-4 w-4" />
            Criar Grupo
          </Button>
        </div>

        {/* My Groups */}
        {myGroups.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold">Meus Grupos</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myGroups.map((group) => (
                <Card key={group.id} className="hover:border-pink-300 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 text-2xl dark:bg-pink-950/30">
                        {group.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{group.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          {group.isPublic ? (
                            <Globe className="h-3 w-3" />
                          ) : (
                            <Lock className="h-3 w-3" />
                          )}
                          {group.memberCount} membros
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {group.description}
                    </p>
                    {group.recentActivity && (
                      <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">
                        <MessageCircle className="h-3 w-3 shrink-0" />
                        <span className="truncate">{group.recentActivity}</span>
                      </div>
                    )}
                    <Button variant="outline" size="sm" className="w-full mt-3 gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Acessar Grupo
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Discover Groups */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Descubra Grupos</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {discoverGroups.map((group) => (
              <Card key={group.id} className="hover:border-pink-300 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-2xl">
                      {group.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{group.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        {group.isPublic ? (
                          <>
                            <Globe className="h-3 w-3" />
                            Público
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3" />
                            Privado
                          </>
                        )}
                        • {group.memberCount} membros
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {group.description}
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full gap-2 bg-pink-600 hover:bg-pink-700"
                  >
                    <UserPlus className="h-4 w-4" />
                    {group.isPublic ? "Participar" : "Solicitar Entrada"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Empty State */}
        {placeholderGroups.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold">Nenhum grupo encontrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Seja o primeiro a criar um grupo na comunidade
              </p>
              <Button className="gap-2 bg-pink-600 hover:bg-pink-700">
                <Plus className="h-4 w-4" />
                Criar Primeiro Grupo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
