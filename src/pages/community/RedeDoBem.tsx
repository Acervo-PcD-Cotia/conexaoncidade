import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
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
  Lock,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { CommunityLayout } from "@/components/community/CommunityLayout";
import { useCommunity } from "@/hooks/useCommunity";
import { useRedeDoBem, HelpRequestType } from "@/hooks/useRedeDoBem";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

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

const neighborhoodOptions = [
  "Centro", "Jardim das Flores", "Vila São João", "Parque das Nações",
  "Granja Viana", "Jardim Atalaia", "Portão", "Caucaia do Alto",
];

export default function RedeDoBem() {
  const { user, isLoading: authLoading } = useAuth();
  const { membership } = useCommunity();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get real data from hook
  const { requests, isLoading: requestsLoading, stats, createRequest, respondToRequest } = useRedeDoBem();

  // Form state
  const [formData, setFormData] = useState({
    type: "need_help" as HelpRequestType,
    category: "Outros",
    title: "",
    description: "",
    neighborhood: "",
    is_urgent: false,
  });

  // Check if user is super_admin
  const { data: isSuperAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["user-role-super-admin", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Check if user has rede_do_bem_access badge
  const hasRedeDoBemAccess = isSuperAdmin || 
    (membership?.badges && Array.isArray(membership.badges) && membership.badges.includes("rede_do_bem_access"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest.mutate(formData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({
          type: "need_help",
          category: "Outros",
          title: "",
          description: "",
          neighborhood: "",
          is_urgent: false,
        });
      },
    });
  };

  const handleRespond = (requestId: string) => {
    respondToRequest.mutate({ 
      request_id: requestId, 
      message: "Olá! Gostaria de ajudar com sua solicitação." 
    });
  };

  if (authLoading || roleLoading) {
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

  // Access restriction: only super_admin or users with rede_do_bem_access badge
  if (!hasRedeDoBemAccess) {
    return (
      <CommunityLayout>
        <Helmet>
          <title>Rede do Bem | Acesso Restrito</title>
        </Helmet>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-6 mb-6">
            <Lock className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground max-w-md mb-6">
            A Rede do Bem está disponível apenas para administradores e membros convidados.
            Entre em contato com a equipe para solicitar acesso.
          </p>
          <Button onClick={() => navigate("/comunidade")} className="bg-pink-600 hover:bg-pink-700">
            <HandHeart className="mr-2 h-4 w-4" />
            Voltar para Comunidade
          </Button>
        </div>
      </CommunityLayout>
    );
  }

  const filteredRequests = activeTab === "all" 
    ? (requests || [])
    : (requests || []).filter((r) => r.type === activeTab);

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
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Solicitação</DialogTitle>
                <DialogDescription>
                  Preencha os dados para pedir ajuda ou oferecer suporte
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de solicitação</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      type="button" 
                      variant={formData.type === "need_help" ? "default" : "outline"} 
                      className={`gap-2 ${formData.type === "need_help" ? "bg-orange-600 hover:bg-orange-700" : ""}`}
                      onClick={() => setFormData(prev => ({ ...prev, type: "need_help" }))}
                    >
                      <HelpCircle className="h-4 w-4" />
                      Preciso de Ajuda
                    </Button>
                    <Button 
                      type="button" 
                      variant={formData.type === "can_help" ? "default" : "outline"} 
                      className={`gap-2 ${formData.type === "can_help" ? "bg-green-600 hover:bg-green-700" : ""}`}
                      onClick={() => setFormData(prev => ({ ...prev, type: "can_help" }))}
                    >
                      <Heart className="h-4 w-4" />
                      Posso Ajudar
                    </Button>
                    <Button 
                      type="button" 
                      variant={formData.type === "volunteer" ? "default" : "outline"} 
                      className={`gap-2 ${formData.type === "volunteer" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                      onClick={() => setFormData(prev => ({ ...prev, type: "volunteer" }))}
                    >
                      <Users className="h-4 w-4" />
                      Voluntariado
                    </Button>
                    <Button 
                      type="button" 
                      variant={formData.type === "donation" ? "default" : "outline"} 
                      className={`gap-2 ${formData.type === "donation" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                      onClick={() => setFormData(prev => ({ ...prev, type: "donation" }))}
                    >
                      <Gift className="h-4 w-4" />
                      Doação
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <select 
                    id="category" 
                    className="w-full rounded-md border px-3 py-2"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input 
                    id="title" 
                    placeholder="Resumo da sua solicitação" 
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Descreva com detalhes..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <select 
                    id="neighborhood" 
                    className="w-full rounded-md border px-3 py-2"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                  >
                    <option value="">Selecione o bairro</option>
                    {neighborhoodOptions.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_urgent"
                    checked={formData.is_urgent}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_urgent: !!checked }))}
                  />
                  <Label htmlFor="is_urgent" className="cursor-pointer text-orange-600 font-medium">
                    Marcar como urgente
                  </Label>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-pink-600 hover:bg-pink-700"
                    disabled={createRequest.isPending || !formData.title}
                  >
                    {createRequest.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publicando...
                      </>
                    ) : (
                      "Publicar"
                    )}
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
                    {stats[key as keyof typeof stats] || 0}
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
            {requestsLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
              </div>
            ) : filteredRequests.length === 0 ? (
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
                  const typeInfo = typeLabels[request.type] || typeLabels.need_help;
                  const statusInfo = statusLabels[request.status] || statusLabels.open;
                  const TypeIcon = typeInfo.icon;
                  const StatusIcon = statusInfo.icon;
                  const authorName = request.author?.full_name || "Anônimo";

                  return (
                    <Card key={request.id} className={`hover:border-pink-300 transition-colors ${request.is_urgent ? "border-orange-300" : ""}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <Badge className={typeInfo.color}>
                            <TypeIcon className="mr-1 h-3 w-3" />
                            {typeInfo.label}
                          </Badge>
                          <div className="flex gap-1">
                            {request.is_urgent && (
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
                          {request.neighborhood || "Não informado"}
                          <span className="mx-1">•</span>
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: ptBR })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {request.description || "Sem descrição"}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-pink-700">
                                {authorName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm">{authorName}</span>
                          </div>
                          {request.status === "open" && request.type === "need_help" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-1"
                              onClick={() => handleRespond(request.id)}
                              disabled={respondToRequest.isPending}
                            >
                              <Heart className="h-4 w-4" />
                              Quero Ajudar
                            </Button>
                          )}
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