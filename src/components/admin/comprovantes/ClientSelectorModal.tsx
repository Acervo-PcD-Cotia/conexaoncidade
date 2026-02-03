import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Building2, Star, Plus } from "lucide-react";
import { toast } from "sonner";
import { useBillingClients, useSetDefaultBillingClient } from "@/hooks/useBillingClients";
import type { BillingClient } from "@/types/billing";

interface ClientSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentClientId?: string;
  onSelect: (client: BillingClient, setAsDefault: boolean) => void;
  onNewClient?: () => void;
}

export default function ClientSelectorModal({
  open,
  onOpenChange,
  currentClientId,
  onSelect,
  onNewClient,
}: ClientSelectorModalProps) {
  const [selectedId, setSelectedId] = useState<string>(currentClientId || "");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: clients, isLoading } = useBillingClients();
  const setDefaultMutation = useSetDefaultBillingClient();

  const handleConfirm = async () => {
    const selectedClient = clients?.find((c) => c.id === selectedId);
    if (!selectedClient) return;

    setIsSubmitting(true);
    try {
      if (setAsDefault) {
        // Usar mutateAsync para aguardar e tratar erros
        await setDefaultMutation.mutateAsync(selectedId);
      }

      onSelect(selectedClient, setAsDefault);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao definir cliente padrão:", error);
      toast.error("Erro ao definir cliente como padrão. Tente novamente.");
      // NÃO fechar modal em caso de erro
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedClient = clients?.find((c) => c.id === selectedId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Selecionar Cliente
          </DialogTitle>
          <DialogDescription>
            Escolha o tomador de serviço para esta nota fiscal.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <ScrollArea className="max-h-[300px] pr-4">
              <RadioGroup value={selectedId} onValueChange={setSelectedId}>
                {clients?.map((client) => (
                  <div
                    key={client.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedId === client.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedId(client.id)}
                  >
                    <RadioGroupItem value={client.id} id={client.id} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={client.id}
                          className="font-semibold cursor-pointer truncate"
                        >
                          {client.legal_name}
                        </Label>
                        {client.is_default && (
                          <Badge variant="secondary" className="gap-1 shrink-0">
                            <Star className="h-3 w-3" />
                            Padrão
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        CNPJ: {client.cnpj}
                      </p>
                      {client.city && (
                        <p className="text-xs text-muted-foreground">
                          {client.city}/{client.state}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </ScrollArea>

            {onNewClient && (
              <>
                <Separator />
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    onOpenChange(false);
                    onNewClient();
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Cadastrar Novo Cliente
                </Button>
              </>
            )}

            {selectedClient && !selectedClient.is_default && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="set-default" className="font-semibold">
                      Definir como padrão
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Este cliente será usado por padrão nas próximas emissões
                    </p>
                  </div>
                  <Switch
                    id="set-default"
                    checked={setAsDefault}
                    onCheckedChange={setSetAsDefault}
                  />
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedId || isLoading || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : setAsDefault ? (
              "Confirmar e Definir Padrão"
            ) : (
              "Usar Só Nesta Emissão"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
