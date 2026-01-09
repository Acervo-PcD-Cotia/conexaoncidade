import { useState } from "react";
import { 
  Lightbulb, 
  Plus, 
  Send, 
  Clock,
  Check,
  X,
  MessageSquare,
  Eye,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data
const mockReceivedPitches = [
  {
    id: "1",
    title: "Cobertura especial: Eleições 2026",
    description: "Proposta de cobertura colaborativa das eleições municipais com foco em cidades do interior...",
    fromPartner: "Portal ABC News",
    sentAt: new Date(Date.now() - 86400000),
    status: "pending",
    category: "Política",
  },
  {
    id: "2",
    title: "Série: Startups que estão mudando o Brasil",
    description: "Convite para participar de série sobre inovação tecnológica brasileira...",
    fromPartner: "Tech News BR",
    sentAt: new Date(Date.now() - 172800000),
    status: "accepted",
    category: "Tecnologia",
  },
];

const mockSentPitches = [
  {
    id: "s1",
    title: "Festival Gastronômico Regional",
    description: "Convite para cobertura conjunta do maior festival gastronômico da região...",
    toPartner: "Diário Regional",
    sentAt: new Date(Date.now() - 43200000),
    status: "pending",
    responses: 0,
  },
  {
    id: "s2",
    title: "Investigação: Transporte Público",
    description: "Proposta de investigação conjunta sobre problemas no transporte público...",
    toPartner: "Portal ABC News",
    sentAt: new Date(Date.now() - 259200000),
    status: "accepted",
    responses: 2,
  },
];

export default function PartnersPitches() {
  const [isNewPitchOpen, setIsNewPitchOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "accepted":
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Aceito</Badge>;
      case "rejected":
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Recusado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminHeader
          title="Sugestões de Pauta"
          description="Troque sugestões de pauta com seus parceiros"
        />
        <Dialog open={isNewPitchOpen} onOpenChange={setIsNewPitchOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Sugestão
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nova Sugestão de Pauta</DialogTitle>
              <DialogDescription>
                Envie uma sugestão de pauta para um ou mais parceiros
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título da Pauta</Label>
                <Input placeholder="Ex: Cobertura especial..." />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea 
                  placeholder="Descreva sua proposta de pauta..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="politics">Política</SelectItem>
                    <SelectItem value="economy">Economia</SelectItem>
                    <SelectItem value="culture">Cultura</SelectItem>
                    <SelectItem value="tech">Tecnologia</SelectItem>
                    <SelectItem value="sports">Esportes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Enviar para</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione parceiros" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Parceiros</SelectItem>
                    <SelectItem value="abc">Portal ABC News</SelectItem>
                    <SelectItem value="diario">Diário Regional</SelectItem>
                    <SelectItem value="tech">Tech News BR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewPitchOpen(false)}>
                  Cancelar
                </Button>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Sugestão
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recebidas Pendentes</CardDescription>
            <CardTitle className="text-2xl">
              {mockReceivedPitches.filter(p => p.status === "pending").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Enviadas Pendentes</CardDescription>
            <CardTitle className="text-2xl">
              {mockSentPitches.filter(p => p.status === "pending").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aceitas (30 dias)</CardDescription>
            <CardTitle className="text-2xl">8</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taxa de Aceite</CardDescription>
            <CardTitle className="text-2xl">72%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="received" className="space-y-4">
        <TabsList>
          <TabsTrigger value="received">
            Recebidas
            <Badge variant="secondary" className="ml-2">{mockReceivedPitches.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="sent">
            Enviadas
            <Badge variant="secondary" className="ml-2">{mockSentPitches.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {mockReceivedPitches.map((pitch) => (
            <Card key={pitch.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{pitch.fromPartner.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{pitch.title}</h3>
                        {getStatusBadge(pitch.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        De: <span className="font-medium">{pitch.fromPartner}</span>
                        {" • "}
                        {format(pitch.sentAt, "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                      <p className="text-sm">{pitch.description}</p>
                      <Badge variant="outline" className="mt-2">{pitch.category}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                    {pitch.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <X className="h-4 w-4" />
                        </Button>
                        <Button size="sm">
                          <Check className="h-4 w-4 mr-1" />
                          Aceitar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {mockSentPitches.map((pitch) => (
            <Card key={pitch.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{pitch.title}</h3>
                        {getStatusBadge(pitch.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Para: <span className="font-medium">{pitch.toPartner}</span>
                        {" • "}
                        {format(pitch.sentAt, "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                      <p className="text-sm">{pitch.description}</p>
                      {pitch.responses > 0 && (
                        <Badge variant="secondary" className="mt-2">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {pitch.responses} resposta(s)
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Respostas
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {mockReceivedPitches.length === 0 && mockSentPitches.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma sugestão de pauta ainda</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsNewPitchOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Sugestão
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
