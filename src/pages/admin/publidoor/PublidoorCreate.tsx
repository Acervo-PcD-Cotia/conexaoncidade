import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Send, Eye, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreatePublidoorItem, usePublidoorAdvertisers, usePublidoorTemplates } from "@/hooks/usePublidoor";
import { PublidoorItemFormData, PublidoorItemType, PUBLIDOOR_TYPE_LABELS } from "@/types/publidoor";
import { PublidoorPreview } from "@/components/publidoor/PublidoorPreview";
import { AdImageUploader } from "@/components/admin/AdImageUploader";

const PUBLIDOOR_TYPES: PublidoorItemType[] = ["narrativo", "contextual", "geografico", "editorial", "impacto_total"];

export default function PublidoorCreate() {
  const navigate = useNavigate();
  const createMutation = useCreatePublidoorItem();
  const { data: advertisers } = usePublidoorAdvertisers("active");
  const { data: templates } = usePublidoorTemplates();

  const [formData, setFormData] = useState<PublidoorItemFormData>({
    internal_name: "",
    type: "narrativo",
    advertiser_id: null,
    phrase_1: "",
    phrase_2: "",
    phrase_3: "",
    media_url: "",
    media_type: "image",
    logo_url: "",
    cta_text: "Saiba mais",
    cta_link: "",
    template_id: null,
  });

  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const handleSubmit = async (status: "draft" | "review") => {
    if (!formData.internal_name || !formData.phrase_1) {
      return;
    }
    
    await createMutation.mutateAsync(formData);
    navigate("/spah/painel/publidoor");
  };

  const updateField = <K extends keyof PublidoorItemFormData>(
    field: K,
    value: PublidoorItemFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Criar Publidoor</h1>
          <p className="text-muted-foreground">Configure seu outdoor digital</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="internal_name">Nome Interno *</Label>
                <Input
                  id="internal_name"
                  placeholder="Ex: Black Friday - Loja X"
                  value={formData.internal_name}
                  onChange={(e) => updateField("internal_name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Publidoor *</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(v) => updateField("type", v as PublidoorItemType)}
                  className="grid grid-cols-2 gap-2"
                >
                  {PUBLIDOOR_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={type} />
                      <Label htmlFor={type} className="cursor-pointer">
                        {PUBLIDOOR_TYPE_LABELS[type]}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Anunciante</Label>
                <Select
                  value={formData.advertiser_id || "none"}
                  onValueChange={(v) => updateField("advertiser_id", v === "none" ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar anunciante..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {advertisers?.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo</CardTitle>
              <CardDescription>Frases e mensagem do Publidoor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phrase_1">Frase 1 *</Label>
                <Input
                  id="phrase_1"
                  placeholder="Sua mensagem principal..."
                  value={formData.phrase_1}
                  onChange={(e) => updateField("phrase_1", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phrase_2">Frase 2</Label>
                <Input
                  id="phrase_2"
                  placeholder="Complemento da mensagem..."
                  value={formData.phrase_2 || ""}
                  onChange={(e) => updateField("phrase_2", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phrase_3">Frase 3 (opcional)</Label>
                <Input
                  id="phrase_3"
                  placeholder="Informação adicional..."
                  value={formData.phrase_3 || ""}
                  onChange={(e) => updateField("phrase_3", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Mídia</CardTitle>
              <CardDescription>Imagem do Publidoor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AdImageUploader
                value={formData.media_url || ""}
                onChange={(url) => updateField("media_url", url)}
                format="home-topo"
                label="Imagem Principal"
                required
              />
              
              <div className="space-y-2">
                <Label>Tipo de Mídia</Label>
                <RadioGroup
                  value={formData.media_type}
                  onValueChange={(v) => updateField("media_type", v as "image" | "video")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="image" id="media-image" />
                    <Label htmlFor="media-image">Imagem</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="video" id="media-video" />
                    <Label htmlFor="media-video">Vídeo</Label>
                  </div>
                </RadioGroup>
              </div>

              <AdImageUploader
                value={formData.logo_url || ""}
                onChange={(url) => updateField("logo_url", url)}
                format="retangulo-medio"
                label="Logo (opcional)"
              />
            </CardContent>
          </Card>

          {/* CTA */}
          <Card>
            <CardHeader>
              <CardTitle>Call to Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cta_text">Texto do Botão</Label>
                <Input
                  id="cta_text"
                  placeholder="Saiba mais"
                  value={formData.cta_text}
                  onChange={(e) => updateField("cta_text", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_link">Link de Destino *</Label>
                <Input
                  id="cta_link"
                  type="url"
                  placeholder="https://..."
                  value={formData.cta_link || ""}
                  onChange={(e) => updateField("cta_link", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Template */}
          <Card>
            <CardHeader>
              <CardTitle>Modelo Visual</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.template_id || "none"}
                onValueChange={(v) => updateField("template_id", v === "none" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar modelo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Padrão</SelectItem>
                  {templates?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleSubmit("draft")}
              disabled={createMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar Rascunho
            </Button>
            <Button onClick={() => handleSubmit("review")} disabled={createMutation.isPending}>
              <Send className="mr-2 h-4 w-4" />
              Enviar para Análise
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview em Tempo Real
                </CardTitle>
                <Tabs
                  value={previewDevice}
                  onValueChange={(v) => setPreviewDevice(v as "desktop" | "mobile")}
                >
                  <TabsList className="h-8">
                    <TabsTrigger value="desktop" className="h-7 px-2">
                      <Monitor className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="mobile" className="h-7 px-2">
                      <Smartphone className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <PublidoorPreview
                data={formData}
                device={previewDevice}
                template={templates?.find((t) => t.id === formData.template_id)}
              />
              <p className="text-xs text-muted-foreground text-center mt-4">
                Conteúdo de Marca
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
