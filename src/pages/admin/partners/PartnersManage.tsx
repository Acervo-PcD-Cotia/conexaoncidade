import { useState } from "react";
import { 
  Handshake, 
  Plus, 
  Search, 
  MoreVertical,
  ExternalLink,
  Settings,
  Trash2,
  Check,
  Clock,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminHeader } from "@/components/admin/AdminHeader";

// Mock data
const mockPartners = [
  {
    id: "1",
    name: "Portal ABC News",
    domain: "abcnews.com.br",
    logo: null,
    status: "active",
    type: "bilateral",
    articlesReceived: 45,
    articlesSent: 32,
    lastSync: new Date(),
  },
  {
    id: "2",
    name: "Diário Regional",
    domain: "diarioregional.com.br",
    logo: null,
    status: "active",
    type: "receive_only",
    articlesReceived: 28,
    articlesSent: 0,
    lastSync: new Date(Date.now() - 3600000),
  },
  {
    id: "3",
    name: "Tech News BR",
    domain: "technewsbr.com",
    logo: null,
    status: "pending",
    type: "send_only",
    articlesReceived: 0,
    articlesSent: 15,
    lastSync: null,
  },
];

const mockPendingRequests = [
  {
    id: "p1",
    name: "Gazeta Local",
    domain: "gazetalocal.com.br",
    requestedAt: new Date(),
    type: "bilateral",
  },
  {
    id: "p2",
    name: "Notícias do Vale",
    domain: "noticiasdovale.com.br",
    requestedAt: new Date(Date.now() - 86400000),
    type: "receive_only",
  },
];

export default function PartnersManage() {
  const [search, setSearch] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspenso</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "bilateral":
        return <Badge variant="outline">Bilateral</Badge>;
      case "receive_only":
        return <Badge variant="outline">Só Recebe</Badge>;
      case "send_only":
        return <Badge variant="outline">Só Envia</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const filteredPartners = mockPartners.filter(partner =>
    partner.name.toLowerCase().includes(search.toLowerCase()) ||
    partner.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminHeader
          title="Gerenciar Parcerias"
          description="Configure e monitore suas parcerias de sindicação"
        />
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Convidar Parceiro
        </Button>
      </div>

      <Tabs defaultValue="partners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="partners">
            Parceiros Ativos
            <Badge variant="secondary" className="ml-2">{mockPartners.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Solicitações
            <Badge variant="secondary" className="ml-2">{mockPendingRequests.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar parceiro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPartners.map((partner) => (
              <Card key={partner.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={partner.logo || undefined} />
                        <AvatarFallback>{partner.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{partner.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          {partner.domain}
                          <ExternalLink className="h-3 w-3" />
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Configurar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visitar Site
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(partner.status)}
                    {getTypeBadge(partner.type)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Recebidos</p>
                      <p className="text-lg font-semibold">{partner.articlesReceived}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Enviados</p>
                      <p className="text-lg font-semibold">{partner.articlesSent}</p>
                    </div>
                  </div>

                  {partner.lastSync && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Última sinc: {new Date(partner.lastSync).toLocaleString("pt-BR")}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPartners.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Handshake className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum parceiro encontrado</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Convidar Primeiro Parceiro
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {mockPendingRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{request.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.name}</p>
                      <p className="text-sm text-muted-foreground">{request.domain}</p>
                    </div>
                    {getTypeBadge(request.type)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <X className="h-4 w-4 mr-1" />
                      Recusar
                    </Button>
                    <Button size="sm">
                      <Check className="h-4 w-4 mr-1" />
                      Aceitar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {mockPendingRequests.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma solicitação pendente</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
