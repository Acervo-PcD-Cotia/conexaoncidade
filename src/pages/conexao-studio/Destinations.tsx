import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import {
  Share2,
  Plus,
  Youtube,
  Facebook,
  Twitch,
  Linkedin,
  Tv,
  Radio,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Trash2,
  Pencil,
  TestTube,
  Link2,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const platformIcons: Record<string, any> = {
  youtube: Youtube,
  facebook: Facebook,
  twitch: Twitch,
  linkedin: Linkedin,
  rtmp: Radio,
  webtv: Tv,
};

const platformColors: Record<string, string> = {
  youtube: "text-red-500",
  facebook: "text-blue-600",
  twitch: "text-purple-500",
  linkedin: "text-blue-700",
  rtmp: "text-orange-500",
  webtv: "text-green-500",
};

export default function Destinations() {
  const { user } = useAuth();
  const { isSuperAdmin, isAdmin } = useUserPermissions();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showStreamKey, setShowStreamKey] = useState<string | null>(null);
  const [newDestination, setNewDestination] = useState({
    name: "",
    platform: "",
    rtmp_url: "",
    stream_key: "",
  });

  const { data: destinations, isLoading } = useQuery({
    queryKey: ["conexao-studio-destinations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("illumina_destinations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createDestination = useMutation({
    mutationFn: async (destination: typeof newDestination) => {
      // Get user's team
      const { data: teamMember } = await supabase
        .from("illumina_team_members")
        .select("team_id")
        .eq("user_id", user?.id)
        .eq("status", "active")
        .single();
      
      if (!teamMember) throw new Error("Equipe não encontrada");

      const { error } = await supabase
        .from("illumina_destinations")
        .insert({
          team_id: teamMember.team_id,
          name: destination.name,
          type: destination.platform,
          rtmp_url: destination.rtmp_url || null,
          stream_key_encrypted: destination.stream_key || null,
          is_enabled: true,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conexao-studio-destinations"] });
      setIsAddDialogOpen(false);
      setNewDestination({ name: "", platform: "", rtmp_url: "", stream_key: "" });
      toast.success("Destino adicionado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar destino: " + error.message);
    },
  });

  const toggleDestination = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { error } = await supabase
        .from("illumina_destinations")
        .update({ is_enabled })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conexao-studio-destinations"] });
    },
  });

  const deleteDestination = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("illumina_destinations")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conexao-studio-destinations"] });
      toast.success("Destino removido!");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestination.name || !newDestination.platform) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    createDestination.mutate(newDestination);
  };

  const copyStreamKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Stream key copiada!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="h-6 w-6" />
            Destinos de Transmissão
          </h1>
          <p className="text-muted-foreground">
            Configure onde suas transmissões serão enviadas
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Destino
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Novo Destino</DialogTitle>
                <DialogDescription>
                  Adicione um destino para transmitir simultaneamente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Destino</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Meu Canal YouTube"
                    value={newDestination.name}
                    onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Plataforma</Label>
                  <Select
                    value={newDestination.platform}
                    onValueChange={(value) => setNewDestination({ ...newDestination, platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">
                        <span className="flex items-center gap-2">
                          <Youtube className="h-4 w-4 text-red-500" />
                          YouTube
                        </span>
                      </SelectItem>
                      <SelectItem value="facebook">
                        <span className="flex items-center gap-2">
                          <Facebook className="h-4 w-4 text-blue-600" />
                          Facebook
                        </span>
                      </SelectItem>
                      <SelectItem value="twitch">
                        <span className="flex items-center gap-2">
                          <Twitch className="h-4 w-4 text-purple-500" />
                          Twitch
                        </span>
                      </SelectItem>
                      <SelectItem value="linkedin">
                        <span className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-blue-700" />
                          LinkedIn
                        </span>
                      </SelectItem>
                      <SelectItem value="rtmp">
                        <span className="flex items-center gap-2">
                          <Radio className="h-4 w-4 text-orange-500" />
                          RTMP Personalizado
                        </span>
                      </SelectItem>
                      <SelectItem value="webtv">
                        <span className="flex items-center gap-2">
                          <Tv className="h-4 w-4 text-green-500" />
                          Minha WebTV
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(newDestination.platform === "rtmp" || newDestination.platform === "youtube" || newDestination.platform === "facebook") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="rtmp_url">URL RTMP</Label>
                      <Input
                        id="rtmp_url"
                        placeholder="rtmp://..."
                        value={newDestination.rtmp_url}
                        onChange={(e) => setNewDestination({ ...newDestination, rtmp_url: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stream_key">Stream Key</Label>
                      <Input
                        id="stream_key"
                        type="password"
                        placeholder="Sua chave de transmissão"
                        value={newDestination.stream_key}
                        onChange={(e) => setNewDestination({ ...newDestination, stream_key: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createDestination.isPending}>
                  {createDestination.isPending ? "Adicionando..." : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plan info - Hidden for super_admin/admin */}
      {!isSuperAdmin && !isAdmin ? (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Plano Atual: Free</p>
                <p className="text-sm text-muted-foreground">
                  1 destino simultâneo • Faça upgrade para transmitir para mais plataformas
                </p>
              </div>
              <Button variant="outline" size="sm">
                Ver Planos
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-green-500 text-white hover:bg-green-600">
                Acesso Ilimitado
              </Badge>
              <p className="text-sm text-muted-foreground">
                Como {isSuperAdmin ? 'Super Admin' : 'Admin'}, você tem acesso a todos os recursos sem limitações.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-12 bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : destinations && destinations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinations.map((dest) => {
            const PlatformIcon = platformIcons[dest.type] || Radio;
            const platformColor = platformColors[dest.type] || "text-muted-foreground";
            
            return (
              <Card key={dest.id} className={`${!dest.is_enabled ? "opacity-60" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-xl bg-muted flex items-center justify-center ${platformColor}`}>
                        <PlatformIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{dest.name}</CardTitle>
                        <CardDescription className="capitalize">{dest.type}</CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <TestTube className="h-4 w-4 mr-2" />
                          Testar Conexão
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteDestination.mutate(dest.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dest.rtmp_url && (
                      <div className="text-xs text-muted-foreground truncate">
                        <Link2 className="h-3 w-3 inline mr-1" />
                        {dest.rtmp_url}
                      </div>
                    )}
                    
                    {dest.stream_key_encrypted && (
                      <div className="flex items-center gap-2">
                        <Input
                          type={showStreamKey === dest.id ? "text" : "password"}
                          value={dest.stream_key_encrypted}
                          readOnly
                          className="h-8 text-xs"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => setShowStreamKey(showStreamKey === dest.id ? null : dest.id)}
                        >
                          {showStreamKey === dest.id ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => copyStreamKey(dest.stream_key_encrypted)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        {dest.is_connected ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Conectado
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Não conectado
                          </Badge>
                        )}
                      </div>
                      <Switch
                        checked={dest.is_enabled}
                        onCheckedChange={(checked) => 
                          toggleDestination.mutate({ id: dest.id, is_enabled: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Share2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum destino configurado</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Adicione destinos para transmitir simultaneamente para múltiplas plataformas.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Destino
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
