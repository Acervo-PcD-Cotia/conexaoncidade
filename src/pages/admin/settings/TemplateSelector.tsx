import { useState } from "react";
import { usePortalTemplates, usePortalTemplate } from "@/hooks/usePortalTemplates";
import { useSiteTemplateConfig, useApplyTemplate } from "@/hooks/useSiteTemplateConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Newspaper, Church, Star, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ICON_MAP: Record<string, React.ElementType> = {
  Newspaper,
  Church,
  Star,
  Building2,
};

export default function TemplateSelector() {
  const { data: templates, isLoading: templatesLoading } = usePortalTemplates();
  const { data: currentConfig, isLoading: configLoading } = useSiteTemplateConfig();
  const { data: currentTemplate } = usePortalTemplate(currentConfig?.template_id);
  const applyTemplate = useApplyTemplate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates?.map((template) => {
          const IconComponent = template.icon ? ICON_MAP[template.icon] : null;
          const isSelected = currentConfig?.template_id === template.id;
          const defaultModules = template.default_modules as string[];

          return (
            <Card
              key={template.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-primary",
                selectedId === template.id && "ring-2 ring-primary/50"
              )}
              onClick={() => setSelectedId(template.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {IconComponent && (
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {isSelected && (
                        <Badge variant="secondary" className="mt-1">
                          <Check className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Módulos incluídos:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {defaultModules?.slice(0, 6).map((m) => (
                        <Badge key={m} variant="outline" className="text-xs">
                          {m.replace(/_/g, " ")}
                        </Badge>
                      ))}
                      {defaultModules && defaultModules.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{defaultModules.length - 6}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {!isSelected && (
                    <Button
                      className="w-full"
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
    </div>
  );
}
