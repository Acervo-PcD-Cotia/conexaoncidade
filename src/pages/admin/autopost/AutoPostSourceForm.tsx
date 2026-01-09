import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, TestTube, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  useAutoPostSource,
  useCreateAutoPostSource,
  useUpdateAutoPostSource,
  useAutoPostGroups,
} from "@/hooks/useAutoPost";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";

const sourceSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  site_url: z.string().url("URL inválida"),
  feed_url: z.string().url("URL do feed inválida").optional().or(z.literal("")),
  source_type: z.enum(["rss", "sitemap", "crawler", "api"]),
  group_id: z.string().optional().nullable(),
  default_category_id: z.string().optional().nullable(),
  default_author: z.string().optional(),
  credit_template: z.string().optional(),
  schedule_frequency_minutes: z.coerce.number().min(5).max(1440),
  daily_limit: z.coerce.number().min(1).max(100),
  per_run_limit: z.coerce.number().min(1).max(50),
  require_review: z.boolean(),
  require_credit: z.boolean(),
  default_tags: z.string().optional(),
});

type SourceFormData = z.infer<typeof sourceSchema>;

export default function AutoPostSourceForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  
  const { data: source, isLoading: loadingSource } = useAutoPostSource(id);
  const { data: groups } = useAutoPostGroups();
  const { data: categories } = useCategories();
  
  const createSource = useCreateAutoPostSource();
  const updateSource = useUpdateAutoPostSource();
  
  const form = useForm<SourceFormData>({
    resolver: zodResolver(sourceSchema),
    defaultValues: {
      name: "",
      site_url: "",
      feed_url: "",
      source_type: "rss",
      group_id: null,
      default_category_id: null,
      default_author: "",
      credit_template: "Fonte: {source_name}",
      schedule_frequency_minutes: 60,
      daily_limit: 20,
      per_run_limit: 10,
      require_review: true,
      require_credit: true,
      default_tags: "",
    },
  });
  
  useEffect(() => {
    if (source) {
      form.reset({
        name: source.name,
        site_url: source.site_url,
        feed_url: source.feed_url || "",
        source_type: source.source_type || "rss",
        group_id: source.group_id,
        default_category_id: source.default_category_id,
        default_author: source.default_author || "",
        credit_template: source.credit_template || "Fonte: {source_name}",
        schedule_frequency_minutes: source.schedule_frequency_minutes || 60,
        daily_limit: source.daily_limit || 20,
        per_run_limit: source.per_run_limit || 10,
        require_review: source.require_review ?? true,
        require_credit: source.require_credit ?? true,
        default_tags: source.default_tags?.join(", ") || "",
      });
    }
  }, [source, form]);
  
  const testConnection = async () => {
    const feedUrl = form.getValues("feed_url");
    const sourceType = form.getValues("source_type");
    
    if (!feedUrl) {
      toast.error("Informe a URL do feed para testar");
      return;
    }
    
    setTestStatus("testing");
    setTestMessage("Testando conexão...");
    
    try {
      const { data, error } = await supabase.functions.invoke("rss-parser", {
        body: { url: feedUrl, limit: 5 }
      });
      
      if (error) throw error;
      
      if (data?.items && data.items.length > 0) {
        setTestStatus("success");
        setTestMessage(`✓ Feed válido! ${data.items.length} itens encontrados.`);
      } else {
        setTestStatus("error");
        setTestMessage("Nenhum item encontrado no feed");
      }
    } catch (err: any) {
      setTestStatus("error");
      setTestMessage(`Erro: ${err.message || "Falha ao conectar"}`);
    }
  };
  
  const onSubmit = async (data: SourceFormData) => {
    const payload = {
      name: data.name,
      site_url: data.site_url,
      feed_url: data.feed_url || null,
      source_type: data.source_type,
      group_id: data.group_id || null,
      default_category_id: data.default_category_id || null,
      default_author: data.default_author || null,
      credit_template: data.credit_template || null,
      schedule_frequency_minutes: data.schedule_frequency_minutes,
      daily_limit: data.daily_limit,
      per_run_limit: data.per_run_limit,
      require_review: data.require_review,
      require_credit: data.require_credit,
      default_tags: data.default_tags ? data.default_tags.split(",").map(t => t.trim()).filter(Boolean) : null,
    };
    
    try {
      if (isEditing && id) {
        await updateSource.mutateAsync({ id, ...payload });
      } else {
        await createSource.mutateAsync(payload);
      }
      navigate("/admin/autopost/sources");
    } catch (error) {
      // Error handled by hook
    }
  };
  
  if (loadingSource && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/autopost/sources")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <AdminHeader
          title={isEditing ? "Editar Fonte" : "Nova Fonte"}
          description={isEditing ? "Atualize as configurações da fonte" : "Configure uma nova fonte de conteúdo"}
        />
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Identifique a fonte de conteúdo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Fonte</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: G1 São Paulo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="site_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Site</FormLabel>
                      <FormControl>
                        <Input placeholder="https://g1.globo.com/sp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="source_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Fonte</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rss">RSS Feed</SelectItem>
                          <SelectItem value="sitemap">Sitemap XML</SelectItem>
                          <SelectItem value="crawler">HTML Crawler</SelectItem>
                          <SelectItem value="api">API REST</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="group_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grupo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um grupo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sem grupo</SelectItem>
                          {groups?.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Conexão e Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Conexão</CardTitle>
                <CardDescription>Configure a URL do feed e teste a conexão</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="feed_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Feed</FormLabel>
                      <FormControl>
                        <Input placeholder="https://g1.globo.com/rss/g1/sp" {...field} />
                      </FormControl>
                      <FormDescription>URL do RSS, Sitemap ou endpoint da API</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={testConnection}
                    disabled={testStatus === "testing"}
                  >
                    {testStatus === "testing" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    Testar Conexão
                  </Button>
                  
                  {testStatus !== "idle" && (
                    <Badge variant={testStatus === "success" ? "default" : testStatus === "error" ? "destructive" : "secondary"}>
                      {testStatus === "success" && <Check className="h-3 w-3 mr-1" />}
                      {testStatus === "error" && <X className="h-3 w-3 mr-1" />}
                      {testMessage}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Configurações de Captura */}
            <Card>
              <CardHeader>
                <CardTitle>Captura</CardTitle>
                <CardDescription>Configure frequência e limites</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="schedule_frequency_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência (minutos)</FormLabel>
                      <FormControl>
                        <Input type="number" min={5} max={1440} {...field} />
                      </FormControl>
                      <FormDescription>Intervalo entre capturas (5 min a 24h)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="daily_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite Diário</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={100} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="per_run_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite por Execução</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={50} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Configurações Editoriais */}
            <Card>
              <CardHeader>
                <CardTitle>Editorial</CardTitle>
                <CardDescription>Configure comportamento de publicação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="default_category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria Padrão</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma</SelectItem>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
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
                  name="default_author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Autor Padrão</FormLabel>
                      <FormControl>
                        <Input placeholder="Redação" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="credit_template"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template de Crédito</FormLabel>
                      <FormControl>
                        <Input placeholder="Fonte: {source_name}" {...field} />
                      </FormControl>
                      <FormDescription>Use {"{source_name}"} para nome da fonte</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="default_tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags Padrão</FormLabel>
                      <FormControl>
                        <Input placeholder="notícia, regional, são paulo" {...field} />
                      </FormControl>
                      <FormDescription>Separadas por vírgula</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator />
                
                <FormField
                  control={form.control}
                  name="require_review"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Requer Revisão</FormLabel>
                        <FormDescription>
                          Conteúdo precisa de aprovação antes de publicar
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="require_credit"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Exigir Crédito</FormLabel>
                        <FormDescription>
                          Adicionar crédito da fonte obrigatoriamente
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/admin/autopost/sources")}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createSource.isPending || updateSource.isPending}
            >
              {(createSource.isPending || updateSource.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isEditing ? "Salvar Alterações" : "Criar Fonte"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
