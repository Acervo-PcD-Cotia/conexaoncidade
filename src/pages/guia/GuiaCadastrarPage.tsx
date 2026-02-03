/**
 * Guia Comercial - Business Registration Page
 * Multi-step form for new business registration
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
import { useAuth } from "@/contexts/AuthContext";
import { useCreateBusiness, useBusinessCategories } from "@/hooks/useGuiaComercial";
import { DEFAULT_CATEGORIES } from "@/types/guia-comercial";
import {
  Building2,
  MapPin,
  Phone,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

const step1Schema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  category_main: z.string().min(1, "Selecione uma categoria"),
});

const step2Schema = z.object({
  city: z.string().min(2, "Cidade é obrigatória"),
  neighborhoods: z.string().optional(),
  address: z.string().optional(),
});

const step3Schema = z.object({
  whatsapp: z.string().min(10, "WhatsApp inválido"),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  instagram: z.string().optional(),
});

const step4Schema = z.object({
  description_short: z.string().max(160).optional(),
  description_full: z.string().optional(),
  tags: z.string().optional(),
});

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema).merge(step4Schema);

type FormData = z.infer<typeof fullSchema>;

const STEPS = [
  { title: "Identificação", icon: Building2 },
  { title: "Localização", icon: MapPin },
  { title: "Contato", icon: Phone },
  { title: "Detalhes", icon: Sparkles },
];

export default function GuiaCadastrarPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const createBusiness = useCreateBusiness();
  const { data: dbCategories } = useBusinessCategories();

  const categories = dbCategories?.length ? dbCategories : DEFAULT_CATEGORIES.map((c, i) => ({
    ...c,
    id: `default-${i}`,
    tenant_id: null,
    parent_id: null,
    seo_title: null,
    seo_description: null,
    page_content: null,
    sort_order: i,
    is_active: true,
    created_at: new Date().toISOString(),
    color: null,
  }));

  const form = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      name: "",
      category_main: "",
      city: "",
      neighborhoods: "",
      address: "",
      whatsapp: "",
      phone: "",
      email: "",
      website: "",
      instagram: "",
      description_short: "",
      description_full: "",
      tags: "",
    },
    mode: "onChange",
  });

  const getCurrentSchema = () => {
    switch (currentStep) {
      case 0: return step1Schema;
      case 1: return step2Schema;
      case 2: return step3Schema;
      case 3: return step4Schema;
      default: return step1Schema;
    }
  };

  const validateCurrentStep = async () => {
    const schema = getCurrentSchema();
    const fields = Object.keys(schema.shape) as (keyof FormData)[];
    return await form.trigger(fields);
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = (data: FormData) => {
    createBusiness.mutate(
      {
        name: data.name,
        category_main: data.category_main,
        city: data.city,
        neighborhoods: data.neighborhoods?.split(",").map((n) => n.trim()).filter(Boolean),
        address: data.address,
        whatsapp: data.whatsapp,
        phone: data.phone,
        email: data.email || undefined,
        website: data.website || undefined,
        instagram: data.instagram,
        description_short: data.description_short,
        description_full: data.description_full,
        tags: data.tags?.split(",").map((t) => t.trim()).filter(Boolean),
      },
      {
        onSuccess: () => navigate("/guia/anunciante"),
      }
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 mx-auto text-primary mb-4" />
            <CardTitle>Cadastre sua Empresa</CardTitle>
            <CardDescription>
              Faça login ou crie uma conta para cadastrar sua empresa no Guia Comercial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" asChild>
              <Link to="/auth?redirect=/guia/cadastrar">Entrar ou Criar Conta</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/guia">Voltar ao Guia</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <>
      <Helmet>
        <title>Cadastrar Empresa | Guia Comercial</title>
        <meta 
          name="description" 
          content="Cadastre sua empresa gratuitamente no Guia Comercial e aumente sua visibilidade online." 
        />
      </Helmet>

      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Cadastrar Minha Empresa</h1>
            <p className="text-muted-foreground">
              Comece gratuitamente e aumente sua visibilidade online
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div
                    key={step.title}
                    className={`flex flex-col items-center gap-1 ${
                      isActive ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                          ? "bg-green-100 text-green-600"
                          : "bg-muted"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                  </div>
                );
              })}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[currentStep].title}</CardTitle>
              <CardDescription>
                {currentStep === 0 && "Como se chama seu negócio e qual a categoria?"}
                {currentStep === 1 && "Onde sua empresa está localizada?"}
                {currentStep === 2 && "Como os clientes podem entrar em contato?"}
                {currentStep === 3 && "Conte mais sobre seu negócio"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Step 1: Identification */}
                  {currentStep === 0 && (
                    <>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Empresa *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Pizzaria do João" {...field} />
                            </FormControl>
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
                    </>
                  )}

                  {/* Step 2: Location */}
                  {currentStep === 1 && (
                    <>
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: São Paulo" {...field} />
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
                              <Input placeholder="Ex: Centro, Vila Nova, Jardim..." {...field} />
                            </FormControl>
                            <FormDescription>Separe por vírgula</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço Completo</FormLabel>
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
                    </>
                  )}

                  {/* Step 3: Contact */}
                  {currentStep === 2 && (
                    <>
                      <FormField
                        control={form.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp *</FormLabel>
                            <FormControl>
                              <Input placeholder="(11) 99999-9999" {...field} />
                            </FormControl>
                            <FormDescription>
                              Principal forma de contato com clientes
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
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
                    </>
                  )}

                  {/* Step 4: Details */}
                  {currentStep === 3 && (
                    <>
                      <FormField
                        control={form.control}
                        name="description_short"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição Curta</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Breve descrição do seu negócio (aparece nas listagens)"
                                rows={2}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Máximo 160 caracteres</FormDescription>
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
                                placeholder="Conte mais sobre sua empresa, serviços, diferenciais..."
                                rows={5}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Palavras-chave / Tags</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: pizza, hamburguer, delivery, família..."
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Ajuda clientes a encontrar você. Separe por vírgula.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>

                    {currentStep < STEPS.length - 1 ? (
                      <Button type="button" onClick={handleNext}>
                        Próximo
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button type="submit" disabled={createBusiness.isPending}>
                        {createBusiness.isPending ? (
                          "Cadastrando..."
                        ) : (
                          <>
                            Cadastrar Empresa
                            <Check className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm">
            <div className="p-4 bg-card rounded-lg">
              <div className="text-2xl mb-2">✓</div>
              <p className="font-medium">100% Gratuito</p>
              <p className="text-muted-foreground text-xs">Para começar</p>
            </div>
            <div className="p-4 bg-card rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <p className="font-medium">Mais Visibilidade</p>
              <p className="text-muted-foreground text-xs">No Google</p>
            </div>
            <div className="p-4 bg-card rounded-lg">
              <div className="text-2xl mb-2">💬</div>
              <p className="font-medium">Leads Diretos</p>
              <p className="text-muted-foreground text-xs">Via WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
