import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Code2, CheckCircle, XCircle, Copy, Eye, Settings2,
  FileJson, Globe, Building2, HelpCircle, List, Newspaper,
  ChevronRight, ToggleLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface SchemaType {
  id: string;
  type: string;
  label: string;
  icon: React.ElementType;
  description: string;
  example: Record<string, any>;
  requiredFields: string[];
}

const SCHEMA_TYPES: SchemaType[] = [
  {
    id: "article",
    type: "Article",
    label: "Article",
    icon: Newspaper,
    description: "Schema para artigos e notícias. Gerado automaticamente a partir dos metadados de cada publicação.",
    requiredFields: ["headline", "author", "datePublished", "image"],
    example: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Título da Notícia",
      author: { "@type": "Person", name: "Autor" },
      datePublished: "2026-02-26",
      image: "https://example.com/image.jpg",
      publisher: { "@type": "Organization", name: "Conexão na Cidade" },
    },
  },
  {
    id: "newsarticle",
    type: "NewsArticle",
    label: "NewsArticle",
    icon: Newspaper,
    description: "Extensão de Article para notícias. Reconhecido pelo Google News e Top Stories.",
    requiredFields: ["headline", "datePublished", "author", "image"],
    example: {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: "Título da Notícia",
      dateline: "Cidade - ",
      datePublished: "2026-02-26T10:00:00-03:00",
      dateModified: "2026-02-26T12:00:00-03:00",
      author: [{ "@type": "Person", name: "Reporter" }],
      image: ["https://example.com/image.jpg"],
    },
  },
  {
    id: "faqpage",
    type: "FAQPage",
    label: "FAQ",
    icon: HelpCircle,
    description: "Schema para páginas de perguntas frequentes. Pode gerar rich results com acordeões no Google.",
    requiredFields: ["mainEntity"],
    example: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Qual o horário de funcionamento?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "De segunda a sexta, das 8h às 18h.",
          },
        },
      ],
    },
  },
  {
    id: "localbusiness",
    type: "LocalBusiness",
    label: "LocalBusiness",
    icon: Building2,
    description: "Schema para negócios locais. Exibe informações no Knowledge Panel do Google.",
    requiredFields: ["name", "address", "telephone"],
    example: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Conexão na Cidade",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rua Principal, 123",
        addressLocality: "Cidade",
        addressRegion: "SP",
        postalCode: "12345-678",
      },
      telephone: "+55 11 99999-9999",
      url: "https://conexaonacidade.com.br",
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
    },
  },
  {
    id: "breadcrumb",
    type: "BreadcrumbList",
    label: "Breadcrumb",
    icon: List,
    description: "Schema para navegação por breadcrumbs. Melhora a apresentação nos resultados de busca.",
    requiredFields: ["itemListElement"],
    example: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: "https://conexaonacidade.com.br" },
        { "@type": "ListItem", position: 2, name: "Notícias", item: "https://conexaonacidade.com.br/noticias" },
        { "@type": "ListItem", position: 3, name: "Título da Notícia" },
      ],
    },
  },
  {
    id: "webpage",
    type: "WebPage",
    label: "WebPage",
    icon: Globe,
    description: "Schema genérico para páginas web. Fornece informações básicas da página ao Google.",
    requiredFields: ["name", "url"],
    example: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Conexão na Cidade",
      url: "https://conexaonacidade.com.br",
      description: "Portal de notícias regional",
      inLanguage: "pt-BR",
    },
  },
];

export default function CoreSchema() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("schemas");
  const [previewSchema, setPreviewSchema] = useState<SchemaType | null>(null);
  const [validatorInput, setValidatorInput] = useState("");
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] } | null>(null);

  // Fetch configs
  const { data: configs = [] } = useQuery({
    queryKey: ["core-schema-configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("core_schema_configs")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Toggle schema
  const toggleMutation = useMutation({
    mutationFn: async ({ schemaType, enabled }: { schemaType: string; enabled: boolean }) => {
      const existing = configs.find((c: any) => c.schema_type === schemaType);
      if (existing) {
        const { error } = await supabase
          .from("core_schema_configs")
          .update({ is_enabled: enabled })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const schema = SCHEMA_TYPES.find((s) => s.type === schemaType);
        const { error } = await supabase.from("core_schema_configs").insert({
          schema_type: schemaType,
          label: schema?.label || schemaType,
          is_enabled: enabled,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["core-schema-configs"] });
      toast.success("Configuração atualizada");
    },
  });

  const isSchemaEnabled = (type: string) => {
    const config = configs.find((c: any) => c.schema_type === type);
    return config ? config.is_enabled : true; // enabled by default
  };

  // Validator
  const handleValidate = () => {
    try {
      const parsed = JSON.parse(validatorInput);
      const errors: string[] = [];

      if (!parsed["@context"]) errors.push("Falta @context (deve ser 'https://schema.org')");
      if (!parsed["@type"]) errors.push("Falta @type (ex: Article, FAQPage)");

      const schemaType = SCHEMA_TYPES.find((s) => s.type === parsed["@type"]);
      if (schemaType) {
        for (const field of schemaType.requiredFields) {
          if (!parsed[field]) errors.push(`Campo obrigatório ausente: ${field}`);
        }
      }

      setValidationResult({ valid: errors.length === 0, errors });
    } catch {
      setValidationResult({ valid: false, errors: ["JSON inválido. Verifique a sintaxe."] });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência");
  };

  const enabledCount = SCHEMA_TYPES.filter((s) => isSchemaEnabled(s.type)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-cyan-500/10">
          <Code2 className="h-6 w-6 text-cyan-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schema & Dados Estruturados</h1>
          <p className="text-sm text-muted-foreground">
            JSON-LD para Rich Results — {enabledCount}/{SCHEMA_TYPES.length} schemas ativos
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-cyan-500/5 border-cyan-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <FileJson className="h-5 w-5 text-cyan-500" />
            <div>
              <p className="text-2xl font-bold">{SCHEMA_TYPES.length}</p>
              <p className="text-xs text-muted-foreground">Tipos Suportados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{enabledCount}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <Globe className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">Auto</p>
              <p className="text-xs text-muted-foreground">Geração</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <Settings2 className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{configs.length}</p>
              <p className="text-xs text-muted-foreground">Configurados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schemas">Schemas ({SCHEMA_TYPES.length})</TabsTrigger>
          <TabsTrigger value="validator">Validador</TabsTrigger>
        </TabsList>

        {/* SCHEMAS TAB */}
        <TabsContent value="schemas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCHEMA_TYPES.map((schema) => {
              const enabled = isSchemaEnabled(schema.type);
              const Icon = schema.icon;
              return (
                <Card key={schema.id} className={`transition-all ${enabled ? "border-cyan-500/20" : "opacity-60"}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="h-4 w-4 text-cyan-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{schema.label}</h3>
                          <Badge variant="outline" className="text-[10px] mt-0.5">
                            @type: {schema.type}
                          </Badge>
                        </div>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) =>
                          toggleMutation.mutate({ schemaType: schema.type, enabled: checked })
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{schema.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {schema.requiredFields.map((f) => (
                          <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setPreviewSchema(schema)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* VALIDATOR TAB */}
        <TabsContent value="validator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Validador de Rich Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cole o JSON-LD para validar</Label>
                <Textarea
                  value={validatorInput}
                  onChange={(e) => setValidatorInput(e.target.value)}
                  placeholder='{"@context": "https://schema.org", "@type": "Article", ...}'
                  className="font-mono text-xs min-h-[200px]"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleValidate} disabled={!validatorInput.trim()}>
                  Validar Schema
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open("https://search.google.com/test/rich-results", "_blank")}
                >
                  <Globe className="h-4 w-4 mr-1.5" />
                  Google Rich Results Test
                </Button>
              </div>

              {validationResult && (
                <Card className={validationResult.valid ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {validationResult.valid ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="font-semibold text-green-600">Schema válido!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="font-semibold text-red-600">Problemas encontrados</span>
                        </>
                      )}
                    </div>
                    {validationResult.errors.length > 0 && (
                      <ul className="space-y-1 text-sm">
                        {validationResult.errors.map((err, i) => (
                          <li key={i} className="flex items-start gap-2 text-red-600">
                            <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                            {err}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Quick templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Templates Rápidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SCHEMA_TYPES.map((schema) => (
                  <Button
                    key={schema.id}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => {
                      setValidatorInput(JSON.stringify(schema.example, null, 2));
                      toast.success(`Template ${schema.label} carregado`);
                    }}
                  >
                    <schema.icon className="h-4 w-4 mr-1.5" />
                    {schema.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schema Preview Dialog */}
      <Dialog open={!!previewSchema} onOpenChange={() => setPreviewSchema(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-cyan-500" />
              Preview: {previewSchema?.label}
            </DialogTitle>
          </DialogHeader>
          {previewSchema && (
            <div className="space-y-4">
              <div className="relative">
                <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-auto max-h-[400px]">
                  {JSON.stringify(previewSchema.example, null, 2)}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => copyToClipboard(JSON.stringify(previewSchema.example, null, 2))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Como inserir na página</Label>
                <pre className="bg-muted rounded-lg p-3 text-xs font-mono mt-1">
{`<script type="application/ld+json">
${JSON.stringify(previewSchema.example, null, 2)}
</script>`}
                </pre>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Campos obrigatórios:</Label>
                <div className="flex gap-1">
                  {previewSchema.requiredFields.map((f) => (
                    <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
