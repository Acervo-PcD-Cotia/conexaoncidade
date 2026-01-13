import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertTriangle, Loader2, Eye, CheckCircle2, Clock, Circle, Ban } from "lucide-react";
import { useTransportReports, useUpdateTransportReport, TransportReport } from "@/hooks/useTransportLeads";
import { useUpdateTransporter } from "@/hooks/useTransporters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function ReportsAdmin() {
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<TransportReport | null>(null);
  const [confirmBlock, setConfirmBlock] = useState(false);

  const { data: reports, isLoading } = useTransportReports({
    status: filterStatus || undefined,
  });

  const updateReport = useUpdateTransportReport();
  const updateTransporter = useUpdateTransporter();

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateReport.mutateAsync({ id, status: newStatus as any });
    if (selectedReport?.id === id) {
      setSelectedReport({ ...selectedReport, status: newStatus as any });
    }
  };

  const handleBlockTransporter = async () => {
    if (!selectedReport?.transporter_id) return;
    
    await updateTransporter.mutateAsync({
      id: selectedReport.transporter_id,
      status: "bloqueado",
    });
    
    await updateReport.mutateAsync({
      id: selectedReport.id,
      status: "resolvido",
    });
    
    setConfirmBlock(false);
    setSelectedReport(null);
    toast.success("Transportador bloqueado e denúncia resolvida");
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "novo":
        return <Badge variant="default" className="bg-red-600"><Circle className="h-2 w-2 mr-1 fill-current" />Novo</Badge>;
      case "revisando":
        return <Badge variant="secondary"><Clock className="h-2 w-2 mr-1" />Revisando</Badge>;
      case "resolvido":
        return <Badge variant="outline" className="text-green-600"><CheckCircle2 className="h-2 w-2 mr-1" />Resolvido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const motivoLabels: Record<string, string> = {
    contato_invalido: "Contato inválido",
    comportamento_inadequado: "Comportamento inadequado",
    golpe: "Golpe / Fraude",
    outros: "Outros",
  };

  return (
    <>
      <Helmet>
        <title>Denúncias | Transporte Escolar Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Denúncias
          </h1>
          <p className="text-muted-foreground">Gerencie denúncias de transportadores</p>
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
                  <SelectItem value="revisando">Revisando</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
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
                    <TableHead>Transportador</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!reports || reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhuma denúncia encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          {format(new Date(report.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {report.transporter?.nome || "Não identificado"}
                        </TableCell>
                        <TableCell>{motivoLabels[report.motivo] || report.motivo}</TableCell>
                        <TableCell>{statusBadge(report.status)}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedReport(report)}
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
        <Dialog open={!!selectedReport && !confirmBlock} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes da Denúncia</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">
                      {format(new Date(selectedReport.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Motivo</p>
                    <p className="font-medium">{motivoLabels[selectedReport.motivo] || selectedReport.motivo}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Transportador denunciado</p>
                  <p className="font-medium">
                    {selectedReport.transporter?.nome || "Não identificado"}
                    {selectedReport.transporter?.whatsapp && (
                      <span className="text-muted-foreground ml-2">
                        ({selectedReport.transporter.whatsapp})
                      </span>
                    )}
                  </p>
                </div>

                {selectedReport.descricao && (
                  <div>
                    <p className="text-sm text-muted-foreground">Descrição</p>
                    <p className="mt-1 p-3 bg-muted rounded-md">{selectedReport.descricao}</p>
                  </div>
                )}

                {selectedReport.contato && (
                  <div>
                    <p className="text-sm text-muted-foreground">Contato do denunciante</p>
                    <p className="font-medium">{selectedReport.contato}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Alterar Status</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={selectedReport.status === "novo" ? "default" : "outline"}
                      onClick={() => handleStatusChange(selectedReport.id, "novo")}
                    >
                      Novo
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedReport.status === "revisando" ? "default" : "outline"}
                      onClick={() => handleStatusChange(selectedReport.id, "revisando")}
                    >
                      Revisando
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedReport.status === "resolvido" ? "default" : "outline"}
                      onClick={() => handleStatusChange(selectedReport.id, "resolvido")}
                    >
                      Resolvido
                    </Button>
                  </div>
                </div>

                {selectedReport.transporter_id && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      onClick={() => setConfirmBlock(true)}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Bloquear Transportador
                    </Button>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Block Dialog */}
        <Dialog open={confirmBlock} onOpenChange={setConfirmBlock}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Bloqueio</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja bloquear o transportador "{selectedReport?.transporter?.nome}"?
                Esta ação impedirá que ele apareça nas buscas.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmBlock(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleBlockTransporter}>
                Bloquear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
