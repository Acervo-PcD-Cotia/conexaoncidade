import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Users, Search, CheckCircle2, XCircle, ShieldCheck, Loader2, Eye, Phone } from "lucide-react";
import { useTransporters, useUpdateTransporter, TransporterWithRelations } from "@/hooks/useTransporters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TransportadoresAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedTransporter, setSelectedTransporter] = useState<TransporterWithRelations | null>(null);

  const { data: transporters, isLoading } = useTransporters({
    status: filterStatus || undefined,
  });

  const updateTransporter = useUpdateTransporter();

  const filteredTransporters = transporters?.filter(t =>
    t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.whatsapp.includes(searchTerm)
  ) || [];

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateTransporter.mutateAsync({ id, status: newStatus as any });
  };

  const handleVerificationChange = async (id: string, level: number) => {
    await updateTransporter.mutateAsync({ id, nivel_verificacao: level });
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge variant="default" className="bg-green-600">Ativo</Badge>;
      case "pendente":
        return <Badge variant="secondary">Pendente</Badge>;
      case "bloqueado":
        return <Badge variant="destructive">Bloqueado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const verificationBadge = (level: number) => {
    switch (level) {
      case 0:
        return <Badge variant="outline">Não verificado</Badge>;
      case 1:
        return <Badge variant="secondary">Básico</Badge>;
      case 2:
        return <Badge className="bg-blue-600">Verificado</Badge>;
      case 3:
        return <Badge className="bg-green-600">Premium</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const turnoLabels: Record<string, string> = {
    manha: "Manhã",
    tarde: "Tarde",
    noite: "Noite",
    integral: "Integral",
  };

  return (
    <>
      <Helmet>
        <title>Transportadores | Transporte Escolar Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Gerenciar Transportadores
          </h1>
          <p className="text-muted-foreground">Aprove e gerencie transportadores escolares</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou WhatsApp..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Escolas</TableHead>
                    <TableHead>Verificação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransporters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum transportador encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransporters.map((transporter) => (
                      <TableRow key={transporter.id}>
                        <TableCell className="font-medium">{transporter.nome}</TableCell>
                        <TableCell>
                          <a
                            href={`https://wa.me/55${transporter.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            {transporter.whatsapp}
                          </a>
                        </TableCell>
                        <TableCell>
                          {transporter.transporter_schools?.length || 0} escolas
                        </TableCell>
                        <TableCell>{verificationBadge(transporter.nivel_verificacao)}</TableCell>
                        <TableCell>{statusBadge(transporter.status)}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedTransporter(transporter)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {transporter.status === "pendente" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusChange(transporter.id, "ativo")}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          {transporter.status !== "bloqueado" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusChange(transporter.id, "bloqueado")}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!selectedTransporter} onOpenChange={() => setSelectedTransporter(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Transportador</DialogTitle>
            </DialogHeader>
            {selectedTransporter && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{selectedTransporter.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{selectedTransporter.whatsapp}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Veículo</p>
                    <p className="font-medium capitalize">{selectedTransporter.veiculo_tipo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Capacidade</p>
                    <p className="font-medium">{selectedTransporter.capacidade_aprox || "Não informada"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cadastrado em</p>
                    <p className="font-medium">
                      {format(new Date(selectedTransporter.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Acessibilidade</p>
                    <p className="font-medium">
                      {selectedTransporter.atende_acessibilidade ? "Sim" : "Não"}
                    </p>
                  </div>
                </div>

                {selectedTransporter.descricao_curta && (
                  <div>
                    <p className="text-sm text-muted-foreground">Descrição</p>
                    <p>{selectedTransporter.descricao_curta}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Escolas atendidas</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTransporter.transporter_schools?.map((ts, i) => (
                      <Badge key={i} variant="secondary">
                        {ts.schools?.nome_oficial || "Escola"}
                      </Badge>
                    ))}
                    {(!selectedTransporter.transporter_schools || selectedTransporter.transporter_schools.length === 0) && (
                      <span className="text-muted-foreground">Nenhuma escola cadastrada</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Áreas de cobertura</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTransporter.transporter_areas?.map((area) => (
                      <Badge key={area.id} variant="outline">
                        {area.bairro} - {turnoLabels[area.turno] || area.turno}
                      </Badge>
                    ))}
                    {(!selectedTransporter.transporter_areas || selectedTransporter.transporter_areas.length === 0) && (
                      <span className="text-muted-foreground">Nenhuma área cadastrada</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Nível de Verificação</p>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((level) => (
                      <Button
                        key={level}
                        size="sm"
                        variant={selectedTransporter.nivel_verificacao === level ? "default" : "outline"}
                        onClick={() => handleVerificationChange(selectedTransporter.id, level)}
                      >
                        {level === 0 ? "Nenhum" : level === 1 ? "Básico" : level === 2 ? "Verificado" : "Premium"}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
