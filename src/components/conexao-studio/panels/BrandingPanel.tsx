import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Image, Type, Layers, Plus, Eye, EyeOff, Trash2, Upload, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudioOverlays, OverlayType } from "@/hooks/useStudioOverlays";
import { toast } from "sonner";

interface BrandingPanelProps {
  sessionId?: string;
}

export function BrandingPanel({ sessionId }: BrandingPanelProps) {
  const {
    overlays,
    addOverlay,
    updateOverlay,
    removeOverlay,
    showOverlay,
    hideOverlay,
    showLowerThird,
    showTicker,
    hideTicker,
    isLoading,
  } = useStudioOverlays(sessionId || '');

  const [lowerThirdName, setLowerThirdName] = useState('');
  const [lowerThirdTitle, setLowerThirdTitle] = useState('');
  const [lowerThirdVariant, setLowerThirdVariant] = useState<'default' | 'minimal' | 'accent'>('default');
  
  const [tickerText, setTickerText] = useState('');
  const [tickerSpeed, setTickerSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [tickerVariant, setTickerVariant] = useState<'default' | 'breaking' | 'info'>('default');
  const [isTickerActive, setIsTickerActive] = useState(false);

  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [newLogoPosition, setNewLogoPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('top-right');

  const handleShowLowerThird = () => {
    if (!lowerThirdName.trim()) {
      toast.error("Digite um nome para o lower third");
      return;
    }
    showLowerThird({
      name: lowerThirdName,
      title: lowerThirdTitle,
      subtitle: lowerThirdVariant === 'accent' ? 'Destaque' : undefined,
    }, 8000);
    toast.success("Lower Third exibido!");
  };

  const handleToggleTicker = (checked: boolean) => {
    if (checked) {
      if (!tickerText.trim()) {
        toast.error("Digite um texto para o ticker");
        return;
      }
      const speedMap = { slow: 50, normal: 100, fast: 150 };
      showTicker({
        text: tickerText,
        speed: speedMap[tickerSpeed],
        loop: true,
      });
      setIsTickerActive(true);
      toast.success("Ticker ativado!");
    } else {
      hideTicker();
      setIsTickerActive(false);
      toast.info("Ticker desativado");
    }
  };

  const handleAddLogo = () => {
    if (!newLogoUrl.trim()) {
      toast.error("Digite a URL do logo");
      return;
    }
    addOverlay({
      type: 'logo',
      isVisible: true,
      position: newLogoPosition,
      content: { imageUrl: newLogoUrl },
    });
    setNewLogoUrl('');
    toast.success("Logo adicionado!");
  };

  const toggleOverlay = (id: string, isVisible: boolean) => {
    if (isVisible) {
      hideOverlay(id);
    } else {
      showOverlay(id);
    }
  };

  const getOverlayTypeIcon = (type: OverlayType) => {
    switch (type) {
      case 'logo': return <Image className="h-4 w-4" />;
      case 'lower-third': return <Type className="h-4 w-4" />;
      case 'ticker': return <Type className="h-4 w-4" />;
      default: return <Layers className="h-4 w-4" />;
    }
  };

  const getOverlayTypeName = (type: OverlayType) => {
    switch (type) {
      case 'logo': return 'Logo';
      case 'lower-third': return 'Lower Third';
      case 'ticker': return 'Ticker';
      case 'banner': return 'Banner';
      case 'comment-highlight': return 'Comentário';
      default: return type;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="overlays" className="flex-1 flex flex-col">
        <TabsList className="shrink-0 w-full justify-start rounded-none border-b border-zinc-800 bg-transparent p-0 h-auto">
          <TabsTrigger 
            value="overlays"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs"
          >
            <Layers className="h-3 w-3 mr-1" />
            Overlays
          </TabsTrigger>
          <TabsTrigger 
            value="lower-third"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs"
          >
            <Type className="h-3 w-3 mr-1" />
            Lower Third
          </TabsTrigger>
          <TabsTrigger 
            value="ticker"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs"
          >
            <Type className="h-3 w-3 mr-1" />
            Ticker
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overlays" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full p-3">
            <div className="space-y-3">
              {overlays.map((overlay) => (
                <Card 
                  key={overlay.id}
                  className={cn(
                    "p-3 bg-zinc-800/50 border-zinc-700 flex items-center justify-between",
                    overlay.isVisible && "border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded bg-zinc-700 flex items-center justify-center",
                      overlay.isVisible && "ring-2 ring-primary"
                    )}>
                      {getOverlayTypeIcon(overlay.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {overlay.type === 'logo' 
                          ? 'Logo' 
                          : overlay.type === 'lower-third' 
                            ? (overlay.content as any)?.name || 'Lower Third'
                            : getOverlayTypeName(overlay.type)
                        }
                      </p>
                      <p className="text-xs text-zinc-500 capitalize">
                        {overlay.position || overlay.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => toggleOverlay(overlay.id, overlay.isVisible)}
                    >
                      {overlay.isVisible ? (
                        <Eye className="h-4 w-4 text-primary" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-zinc-500" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeOverlay(overlay.id)}
                      className="text-zinc-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {overlays.length === 0 && !isLoading && (
                <div className="text-center py-8 text-zinc-500">
                  <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum overlay configurado</p>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                </div>
              )}

              <div className="pt-4 border-t border-zinc-800">
                <Label className="text-xs mb-2 block">Adicionar Logo</Label>
                <div className="space-y-2">
                  <Input 
                    placeholder="URL do logo..."
                    value={newLogoUrl}
                    onChange={(e) => setNewLogoUrl(e.target.value)}
                    className="bg-zinc-800 border-zinc-700"
                  />
                  <div className="flex gap-2">
                    <Select value={newLogoPosition} onValueChange={(v: any) => setNewLogoPosition(v)}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-left">Superior Esquerdo</SelectItem>
                        <SelectItem value="top-right">Superior Direito</SelectItem>
                        <SelectItem value="bottom-left">Inferior Esquerdo</SelectItem>
                        <SelectItem value="bottom-right">Inferior Direito</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddLogo} className="shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="lower-third" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full p-3">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Nome</Label>
                <Input 
                  placeholder="Nome do apresentador..."
                  value={lowerThirdName}
                  onChange={(e) => setLowerThirdName(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Título / Cargo</Label>
                <Input 
                  placeholder="Ex: Editor-Chefe"
                  value={lowerThirdTitle}
                  onChange={(e) => setLowerThirdTitle(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Estilo</Label>
                <Select value={lowerThirdVariant} onValueChange={(v: any) => setLowerThirdVariant(v)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Padrão</SelectItem>
                    <SelectItem value="minimal">Minimalista</SelectItem>
                    <SelectItem value="accent">Destaque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-zinc-800 p-4 border border-zinc-700">
                <p className="text-xs text-zinc-500 mb-2">Preview</p>
                <div className={cn(
                  "p-3 rounded",
                  lowerThirdVariant === 'minimal' && "bg-black/70",
                  lowerThirdVariant === 'accent' && "bg-gradient-to-r from-primary to-primary/80",
                  lowerThirdVariant === 'default' && "bg-gradient-to-r from-zinc-900/95 to-zinc-800/90"
                )}>
                  <p className="font-bold text-white">
                    {lowerThirdName || 'Nome'}
                  </p>
                  <p className="text-sm text-white/80">
                    {lowerThirdTitle || 'Título'}
                  </p>
                </div>
              </div>

              <Button onClick={handleShowLowerThird} className="w-full gap-2">
                <Eye className="h-4 w-4" />
                Mostrar Lower Third
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="ticker" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full p-3">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Texto do Ticker</Label>
                <Input 
                  placeholder="Últimas notícias..."
                  value={tickerText}
                  onChange={(e) => setTickerText(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Velocidade</Label>
                  <Select value={tickerSpeed} onValueChange={(v: any) => setTickerSpeed(v)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Lento</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fast">Rápido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Estilo</Label>
                  <Select value={tickerVariant} onValueChange={(v: any) => setTickerVariant(v)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Destaque</SelectItem>
                      <SelectItem value="breaking">Urgente</SelectItem>
                      <SelectItem value="info">Informativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Exibir Ticker</Label>
                <Switch 
                  checked={isTickerActive}
                  onCheckedChange={handleToggleTicker}
                />
              </div>

              <div className="rounded-lg bg-zinc-800 p-4 border border-zinc-700">
                <p className="text-xs text-zinc-500 mb-2">Preview</p>
                <div className={cn(
                  "p-2 rounded overflow-hidden",
                  tickerVariant === 'default' && "bg-primary/90",
                  tickerVariant === 'breaking' && "bg-red-600",
                  tickerVariant === 'info' && "bg-blue-600"
                )}>
                  <p className="text-sm font-medium text-white whitespace-nowrap overflow-hidden text-ellipsis">
                    {tickerText || 'Seu texto aparecerá aqui rolando na tela...'}
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
