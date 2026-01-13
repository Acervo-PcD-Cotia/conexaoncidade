import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import {
  HandHeart,
  HelpCircle,
  Heart,
  Gift,
  Users,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CommunityLayout } from "@/components/community/CommunityLayout";

interface HelpRequest {
  id: string;
  type: "need_help" | "can_help" | "volunteer" | "donation";
  category: string;
  title: string;
  description: string;
  neighborhood: string;
  status: "open" | "in_progress" | "resolved";
  isUrgent: boolean;
  createdAt: string;
  author: {
    name: string;
    avatar?: string;
  };
}

const typeLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  need_help: { label: "Preciso de Ajuda", icon: HelpCircle, color: "bg-orange-100 text-orange-700" },
  can_help: { label: "Posso Ajudar", icon: Heart, color: "bg-green-100 text-green-700" },
  volunteer: { label: "Voluntariado", icon: Users, color: "bg-blue-100 text-blue-700" },
  donation: { label: "Doação", icon: Gift, color: "bg-purple-100 text-purple-700" },
};

const statusLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  open: { label: "Aberto", icon: Clock, color: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "Em andamento", icon: AlertCircle, color: "bg-blue-100 text-blue-700" },
  resolved: { label: "Resolvido", icon: CheckCircle, color: "bg-green-100 text-green-700" },
};

const categoryOptions = [
  "Saúde / Medicamentos",
  "Transporte",
  "Alimentação",
  "Educação",
  "Moradia",
  "Emprego",
  "Apoio PcD",
  "Outros",
];

// Placeholder data
const placeholderRequests: HelpRequest[] = [
  {
    id: "1",
    type: "need_help",
    category: "Transporte",
    title: "Preciso de carona para consulta médica",
    description: "Preciso ir ao Hospital Regional na próxima terça-feira às 14h. Alguém pode me ajudar?",
    neighborhood: "Jardim das Flores",
    status: "open",
    isUrgent: true,
    createdAt: new Date().toISOString(),
    author: { name: "Maria S." },
  },
  {
    id: "2",
    type: "can_help",
    category: "Educação",
    title: "Ofereço aulas de reforço escolar",
    description: "Sou professor aposentado e posso ajudar crianças com matemática e português, de segunda a quarta.",
    neighborhood: "Centro",
    status: "open",
    isUrgent: false,
    createdAt: new Date().toISOString(),
    author: { name: "João P." },
  },
  {
    id: "3",
    type: "donation",
    category: "Alimentação",
    title: "Doação de cestas básicas",
    description: "Empresa local está doando 50 cestas básicas. Entre em contato para retirada.",
    neighborhood: "Portão",
    status: "in_progress",
    isUrgent: false,
    createdAt: new Date().toISOString(),
    author: { name: "Mercado Bom Preço" },
  },
];

export default function RedeDoBem() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading] = useState(false);

  if (authLoading) {
    return (
      <CommunityLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </CommunityLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth-comunidade" replace />;
  }

  const filteredRequests = activeTab === "all" 
    ? placeholderRequests 
    : placeholderRequests.filter((r) => r.type === activeTab);

  return (
    <CommunityLayout>
      <Helmet>
        <title>Rede do Bem | Comunidade Conexão na Cidade</title>
        <meta name="description" content="Ajude e seja ajudado pela comunidade de Cotia" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HandHeart className="h-6 w-6 text-pink-600" />
              Rede do Bem
            </h1>
            <p className="text-muted-foreground">
              Conectando quem precisa com quem pode ajudar
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-pink-600 hover:bg-pink-700">
                <Plus className="h-4 w-4" />
                Nova Solicitação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Solicitação</DialogTitle>
                <DialogDescription>
                  Preencha os dados para pedir ajuda ou oferecer suporte
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" className="gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Preciso de Ajuda
                    </Button>
                    <Button type="button" variant="outline" className="gap-2">
                      <Heart className="h-4 w-4" />
                      Posso Ajudar
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <select id="category" className="w-full rounded-md border px-3 py-2">
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" placeholder="Resumo da sua solicitação" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Descreva com detalhes..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input id="neighborhood" placeholder="Seu bairro" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-pink-600 hover:bg-pink-700">
                    Publicar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(typeLabels).map(([key, { label, icon: Icon, color }]) => (
            <Card key={key}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`rounded-full p-3 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {placeholderRequests.filter((r) => r.type === key).length}
                  </p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="need_help" className="gap-1">
              <HelpCircle className="h-4 w-4" />
              Precisam de Ajuda
            </TabsTrigger>
            <TabsTrigger value="can_help" className="gap-1">
              <Heart className="h-4 w-4" />
              Oferecem Ajuda
            </TabsTrigger>
            <TabsTrigger value="donation" className="gap-1">
              <Gift className="h-4 w-4" />
              Doações
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <HandHeart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 font-semibold">Nenhuma solicitação encontrada</h3>
                  <p className="text-sm text-muted-foreground">
                    Seja o primeiro a criar uma solicitação
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredRequests.map((request) => {
                  const typeInfo = typeLabels[request.type];
                  const statusInfo = statusLabels[request.status];
                  const TypeIcon = typeInfo.icon;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <Card key={request.id} className={`hover:border-pink-300 transition-colors ${request.isUrgent ? "border-orange-300" : ""}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <Badge className={typeInfo.color}>
                            <TypeIcon className="mr-1 h-3 w-3" />
                            {typeInfo.label}
                          </Badge>
                          <div className="flex gap-1">
                            {request.isUrgent && (
                              <Badge variant="destructive" className="text-xs">
                                Urgente
                              </Badge>
                            )}
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className="text-lg mt-2">{request.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {request.neighborhood}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {request.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-pink-700">
                                {request.author.name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm">{request.author.name}</span>
                          </div>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Heart className="h-4 w-4" />
                            Quero Ajudar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* How it works */}
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandHeart className="h-5 w-5 text-pink-600" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
                  <span className="text-xl font-bold text-pink-600">1</span>
                </div>
                <h4 className="font-medium">Publique</h4>
                <p className="text-sm text-muted-foreground">
                  Diga o que precisa ou o que pode oferecer
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
                  <span className="text-xl font-bold text-pink-600">2</span>
                </div>
                <h4 className="font-medium">Conecte</h4>
                <p className="text-sm text-muted-foreground">
                  A comunidade encontra quem pode ajudar
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
                  <span className="text-xl font-bold text-pink-600">3</span>
                </div>
                <h4 className="font-medium">Resolva</h4>
                <p className="text-sm text-muted-foreground">
                  Juntos, fazemos a diferença na cidade
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CommunityLayout>
  );
}
