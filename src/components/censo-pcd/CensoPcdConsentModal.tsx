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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Lock, FileText } from "lucide-react";

interface CensoPcdConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function CensoPcdConsentModal({ open, onAccept, onDecline }: CensoPcdConsentModalProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dataUseAccepted, setDataUseAccepted] = useState(false);
  const [noCommercialAccepted, setNoCommercialAccepted] = useState(false);

  const allAccepted = termsAccepted && dataUseAccepted && noCommercialAccepted;

  const handleAccept = () => {
    if (allAccepted) {
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent className="max-w-lg" aria-describedby="consent-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-primary" />
            Termo de Consentimento - LGPD
          </DialogTitle>
          <DialogDescription id="consent-description">
            Antes de participar do Censo PcD Cotia, leia e aceite os termos abaixo.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[300px] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Lock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Proteção de Dados</h4>
                <p>
                  Seus dados pessoais serão tratados em conformidade com a Lei Geral de Proteção 
                  de Dados (LGPD - Lei nº 13.709/2018). Apenas informações essenciais para o 
                  mapeamento de necessidades serão coletadas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <FileText className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Finalidade</h4>
                <p>
                  Os dados coletados serão utilizados exclusivamente para:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Mapeamento de Pessoas com Deficiência em Cotia</li>
                  <li>Identificação de necessidades de saúde, educação e assistência</li>
                  <li>Planejamento de políticas públicas inclusivas</li>
                  <li>Organização de mutirões e ações de atendimento</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Seus Direitos</h4>
                <p>
                  Você tem direito a acessar, corrigir, excluir ou solicitar informações sobre 
                  seus dados a qualquer momento, entrando em contato com os responsáveis pelo 
                  Censo PcD Cotia.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              aria-describedby="terms-label"
            />
            <Label 
              htmlFor="terms" 
              id="terms-label"
              className="text-sm leading-relaxed cursor-pointer"
            >
              Li e aceito os termos de uso e a política de privacidade
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox 
              id="data-use" 
              checked={dataUseAccepted}
              onCheckedChange={(checked) => setDataUseAccepted(checked === true)}
              aria-describedby="data-use-label"
            />
            <Label 
              htmlFor="data-use" 
              id="data-use-label"
              className="text-sm leading-relaxed cursor-pointer"
            >
              Autorizo o uso dos dados para políticas públicas e ações sociais
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox 
              id="no-commercial" 
              checked={noCommercialAccepted}
              onCheckedChange={(checked) => setNoCommercialAccepted(checked === true)}
              aria-describedby="no-commercial-label"
            />
            <Label 
              htmlFor="no-commercial" 
              id="no-commercial-label"
              className="text-sm leading-relaxed cursor-pointer"
            >
              Entendo que meus dados não serão comercializados
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onDecline}
            className="min-h-[44px]"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={!allAccepted}
            className="min-h-[44px]"
            aria-disabled={!allAccepted}
          >
            Aceitar e Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
