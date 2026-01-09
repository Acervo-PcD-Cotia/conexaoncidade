import { useState } from "react";
import { 
  AlertTriangle, 
  Check, 
  X, 
  Eye,
  MessageSquare,
  User,
  Flag,
  Ban,
  Clock,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data
const mockReports = [
  {
    id: "1",
    type: "post",
    content: "Conteúdo ofensivo sobre política local...",
    reason: "Discurso de ódio",
    reportedBy: "Maria Silva",
    reportedUser: "João Santos",
    reportedAt: new Date(Date.now() - 3600000),
    status: "pending",
  },
  {
    id: "2",
    type: "comment",
    content: "Comentário com linguagem inapropriada...",
    reason: "Linguagem ofensiva",
    reportedBy: "Ana Costa",
    reportedUser: "Pedro Lima",
    reportedAt: new Date(Date.now() - 7200000),
    status: "pending",
  },
  {
    id: "3",
    type: "user",
    content: null,
    reason: "Spam repetitivo",
    reportedBy: "Carlos Souza",
    reportedUser: "Spam Bot",
    reportedAt: new Date(Date.now() - 86400000),
    status: "resolved",
    resolution: "banned",
  },
];

const mockPenalties = [
  {
    id: "p1",
    user: "Pedro Lima",
    type: "warning",
    reason: "Primeira infração - linguagem inapropriada",
    appliedAt: new Date(Date.now() - 172800000),
    appliedBy: "Admin",
    expiresAt: null,
    isActive: true,
  },
  {
    id: "p2",
    user: "Spam Bot",
    type: "ban",
    reason: "Spam repetitivo e comportamento automatizado",
    appliedAt: new Date(Date.now() - 86400000),
    appliedBy: "Admin",
    expiresAt: null,
    isActive: true,
  },
];

export default function CommunityModeration() {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<typeof mockReports[0] | null>(null);
  const [actionNote, setActionNote] = useState("");

  const filteredReports = mockReports.filter(report => 
    statusFilter === "all" || report.status === statusFilter
  );

  const pendingCount = mockReports.filter(r => r.status === "pending").length;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "post":
        return <Badge variant="outline"><MessageSquare className="h-3 w-3 mr-1" />Post</Badge>;
      case "comment":
        return <Badge variant="outline"><MessageSquare className="h-3 w-3 mr-1" />Comentário</Badge>;
      case "user":
        return <Badge variant="outline"><User className="h-3 w-3 mr-1" />Usuário</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPenaltyBadge = (type: string) => {
    switch (type) {
      case "warning":
        return <Badge variant="secondary">Advertência</Badge>;
      case "mute":
        return <Badge className="bg-yellow-100 text-yellow-800">Silenciado</Badge>;
      case "suspend":
        return <Badge className="bg-orange-100 text-orange-800">Suspenso</Badge>;
      case "ban":
        return <Badge variant="destructive">Banido</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const openActionDialog = (report: typeof mockReports[0]) => {
    setSelectedReport(report);
    setActionDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminHeader
          title="Moderação"
          description="Revise denúncias e gerencie penalidades"
        />
        {pendingCount > 0 && (
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {pendingCount} pendente(s)
          </Badge>
        )}
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">
            <Flag className="h-4 w-4 mr-2" />
            Denúncias
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="penalties">
            <Ban className="h-4 w-4 mr-2" />
            Penalidades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="resolved">Resolvidas</SelectItem>
                <SelectItem value="dismissed">Descartadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredReports.map((report) => (
            <Card key={report.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      report.status === "pending" ? "bg-red-100" : "bg-gray-100"
                    }`}>
                      <AlertTriangle className={`h-5 w-5 ${
                        report.status === "pending" ? "text-red-600" : "text-gray-600"
                      }`} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getTypeBadge(report.type)}
                        <Badge variant="destructive">{report.reason}</Badge>
                        {report.status === "pending" ? (
                          <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>
                        ) : report.status === "resolved" ? (
                          <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Resolvido</Badge>
                        ) : (
                          <Badge variant="outline"><X className="h-3 w-3 mr-1" />Descartado</Badge>
                        )}
                      </div>
                      
                      {report.content && (
                        <p className="text-sm bg-muted p-3 rounded-lg">
                          "{report.content}"
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Denunciado: <span className="font-medium text-foreground">{report.reportedUser}</span>
                        </span>
                        <span>
                          Por: <span className="font-medium text-foreground">{report.reportedBy}</span>
                        </span>
                        <span>
                          {format(report.reportedAt, "dd/MM HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {report.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline" className="text-gray-600">
                        <X className="h-4 w-4 mr-1" />
                        Descartar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => openActionDialog(report)}>
                        <Ban className="h-4 w-4 mr-1" />
                        Aplicar Ação
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredReports.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">Nenhuma denúncia pendente</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="penalties" className="space-y-4">
          {mockPenalties.map((penalty) => (
            <Card key={penalty.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{penalty.user.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{penalty.user}</span>
                        {getPenaltyBadge(penalty.type)}
                        {penalty.isActive ? (
                          <Badge variant="outline" className="text-red-600 border-red-600">Ativo</Badge>
                        ) : (
                          <Badge variant="outline">Expirado</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{penalty.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Aplicado por {penalty.appliedBy} em {format(penalty.appliedAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  {penalty.isActive && (
                    <Button variant="outline" size="sm">
                      Remover Penalidade
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aplicar Penalidade</DialogTitle>
            <DialogDescription>
              Escolha a ação a ser tomada contra o usuário {selectedReport?.reportedUser}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Penalidade</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">Advertência</SelectItem>
                  <SelectItem value="mute">Silenciar (24h)</SelectItem>
                  <SelectItem value="suspend">Suspender (7 dias)</SelectItem>
                  <SelectItem value="ban">Banir Permanentemente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Observações</label>
              <Textarea 
                placeholder="Descreva o motivo da ação..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive">
              Aplicar Penalidade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
