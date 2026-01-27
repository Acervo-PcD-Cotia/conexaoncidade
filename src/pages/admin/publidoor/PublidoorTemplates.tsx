import { Palette, Check, Sparkles, Type, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePublidoorTemplates } from "@/hooks/usePublidoor";

export default function PublidoorTemplates() {
  const { data: templates, isLoading } = usePublidoorTemplates(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Modelos & Estilos</h1>
        <p className="text-muted-foreground">
          Templates visuais reutilizáveis para seus Publidoors
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates?.map((template) => (
            <Card key={template.id} className={!template.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  {template.has_animations && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Animado
                    </Badge>
                  )}
                </div>
                {template.description && (
                  <CardDescription>{template.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Color Preview */}
                <div>
                  <p className="text-sm font-medium mb-2">Paleta de Cores</p>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: template.color_palette?.primary || '#000' }}
                      />
                      <span className="text-xs text-muted-foreground">Primária</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: template.color_palette?.secondary || '#fff' }}
                      />
                      <span className="text-xs text-muted-foreground">Secundária</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: template.color_palette?.accent || '#3b82f6' }}
                      />
                      <span className="text-xs text-muted-foreground">Destaque</span>
                    </div>
                  </div>
                </div>

                {/* Typography */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-muted-foreground" />
                    <span>{template.font_family}</span>
                  </div>
                  <Badge variant="outline">{template.font_size}</Badge>
                </div>

                {/* Preview Area */}
                <div
                  className="rounded-lg p-4 min-h-[100px] flex items-center justify-center"
                  style={{
                    backgroundColor: template.color_palette?.primary || '#000',
                    color: template.color_palette?.secondary || '#fff',
                    fontFamily: template.font_family,
                  }}
                >
                  <div className="text-center">
                    <p className="font-bold">Exemplo de Título</p>
                    <p className="text-sm opacity-80">Subtítulo do Publidoor</p>
                    <button
                      className="mt-2 px-3 py-1 rounded text-sm font-medium"
                      style={{
                        backgroundColor: template.color_palette?.accent || '#3b82f6',
                        color: template.color_palette?.secondary || '#fff',
                      }}
                    >
                      Saiba mais
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {template.slug}
                  </code>
                  <div className="flex items-center gap-1 text-sm">
                    {template.is_active ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">Ativo</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Inativo</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Sobre os Modelos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Outdoor Urbano:</strong> Visual de outdoor tradicional com alto impacto.
            Ideal para campanhas de rua.
          </p>
          <p>
            <strong>Manchete Editorial:</strong> Estilo de jornal, elegante e autoritativo.
            Perfeito para conteúdo patrocinado.
          </p>
          <p>
            <strong>Minimal Premium:</strong> Design limpo com muito espaço em branco.
            Transmite sofisticação e exclusividade.
          </p>
          <p>
            <strong>Impacto Total:</strong> Ocupação máxima com cores vibrantes.
            Para campanhas de alto impacto visual.
          </p>
          <p>
            <strong>Bairro / Localidade:</strong> Foco em identidade local.
            Conecta com a comunidade do bairro.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
