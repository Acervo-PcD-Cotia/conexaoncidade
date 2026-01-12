import { useState, useEffect } from "react";
import { Shield, ShieldCheck, ShieldOff, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorSetupProps {
  isEnabled: boolean;
  onStatusChange: () => void;
}

type SetupStep = "idle" | "enrolling" | "verifying" | "disabling";

export function TwoFactorSetup({ isEnabled, onStatusChange }: TwoFactorSetupProps) {
  const [step, setStep] = useState<SetupStep>("idle");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const { toast } = useToast();

  const handleEnroll = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      });

      if (error) throw error;

      if (data) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setFactorId(data.id);
        setStep("enrolling");
      }
    } catch (error) {
      console.error("Error enrolling MFA:", error);
      toast({
        variant: "destructive",
        title: "Erro ao ativar 2FA",
        description: "Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Código inválido",
        description: "Digite o código de 6 dígitos do seu autenticador.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verificationCode,
      });

      if (verifyError) throw verifyError;

      toast({
        title: "2FA ativado!",
        description: "Autenticação de dois fatores configurada com sucesso.",
      });
      
      setStep("idle");
      setQrCode("");
      setSecret("");
      setVerificationCode("");
      onStatusChange();
    } catch (error) {
      console.error("Error verifying MFA:", error);
      toast({
        variant: "destructive",
        title: "Código incorreto",
        description: "Verifique o código e tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (disableCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Código inválido",
        description: "Digite o código de 6 dígitos do seu autenticador.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get current factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) throw factorsError;

      const verifiedFactor = factorsData.totp.find(f => f.status === "verified");
      if (!verifiedFactor) throw new Error("No verified factor found");

      // Challenge and verify
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: verifiedFactor.id,
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: verifiedFactor.id,
        challengeId: challengeData.id,
        code: disableCode,
      });

      if (verifyError) throw verifyError;

      // Unenroll the factor
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: verifiedFactor.id,
      });

      if (unenrollError) throw unenrollError;

      toast({
        title: "2FA desativado",
        description: "Autenticação de dois fatores foi removida da sua conta.",
      });

      setShowDisableDialog(false);
      setDisableCode("");
      onStatusChange();
    } catch (error) {
      console.error("Error disabling MFA:", error);
      toast({
        variant: "destructive",
        title: "Erro ao desativar 2FA",
        description: "Código incorreto ou erro interno.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cancelEnrollment = async () => {
    if (factorId) {
      try {
        await supabase.auth.mfa.unenroll({ factorId });
      } catch (e) {
        // Ignore errors when canceling
      }
    }
    setStep("idle");
    setQrCode("");
    setSecret("");
    setVerificationCode("");
    setFactorId("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-3">
          {isEnabled ? (
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="p-2 rounded-full bg-muted">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-medium">Autenticação de Dois Fatores</p>
            <p className="text-sm text-muted-foreground">
              {isEnabled
                ? "Sua conta está protegida com 2FA"
                : "Adicione uma camada extra de segurança"}
            </p>
          </div>
        </div>

        {isEnabled ? (
          <Button
            variant="outline"
            onClick={() => setShowDisableDialog(true)}
            className="text-destructive hover:text-destructive"
          >
            <ShieldOff className="h-4 w-4 mr-2" />
            Desativar
          </Button>
        ) : (
          <Button onClick={handleEnroll} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            Ativar 2FA
          </Button>
        )}
      </div>

      {/* Enrollment Dialog */}
      <Dialog open={step === "enrolling"} onOpenChange={(open) => !open && cancelEnrollment()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Autenticação 2FA</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code com seu aplicativo autenticador (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* QR Code */}
            <div className="flex justify-center">
              {qrCode && (
                <img
                  src={qrCode}
                  alt="QR Code para 2FA"
                  className="w-48 h-48 rounded-lg border"
                />
              )}
            </div>

            {/* Manual entry secret */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Ou digite o código manualmente:
              </Label>
              <div className="flex gap-2">
                <Input
                  value={secret}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="icon" onClick={copySecret}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Verification code */}
            <div className="space-y-2">
              <Label htmlFor="verification-code">
                Digite o código de 6 dígitos do seu autenticador:
              </Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={cancelEnrollment}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleVerify}
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Verificar e Ativar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Desativar 2FA</DialogTitle>
            <DialogDescription>
              Digite o código do seu autenticador para confirmar a desativação.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">
                ⚠️ Desativar o 2FA reduz a segurança da sua conta. Tenha certeza antes de continuar.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disable-code">Código do autenticador:</Label>
              <Input
                id="disable-code"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDisableDialog(false);
                  setDisableCode("");
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisable}
                disabled={isLoading || disableCode.length !== 6}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Desativar 2FA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
