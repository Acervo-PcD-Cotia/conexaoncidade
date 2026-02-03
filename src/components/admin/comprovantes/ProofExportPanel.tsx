import { useState } from "react";
import { useCreateProofDocument, useDownloadProofDocument } from "@/hooks/useCampaignProofDocuments";
import { generateVeiculacaoPdf, generateAnalyticsPdf } from "@/lib/campaignProofPdf";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  BarChart3,
  Download,
  Package,
  Loader2,
  CheckCircle,
  Clock,
  Receipt,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import type { CampaignProofFull, CampaignProofDocType } from "@/types/campaign-proofs";
import EmitInvoiceModal from "./EmitInvoiceModal";
import ProofInvoiceCard from "./ProofInvoiceCard";
import InvoiceIssuedForm from "./InvoiceIssuedForm";
import { useProofInvoices } from "@/hooks/useProofInvoices";
import type { ProofInvoiceExpanded } from "@/types/billing";

interface ProofExportPanelProps {
  proof: CampaignProofFull;
}

export default function ProofExportPanel({ proof }: ProofExportPanelProps) {
  const [generating, setGenerating] = useState<CampaignProofDocType | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ProofInvoiceExpanded | null>(null);

  const { data: invoices = [], refetch: refetchInvoices } = useProofInvoices(proof.id);
  const downloadMutation = useDownloadProofDocument();

  const handleGenerateVeiculacao = async () => {
    if (proof.assets.filter(a => a.asset_type === 'VEICULACAO_PRINT').length === 0) {
      toast.error("Adicione pelo menos um print de veiculação");
      return;
    }

    setGenerating("VEICULACAO");
    try {
      await generateVeiculacaoPdf(proof);
      toast.success("PDF de Veiculação gerado com sucesso!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erro ao gerar PDF");
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateAnalytics = async () => {
    const analyticsAssets = proof.assets.filter(a => a.asset_type === 'ANALYTICS_PRINT');
    const hasMetrics = proof.analytics?.show_on_pdf && (
      proof.analytics.users || 
      proof.analytics.pageviews || 
      proof.analytics.sessions
    );

    if (analyticsAssets.length === 0 && !hasMetrics) {
      toast.error("Adicione prints do Analytics ou métricas manuais");
      return;
    }

    setGenerating("ANALYTICS");
    try {
      await generateAnalyticsPdf(proof);
      toast.success("PDF do Analytics gerado com sucesso!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erro ao gerar PDF");
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateBoth = async () => {
    setGenerating("BOTH_ZIP");
    try {
      await handleGenerateVeiculacao();
      await handleGenerateAnalytics();
      toast.success("Ambos os PDFs foram gerados!");
    } catch (error) {
      toast.error("Erro ao gerar PDFs");
    } finally {
      setGenerating(null);
    }
  };

  const veiculacaoAssets = proof.assets.filter(a => a.asset_type === 'VEICULACAO_PRINT');
  const analyticsAssets = proof.assets.filter(a => a.asset_type === 'ANALYTICS_PRINT');

  return (
    <div className="space-y-6">
      {/* Seção de Nota Fiscal - ATALHO RÁPIDO */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Emissão de Nota Fiscal
          </CardTitle>
          <CardDescription>
            Gere o texto da nota fiscal rapidamente. O número da NF será preenchido após emissão no portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {/* Atalho Prefeitura de Cotia */}
            <Button
              onClick={() => setInvoiceModalOpen(true)}
              className="gap-2"
              size="lg"
            >
              <Building2 className="h-5 w-5" />
              Emitir NF Prefeitura de Cotia
            </Button>
          </div>

          {/* Lista de invoices existentes */}
          {invoices.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Notas Fiscais deste Comprovante
                </p>
                <div className="space-y-2">
                  {invoices.map((invoice) => (
                    <ProofInvoiceCard
                      key={invoice.id}
                      invoice={invoice}
                      onClick={() => setSelectedInvoice(invoice)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Formulário de pós-emissão para invoice selecionada */}
      {selectedInvoice && (
        <InvoiceIssuedForm
          invoice={selectedInvoice}
          onSuccess={() => {
            setSelectedInvoice(null);
            refetchInvoices();
          }}
        />
      )}

      {/* Generation Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Gerar Comprovantes</CardTitle>
          <CardDescription>
            Clique nos botões abaixo para gerar os PDFs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Veiculação */}
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
              onClick={handleGenerateVeiculacao}
              disabled={generating !== null}
            >
              {generating === "VEICULACAO" ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <FileText className="h-8 w-8 text-primary" />
              )}
              <span className="font-semibold">Comprovante de Veiculação</span>
              <span className="text-xs text-muted-foreground">
                {veiculacaoAssets.length} print(s)
              </span>
            </Button>

            {/* Analytics */}
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
              onClick={handleGenerateAnalytics}
              disabled={generating !== null}
            >
              {generating === "ANALYTICS" ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <BarChart3 className="h-8 w-8 text-blue-500" />
              )}
              <span className="font-semibold">Relatório Analytics</span>
              <span className="text-xs text-muted-foreground">
                {analyticsAssets.length} print(s) + métricas
              </span>
            </Button>

            {/* Both */}
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
              onClick={handleGenerateBoth}
              disabled={generating !== null}
            >
              {generating === "BOTH_ZIP" ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <Package className="h-8 w-8 text-green-500" />
              )}
              <span className="font-semibold">Gerar Ambos</span>
              <span className="text-xs text-muted-foreground">
                Veiculação + Analytics
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Campanha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-medium">{proof.client_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Campanha</p>
              <p className="font-medium">{proof.campaign_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pedido de Inserção</p>
              <p className="font-medium font-mono">{proof.insertion_order}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Período</p>
              <p className="font-medium">
                {format(new Date(proof.start_date), "dd/MM/yyyy", { locale: ptBR })} -{" "}
                {format(new Date(proof.end_date), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{proof.channels.length}</p>
              <p className="text-sm text-muted-foreground">Canais</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{veiculacaoAssets.length}</p>
              <p className="text-sm text-muted-foreground">Prints Veiculação</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{analyticsAssets.length}</p>
              <p className="text-sm text-muted-foreground">Prints Analytics</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document History */}
      {proof.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Documentos</CardTitle>
            <CardDescription>
              PDFs gerados anteriormente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {proof.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {doc.doc_type === "VEICULACAO" ? (
                      <FileText className="h-5 w-5 text-primary" />
                    ) : doc.doc_type === "ANALYTICS" ? (
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Package className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {doc.doc_type === "VEICULACAO"
                          ? "Comprovante de Veiculação"
                          : doc.doc_type === "ANALYTICS"
                          ? "Relatório Analytics"
                          : "Pacote Completo"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Versão {doc.version} •{" "}
                        {format(new Date(doc.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadMutation.mutate(doc.file_path)}
                    disabled={downloadMutation.isPending}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Emissão */}
      <EmitInvoiceModal
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        proofId={proof.id}
        onSuccess={() => refetchInvoices()}
      />
    </div>
  );
}
