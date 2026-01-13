import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LocationReview } from "@/hooks/useLocationReviews";

interface ReportReviewDialogProps {
  review: LocationReview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REPORT_REASONS = [
  { value: "fake_review", label: "Avaliação falsa ou fraudulenta" },
  { value: "offensive", label: "Conteúdo ofensivo ou impróprio" },
  { value: "spam", label: "Spam ou propaganda" },
  { value: "other", label: "Outro motivo" },
];

export function ReportReviewDialog({
  review,
  open,
  onOpenChange,
}: ReportReviewDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const reportMutation = useMutation({
    mutationFn: async () => {
      if (!user || !review) throw new Error("Dados inválidos");

      const { error } = await supabase.from("community_reports").insert({
        reporter_id: user.id,
        reported_user_id: review.user_id,
        review_id: review.id,
        reason: reason,
        description: description.trim() || null,
        status: "pending",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-reports"] });
      toast({
        title: "Denúncia enviada",
        description: "Nossa equipe irá analisar sua denúncia em breve.",
      });
      onOpenChange(false);
      setReason("");
      setDescription("");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao enviar denúncia",
        description: error.message,
      });
    },
  });

  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Denunciar Avaliação
          </DialogTitle>
          <DialogDescription>
            Informe o motivo da denúncia. Nossa equipe irá analisar e tomar as
            medidas necessárias.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Motivo da denúncia *</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {REPORT_REASONS.map((r) => (
                <div key={r.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={r.value} id={r.value} />
                  <Label htmlFor={r.value} className="font-normal cursor-pointer">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Detalhes adicionais (opcional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva mais detalhes sobre o problema..."
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => reportMutation.mutate()}
            disabled={!reason || reportMutation.isPending}
          >
            {reportMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Flag className="h-4 w-4 mr-2" />
            )}
            Enviar Denúncia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
