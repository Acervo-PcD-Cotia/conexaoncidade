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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Building2 } from "lucide-react";
import { useCreateBillingClient } from "@/hooks/useBillingClients";
import { formatCNPJ, cleanCNPJ, isValidCNPJ } from "@/lib/invoiceTemplate";
import type { BillingClient } from "@/types/billing";

interface NewClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (client: BillingClient) => void;
}

export default function NewClientModal({
  open,
  onOpenChange,
  onSuccess,
}: NewClientModalProps) {
  const [formData, setFormData] = useState({
    legal_name: "",
    cnpj: "",
    im: "",
    address_line: "",
    city: "",
    state: "",
    email: "",
    is_default: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createClient = useCreateBillingClient();

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    setFormData((prev) => ({ ...prev, cnpj: formatted }));
    if (errors.cnpj) {
      setErrors((prev) => ({ ...prev, cnpj: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.legal_name.trim()) {
      newErrors.legal_name = "Razão social é obrigatória";
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = "CNPJ é obrigatório";
    } else if (!isValidCNPJ(formData.cnpj)) {
      newErrors.cnpj = "CNPJ inválido (deve ter 14 dígitos)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const result = await createClient.mutateAsync({
        legal_name: formData.legal_name.trim(),
        cnpj: formatCNPJ(formData.cnpj),
        im: formData.im.trim() || undefined,
        address_line: formData.address_line.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim().toUpperCase() || undefined,
        email: formData.email.trim() || undefined,
        is_default: formData.is_default,
      });

      onSuccess?.(result);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      legal_name: "",
      cnpj: "",
      im: "",
      address_line: "",
      city: "",
      state: "",
      email: "",
      is_default: false,
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Novo Cliente (Tomador)
          </DialogTitle>
          <DialogDescription>
            Cadastre um novo tomador de serviço para emissão de notas fiscais.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="legal_name">Razão Social *</Label>
            <Input
              id="legal_name"
              value={formData.legal_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, legal_name: e.target.value }))}
              placeholder="Nome completo da empresa"
              className={errors.legal_name ? "border-destructive" : ""}
            />
            {errors.legal_name && (
              <p className="text-sm text-destructive">{errors.legal_name}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleCNPJChange(e.target.value)}
                placeholder="00.000.000/0000-00"
                className={errors.cnpj ? "border-destructive" : ""}
              />
              {errors.cnpj && (
                <p className="text-sm text-destructive">{errors.cnpj}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="im">Inscrição Municipal</Label>
              <Input
                id="im"
                value={formData.im}
                onChange={(e) => setFormData((prev) => ({ ...prev, im: e.target.value }))}
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line">Endereço</Label>
            <Input
              id="address_line"
              value={formData.address_line}
              onChange={(e) => setFormData((prev) => ({ ...prev, address_line: e.target.value }))}
              placeholder="Endereço completo"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Cidade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">UF</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                placeholder="SP"
                maxLength={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="email@empresa.com.br"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <Label htmlFor="is_default" className="font-semibold">
                Definir como cliente padrão
              </Label>
              <p className="text-sm text-muted-foreground">
                Será usado automaticamente nas próximas emissões
              </p>
            </div>
            <Switch
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_default: checked }))}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={createClient.isPending}>
            {createClient.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Cliente"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
