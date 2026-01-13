import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { MessageSquare, Phone, Loader2, Eye, CheckCircle2, Clock, Circle } from "lucide-react";
import { useTransportLeads, useUpdateTransportLead, TransportLead } from "@/hooks/useTransportLeads";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function LeadsAdmin() {
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedLead, setSelectedLead] = useState<TransportLead | null>(null);

  const { data: leads, isLoading } = useTransportLeads({
    status: filterStatus || undefined,
  });

  const updateLead = useUpdateTransportLead();

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateLead.mutateAsync({ id, status: newStatus as any });
    if (selectedLead?.id === id) {
      setSelectedLead({ ...selectedLead, status: newStatus as any });
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "novo":
        return <Badge variant="default" className="bg-blue-600"><Circle className="h-2 w-2 mr-1 fill-current" />Novo</Badge>;
      case "em_andamento":
        return <Badge variant="secondary"><Clock className="h-2 w-2 mr-1" />Em andamento</Badge>;
      case "concluido":
        return <Badge variant="outline" className="text-green-600"><CheckCircle2 className="h-2 w-2 mr-1" />Concluído</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const turnoLabels: Record<string, string> = {
    manha: "Manhã",
    tarde: "Tarde",
    noite: "Noite",
    integral: "Integral",
  };

  const redeLabels: Record<string, string> = {
    municipal: "Municipal",
    estadual: "Estadual",
    particular: "Particular",
    nao_sei: "Não sabe",
  };

  const acessibilidadeLabels: Record<string, string> = {
    cadeira_rodas: "Cadeira de rodas",
    mobilidade_reduzida: "Mobilidade reduzida",
    autismo: "TEA (Autismo)",
    auditiva: "Deficiência auditiva",
    visual: "Deficiência visual",
  };

  return (
    <>
      <Helmet>
        <title>Leads | Transporte Escolar Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Solicitações de Pais
          </h1>
          <p className="text-muted-foreground">Gerencie as solicitações de busca por transporte</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="em_andamento">Em andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
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
                    <TableHead>Data</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Escola</TableHead>
                    <TableHead>Bairro</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!leads || leads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhuma solicitação encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`https://wa.me/55${lead.contato_whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            {lead.contato_whatsapp}
                          </a>
                        </TableCell>
                        <TableCell>
                          {lead.school?.nome_oficial || lead.school_texto || "-"}
                        </TableCell>
                        <TableCell>{lead.bairro}</TableCell>
                        <TableCell>{turnoLabels[lead.turno] || lead.turno}</TableCell>
                        <TableCell>{statusBadge(lead.status)}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedLead(lead)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes da Solicitação</DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">
                      {format(new Date(selectedLead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <a
                      href={`https://wa.me/55${selectedLead.contato_whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline font-medium"
                    >
                      {selectedLead.contato_whatsapp}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rede</p>
                    <p className="font-medium">{redeLabels[selectedLead.rede] || selectedLead.rede}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Turno</p>
                    <p className="font-medium">{turnoLabels[selectedLead.turno] || selectedLead.turno}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Escola</p>
                  <p className="font-medium">
                    {selectedLead.school?.nome_oficial || selectedLead.school_texto || "Não especificada"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Bairro de embarque</p>
                  <p className="font-medium">{selectedLead.bairro}</p>
                </div>

                {selectedLead.acessibilidade && selectedLead.acessibilidade.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Acessibilidade necessária</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.acessibilidade.map((a) => (
                        <Badge key={a} variant="secondary">
                          {acessibilidadeLabels[a] || a}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Alterar Status</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={selectedLead.status === "novo" ? "default" : "outline"}
                      onClick={() => handleStatusChange(selectedLead.id, "novo")}
                    >
                      Novo
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedLead.status === "em_andamento" ? "default" : "outline"}
                      onClick={() => handleStatusChange(selectedLead.id, "em_andamento")}
                    >
                      Em andamento
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedLead.status === "concluido" ? "default" : "outline"}
                      onClick={() => handleStatusChange(selectedLead.id, "concluido")}
                    >
                      Concluído
                    </Button>
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
