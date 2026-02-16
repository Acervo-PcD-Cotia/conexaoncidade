import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface DeleteAccountDialogProps {
  userEmail: string;
}

type Step = "warning" | "confirm-email" | "confirm-text" | "deleting";

export function DeleteAccountDialog({ userEmail }: DeleteAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("warning");
  const [emailInput, setEmailInput] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const CONFIRM_TEXT = "EXCLUIR MINHA CONTA";

  const resetDialog = () => {
    setStep("warning");
    setEmailInput("");
    setConfirmText("");
    setIsDeleting(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetDialog();
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setStep("deleting");

    try {
      const { error } = await supabase.functions.invoke("delete-user-account");

      if (error) throw error;

      toast({
        title: "Conta excluída",
        description: "Sua conta e todos os dados foram removidos permanentemente.",
      });

      await signOut();
      window.location.href = "https://conexaoncidade.lovable.app/spah";
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir conta",
        description: "Ocorreu um erro. Tente novamente ou entre em contato conosco.",
      });
      setStep("confirm-text");
      setIsDeleting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "warning":
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-destructive">
                    Esta ação é irreversível!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ao excluir sua conta, você perderá permanentemente:
                  </p>
                </div>
              </div>
              
              <ul className="ml-8 space-y-1 text-sm text-muted-foreground list-disc">
                <li>Seu perfil e foto de perfil</li>
                <li>Todas as publicações e comentários</li>
                <li>Pontos e badges conquistados</li>
                <li>Histórico de participação na comunidade</li>
                <li>Convites enviados e recebidos</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => setStep("confirm-email")}
                className="flex-1"
              >
                Continuar
              </Button>
            </div>
          </div>
        );

      case "confirm-email":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="confirm-email">
                Digite seu e-mail para confirmar:
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                {userEmail}
              </p>
              <Input
                id="confirm-email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Digite seu e-mail"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("warning")}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                variant="destructive"
                onClick={() => setStep("confirm-text")}
                disabled={emailInput.toLowerCase() !== userEmail.toLowerCase()}
                className="flex-1"
              >
                Continuar
              </Button>
            </div>
          </div>
        );

      case "confirm-text":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="confirm-text">
                Digite <span className="font-mono font-bold">{CONFIRM_TEXT}</span> para confirmar:
              </Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="EXCLUIR MINHA CONTA"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("confirm-email")}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={confirmText !== CONFIRM_TEXT}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Conta
              </Button>
            </div>
          </div>
        );

      case "deleting":
        return (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-destructive" />
            <p className="text-muted-foreground">
              Excluindo sua conta e todos os dados...
            </p>
            <p className="text-sm text-muted-foreground">
              Isso pode levar alguns segundos.
            </p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full sm:w-auto">
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir minha conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Excluir Conta
          </DialogTitle>
          <DialogDescription>
            {step === "warning" && "Leia atentamente antes de continuar."}
            {step === "confirm-email" && "Confirme sua identidade."}
            {step === "confirm-text" && "Última confirmação."}
            {step === "deleting" && "Processando..."}
          </DialogDescription>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}
