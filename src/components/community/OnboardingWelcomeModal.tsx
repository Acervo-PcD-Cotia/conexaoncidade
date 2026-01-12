import { Users, ShieldCheck, Heart, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface OnboardingWelcomeModalProps {
  open: boolean;
  onContinue: () => void;
}

export function OnboardingWelcomeModal({ open, onContinue }: OnboardingWelcomeModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            Bem-vindo à Comunidade Conexão na Cidade!
          </DialogTitle>
          <DialogDescription className="text-base">
            Você está entrando em um espaço exclusivo para cidadãos engajados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-sm">Diálogo construtivo</p>
              <p className="text-sm text-muted-foreground">
                Compartilhe ideias e debata sobre temas importantes para nossa cidade.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-sm">Combate à desinformação</p>
              <p className="text-sm text-muted-foreground">
                Aqui valorizamos informações verificadas e combatemos fake news.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <Heart className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-sm">Comunidade ativa</p>
              <p className="text-sm text-muted-foreground">
                Ganhe pontos, suba de nível e ajude a fortalecer nossa comunidade.
              </p>
            </div>
          </div>
        </div>

        <Button onClick={onContinue} className="w-full">
          Começar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
