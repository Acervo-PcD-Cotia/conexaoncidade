/**
 * Guia Comercial - Business Editor Page
 * For editing existing business listings
 */

import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUpdateBusiness, useBusinessCategories } from "@/hooks/useGuiaComercial";
import { PLAN_LABELS, PLAN_COLORS, PAYMENT_METHODS, AMENITIES, type Business, type UpdateBusinessInput } from "@/types/guia-comercial";
import type { Json } from "@/integrations/supabase/types";
import {
  ArrowLeft,
  Save,
  Building2,
  MapPin,
  Phone,
  Globe,
  Clock,
  Image,
  Tag,
  Search,
} from "lucide-react";

const businessSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  category_main: z.string().min(1, "Selecione uma categoria"),
  city: z.string().min(2, "Cidade é obrigatória"),
  tagline: z.string().max(100).optional(),
  description_short: z.string().max(160).optional(),
  description_full: z.string().optional(),
  neighborhoods: z.string().optional(),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().optional(),
  address: z.string().optional(),
  payment_methods: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  tags: z.string().optional(),
  seo_title: z.string().max(60).optional(),
  seo_description: z.string().max(160).optional(),
});

type BusinessFormData = z.infer<typeof businessSchema>;

export default function GuiaAnuncianteEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateBusiness = useUpdateBusiness();
  const { data: categories } = useBusinessCategories();

  const { data: business, isLoading } = useQuery({
    queryKey: ['business-edit', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as Business;
    },
  });

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    values: business ? {
      name: business.name,
      category_main: business.category_main,
      city: business.city,
      tagline: business.tagline ?? "",
      description_short: business.description_short ?? "",
      description_full: business.description_full ?? "",
      neighborhoods: business.neighborhoods?.join(", ") ?? "",
      whatsapp: business.whatsapp ?? "",
      phone: business.phone ?? "",
      email: business.email ?? "",
      website: business.website ?? "",
      instagram: business.instagram ?? "",
      address: business.address ?? "",
      payment_methods: business.payment_methods ?? [],
      amenities: business.amenities ?? [],
      tags: business.tags?.join(", ") ?? "",
      seo_title: business.seo_title ?? "",
      seo_description: business.seo_description ?? "",
    } : undefined,
  });

  const onSubmit = (data: BusinessFormData) => {
    if (!id) return;

    const input: UpdateBusinessInput = {
      id,
      name: data.name,
      category_main: data.category_main,
      city: data.city,
      description_short: data.description_short,
      description_full: data.description_full,
      neighborhoods: data.neighborhoods?.split(",").map(n => n.trim()).filter(Boolean),
      whatsapp: data.whatsapp,
      phone: data.phone,
      email: data.email || undefined,
      website: data.website || undefined,
      instagram: data.instagram,
      address: data.address,
      payment_methods: data.payment_methods,
      tags: data.tags?.split(",").map(t => t.trim()).filter(Boolean),
      seo_title: data.seo_title,
      seo_description: data.seo_description,
    };

    updateBusiness.mutate(input, {
      onSuccess: () => navigate('/guia/anunciante'),
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Empresa não encontrada</p>
        <Button className="mt-4" asChild>
          <Link to="/guia/anunciante">Voltar ao Painel</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Editar {business.name} | Guia Comercial</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/guia/anunciante">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Editar Empresa</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={PLAN_COLORS[business.plan]}>
                  {PLAN_LABELS[business.plan]}
                </Badge>
                {business.plan === 'free' && (
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/guia/planos">Fazer Upgrade</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateBusiness.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateBusiness.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="basic">
                  <Building2 className="h-4 w-4 mr-2" />
                  Básico
                </TabsTrigger>
                <TabsTrigger value="contact">
                  <Phone className="h-4 w-4 mr-2" />
                  Contato
                </TabsTrigger>
                <TabsTrigger value="details">
                  <Tag className="h-4 w-4 mr-2" />
                  Detalhes
                </TabsTrigger>
                <TabsTrigger value="seo">
                  <Search className="h-4 w-4 mr-2" />
                  SEO
                </TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                    <CardDescription>
                      Dados principais da sua empresa
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Empresa *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da sua empresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tagline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slogan</FormLabel>
                          <FormControl>
                            <Input placeholder="Uma frase curta sobre seu negócio" {...field} />
                          </FormControl>
                          <FormDescription>Máximo 100 caracteres</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category_main"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria Principal *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.slug}>
                                  {cat.icon} {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade *</FormLabel>
                            <FormControl>
                              <Input placeholder="Sua cidade" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="neighborhoods"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairros de Atuação</FormLabel>
                            <FormControl>
                              <Input placeholder="Centro, Vila Nova, Jardim..." {...field} />
                            </FormControl>
                            <FormDescription>Separe por vírgula</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description_short"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição Curta</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Breve descrição do seu negócio..."
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Usada em listagens. Máximo 160 caracteres.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description_full"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição Completa</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Conte mais sobre sua empresa, história, diferenciais..."
                              rows={6}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações de Contato</CardTitle>
                    <CardDescription>
                      Como os clientes podem entrar em contato
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp</FormLabel>
                            <FormControl>
                              <Input placeholder="(11) 99999-9999" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone Fixo</FormLabel>
                            <FormControl>
                              <Input placeholder="(11) 3333-3333" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contato@empresa.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://seusite.com.br" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <Input placeholder="@seuinstagram" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Rua, número, complemento, CEP..."
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes do Negócio</CardTitle>
                    <CardDescription>
                      Formas de pagamento, facilidades e tags
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="payment_methods"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Formas de Pagamento</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {PAYMENT_METHODS.map((method) => (
                              <label
                                key={method.value}
                                className="flex items-center space-x-2 cursor-pointer"
                              >
                                <Checkbox
                                  checked={field.value?.includes(method.value)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value ?? [];
                                    if (checked) {
                                      field.onChange([...current, method.value]);
                                    } else {
                                      field.onChange(current.filter((v) => v !== method.value));
                                    }
                                  }}
                                />
                                <span className="text-sm">{method.label}</span>
                              </label>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amenities"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comodidades</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {AMENITIES.map((amenity) => (
                              <label
                                key={amenity.value}
                                className="flex items-center space-x-2 cursor-pointer"
                              >
                                <Checkbox
                                  checked={field.value?.includes(amenity.value)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value ?? [];
                                    if (checked) {
                                      field.onChange([...current, amenity.value]);
                                    } else {
                                      field.onChange(current.filter((v) => v !== amenity.value));
                                    }
                                  }}
                                />
                                <span className="text-sm">
                                  {amenity.icon} {amenity.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags / Palavras-chave</FormLabel>
                          <FormControl>
                            <Input placeholder="pizza, hamburguer, delivery, família..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Ajuda na busca. Separe por vírgula.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo">
                <Card>
                  <CardHeader>
                    <CardTitle>Otimização para Buscadores (SEO)</CardTitle>
                    <CardDescription>
                      Melhore sua visibilidade no Google
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="seo_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título SEO</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={`${business.name} - Serviços em ${business.city}`}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Máximo 60 caracteres. Aparece no título da página.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seo_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva seu negócio de forma atrativa para os buscadores..."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Máximo 160 caracteres. Aparece nos resultados do Google.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* SEO Preview */}
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">Prévia no Google:</p>
                      <div className="space-y-1">
                        <p className="text-blue-600 hover:underline text-lg">
                          {form.watch('seo_title') || `${business.name} | Guia Comercial`}
                        </p>
                        <p className="text-green-700 text-sm">
                          conexaonacidade.com.br › guia › {business.slug}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {form.watch('seo_description') || business.description_short || 'Descrição da empresa...'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </>
  );
}
