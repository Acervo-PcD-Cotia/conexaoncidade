import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpsertProofAnalytics } from "@/hooks/useCampaignProofAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Save } from "lucide-react";
import type { CampaignProofFull } from "@/types/campaign-proofs";

const formSchema = z.object({
  users: z.coerce.number().nullable().optional(),
  new_users: z.coerce.number().nullable().optional(),
  pageviews: z.coerce.number().nullable().optional(),
  unique_pageviews: z.coerce.number().nullable().optional(),
  sessions: z.coerce.number().nullable().optional(),
  bounce_rate: z.coerce.number().nullable().optional(),
  avg_time: z.string().nullable().optional(),
  entrances: z.coerce.number().nullable().optional(),
  show_on_pdf: z.boolean(),
  notes: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProofAnalyticsFormProps {
  proof: CampaignProofFull;
}

export default function ProofAnalyticsForm({ proof }: ProofAnalyticsFormProps) {
  const upsertMutation = useUpsertProofAnalytics();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      users: proof.analytics?.users ?? null,
      new_users: proof.analytics?.new_users ?? null,
      pageviews: proof.analytics?.pageviews ?? null,
      unique_pageviews: proof.analytics?.unique_pageviews ?? null,
      sessions: proof.analytics?.sessions ?? null,
      bounce_rate: proof.analytics?.bounce_rate ?? null,
      avg_time: proof.analytics?.avg_time ?? "",
      entrances: proof.analytics?.entrances ?? null,
      show_on_pdf: proof.analytics?.show_on_pdf ?? false,
      notes: proof.analytics?.notes ?? "",
    },
  });

  const onSubmit = (values: FormValues) => {
    upsertMutation.mutate({
      campaign_proof_id: proof.id,
      users: values.users || null,
      new_users: values.new_users || null,
      pageviews: values.pageviews || null,
      unique_pageviews: values.unique_pageviews || null,
      sessions: values.sessions || null,
      bounce_rate: values.bounce_rate || null,
      avg_time: values.avg_time || null,
      entrances: values.entrances || null,
      show_on_pdf: values.show_on_pdf,
      notes: values.notes || null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas Manuais</CardTitle>
        <CardDescription>
          Insira dados do Google Analytics manualmente (todos os campos são opcionais)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Toggle Show on PDF */}
            <FormField
              control={form.control}
              name="show_on_pdf"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Exibir no PDF</FormLabel>
                    <FormDescription>
                      Incluir estas métricas no relatório Analytics
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormField
                control={form.control}
                name="users"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuários</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        value={field.value ?? ""} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="new_users"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Novos Usuários</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pageviews"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visualizações</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unique_pageviews"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visualizações Únicas</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sessions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sessões</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bounce_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de Rejeição (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avg_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo Médio</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="00:02:30" 
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="entrances"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entradas</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas adicionais sobre os dados..." 
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex justify-end">
              <Button type="submit" disabled={upsertMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {upsertMutation.isPending ? "Salvando..." : "Salvar Métricas"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
