import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateTransportReport } from "@/hooks/useTransportLeads";

const reportSchema = z.object({
  motivo: z.enum(["contato_invalido", "comportamento_inadequado", "golpe", "outros"]),
  descricao: z.string().max(800).optional(),
  contato: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transporterId?: string;
  transporterName?: string;
}

export function ReportModal({ open, onOpenChange, transporterId, transporterName }: ReportModalProps) {
  const createReport = useCreateTransportReport();

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      motivo: "contato_invalido",
      descricao: "",
      contato: "",
    },
  });

  const onSubmit = async (data: ReportFormData) => {
    await createReport.mutateAsync({
      motivo: data.motivo,
      descricao: data.descricao,
      contato: data.contato,
      transporter_id: transporterId,
    });
    onOpenChange(false);
    form.reset();
  };

  const motivoLabels: Record<string, string> = {
    contato_invalido: "Contato inválido ou desatualizado",
    comportamento_inadequado: "Comportamento inadequado",
    golpe: "Suspeita de golpe",
    outros: "Outros",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Denunciar Problema
          </DialogTitle>
          <DialogDescription>
            {transporterName ? (
              <>Denunciar problema com <strong>{transporterName}</strong></>
            ) : (
              "Relate um problema com este transportador"
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo da denúncia *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger aria-label="Selecione o motivo da denúncia">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(motivoLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o problema com mais detalhes..."
                      className="resize-none"
                      rows={4}
                      maxLength={800}
                      aria-label="Descrição do problema"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground text-right">
                    {field.value?.length || 0}/800
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seu contato (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="WhatsApp ou e-mail para retorno"
                      aria-label="Seu contato para retorno"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={createReport.isPending}
              >
                {createReport.isPending ? "Enviando..." : "Enviar Denúncia"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
