import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Building2, Lock, Pencil } from "lucide-react";
import { toast } from "sonner";
import CopyToClipboardButton from "./CopyToClipboardButton";
import ClientSelectorModal from "./ClientSelectorModal";
import NewClientModal from "./NewClientModal";
import {
  useDefaultBillingClient,
  useBillingClient,
  useBillingClientDefaults,
  useEnsureDefaultClient,
} from "@/hooks/useBillingClients";
import { useBillingProvider, useEnsureProviderProfile } from "@/hooks/useBillingProvider";
import { useCreateProofInvoice } from "@/hooks/useProofInvoices";
import { renderInvoiceDescription, normalizePINumber, PREFEITURA_COTIA_TEMPLATE } from "@/lib/invoiceTemplate";
import type { BillingClient } from "@/types/billing";

interface EmitInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proofId?: string;
  forceClientId?: string; // Para atalho Prefeitura de Cotia
  onSuccess?: (invoiceId: string) => void;
}

export default function EmitInvoiceModal({
  open,
  onOpenChange,
  proofId,
  forceClientId,
  onSuccess,
}: EmitInvoiceModalProps) {
  const piInputRef = useRef<HTMLInputElement>(null);
  const [piNumber, setPiNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  
  // Cliente selecionado para esta emissão (pode diferir do default)
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(forceClientId);
  const [selectedClientOverride, setSelectedClientOverride] = useState<BillingClient | null>(null);

  // Hooks para buscar dados
  const { data: defaultClient, isLoading: loadingDefaultClient } = useDefaultBillingClient();
  
  // Determinar qual clientId usar
  const clientId = selectedClientId || forceClientId || defaultClient?.id;
  
  // Buscar cliente selecionado se diferente do default
  const { data: fetchedClient, isLoading: loadingFetchedClient } = useBillingClient(
    clientId && clientId !== defaultClient?.id ? clientId : undefined
  );
  
  // Cliente final a ser exibido/usado
  const selectedClient = selectedClientOverride || fetchedClient || defaultClient;
  
  const { data: clientDefaults, isLoading: loadingDefaults } = useBillingClientDefaults(clientId);
  const { data: provider } = useBillingProvider();

  // Mutations para garantir dados iniciais
  const ensureClient = useEnsureDefaultClient();
  const ensureProvider = useEnsureProviderProfile();
  const createInvoice = useCreateProofInvoice();

  // Template e descrição renderizada
  const template = clientDefaults?.invoice_text_template || PREFEITURA_COTIA_TEMPLATE;
  const normalizedPI = normalizePINumber(piNumber);
  const renderedDescription = renderInvoiceDescription(template, piNumber);

  // Resetar ao fechar
  useEffect(() => {
    if (!open) {
      setPiNumber("");
      setSelectedClientId(forceClientId);
      setSelectedClientOverride(null);
    }
  }, [open, forceClientId]);

  // Focar no input de PI ao abrir
  useEffect(() => {
    if (open && piInputRef.current) {
      setTimeout(() => piInputRef.current?.focus(), 100);
    }
  }, [open]);

  // Inicializar cliente padrão se necessário
  useEffect(() => {
    if (open && !defaultClient && !loadingDefaultClient) {
      ensureClient.mutate();
    }
  }, [open, defaultClient, loadingDefaultClient]);

  // Inicializar prestador se necessário
  useEffect(() => {
    if (open && !provider) {
      ensureProvider.mutate();
    }
  }, [open, provider]);

  const handleClientSelect = (client: BillingClient, _setAsDefault: boolean) => {
    setSelectedClientId(client.id);
    setSelectedClientOverride(client);
  };

  const handleNewClientSuccess = (client: BillingClient) => {
    setSelectedClientId(client.id);
    setSelectedClientOverride(client);
  };

  const handleSubmit = async () => {
    if (!normalizedPI) {
      toast.error("Digite o número da PI");
      piInputRef.current?.focus();
      return;
    }

    if (!clientId || !selectedClient) {
      toast.error("Nenhum cliente selecionado");
      return;
    }

    setIsSubmitting(true);
    try {
      // Criar snapshot do cliente
      const clientSnapshot = {
        id: selectedClient.id,
        legal_name: selectedClient.legal_name,
        cnpj: selectedClient.cnpj,
        im: selectedClient.im,
        address_line: selectedClient.address_line,
        city: selectedClient.city,
        state: selectedClient.state,
        email: selectedClient.email,
      };

      // Criar snapshot do prestador
      const providerSnapshot = provider ? {
        id: provider.id,
        legal_name: provider.legal_name,
        trade_name: provider.trade_name,
        cnpj: provider.cnpj,
        im: provider.im,
        address_line: provider.address_line,
        email: provider.email,
      } : null;

      const result = await createInvoice.mutateAsync({
        campaign_proof_id: proofId,
        client_id: clientId,
        pi_number: normalizedPI,
        description_final: renderedDescription,
        service_code: clientDefaults?.service_code || "107",
        cnae: clientDefaults?.cnae || "6209100",
        iss_rate: clientDefaults?.iss_rate || 2.00,
        service_description_short: clientDefaults?.service_description_short || 
          "SUPORTE TÉCNICO, MANUTENÇÃO E OUTROS SERVIÇOS EM TECNOLOGIA DA INFORMAÇÃO",
        client_snapshot: clientSnapshot,
        provider_snapshot: providerSnapshot,
      });

      toast.success("Rascunho criado! Agora emita a nota no portal da Prefeitura.");
      onSuccess?.(result.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao criar invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loadingDefaultClient || loadingDefaults || loadingFetchedClient || ensureClient.isPending;
  const isClientLocked = !!forceClientId;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Emitir Nota Fiscal de Serviço
            </DialogTitle>
            <DialogDescription>
              Digite apenas o número da PI. A descrição será gerada automaticamente.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cliente/Tomador */}
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Tomador (Cliente)</p>
                        <p className="font-semibold">{selectedClient?.legal_name || "Carregando..."}</p>
                        <p className="text-sm text-muted-foreground">CNPJ: {selectedClient?.cnpj}</p>
                        {selectedClient?.city && (
                          <p className="text-xs text-muted-foreground">
                            {selectedClient.city}/{selectedClient.state}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedClient?.is_default && (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Padrão
                        </Badge>
                      )}
                      {!isClientLocked && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowClientSelector(true)}
                          className="gap-1"
                        >
                          <Pencil className="h-3 w-3" />
                          Alterar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Input da PI */}
              <div className="space-y-2">
                <Label htmlFor="pi_number" className="text-base font-semibold">
                  Número da PI (Pedido de Inserção) *
                </Label>
                <Input
                  ref={piInputRef}
                  id="pi_number"
                  value={piNumber}
                  onChange={(e) => setPiNumber(e.target.value)}
                  placeholder="Ex: 269.17"
                  className="text-lg font-mono"
                  autoComplete="off"
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Digite o número (ex: 269.17, 270-01, PI 271)
                  </p>
                  {normalizedPI && normalizedPI !== piNumber.trim() && (
                    <Badge variant="outline" className="font-mono">
                      Normalizado: {normalizedPI}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Descrição gerada */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Descrição para a Nota Fiscal</Label>
                  <CopyToClipboardButton
                    text={renderedDescription}
                    label="Copiar Descrição"
                    disabled={!normalizedPI}
                  />
                </div>
                <Textarea
                  value={renderedDescription}
                  readOnly
                  className="min-h-[120px] font-mono text-sm bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Esta descrição será salva e pode ser copiada para o portal da Prefeitura.
                </p>
              </div>

              {/* Serviço */}
              <Card>
                <CardContent className="pt-4">
                  <div className="grid gap-4 sm:grid-cols-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Código do Serviço</p>
                      <p className="font-mono font-semibold">{clientDefaults?.service_code || "107"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CNAE</p>
                      <p className="font-mono font-semibold">{clientDefaults?.cnae || "6209100"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ISS</p>
                      <p className="font-mono font-semibold">{clientDefaults?.iss_rate || 2.00}%</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {clientDefaults?.service_description_short || 
                      "SUPORTE TÉCNICO, MANUTENÇÃO E OUTROS SERVIÇOS EM TECNOLOGIA DA INFORMAÇÃO"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || isSubmitting || !normalizedPI}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Rascunho"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de seleção de cliente */}
      <ClientSelectorModal
        open={showClientSelector}
        onOpenChange={setShowClientSelector}
        currentClientId={clientId}
        onSelect={handleClientSelect}
        onNewClient={() => setShowNewClient(true)}
      />

      {/* Modal de novo cliente */}
      <NewClientModal
        open={showNewClient}
        onOpenChange={setShowNewClient}
        onSuccess={handleNewClientSuccess}
      />
    </>
  );
}
