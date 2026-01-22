import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  Image, Type, Layers, Plus, Eye, EyeOff, Trash2, Upload
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Overlay {
  id: string;
  name: string;
  type: 'logo' | 'lower-third' | 'ticker' | 'custom';
  isActive: boolean;
  imageUrl?: string;
}

const mockOverlays: Overlay[] = [
  { id: '1', name: 'Logo Principal', type: 'logo', isActive: true },
  { id: '2', name: 'Lower Third - Nome', type: 'lower-third', isActive: false },
  { id: '3', name: 'Ticker - Notícias', type: 'ticker', isActive: false },
];

export function BrandingPanel() {
  const [overlays, setOverlays] = useState<Overlay[]>(mockOverlays);
  const [lowerThirdName, setLowerThirdName] = useState('');
  const [lowerThirdTitle, setLowerThirdTitle] = useState('');
  const [tickerText, setTickerText] = useState('');

  const toggleOverlay = (id: string) => {
    setOverlays(prev => 
      prev.map(o => o.id === id ? { ...o, isActive: !o.isActive } : o)
    );
  };

  const showLowerThird = () => {
    // Would show lower third with current name/title
    console.log('Show lower third:', lowerThirdName, lowerThirdTitle);
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
            <div className="space-y-2">
              {overlays.map((overlay) => (
                <Card 
                  key={overlay.id}
                  className={cn(
                    "p-3 bg-zinc-800/50 border-zinc-700 flex items-center justify-between",
                    overlay.isActive && "border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-16 rounded bg-zinc-700 flex items-center justify-center",
                      overlay.isActive && "ring-2 ring-primary"
                    )}>
                      <Image className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{overlay.name}</p>
                      <p className="text-xs text-zinc-500 capitalize">{overlay.type}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toggleOverlay(overlay.id)}
                  >
                    {overlay.isActive ? (
                      <Eye className="h-4 w-4 text-primary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-zinc-500" />
                    )}
                  </Button>
                </Card>
              ))}

              <Button variant="outline" className="w-full border-dashed border-zinc-700 gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Overlay
              </Button>
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

              {/* Preview */}
              <div className="rounded-lg bg-zinc-800 p-4 border border-zinc-700">
                <p className="text-xs text-zinc-500 mb-2">Preview</p>
                <div className="bg-gradient-to-r from-primary/90 to-primary/70 p-3 rounded">
                  <p className="font-bold text-white">
                    {lowerThirdName || 'Nome'}
                  </p>
                  <p className="text-sm text-white/80">
                    {lowerThirdTitle || 'Título'}
                  </p>
                </div>
              </div>

              <Button onClick={showLowerThird} className="w-full gap-2">
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

              <div className="flex items-center justify-between">
                <Label className="text-xs">Exibir Ticker</Label>
                <Switch />
              </div>

              {/* Preview */}
              <div className="rounded-lg bg-zinc-800 p-4 border border-zinc-700">
                <p className="text-xs text-zinc-500 mb-2">Preview</p>
                <div className="bg-primary/90 p-2 rounded overflow-hidden">
                  <p className="text-sm font-medium text-white whitespace-nowrap animate-marquee">
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
