import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Copy, Trash2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import CopyToClipboardButton from "./CopyToClipboardButton";
import { useDeleteProofInvoice } from "@/hooks/useProofInvoices";
import type { ProofInvoiceExpanded } from "@/types/billing";

interface ProofInvoiceCardProps {
  invoice: ProofInvoiceExpanded;
  onClick?: () => void;
}

export default function ProofInvoiceCard({ invoice, onClick }: ProofInvoiceCardProps) {
  const deleteInvoice = useDeleteProofInvoice();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (invoice.status === "issued") {
      return; // Não permite deletar notas emitidas
    }
    if (confirm("Remover este rascunho?")) {
      deleteInvoice.mutate(invoice.id);
    }
  };

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <FileText className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">PI: {invoice.pi_number}</span>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {invoice.client?.legal_name || "Cliente não identificado"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Criado em {format(new Date(invoice.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </p>
              {invoice.status === "issued" && invoice.nf_number && (
                <p className="text-sm font-mono mt-1">
                  NF-e Nº {invoice.nf_number}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <CopyToClipboardButton
              text={invoice.description_final}
              label=""
              size="icon"
              variant="ghost"
            />
            
            {invoice.nf_pdf_url && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a href={invoice.nf_pdf_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}

            {invoice.status === "draft" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={deleteInvoice.isPending}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
