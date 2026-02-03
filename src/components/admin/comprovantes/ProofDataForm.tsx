import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCampaignProof, useUpdateCampaignProof } from "@/hooks/useCampaignProofs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  client_name: z.string().min(1, "Nome do cliente obrigatório"),
  campaign_name: z.string().min(1, "Nome da campanha obrigatório"),
  insertion_order: z.string().min(1, "Pedido de Inserção obrigatório"),
  internal_number: z.string().optional(),
  internal_code: z.string().optional(),
  site_name: z.string().min(1, "Nome do veículo obrigatório"),
  site_domain: z.string().min(1, "Domínio obrigatório"),
  start_date: z.string().min(1, "Data início obrigatória"),
  end_date: z.string().min(1, "Data fim obrigatória"),
  status: z.enum(["draft", "final", "sent"]),
});

type FormValues = z.infer<typeof formSchema>;

interface ProofDataFormProps {
  proof?: CampaignProofFull | null;
  onSuccess?: (id: string) => void;
}

export default function ProofDataForm({ proof, onSuccess }: ProofDataFormProps) {
  const createMutation = useCreateCampaignProof();
  const updateMutation = useUpdateCampaignProof();
  const isNew = !proof;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_name: proof?.client_name || "",
      campaign_name: proof?.campaign_name || "",
      insertion_order: proof?.insertion_order || "",
      internal_number: proof?.internal_number || "",
      internal_code: proof?.internal_code || "",
      site_name: proof?.site_name || "Jornal Conexão na Cidade",
      site_domain: proof?.site_domain || "www.conexaonacidade.com.br",
      start_date: proof?.start_date || "",
      end_date: proof?.end_date || "",
      status: proof?.status || "draft",
    },
  });

  const onSubmit = (values: FormValues) => {
    if (isNew) {
      createMutation.mutate({
        client_name: values.client_name,
        campaign_name: values.campaign_name,
        insertion_order: values.insertion_order,
        internal_number: values.internal_number,
        internal_code: values.internal_code,
        site_name: values.site_name,
        site_domain: values.site_domain,
        start_date: values.start_date,
        end_date: values.end_date,
        status: values.status,
      }, {
        onSuccess: (data) => onSuccess?.(data.id),
      });
    } else {
      updateMutation.mutate({ id: proof.id, ...values });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da Campanha</CardTitle>
        <CardDescription>
          Informações básicas que aparecerão na capa do comprovante
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Cliente e Campanha */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="client_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="campaign_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campanha *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da campanha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* PI, Número e Código */}
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="insertion_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pedido de Inserção *</FormLabel>
                    <FormControl>
                      <Input placeholder="PI-2024-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="internal_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número Interno</FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormDescription>Campo opcional</FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="internal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Interno</FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormDescription>Campo opcional</FormDescription>
                  </FormItem>
                )}
              />
            </div>

            {/* Site e Domínio */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="site_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Veículo *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="site_domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domínio *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Datas e Status */}
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Início *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Fim *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="final">Finalizado</SelectItem>
                        <SelectItem value="sent">Enviado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                <Save className="mr-2 h-4 w-4" />
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
