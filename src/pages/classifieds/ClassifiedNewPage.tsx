import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateClassified, CLASSIFIED_CATEGORIES } from "@/hooks/useClassifieds";
import { useAuth } from "@/contexts/AuthContext";

const NEIGHBORHOODS = [
  'Centro', 'Granja Viana', 'Jardim da Glória', 'Jardim Barbacena', 
  'Parque São George', 'Portão', 'Caucaia do Alto', 'Ressaca',
  'Jardim Atalaia', 'Parque Jandaia', 'Vila Jovina', 'Outros'
];

const formSchema = z.object({
  title: z.string().min(5, "Mínimo 5 caracteres").max(100, "Máximo 100 caracteres"),
  description: z.string().min(20, "Descreva melhor seu anúncio (mínimo 20 caracteres)"),
  category: z.string().min(1, "Selecione uma categoria"),
  price: z.string().optional(),
  is_negotiable: z.boolean().default(false),
  contact_name: z.string().min(2, "Informe seu nome"),
  contact_phone: z.string().optional(),
  contact_whatsapp: z.string().min(10, "Informe um WhatsApp válido"),
  contact_email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  neighborhood: z.string().optional(),
  location: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ClassifiedNewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createClassified = useCreateClassified();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: "",
      is_negotiable: false,
      contact_name: "",
      contact_phone: "",
      contact_whatsapp: "",
      contact_email: user?.email || "",
      neighborhood: "",
      location: "Cotia - SP",
    },
  });

  const onSubmit = async (data: FormValues) => {
    const price = data.price ? parseFloat(data.price.replace(/\D/g, '')) / 100 : null;
    
    await createClassified.mutateAsync({
      title: data.title,
      description: data.description,
      category: data.category,
      price,
      is_negotiable: data.is_negotiable,
      contact_name: data.contact_name,
      contact_phone: data.contact_phone || null,
      contact_whatsapp: data.contact_whatsapp,
      contact_email: data.contact_email || null,
      neighborhood: data.neighborhood || null,
      location: data.location || null,
      images: [],
    });

    navigate("/classificados");
  };

  if (!user) {
    navigate("/auth?redirect=/classificados/novo");
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Novo Anúncio - Classificados | Conexão na Cidade</title>
      </Helmet>

      <div className="container max-w-2xl py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/classificados">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Criar Anúncio</CardTitle>
            <CardDescription>
              Preencha os dados do seu anúncio. Após enviar, ele passará por moderação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do anúncio *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: iPhone 14 Pro 256GB" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CLASSIFIED_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva detalhes do produto ou serviço..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (R$)</FormLabel>
                        <FormControl>
                          <Input placeholder="0,00" {...field} />
                        </FormControl>
                        <FormDescription>Deixe em branco para "A combinar"</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_negotiable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 space-y-0 pb-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Aceita negociação</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o bairro" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {NEIGHBORHOODS.map((n) => (
                            <SelectItem key={n} value={n}>
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Dados de Contato</h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="contact_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seu nome *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contact_whatsapp"
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
                      name="contact_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Seu anúncio será revisado antes de ser publicado. Anúncios aprovados ficam ativos por 30 dias.
                  </AlertDescription>
                </Alert>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createClassified.isPending}
                >
                  {createClassified.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Enviar para moderação
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
