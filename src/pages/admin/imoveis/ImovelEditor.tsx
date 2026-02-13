import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ArrowLeft, Save, Loader2, Upload, X, MapPin, DollarSign, 
  Home, Image as ImageIcon, FileText, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useCreateImovel, useImovel } from "@/modules/imoveis/hooks/useImoveis";
import { useAnunciantes } from "@/modules/imoveis/hooks/useAnunciantes";
import { TIPO_LABELS, FINALIDADE_LABELS, FEATURES_COMUNS, PROXIMIDADES_COMUNS } from "@/modules/imoveis/types";
import type { ImovelTipo, ImovelFinalidade, ImovelStatus } from "@/modules/imoveis/types";

const imovelSchema = z.object({
  titulo: z.string().min(10, "Título deve ter pelo menos 10 caracteres"),
  finalidade: z.enum(["venda", "aluguel", "venda_aluguel"]),
  tipo: z.enum(["casa", "apartamento", "terreno", "comercial", "chacara", "cobertura", "studio", "kitnet", "galpao", "sala_comercial"]),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  bairro: z.string().min(2, "Bairro é obrigatório"),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  cep: z.string().optional(),
  preco: z.number().optional(),
  condominio_valor: z.number().optional(),
  iptu_valor: z.number().optional(),
  area_construida: z.number().optional(),
  area_terreno: z.number().optional(),
  quartos: z.number().min(0).default(0),
  suites: z.number().min(0).default(0),
  banheiros: z.number().min(0).default(0),
  vagas: z.number().min(0).default(0),
  descricao_html: z.string().optional(),
  anunciante_id: z.string().optional(),
  mostrar_endereco_exato: z.boolean().default(false),
  destaque: z.boolean().default(false),
  lancamento: z.boolean().default(false),
  aceita_financiamento: z.boolean().default(false),
  aceita_permuta: z.boolean().default(false),
  is_condominio: z.boolean().default(false),
});

type ImovelFormData = z.infer<typeof imovelSchema>;

export default function ImovelEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedProximidades, setSelectedProximidades] = useState<string[]>([]);
  
  const isEditing = !!id;
  const { data: imovel, isLoading: loadingImovel } = useImovel(id || "");
  const { data: anunciantes } = useAnunciantes();
  const createImovel = useCreateImovel();

  const form = useForm<ImovelFormData>({
    resolver: zodResolver(imovelSchema),
    defaultValues: {
      titulo: "",
      finalidade: "venda",
      tipo: "casa",
      cidade: "Cotia",
      bairro: "",
      quartos: 0,
      suites: 0,
      banheiros: 0,
      vagas: 0,
      mostrar_endereco_exato: false,
      destaque: false,
      lancamento: false,
      aceita_financiamento: false,
      aceita_permuta: false,
      is_condominio: false,
    },
  });

  const onSubmit = async (data: ImovelFormData) => {
    try {
      const slug = data.titulo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 100);

      await createImovel.mutateAsync({
        titulo: data.titulo,
        slug,
        finalidade: data.finalidade,
        tipo: data.tipo,
        cidade: data.cidade,
        bairro: data.bairro,
        endereco: data.endereco,
        numero: data.numero,
        cep: data.cep,
        preco: data.preco,
        condominio_valor: data.condominio_valor,
        iptu_valor: data.iptu_valor,
        area_construida: data.area_construida,
        area_terreno: data.area_terreno,
        quartos: data.quartos,
        suites: data.suites,
        banheiros: data.banheiros,
        vagas: data.vagas,
        descricao_html: data.descricao_html,
        anunciante_id: data.anunciante_id,
        mostrar_endereco_exato: data.mostrar_endereco_exato,
        destaque: data.destaque,
        lancamento: data.lancamento,
        aceita_financiamento: data.aceita_financiamento,
        aceita_permuta: data.aceita_permuta,
        is_condominio: data.is_condominio,
        features: selectedFeatures,
        proximidades: selectedProximidades,
        status: "pendente" as ImovelStatus,
      });

      toast({
        title: "Imóvel salvo!",
        description: "O imóvel foi cadastrado e está aguardando aprovação.",
      });

      navigate("/spah/painel/imoveis");
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o imóvel.",
        variant: "destructive",
      });
    }
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const toggleProximidade = (item: string) => {
    setSelectedProximidades(prev => 
      prev.includes(item) 
        ? prev.filter(p => p !== item)
        : [...prev, item]
    );
  };

  if (isEditing && loadingImovel) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {isEditing ? "Editar Imóvel" : "Novo Imóvel"}
          </h1>
          <p className="text-muted-foreground">
            Preencha os dados do imóvel
          </p>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={createImovel.isPending}>
          {createImovel.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="basico" className="space-y-6">
            <TabsList>
              <TabsTrigger value="basico" className="gap-2">
                <Home className="h-4 w-4" />
                Básico
              </TabsTrigger>
              <TabsTrigger value="localizacao" className="gap-2">
                <MapPin className="h-4 w-4" />
                Localização
              </TabsTrigger>
              <TabsTrigger value="valores" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Valores
              </TabsTrigger>
              <TabsTrigger value="caracteristicas" className="gap-2">
                <Settings className="h-4 w-4" />
                Características
              </TabsTrigger>
              <TabsTrigger value="midia" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Mídia
              </TabsTrigger>
              <TabsTrigger value="seo" className="gap-2">
                <FileText className="h-4 w-4" />
                SEO
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basico">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Anúncio *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Casa 3 quartos com piscina no Jardim da Glória" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="finalidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Finalidade *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(FINALIDADE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Imóvel *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(TIPO_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="anunciante_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anunciante</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o anunciante" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {anunciantes?.map((a) => (
                              <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descricao_html"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva o imóvel em detalhes..." 
                            rows={6}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-wrap gap-4">
                    <FormField
                      control={form.control}
                      name="destaque"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0">Destaque</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lancamento"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0">Lançamento</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="localizacao">
              <Card>
                <CardHeader>
                  <CardTitle>Localização</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bairro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="endereco"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, Avenida..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem className="max-w-xs">
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input placeholder="00000-000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mostrar_endereco_exato"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Mostrar endereço exato publicamente</FormLabel>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="valores">
              <Card>
                <CardHeader>
                  <CardTitle>Valores e Áreas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="preco"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0"
                              {...field}
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="condominio_valor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condomínio (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0"
                              {...field}
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="iptu_valor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IPTU Anual (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0"
                              {...field}
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="area_construida"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Área Construída (m²)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="area_terreno"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Área do Terreno (m²)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="quartos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quartos</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="suites"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Suítes</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="banheiros"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Banheiros</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vagas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vagas</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4">
                    <FormField
                      control={form.control}
                      name="is_condominio"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0">Em Condomínio</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="aceita_financiamento"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0">Aceita Financiamento</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="aceita_permuta"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0">Aceita Permuta</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="caracteristicas">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Características do Imóvel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {FEATURES_COMUNS.map((feature) => (
                        <Button
                          key={feature}
                          type="button"
                          variant={selectedFeatures.includes(feature) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleFeature(feature)}
                        >
                          {feature}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Proximidades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {PROXIMIDADES_COMUNS.map((item) => (
                        <Button
                          key={item}
                          type="button"
                          variant={selectedProximidades.includes(item) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleProximidade(item)}
                        >
                          {item}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="midia">
              <Card>
                <CardHeader>
                  <CardTitle>Fotos e Vídeos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border-2 border-dashed p-12 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">
                      Arraste imagens aqui ou clique para fazer upload
                    </p>
                    <Button variant="outline" className="mt-4">
                      Selecionar Arquivos
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB por imagem.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle>SEO e Meta Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Título SEO</Label>
                    <Input placeholder="Título para mecanismos de busca (max 60 caracteres)" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Deixe em branco para usar o título do anúncio
                    </p>
                  </div>
                  <div>
                    <Label>Descrição SEO</Label>
                    <Textarea placeholder="Descrição para mecanismos de busca (max 160 caracteres)" rows={3} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
