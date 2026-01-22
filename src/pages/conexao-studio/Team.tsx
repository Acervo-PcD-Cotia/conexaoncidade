import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Plus,
  Mail,
  MoreVertical,
  Trash2,
  Shield,
  User,
  Crown,
  Clock,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const roleLabels: Record<string, { label: string; icon: any; color: string }> = {
  owner: { label: "Proprietário", icon: Crown, color: "text-yellow-500" },
  admin: { label: "Administrador", icon: Shield, color: "text-blue-500" },
  member: { label: "Membro", icon: User, color: "text-green-500" },
  guest: { label: "Convidado", icon: User, color: "text-muted-foreground" },
};

export default function Team() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const { data: teamData, isLoading } = useQuery({
    queryKey: ["conexao-studio-team", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Get user's team
      const { data: teamMember, error: teamError } = await supabase
        .from("illumina_team_members")
        .select(`
          *,
          illumina_teams (*)
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      
      if (teamError) throw teamError;
      
      // Get all team members
      const { data: members, error: membersError } = await supabase
        .from("illumina_team_members")
        .select("*")
        .eq("team_id", teamMember.team_id)
        .order("created_at", { ascending: true });
      
      if (membersError) throw membersError;
      
      return {
        team: teamMember.illumina_teams,
        currentMember: teamMember,
        members: members || [],
      };
    },
    enabled: !!user?.id,
  });

  const inviteMember = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      if (!teamData?.team?.id) throw new Error("Equipe não encontrada");
      
      const { error } = await supabase
        .from("illumina_team_members")
        .insert({
          team_id: teamData.team.id,
          user_id: null, // Will be linked when user accepts
          role,
          status: "pending",
          invited_email: email,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conexao-studio-team"] });
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      toast.success("Convite enviado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao enviar convite: " + error.message);
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("illumina_team_members")
        .delete()
        .eq("id", memberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conexao-studio-team"] });
      toast.success("Membro removido!");
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const { error } = await supabase
        .from("illumina_team_members")
        .update({ role })
        .eq("id", memberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conexao-studio-team"] });
      toast.success("Papel atualizado!");
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast.error("Digite o e-mail do convidado");
      return;
    }
    inviteMember.mutate({ email: inviteEmail, role: inviteRole });
  };

  const canManageMembers = teamData?.currentMember?.role === "owner" || 
                           teamData?.currentMember?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Equipe
          </h1>
          <p className="text-muted-foreground">
            Gerencie os membros da sua equipe
          </p>
        </div>
        {canManageMembers && (
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Convidar Membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleInvite}>
                <DialogHeader>
                  <DialogTitle>Convidar Membro</DialogTitle>
                  <DialogDescription>
                    Envie um convite por e-mail para adicionar um novo membro à equipe
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Papel</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o papel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <span className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            Administrador
                          </span>
                        </SelectItem>
                        <SelectItem value="member">
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4 text-green-500" />
                            Membro
                          </span>
                        </SelectItem>
                        <SelectItem value="guest">
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Convidado
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={inviteMember.isPending}>
                    {inviteMember.isPending ? "Enviando..." : "Enviar Convite"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Team info */}
      {teamData?.team && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  {teamData.team.logo_url ? (
                    <AvatarImage src={teamData.team.logo_url} />
                  ) : null}
                  <AvatarFallback>
                    {teamData.team.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{teamData.team.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {teamData.members?.length || 0} membros • Plano {teamData.team.plan_type}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="capitalize">
                {roleLabels[teamData.currentMember?.role]?.label || teamData.currentMember?.role}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : teamData?.members && teamData.members.length > 0 ? (
        <div className="space-y-3">
          {teamData.members.map((member) => {
            const roleInfo = roleLabels[member.role] || roleLabels.member;
            const RoleIcon = roleInfo.icon;
            const isCurrentUser = member.user_id === user?.id;
            const isPending = member.status === "pending";

            return (
              <Card key={member.id} className={isPending ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {member.invited_email?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {member.invited_email || "Usuário"}
                          </p>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">
                              Você
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <RoleIcon className={`h-3 w-3 ${roleInfo.color}`} />
                          <span>{roleInfo.label}</span>
                          {isPending && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Pendente
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isPending && (
                        <span className="text-xs text-muted-foreground">
                          Desde {format(new Date(member.created_at), "MMM yyyy", { locale: ptBR })}
                        </span>
                      )}
                      
                      {canManageMembers && !isCurrentUser && member.role !== "owner" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!isPending && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => updateRole.mutate({ memberId: member.id, role: "admin" })}
                                  disabled={member.role === "admin"}
                                >
                                  <Shield className="h-4 w-4 mr-2 text-blue-500" />
                                  Tornar Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateRole.mutate({ memberId: member.id, role: "member" })}
                                  disabled={member.role === "member"}
                                >
                                  <User className="h-4 w-4 mr-2 text-green-500" />
                                  Tornar Membro
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => removeMember.mutate(member.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {isPending ? "Cancelar Convite" : "Remover"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
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
            <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum membro ainda</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Convide membros para colaborar nas transmissões.
            </p>
            {canManageMembers && (
              <Button onClick={() => setIsInviteOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Convidar Membro
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Permissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permissões por Papel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Permissão</th>
                  <th className="text-center py-2 px-2">
                    <span className="flex items-center justify-center gap-1">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      Owner
                    </span>
                  </th>
                  <th className="text-center py-2 px-2">
                    <span className="flex items-center justify-center gap-1">
                      <Shield className="h-4 w-4 text-blue-500" />
                      Admin
                    </span>
                  </th>
                  <th className="text-center py-2 px-2">
                    <span className="flex items-center justify-center gap-1">
                      <User className="h-4 w-4 text-green-500" />
                      Membro
                    </span>
                  </th>
                  <th className="text-center py-2 px-2">
                    <span className="flex items-center justify-center gap-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Guest
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Gerenciar Destinos", owner: true, admin: true, member: false, guest: false },
                  { name: "Editar Branding", owner: true, admin: true, member: false, guest: false },
                  { name: "Gerenciar Membros", owner: true, admin: true, member: false, guest: false },
                  { name: "Ver Faturamento", owner: true, admin: false, member: false, guest: false },
                  { name: "Usar Estúdio", owner: true, admin: true, member: true, guest: true },
                  { name: "Ver Biblioteca", owner: true, admin: true, member: true, guest: false },
                ].map((perm) => (
                  <tr key={perm.name} className="border-b last:border-0">
                    <td className="py-2 pr-4">{perm.name}</td>
                    <td className="text-center py-2 px-2">
                      {perm.owner ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                    </td>
                    <td className="text-center py-2 px-2">
                      {perm.admin ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                    </td>
                    <td className="text-center py-2 px-2">
                      {perm.member ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                    </td>
                    <td className="text-center py-2 px-2">
                      {perm.guest ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
