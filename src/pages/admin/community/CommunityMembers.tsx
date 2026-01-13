import { useState } from "react";
import { 
  Users, 
  Search, 
  Filter,
  MoreVertical,
  Award,
  Ban,
  Mail,
  Eye,
  ArrowUpDown,
  HandHeart,
  Shield,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CommunityMember {
  id: string;
  user_id: string;
  level: string;
  points: number;
  shares_count: number;
  posts_count: number;
  badges: string[];
  joined_at: string;
  last_active_at: string | null;
  is_suspended: boolean;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    email?: string;
  };
}

const levelConfig: Record<string, { label: string; color: string }> = {
  visitor: { label: "Visitante", color: "bg-gray-100 text-gray-800" },
  supporter: { label: "Apoiador", color: "bg-blue-100 text-blue-800" },
  collaborator: { label: "Colaborador", color: "bg-green-100 text-green-800" },
  ambassador: { label: "Embaixador", color: "bg-purple-100 text-purple-800" },
  leader: { label: "Líder", color: "bg-yellow-100 text-yellow-800" },
};

export default function CommunityMembers() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real members from database
  const { data: members, isLoading } = useQuery({
    queryKey: ["community-members-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_members")
        .select(`
          id,
          user_id,
          level,
          points,
          shares_count,
          posts_count,
          badges,
          joined_at,
          last_active_at,
          is_suspended,
          profile:profiles!community_members_user_id_fkey(full_name, avatar_url)
        `)
        .order("points", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as CommunityMember[];
    },
  });

  // Grant Rede do Bem access mutation
  const grantRedeDoBemAccess = useMutation({
    mutationFn: async (userId: string) => {
      // Get current badges
      const { data: member, error: fetchError } = await supabase
        .from("community_members")
        .select("badges")
        .eq("user_id", userId)
        .single();

      if (fetchError) throw fetchError;

      const currentBadges = (member?.badges as string[]) || [];
      
      if (currentBadges.includes("rede_do_bem_access")) {
        throw new Error("Usuário já possui acesso à Rede do Bem");
      }

      // Add badge
      const { error } = await supabase
        .from("community_members")
        .update({ badges: [...currentBadges, "rede_do_bem_access"] })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-members-admin"] });
      toast({
        title: "Acesso concedido",
        description: "O usuário agora tem acesso à Rede do Bem",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    },
  });

  // Revoke Rede do Bem access mutation
  const revokeRedeDoBemAccess = useMutation({
    mutationFn: async (userId: string) => {
      // Get current badges
      const { data: member, error: fetchError } = await supabase
        .from("community_members")
        .select("badges")
        .eq("user_id", userId)
        .single();

      if (fetchError) throw fetchError;

      const currentBadges = (member?.badges as string[]) || [];
      const newBadges = currentBadges.filter(b => b !== "rede_do_bem_access");

      // Update badges
      const { error } = await supabase
        .from("community_members")
        .update({ badges: newBadges })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-members-admin"] });
      toast({
        title: "Acesso revogado",
        description: "O acesso à Rede do Bem foi removido",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    },
  });

  const filteredMembers = (members || []).filter(member => {
    const name = member.profile?.full_name || "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === "all" || member.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const hasRedeDoBemBadge = (badges: string[]) => badges?.includes("rede_do_bem_access");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Membros da Comunidade</h1>
          <p className="text-muted-foreground">Gerencie os membros e seus níveis</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full max-w-sm" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Membros da Comunidade</h1>
        <p className="text-muted-foreground">Gerencie os membros e seus níveis</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 max-w-sm"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Níveis</SelectItem>
                <SelectItem value="visitor">Visitante</SelectItem>
                <SelectItem value="supporter">Apoiador</SelectItem>
                <SelectItem value="collaborator">Colaborador</SelectItem>
                <SelectItem value="ambassador">Embaixador</SelectItem>
                <SelectItem value="leader">Líder</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Pontos
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Shares</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead>Badges</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => {
              const memberBadges = member.badges || [];
              const hasRedeAccess = hasRedeDoBemBadge(memberBadges);
              
              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {(member.profile?.full_name || "U").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.profile?.full_name || "Sem nome"}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                          {member.user_id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={levelConfig[member.level]?.color || levelConfig.visitor.color}>
                      <Award className="h-3 w-3 mr-1" />
                      {levelConfig[member.level]?.label || "Visitante"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{(member.points || 0).toLocaleString()}</TableCell>
                  <TableCell>{member.shares_count || 0}</TableCell>
                  <TableCell>{member.posts_count || 0}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {hasRedeAccess && (
                        <Badge variant="outline" className="text-xs border-pink-300 text-pink-700">
                          <HandHeart className="h-3 w-3 mr-1" />
                          Rede do Bem
                        </Badge>
                      )}
                      {memberBadges.filter(b => b !== "rede_do_bem_access").length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          +{memberBadges.filter(b => b !== "rede_do_bem_access").length}
                        </Badge>
                      )}
                      {memberBadges.length === 0 && (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.joined_at 
                      ? format(new Date(member.joined_at), "dd/MM/yy", { locale: ptBR })
                      : "-"
                    }
                  </TableCell>
                  <TableCell>
                    {member.is_suspended ? (
                      <Badge variant="destructive">Suspenso</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-600">Ativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Enviar Mensagem
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Award className="h-4 w-4 mr-2" />
                          Alterar Nível
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {hasRedeAccess ? (
                          <DropdownMenuItem 
                            onClick={() => revokeRedeDoBemAccess.mutate(member.user_id)}
                            disabled={revokeRedeDoBemAccess.isPending}
                            className="text-orange-600"
                          >
                            {revokeRedeDoBemAccess.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Shield className="h-4 w-4 mr-2" />
                            )}
                            Revogar Acesso Rede do Bem
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => grantRedeDoBemAccess.mutate(member.user_id)}
                            disabled={grantRedeDoBemAccess.isPending}
                            className="text-pink-600"
                          >
                            {grantRedeDoBemAccess.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <HandHeart className="h-4 w-4 mr-2" />
                            )}
                            Conceder Acesso Rede do Bem
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Ban className="h-4 w-4 mr-2" />
                          {member.is_suspended ? "Remover Suspensão" : "Suspender"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredMembers.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Nenhum membro encontrado</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}