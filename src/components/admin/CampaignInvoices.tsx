import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  FileText,
  Download,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  MoreHorizontal,
  Plus,
  Loader2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCampaignInvoices, CampaignInvoice } from "@/hooks/useCampaignInvoices";

interface CampaignInvoicesProps {
  campaignId?: string;
  campaignName?: string;
}

export function CampaignInvoices({ campaignId, campaignName }: CampaignInvoicesProps) {
  const {
    invoices,
    isLoading,
    generateInvoice,
    isGenerating,
    updateStatus,
    deleteInvoice,
  } = useCampaignInvoices(campaignId);

  const [generateOpen, setGenerateOpen] = useState(false);
  const [periodStart, setPeriodStart] = useState(
    format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
  );
  const [periodEnd, setPeriodEnd] = useState(format(new Date(), "yyyy-MM-dd"));

  const getStatusBadge = (status: CampaignInvoice["status"]) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; label: string }> = {
      draft: { variant: "secondary", icon: <FileText className="h-3 w-3" />, label: "Rascunho" },
      sent: { variant: "outline", icon: <Send className="h-3 w-3" />, label: "Enviada" },
      paid: { variant: "default", icon: <CheckCircle className="h-3 w-3" />, label: "Paga" },
      overdue: { variant: "destructive", icon: <Clock className="h-3 w-3" />, label: "Vencida" },
      cancelled: { variant: "secondary", icon: <XCircle className="h-3 w-3" />, label: "Cancelada" },
    };

    const config = variants[status] || variants.draft;

    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const handleGenerate = () => {
    if (!campaignId) return;
    
    generateInvoice({
      campaign_id: campaignId,
      period_start: periodStart,
      period_end: periodEnd,
    });
    setGenerateOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calculate totals
  const totals = invoices.reduce(
    (acc, inv) => ({
      impressions: acc.impressions + (inv.impressions_count || 0),
      clicks: acc.clicks + (inv.clicks_count || 0),
      amount: acc.amount + Number(inv.total_amount || 0),
      paid: acc.paid + (inv.status === "paid" ? Number(inv.total_amount || 0) : 0),
    }),
    { impressions: 0, clicks: 0, amount: 0, paid: 0 }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Faturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.amount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.paid)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totals.amount - totals.paid)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Invoice Dialog */}
      {campaignId && (
        <div className="flex justify-end">
          <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Gerar Fatura
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gerar Fatura Manual</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Gerar fatura para a campanha: <strong>{campaignName}</strong>
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Início</Label>
                    <Input
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Fim</Label>
                    <Input
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Gerar Fatura
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma fatura encontrada</p>
            {campaignId && (
              <p className="text-sm mt-2">
                Clique em "Gerar Fatura" para criar uma nova fatura
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead className="text-right">Impressões</TableHead>
                <TableHead className="text-right">Cliques</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(invoice.invoice_period_start), "dd/MM", { locale: ptBR })}
                        {" - "}
                        {format(new Date(invoice.invoice_period_end), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {invoice.impressions_count?.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    {invoice.clicks_count?.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(invoice.total_amount))}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    {invoice.due_date
                      ? format(new Date(invoice.due_date), "dd/MM/yyyy", { locale: ptBR })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {invoice.status === "draft" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus({ id: invoice.id, status: "sent" })
                            }
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Marcar como Enviada
                          </DropdownMenuItem>
                        )}
                        {(invoice.status === "sent" || invoice.status === "overdue") && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus({ id: invoice.id, status: "paid" })
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como Paga
                          </DropdownMenuItem>
                        )}
                        {invoice.status !== "cancelled" && invoice.status !== "paid" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus({ id: invoice.id, status: "cancelled" })
                            }
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => deleteInvoice(invoice.id)}
                          className="text-destructive"
                        >
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
