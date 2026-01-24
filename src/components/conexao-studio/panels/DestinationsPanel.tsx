import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Youtube, Facebook, Twitch, Radio, Plus, 
  CheckCircle2, AlertCircle, Loader2, Users, Signal, Instagram, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useConexaoStreaming, StreamPlatform, StreamStatus } from "@/hooks/useConexaoStreaming";

interface DestinationsPanelProps {
  isStreaming: boolean;
  sessionId?: string;
  teamId?: string;
}

const getPlatformIcon = (platform: StreamPlatform) => {
  switch (platform) {
    case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
    case 'facebook': return <Facebook className="h-4 w-4 text-blue-500" />;
    case 'twitch': return <Twitch className="h-4 w-4 text-purple-500" />;
    case 'instagram': return <Instagram className="h-4 w-4 text-pink-500" />;
    case 'rtmp': return <Radio className="h-4 w-4 text-orange-500" />;
    default: return <Radio className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: StreamStatus, isEnabled: boolean) => {
  if (!isEnabled) {
    return <Badge variant="outline" className="text-zinc-500 border-zinc-600">Desativado</Badge>;
  }
  
  switch (status) {
    case 'idle':
      return <Badge variant="outline" className="text-zinc-500 border-zinc-600">Pronto</Badge>;
    case 'connecting':
      return (
        <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Conectando
        </Badge>
      );
    case 'live':
      return (
        <Badge className="bg-red-600 text-white gap-1 animate-pulse">
          <Signal className="h-3 w-3" />
          Ao Vivo
        </Badge>
      );
    case 'ended':
      return (
        <Badge variant="outline" className="text-emerald-500 border-emerald-500/50 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Finalizado
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Erro
        </Badge>
      );
    default:
      return null;
  }
};

export function DestinationsPanel({ isStreaming, sessionId, teamId }: DestinationsPanelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDestination, setNewDestination] = useState({
    platform: 'youtube' as StreamPlatform,
    name: '',
    rtmp_url: '',
    stream_key: '',
  });

  const {
    destinations,
    isLoading,
    isAdding,
    destinationStatus,
    toggleDestination,
    addDestination,
    removeDestination,
    getDestinationStatus,
  } = useConexaoStreaming({
    sessionId: sessionId || '',
    teamId,
  });

  const handleAddDestination = () => {
    if (!newDestination.name || !newDestination.rtmp_url) {
      return;
    }
    
    addDestination(newDestination);
    setNewDestination({
      platform: 'youtube',
      name: '',
      rtmp_url: '',
      stream_key: '',
    });
    setIsDialogOpen(false);
  };

  const totalViewers = destinations
    .filter(d => getDestinationStatus(d.id) === 'live')
    .reduce((sum, d) => sum + (d.viewers || 0), 0);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
          {destinations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Radio className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum destino configurado</p>
              <p className="text-xs mt-1">Adicione destinos para transmitir</p>
            </div>
          ) : (
            destinations.map((dest) => {
              const status = getDestinationStatus(dest.id);
              
              return (
                <Card 
                  key={dest.id}
                  className={cn(
                    "p-3 bg-zinc-800/50 border-zinc-700",
                    status === 'live' && "border-red-500/50",
                    status === 'error' && "border-red-500/50"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(dest.platform)}
                      <span className="text-sm font-medium">{dest.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isStreaming && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeDestination(dest.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                      <Switch
                        checked={dest.is_enabled}
                        onCheckedChange={(enabled) => toggleDestination(dest.id, enabled)}
                        disabled={isStreaming}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {getStatusBadge(status, dest.is_enabled)}
                    
                    {status === 'live' && dest.viewers !== undefined && (
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {dest.viewers}
                      </span>
                    )}
                  </div>
                  
                  {dest.error_message && status === 'error' && (
                    <p className="text-xs text-destructive mt-2">{dest.error_message}</p>
                  )}
                </Card>
              );
            })
          )}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full border-dashed border-zinc-700 gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Destino
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Destino de Streaming</DialogTitle>
                <DialogDescription>
                  Configure um novo destino para transmitir seu conteúdo.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="platform">Plataforma</Label>
                  <Select
                    value={newDestination.platform}
                    onValueChange={(value: StreamPlatform) => 
                      setNewDestination(prev => ({ ...prev, platform: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">
                        <div className="flex items-center gap-2">
                          <Youtube className="h-4 w-4 text-red-500" />
                          YouTube
                        </div>
                      </SelectItem>
                      <SelectItem value="facebook">
                        <div className="flex items-center gap-2">
                          <Facebook className="h-4 w-4 text-blue-500" />
                          Facebook
                        </div>
                      </SelectItem>
                      <SelectItem value="twitch">
                        <div className="flex items-center gap-2">
                          <Twitch className="h-4 w-4 text-purple-500" />
                          Twitch
                        </div>
                      </SelectItem>
                      <SelectItem value="instagram">
                        <div className="flex items-center gap-2">
                          <Instagram className="h-4 w-4 text-pink-500" />
                          Instagram
                        </div>
                      </SelectItem>
                      <SelectItem value="rtmp">
                        <div className="flex items-center gap-2">
                          <Radio className="h-4 w-4 text-orange-500" />
                          RTMP Personalizado
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Destino</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Canal Principal"
                    value={newDestination.name}
                    onChange={(e) => 
                      setNewDestination(prev => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="rtmp_url">URL RTMP</Label>
                  <Input
                    id="rtmp_url"
                    placeholder="rtmp://a.rtmp.youtube.com/live2"
                    value={newDestination.rtmp_url}
                    onChange={(e) => 
                      setNewDestination(prev => ({ ...prev, rtmp_url: e.target.value }))
                    }
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="stream_key">Chave de Transmissão</Label>
                  <Input
                    id="stream_key"
                    type="password"
                    placeholder="xxxx-xxxx-xxxx-xxxx"
                    value={newDestination.stream_key}
                    onChange={(e) => 
                      setNewDestination(prev => ({ ...prev, stream_key: e.target.value }))
                    }
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddDestination}
                  disabled={isAdding || !newDestination.name || !newDestination.rtmp_url}
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    "Adicionar"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
