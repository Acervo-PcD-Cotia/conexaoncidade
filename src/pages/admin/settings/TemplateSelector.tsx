import { useState, useMemo } from "react";
import { usePortalTemplates, usePortalTemplate } from "@/hooks/usePortalTemplates";
import { useSiteTemplateConfig, useApplyTemplate } from "@/hooks/useSiteTemplateConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Newspaper, Church, Star, Building2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PortalTemplate, TemplateTheme, VocabularyMap } from "@/types/portal-templates";

const ICON_MAP: Record<string, React.ElementType> = {
  Newspaper,
  Church,
  Star,
  Building2,
};

// Template Preview Component
function TemplatePreview({ template }: { template: PortalTemplate }) {
  const theme = template.theme as TemplateTheme;
  const vocabulary = template.vocabulary as VocabularyMap;
  
  // Preview styles based on template theme
  const previewStyles = useMemo(() => ({
    '--preview-primary': theme?.primary || '25 95% 53%',
    '--preview-secondary': theme?.secondary || '220 20% 20%',
    '--preview-accent': theme?.accent || '30 90% 50%',
  } as React.CSSProperties), [theme]);

  const getLayoutStyle = () => {
    switch (theme?.layout) {
      case 'worship-centered':
        return 'justify-center text-center';
      case 'creator-hub':
        return 'justify-start';
      case 'corporate-clean':
        return 'justify-between';
      default:
        return 'justify-start';
    }
  };

  return (
    <div 
      className="border rounded-lg overflow-hidden bg-background shadow-inner"
      style={previewStyles}
    >
      {/* Simulated Header */}
      <div 
        className="p-3 border-b flex items-center gap-3"
        style={{ background: `hsl(${theme?.primary || '25 95% 53%'} / 0.1)` }}
      >
        <div className="w-16 h-5 rounded bg-muted animate-pulse" />
        <div className={cn("flex-1 flex gap-2", getLayoutStyle())}>
          <div className="w-10 h-3 rounded bg-muted/60" />
          <div className="w-10 h-3 rounded bg-muted/60" />
          <div className="w-10 h-3 rounded bg-muted/60" />
        </div>
      </div>
      
      {/* Simulated Hero */}
      <div 
        className="h-20 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, hsl(${theme?.primary || '25 95% 53%'}), hsl(${theme?.secondary || '220 20% 20%'}))` }}
      >
        <span className="text-white/90 text-xs font-medium">
          {theme?.heroStyle === 'video-focus' ? '▶ Live Video' : 
           theme?.heroStyle === 'profile-focus' ? '👤 Creator Profile' :
           theme?.heroStyle === 'banner-focus' ? '📢 Banner' : '📰 Headlines'}
        </span>
      </div>
      
      {/* Simulated Content Grid */}
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="h-12 rounded bg-muted" />
          <div className="h-12 rounded bg-muted" />
          <div className="h-12 rounded bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-8 rounded bg-muted/60" />
          <div className="h-8 rounded bg-muted/60" />
        </div>
      </div>
      
      {/* Simulated Footer with Vocabulary */}
      <div className="p-2 border-t bg-muted/30 flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
        <span className="px-2 py-0.5 rounded bg-muted">
          {vocabulary?.news || 'Notícias'}
        </span>
        <span className="px-2 py-0.5 rounded bg-muted">
          {vocabulary?.lives || 'Ao Vivo'}
        </span>
        <span className="px-2 py-0.5 rounded bg-muted">
          {vocabulary?.community || 'Comunidade'}
        </span>
      </div>
    </div>
  );
}

export default function TemplateSelector() {
  const { data: templates, isLoading: templatesLoading } = usePortalTemplates();
  const { data: currentConfig, isLoading: configLoading } = useSiteTemplateConfig();
  const { data: currentTemplate } = usePortalTemplate(currentConfig?.template_id);
  const applyTemplate = useApplyTemplate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Get the selected template for preview
  const selectedTemplate = useMemo(() => {
    if (!selectedId) return currentTemplate;
    return templates?.find(t => t.id === selectedId) || currentTemplate;
  }, [selectedId, templates, currentTemplate]);

  const handleApplyTemplate = async (templateId: string) => {
    try {
      await applyTemplate.mutateAsync(templateId);
      toast.success("Modelo aplicado com sucesso!");
    } catch (error) {
      toast.error("Erro ao aplicar modelo");
    }
  };

  if (templatesLoading || configLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Modelo do Portal</h1>
        <p className="text-muted-foreground">
          Selecione o modelo que melhor representa seu portal. A troca de modelo não apaga seus dados.
        </p>
      </div>

      {currentTemplate && (
        <Card className="border-primary bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="default">Modelo Atual</Badge>
            </div>
            <CardTitle className="flex items-center gap-2">
              {currentTemplate.icon && ICON_MAP[currentTemplate.icon] && (
                (() => {
                  const IconComponent = ICON_MAP[currentTemplate.icon];
                  return <IconComponent className="h-5 w-5" />;
                })()
              )}
              {currentTemplate.name}
            </CardTitle>
            <CardDescription>{currentTemplate.description}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Template List */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">Modelos Disponíveis</h2>
          {templates?.map((template) => {
            const IconComponent = template.icon ? ICON_MAP[template.icon] : null;
            const isSelected = currentConfig?.template_id === template.id;
            const isHovered = selectedId === template.id;
            const defaultModules = template.default_modules as string[];

            return (
              <Card
                key={template.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  isSelected && "ring-2 ring-primary",
                  isHovered && !isSelected && "ring-2 ring-primary/50"
                )}
                onClick={() => setSelectedId(template.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {IconComponent && (
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        {isSelected && (
                          <Badge variant="secondary" className="mt-1">
                            <Check className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        )}
                      </div>
                    </div>
                    {isHovered && !isSelected && (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <CardDescription className="mt-1 text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {defaultModules?.slice(0, 4).map((m) => (
                        <Badge key={m} variant="outline" className="text-xs">
                          {m.replace(/_/g, " ")}
                        </Badge>
                      ))}
                      {defaultModules && defaultModules.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{defaultModules.length - 4}
                        </Badge>
                      )}
                    </div>

                    {!isSelected && (
                      <Button
                        className="w-full"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyTemplate(template.id);
                        }}
                        disabled={applyTemplate.isPending}
                      >
                        {applyTemplate.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Aplicando...
                          </>
                        ) : (
                          "Aplicar este modelo"
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Column 2: Live Preview */}
        <div className="lg:sticky lg:top-4 space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview em Tempo Real
          </h2>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {selectedTemplate?.name || 'Selecione um modelo'}
              </CardTitle>
              <CardDescription className="text-xs">
                Visualize como seu portal ficará com este modelo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTemplate ? (
                <TemplatePreview template={selectedTemplate} />
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground border rounded-lg bg-muted/20">
                  <p className="text-sm">Selecione um modelo para visualizar</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Theme Info */}
          {selectedTemplate && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Características do Tema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Layout</span>
                  <Badge variant="outline">
                    {(selectedTemplate.theme as TemplateTheme)?.layout?.replace(/-/g, ' ') || 'Padrão'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tipografia</span>
                  <Badge variant="outline">
                    {(selectedTemplate.theme as TemplateTheme)?.typography || 'Moderna'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estilo do Hero</span>
                  <Badge variant="outline">
                    {(selectedTemplate.theme as TemplateTheme)?.heroStyle?.replace(/-/g, ' ') || 'Headlines'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-muted-foreground">Cores</span>
                  <div className="flex gap-1">
                    <div 
                      className="w-5 h-5 rounded-full border"
                      style={{ background: `hsl(${(selectedTemplate.theme as TemplateTheme)?.primary || '25 95% 53%'})` }}
                      title="Primária"
                    />
                    <div 
                      className="w-5 h-5 rounded-full border"
                      style={{ background: `hsl(${(selectedTemplate.theme as TemplateTheme)?.secondary || '220 20% 20%'})` }}
                      title="Secundária"
                    />
                    <div 
                      className="w-5 h-5 rounded-full border"
                      style={{ background: `hsl(${(selectedTemplate.theme as TemplateTheme)?.accent || '30 90% 50%'})` }}
                      title="Accent"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
