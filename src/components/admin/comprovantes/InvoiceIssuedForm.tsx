import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, FileText, Upload, Check } from "lucide-react";
import { toast } from "sonner";
import { useMarkInvoiceIssued, useUploadInvoiceFile } from "@/hooks/useProofInvoices";
import type { ProofInvoice } from "@/types/billing";

interface InvoiceIssuedFormProps {
  invoice: ProofInvoice;
  onSuccess?: () => void;
}

export default function InvoiceIssuedForm({ invoice, onSuccess }: InvoiceIssuedFormProps) {
  const [nfNumber, setNfNumber] = useState(invoice.nf_number || "");
  const [verificationCode, setVerificationCode] = useState(invoice.nf_verification_code || "");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const markIssued = useMarkInvoiceIssued();
  const uploadFile = useUploadInvoiceFile();

  const isAlreadyIssued = invoice.status === "issued";

  const handleSubmit = async () => {
    if (!nfNumber.trim()) {
      toast.error("Digite o número da nota fiscal");
      return;
    }

    try {
      // Upload do PDF se houver
      let pdfUrl = invoice.nf_pdf_url;
      if (pdfFile) {
        const uploadResult = await uploadFile.mutateAsync({
          invoiceId: invoice.id,
          file: pdfFile,
          fileType: "nf_pdf",
        });
        pdfUrl = uploadResult.file_url;
      }

      // Marcar como emitida
      await markIssued.mutateAsync({
        id: invoice.id,
        nf_number: nfNumber.trim(),
        nf_verification_code: verificationCode.trim() || undefined,
        nf_pdf_url: pdfUrl || undefined,
      });

      toast.success("Nota fiscal marcada como emitida!");
      onSuccess?.();
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Apenas arquivos PDF são aceitos");
        return;
      }
      setPdfFile(file);
    }
  };

  const isLoading = markIssued.isPending || uploadFile.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isAlreadyIssued ? (
            <>
              <Check className="h-5 w-5 text-green-600" />
              Nota Fiscal Emitida
            </>
          ) : (
            <>
              <FileText className="h-5 w-5" />
              Registrar Emissão
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isAlreadyIssued
            ? `NF-e Nº ${invoice.nf_number}`
            : "Após emitir no portal da Prefeitura, registre aqui os dados da nota."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Número da NF */}
        <div className="space-y-2">
          <Label htmlFor="nf_number">Número da Nota Fiscal *</Label>
          <Input
            id="nf_number"
            value={nfNumber}
            onChange={(e) => setNfNumber(e.target.value)}
            placeholder="Ex: 12345"
            className="font-mono"
            disabled={isAlreadyIssued}
          />
        </div>

        {/* Código de verificação */}
        <div className="space-y-2">
          <Label htmlFor="verification_code">Código de Verificação (opcional)</Label>
          <Input
            id="verification_code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Código para consulta"
            className="font-mono"
            disabled={isAlreadyIssued}
          />
        </div>

        <Separator />

        {/* Upload do PDF */}
        <div className="space-y-2">
          <Label>PDF da Nota Fiscal</Label>
          {invoice.nf_pdf_url ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href={invoice.nf_pdf_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="mr-2 h-4 w-4" />
                  Visualizar PDF
                </a>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={isAlreadyIssued}
                className="max-w-xs"
              />
              {pdfFile && (
                <span className="text-sm text-muted-foreground">
                  {pdfFile.name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Botão de ação */}
        {!isAlreadyIssued && (
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !nfNumber.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Marcar como Emitida
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
