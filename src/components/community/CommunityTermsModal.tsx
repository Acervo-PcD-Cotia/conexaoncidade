import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle, Heart, Users } from "lucide-react";

interface CommunityTermsModalProps {
  open: boolean;
  onAccept: () => void;
}

export function CommunityTermsModal({ open, onAccept }: CommunityTermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Termos de Uso da Comunidade
          </DialogTitle>
          <DialogDescription>
            Antes de participar, leia e aceite nossas diretrizes
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-rose-500" />
                Respeito e Cordialidade
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Trate todos os membros com respeito</li>
                <li>Não são permitidos ataques pessoais ou ofensas</li>
                <li>Discordâncias devem ser expressas de forma construtiva</li>
                <li>Discriminação de qualquer tipo não será tolerada</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-500" />
                Conteúdo Permitido
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Discussões sobre temas relevantes à comunidade</li>
                <li>Compartilhamento de ideias e opiniões</li>
                <li>Perguntas e pedidos de ajuda</li>
                <li>Sugestões de pautas para o portal</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Conteúdo Proibido
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Spam, propaganda ou promoção não autorizada</li>
                <li>Conteúdo ilegal ou que incite violência</li>
                <li>Fake news ou desinformação</li>
                <li>Conteúdo adulto ou impróprio</li>
                <li>Dados pessoais de terceiros sem consentimento</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Penalidades</h3>
              <p className="text-muted-foreground">
                Violações podem resultar em:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-1">
                <li>Aviso formal</li>
                <li>Suspensão temporária</li>
                <li>Banimento permanente</li>
              </ul>
            </section>

            <section className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Ao aceitar estes termos, você concorda em seguir as diretrizes da comunidade 
                e entende que a moderação pode remover conteúdo ou aplicar penalidades 
                conforme necessário para manter um ambiente saudável.
              </p>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onAccept} className="w-full">
            Aceito os Termos e Quero Participar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
