import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Image, Video, Upload, Play, Plus, Trash2, Share2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  thumbnailUrl: string;
  isActive: boolean;
}

const mockMedia: MediaItem[] = [
  { id: '1', name: 'Banner Abertura', type: 'image', thumbnailUrl: '', isActive: false },
  { id: '2', name: 'Vinheta', type: 'video', thumbnailUrl: '', isActive: false },
  { id: '3', name: 'Logo Animado', type: 'video', thumbnailUrl: '', isActive: false },
];

export function MediaPanel() {
  const [media, setMedia] = useState<MediaItem[]>(mockMedia);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);

  const shareMedia = (id: string) => {
    setActiveMediaId(activeMediaId === id ? null : id);
    setMedia(prev => 
      prev.map(m => ({ ...m, isActive: m.id === id && activeMediaId !== id }))
    );
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <TabsList className="shrink-0 w-full justify-start rounded-none border-b border-zinc-800 bg-transparent p-0 h-auto">
          <TabsTrigger 
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs"
          >
            Todos
          </TabsTrigger>
          <TabsTrigger 
            value="images"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs gap-1"
          >
            <Image className="h-3 w-3" />
            Imagens
          </TabsTrigger>
          <TabsTrigger 
            value="videos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs gap-1"
          >
            <Video className="h-3 w-3" />
            Vídeos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full p-3">
            <div className="grid grid-cols-2 gap-2">
              {media.map((item) => (
                <Card 
                  key={item.id}
                  className={cn(
                    "overflow-hidden bg-zinc-800/50 border-zinc-700 cursor-pointer transition-all",
                    item.isActive && "ring-2 ring-primary"
                  )}
                  onClick={() => shareMedia(item.id)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-zinc-700 flex items-center justify-center relative">
                    {item.type === 'image' ? (
                      <Image className="h-6 w-6 text-zinc-500" />
                    ) : (
                      <Video className="h-6 w-6 text-zinc-500" />
                    )}
                    
                    {item.isActive && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Share2 className="h-6 w-6 text-primary animate-pulse" />
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    <p className="text-[10px] text-zinc-500 capitalize">{item.type}</p>
                  </div>
                </Card>
              ))}

              {/* Upload button */}
              <Card 
                className="overflow-hidden bg-zinc-800/30 border-dashed border-zinc-700 cursor-pointer hover:border-zinc-600 transition-colors"
              >
                <div className="aspect-video flex flex-col items-center justify-center gap-1">
                  <Upload className="h-5 w-5 text-zinc-500" />
                  <span className="text-[10px] text-zinc-500">Upload</span>
                </div>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="images" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full p-3">
            <div className="grid grid-cols-2 gap-2">
              {media.filter(m => m.type === 'image').map((item) => (
                <Card 
                  key={item.id}
                  className="overflow-hidden bg-zinc-800/50 border-zinc-700 cursor-pointer"
                  onClick={() => shareMedia(item.id)}
                >
                  <div className="aspect-video bg-zinc-700 flex items-center justify-center">
                    <Image className="h-6 w-6 text-zinc-500" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="videos" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full p-3">
            <div className="grid grid-cols-2 gap-2">
              {media.filter(m => m.type === 'video').map((item) => (
                <Card 
                  key={item.id}
                  className="overflow-hidden bg-zinc-800/50 border-zinc-700 cursor-pointer"
                  onClick={() => shareMedia(item.id)}
                >
                  <div className="aspect-video bg-zinc-700 flex items-center justify-center relative">
                    <Video className="h-6 w-6 text-zinc-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
