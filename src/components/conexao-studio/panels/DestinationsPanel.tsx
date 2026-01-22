import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  Youtube, Facebook, Twitch, Radio, Plus, 
  CheckCircle2, AlertCircle, Loader2, Users, Signal
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Destination {
  id: string;
  name: string;
  platform: 'youtube' | 'facebook' | 'twitch' | 'rtmp';
  status: 'disconnected' | 'connecting' | 'connected' | 'live' | 'error';
  isEnabled: boolean;
  viewerCount?: number;
  bitrate?: number;
}

const mockDestinations: Destination[] = [
  { 
    id: '1', 
    name: 'Canal Principal', 
    platform: 'youtube', 
    status: 'connected', 
    isEnabled: true,
    viewerCount: 0
  },
  { 
    id: '2', 
    name: 'Página Oficial', 
    platform: 'facebook', 
    status: 'connected', 
    isEnabled: true,
    viewerCount: 0
  },
  { 
    id: '3', 
    name: 'WebTV Local', 
    platform: 'rtmp', 
    status: 'disconnected', 
    isEnabled: false 
  },
];

const getPlatformIcon = (platform: Destination['platform']) => {
  switch (platform) {
    case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
    case 'facebook': return <Facebook className="h-4 w-4 text-blue-500" />;
    case 'twitch': return <Twitch className="h-4 w-4 text-purple-500" />;
    case 'rtmp': return <Radio className="h-4 w-4 text-orange-500" />;
  }
};

const getStatusBadge = (status: Destination['status']) => {
  switch (status) {
    case 'disconnected':
      return <Badge variant="outline" className="text-zinc-500 border-zinc-600">Desconectado</Badge>;
    case 'connecting':
      return (
        <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Conectando
        </Badge>
      );
    case 'connected':
      return (
        <Badge variant="outline" className="text-emerald-500 border-emerald-500/50 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Pronto
        </Badge>
      );
    case 'live':
      return (
        <Badge className="bg-red-600 text-white gap-1 animate-pulse">
          <Signal className="h-3 w-3" />
          Ao Vivo
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Erro
        </Badge>
      );
  }
};

interface DestinationsPanelProps {
  isStreaming: boolean;
}

export function DestinationsPanel({ isStreaming }: DestinationsPanelProps) {
  const [destinations, setDestinations] = useState<Destination[]>(
    mockDestinations.map(d => ({
      ...d,
      status: isStreaming && d.isEnabled ? 'live' : d.status,
      viewerCount: isStreaming && d.isEnabled ? Math.floor(Math.random() * 100) : 0
    }))
  );

  const toggleDestination = (id: string) => {
    setDestinations(prev => 
      prev.map(d => d.id === id ? { ...d, isEnabled: !d.isEnabled } : d)
    );
  };

  const totalViewers = destinations
    .filter(d => d.status === 'live')
    .reduce((sum, d) => sum + (d.viewerCount || 0), 0);

  return (
    <div className="h-full flex flex-col">
      {/* Summary */}
      {isStreaming && (
        <div className="shrink-0 p-3 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Signal className="h-4 w-4 text-red-500 animate-pulse" />
              <span className="text-sm font-medium">Transmitindo para</span>
            </div>
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {totalViewers} espectadores
            </Badge>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {destinations.map((dest) => (
            <Card 
              key={dest.id}
              className={cn(
                "p-3 bg-zinc-800/50 border-zinc-700",
                dest.status === 'live' && "border-red-500/50",
                dest.status === 'error' && "border-red-500/50"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getPlatformIcon(dest.platform)}
                  <span className="text-sm font-medium">{dest.name}</span>
                </div>
                <Switch
                  checked={dest.isEnabled}
                  onCheckedChange={() => toggleDestination(dest.id)}
                  disabled={isStreaming}
                />
              </div>

              <div className="flex items-center justify-between">
                {getStatusBadge(dest.status)}
                
                {dest.status === 'live' && dest.viewerCount !== undefined && (
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {dest.viewerCount}
                  </span>
                )}
              </div>
            </Card>
          ))}

          <Button variant="outline" className="w-full border-dashed border-zinc-700 gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Destino
          </Button>
        </div>
      </ScrollArea>

      {/* Info */}
      <div className="shrink-0 p-3 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 text-center">
          {isStreaming 
            ? "Não é possível alterar destinos durante a transmissão"
            : "Ative os destinos desejados antes de iniciar a transmissão"
          }
        </p>
      </div>
    </div>
  );
}
