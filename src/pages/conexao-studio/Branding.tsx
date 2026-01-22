import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Palette,
  Upload,
  Image,
  Type,
  Monitor,
  Plus,
  Trash2,
  MoreVertical,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Branding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isAddOverlayOpen, setIsAddOverlayOpen] = useState(false);
  const [newOverlay, setNewOverlay] = useState({
    name: "",
    type: "logo",
    position: "top-left",
  });

  const { data: brandingAssets, isLoading } = useQuery({
    queryKey: ["conexao-studio-branding", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("illumina_branding")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const logos = brandingAssets?.filter((a) => a.asset_type === "logo") || [];
  const overlays = brandingAssets?.filter((a) => a.asset_type === "overlay") || [];
  const lowerThirds = brandingAssets?.filter((a) => a.asset_type === "lower_third") || [];
  const backgrounds = brandingAssets?.filter((a) => a.asset_type === "background") || [];

  const [colors, setColors] = useState({
    primary: "#3B82F6",
    secondary: "#10B981",
    accent: "#F59E0B",
    text: "#FFFFFF",
  });

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success("Cor copiada!");
  };

  const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <div
          className="h-10 w-10 rounded-lg border cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => document.getElementById(`color-${label}`)?.click()}
        />
        <Input
          id={`color-${label}`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 h-10 p-1 cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => copyColor(value)}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const AssetCard = ({ asset }: { asset: any }) => (
    <div className="group relative border rounded-lg overflow-hidden bg-muted/50">
      <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
        {asset.asset_url ? (
          <img
            src={asset.asset_url}
            alt={asset.name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <Image className="h-12 w-12 text-muted-foreground/50" />
        )}
      </div>
      <div className="p-3">
        <p className="font-medium text-sm truncate">{asset.name}</p>
        <p className="text-xs text-muted-foreground capitalize">{asset.asset_type}</p>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="destructive" size="icon" className="h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Branding
          </h1>
          <p className="text-muted-foreground">
            Personalize a identidade visual das suas transmissões
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Sincronizar
        </Button>
      </div>

      <Tabs defaultValue="colors">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="colors" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Cores</span>
          </TabsTrigger>
          <TabsTrigger value="logos" className="gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Logos</span>
          </TabsTrigger>
          <TabsTrigger value="overlays" className="gap-2">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Overlays</span>
          </TabsTrigger>
          <TabsTrigger value="lowerthirds" className="gap-2">
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Letreiros</span>
          </TabsTrigger>
          <TabsTrigger value="backgrounds" className="gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Fundos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Paleta de Cores</CardTitle>
                <CardDescription>
                  Defina as cores principais da sua marca
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ColorPicker 
                  label="Cor Primária" 
                  value={colors.primary} 
                  onChange={(v) => setColors({ ...colors, primary: v })} 
                />
                <ColorPicker 
                  label="Cor Secundária" 
                  value={colors.secondary} 
                  onChange={(v) => setColors({ ...colors, secondary: v })} 
                />
                <ColorPicker 
                  label="Cor de Destaque" 
                  value={colors.accent} 
                  onChange={(v) => setColors({ ...colors, accent: v })} 
                />
                <ColorPicker 
                  label="Cor do Texto" 
                  value={colors.text} 
                  onChange={(v) => setColors({ ...colors, text: v })} 
                />
                <Button className="w-full">Salvar Paleta</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  Veja como as cores aparecem juntas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="aspect-video rounded-lg overflow-hidden border"
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` 
                  }}
                >
                  <div className="h-full flex flex-col items-center justify-center p-6">
                    <div 
                      className="text-2xl font-bold mb-2"
                      style={{ color: colors.text }}
                    >
                      Conexão Studio
                    </div>
                    <div 
                      className="px-4 py-2 rounded-full text-sm font-medium"
                      style={{ backgroundColor: colors.accent, color: colors.text }}
                    >
                      AO VIVO
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logos" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Logos</CardTitle>
                <CardDescription>
                  Logotipos para exibir durante a transmissão
                </CardDescription>
              </div>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </CardHeader>
            <CardContent>
              {logos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {logos.map((logo) => (
                    <AssetCard key={logo.id} asset={logo} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum logo adicionado</p>
                  <p className="text-sm">Faça upload do logo da sua marca</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overlays" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Overlays</CardTitle>
                <CardDescription>
                  Elementos gráficos para sobrepor ao vídeo
                </CardDescription>
              </div>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload PNG
              </Button>
            </CardHeader>
            <CardContent>
              {overlays.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {overlays.map((overlay) => (
                    <AssetCard key={overlay.id} asset={overlay} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Monitor className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum overlay adicionado</p>
                  <p className="text-sm">Faça upload de imagens PNG transparentes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lowerthirds" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lower Thirds (Letreiros)</CardTitle>
                <CardDescription>
                  Textos e identificadores para participantes
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Letreiro
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Letreiro</DialogTitle>
                    <DialogDescription>
                      Configure um novo lower third para usar nas transmissões
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input placeholder="Ex: Apresentador Principal" />
                    </div>
                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input placeholder="Ex: João Silva" />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtítulo</Label>
                      <Input placeholder="Ex: Jornalista" />
                    </div>
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="h-24 bg-gray-900 rounded-lg flex items-end p-4">
                        <div 
                          className="px-4 py-2 rounded"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <div className="text-white font-bold">João Silva</div>
                          <div className="text-white/80 text-sm">Jornalista</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancelar</Button>
                    <Button>Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {lowerThirds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lowerThirds.map((lt) => (
                    <div key={lt.id} className="border rounded-lg p-4">
                      <div className="h-16 bg-gray-900 rounded flex items-end p-3 mb-3">
                        <div 
                          className="px-3 py-1.5 rounded text-sm"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <div className="text-white font-bold">{lt.name}</div>
                        </div>
                      </div>
                      <p className="font-medium">{lt.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Type className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum letreiro criado</p>
                  <p className="text-sm">Crie lower thirds para identificar participantes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backgrounds" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Fundos</CardTitle>
                <CardDescription>
                  Imagens e vídeos de fundo para suas transmissões
                </CardDescription>
              </div>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </CardHeader>
            <CardContent>
              {backgrounds.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {backgrounds.map((bg) => (
                    <AssetCard key={bg.id} asset={bg} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum fundo adicionado</p>
                  <p className="text-sm">Faça upload de imagens ou vídeos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
