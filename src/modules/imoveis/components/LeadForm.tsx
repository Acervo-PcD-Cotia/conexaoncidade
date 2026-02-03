import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { useCreateLead } from "../hooks/useLeads";
import type { LeadIntencao } from "../types";

const formSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  whatsapp: z.string().min(10, "WhatsApp é obrigatório"),
  mensagem: z.string().optional(),
  intencao: z.enum(["comprar", "alugar", "investir", "avaliar"]).optional(),
  prazo: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface LeadFormProps {
  imovelId?: string;
  anuncianteId?: string;
  imovelTitulo?: string;
  compact?: boolean;
}

export function LeadForm({ imovelId, anuncianteId, imovelTitulo, compact = false }: LeadFormProps) {
  const createLead = useCreateLead();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      whatsapp: "",
      mensagem: imovelTitulo ? `Olá! Tenho interesse no imóvel: ${imovelTitulo}` : "",
      intencao: "comprar",
      prazo: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    await createLead.mutateAsync({
      nome: data.nome,
      whatsapp: data.whatsapp,
      email: data.email || undefined,
      telefone: data.telefone || undefined,
      mensagem: data.mensagem || undefined,
      prazo: data.prazo || undefined,
      imovel_id: imovelId,
      anunciante_id: anuncianteId,
      intencao: data.intencao as LeadIntencao,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
        <CardContent className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="mb-2 font-semibold text-green-800 dark:text-green-200">
            Mensagem enviada!
          </h3>
          <p className="text-sm text-green-600 dark:text-green-400">
            Entraremos em contato em breve.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className={compact ? "pb-3" : ""}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Tenho interesse
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp *</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!compact && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="intencao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intenção</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="comprar">Comprar</SelectItem>
                          <SelectItem value="alugar">Alugar</SelectItem>
                          <SelectItem value="investir">Investir</SelectItem>
                          <SelectItem value="avaliar">Avaliar meu imóvel</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prazo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="imediato">Imediato</SelectItem>
                          <SelectItem value="30dias">Até 30 dias</SelectItem>
                          <SelectItem value="90dias">Até 90 dias</SelectItem>
                          <SelectItem value="6meses">Até 6 meses</SelectItem>
                          <SelectItem value="1ano">Até 1 ano</SelectItem>
                          <SelectItem value="indefinido">Indefinido</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="mensagem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escreva sua mensagem..."
                      rows={compact ? 2 : 4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={createLead.isPending}
            >
              {createLead.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar mensagem
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
