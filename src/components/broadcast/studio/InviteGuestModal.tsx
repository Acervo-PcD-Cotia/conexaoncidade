import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Copy, 
  Check, 
  Link2, 
  Mail, 
  MessageCircle, 
  Loader2,
  Video,
  Mic,
  Clock
} from "lucide-react";

interface InviteGuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  broadcastId: string;
  broadcastTitle: string;
}

export function InviteGuestModal({
  open,
  onOpenChange,
  broadcastId,
  broadcastTitle,
}: InviteGuestModalProps) {
  const [guestName, setGuestName] = useState("");
  const [guestTitle, setGuestTitle] = useState("");
  const [allowVideo, setAllowVideo] = useState(true);
  const [allowAudio, setAllowAudio] = useState(true);
  const [expiresIn, setExpiresIn] = useState("60"); // minutes
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateInvite = useMutation({
    mutationFn: async () => {
      // Generate unique invite token
      const inviteToken = crypto.randomUUID();
      const expiresAt = new Date(
        Date.now() + parseInt(expiresIn) * 60 * 1000
      ).toISOString();

      // Store invite in database
      const { data, error } = await supabase
        .from("broadcast_participants")
        .insert({
          broadcast_id: broadcastId,
          role: "guest",
          display_name: guestName || "Convidado",
          invite_token: inviteToken,
          invite_expires_at: expiresAt,
          can_publish: allowVideo || allowAudio,
          can_subscribe: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Generate invite link
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/join/${inviteToken}`;
      
      return { link, data };
    },
    onSuccess: ({ link }) => {
      setGeneratedLink(link);
      toast.success("Convite gerado com sucesso!");
    },
    onError: (error) => {
      console.error("Error generating invite:", error);
      toast.error("Erro ao gerar convite");
    },
  });

  const copyToClipboard = async () => {
    if (!generatedLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar link");
    }
  };

  const shareViaWhatsApp = () => {
    if (!generatedLink) return;
    
    const message = encodeURIComponent(
      `Você foi convidado para participar da transmissão "${broadcastTitle}"!\n\nAcesse: ${generatedLink}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const shareViaEmail = () => {
    if (!generatedLink) return;
    
    const subject = encodeURIComponent(`Convite para transmissão: ${broadcastTitle}`);
    const body = encodeURIComponent(
      `Olá!\n\nVocê foi convidado para participar da transmissão "${broadcastTitle}".\n\nAcesse o link abaixo para entrar:\n${generatedLink}\n\nAté logo!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const resetForm = () => {
    setGuestName("");
    setGuestTitle("");
    setAllowVideo(true);
    setAllowAudio(true);
    setExpiresIn("60");
    setGeneratedLink(null);
    setCopied(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar Participante</DialogTitle>
          <DialogDescription>
            Gere um link de convite para um convidado participar da transmissão.
          </DialogDescription>
        </DialogHeader>

        {!generatedLink ? (
          <div className="space-y-4">
            {/* Guest info */}
            <div className="space-y-2">
              <Label htmlFor="guestName">Nome do convidado</Label>
              <Input
                id="guestName"
                placeholder="Ex: João Silva"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestTitle">Título / Cargo (opcional)</Label>
              <Input
                id="guestTitle"
                placeholder="Ex: Especialista em Tecnologia"
                value={guestTitle}
                onChange={(e) => setGuestTitle(e.target.value)}
              />
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <Label>Permissões</Label>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Pode enviar vídeo</span>
                </div>
                <Switch
                  checked={allowVideo}
                  onCheckedChange={setAllowVideo}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Pode enviar áudio</span>
                </div>
                <Switch
                  checked={allowAudio}
                  onCheckedChange={setAllowAudio}
                />
              </div>
            </div>

            {/* Expiration */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Expira em
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={expiresIn === "30" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExpiresIn("30")}
                >
                  30 min
                </Button>
                <Button
                  type="button"
                  variant={expiresIn === "60" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExpiresIn("60")}
                >
                  1 hora
                </Button>
                <Button
                  type="button"
                  variant={expiresIn === "180" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExpiresIn("180")}
                >
                  3 horas
                </Button>
                <Button
                  type="button"
                  variant={expiresIn === "1440" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExpiresIn("1440")}
                >
                  24 horas
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Generated link */}
            <div className="space-y-2">
              <Label>Link do convite</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Share options */}
            <div className="space-y-2">
              <Label>Compartilhar via</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={shareViaWhatsApp}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={shareViaEmail}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  E-mail
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Este link expira em {expiresIn} minutos
            </p>
          </div>
        )}

        <DialogFooter>
          {!generatedLink ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => generateInvite.mutate()}
                disabled={generateInvite.isPending}
              >
                {generateInvite.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-4 w-4" />
                    Gerar Convite
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Novo Convite
              </Button>
              <Button onClick={() => handleOpenChange(false)}>
                Fechar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
