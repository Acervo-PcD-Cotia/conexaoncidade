import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, UserPlus, Loader2, Power, Key, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PERMISSIONS, PERMISSION_LABELS, type Permission } from "@/hooks/useUserPermissions";

type AppRole = "admin" | "editor_chief" | "editor" | "reporter" | "columnist" | "collaborator" | "moderator";

const roleLabels: Record<AppRole, string> = {
  admin: "Administrador",
  editor_chief: "Editor-Chefe",
  editor: "Editor",
  reporter: "Repórter",
  columnist: "Colunista",
  collaborator: "Colaborador",
  moderator: "Moderador",
};

const roleColors: Record<AppRole, string> = {
  admin: "bg-red-100 text-red-700",
  editor_chief: "bg-orange-100 text-orange-700",
  editor: "bg-blue-100 text-blue-700",
  reporter: "bg-cyan-100 text-cyan-700",
  columnist: "bg-purple-100 text-purple-700",
  collaborator: "bg-yellow-100 text-yellow-700",
  moderator: "bg-green-100 text-green-700",
};

export default function Users() {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string; role?: AppRole; isActive?: boolean } | null>(null);
  const [newRole, setNewRole] = useState<AppRole>("collaborator");
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [newUserForm, setNewUserForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "collaborator" as AppRole,
    sendInvite: true,
  });
  const queryClient = useQueryClient();

  const { data: usersWithRoles, isLoading } = useQuery({
    queryKey: ["admin-users-roles"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, is_active")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      return profiles?.map((profile) => {
        const roleData = roles?.find((r) => r.user_id === profile.id);
        return {
          id: profile.id,
          role: (roleData?.role as AppRole) || null,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          is_active: profile.is_active !== false,
        };
      }) || [];
    },
  });

  // Fetch user permissions when editing
  const { data: userPermissions } = useQuery({
    queryKey: ["user-permissions", selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      const { data, error } = await supabase
        .from("user_permissions")
        .select("permission")
        .eq("user_id", selectedUser.id);
      if (error) throw error;
      return data.map((p) => p.permission as Permission);
    },
    enabled: !!selectedUser?.id && roleDialogOpen,
  });

  // Load permissions when user is selected
  useState(() => {
    if (userPermissions) {
      setSelectedPermissions(userPermissions);
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role, permissions }: { userId: string; role: AppRole; permissions: Permission[] }) => {
      // Update role
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role })
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role });
        if (error) throw error;
      }

      // Update permissions - delete all and insert new
      await supabase.from("user_permissions").delete().eq("user_id", userId);
      
      if (permissions.length > 0) {
        const { error } = await supabase.from("user_permissions").insert(
          permissions.map((permission) => ({ user_id: userId, permission }))
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-roles"] });
      toast.success("Usuário atualizado!");
      setRoleDialogOpen(false);
      setSelectedUser(null);
      setSelectedPermissions([]);
    },
    onError: (error) => {
      toast.error("Erro: " + (error as Error).message);
    },
  });

  const toggleUserActiveMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: isActive })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-roles"] });
      toast.success("Status atualizado!");
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof newUserForm) => {
      const response = await supabase.functions.invoke("create-user", {
        body: {
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          role: data.role,
          sendInvite: data.sendInvite,
        },
      });

      if (response.error) throw new Error(response.error.message);
      if (!response.data.success) throw new Error(response.data.error);
      
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-roles"] });
      if (data.inviteSent) {
        toast.success("Usuário criado e email de convite enviado!");
      } else {
        toast.success("Usuário criado com sucesso!");
      }
      setNewUserDialogOpen(false);
      setNewUserForm({ fullName: "", email: "", password: "", role: "collaborator", sendInvite: true });
    },
    onError: (error) => {
      toast.error("Erro ao criar usuário: " + (error as Error).message);
    },
  });

  const handleEditRole = (user: { id: string; full_name?: string | null; role: AppRole | null; is_active?: boolean }) => {
    setSelectedUser({ 
      id: user.id, 
      email: user.full_name || user.id, 
      role: user.role || undefined,
      isActive: user.is_active 
    });
    setNewRole(user.role || "collaborator");
    setSelectedPermissions([]);
    setRoleDialogOpen(true);
  };

  const togglePermission = (permission: Permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários e suas permissões</p>
        </div>
        <Button onClick={() => setNewUserDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : usersWithRoles?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              usersWithRoles?.map((user) => (
                <TableRow key={user.id} className={!user.is_active ? "opacity-50" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback>
                          {user.full_name?.slice(0, 2).toUpperCase() || "US"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.full_name || "Sem nome"}</div>
                        <div className="text-xs text-muted-foreground">{user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role ? (
                      <Badge className={roleColors[user.role]}>
                        <Shield className="mr-1 h-3 w-3" />
                        {roleLabels[user.role]}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Sem permissão
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.is_active}
                        onCheckedChange={(checked) =>
                          toggleUserActiveMutation.mutate({ userId: user.id, isActive: checked })
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {user.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRole(user)}
                    >
                      <Key className="mr-1 h-3 w-3" />
                      Permissões
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Role & Permissions Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Permissões</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Usuário</Label>
              <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
            </div>
            <div>
              <Label>Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="editor_chief">Editor-Chefe</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="reporter">Repórter</SelectItem>
                  <SelectItem value="columnist">Colunista</SelectItem>
                  <SelectItem value="collaborator">Colaborador</SelectItem>
                  <SelectItem value="moderator">Moderador</SelectItem>
                </SelectContent>
              </Select>
              {newRole === "admin" && (
                <p className="text-xs text-muted-foreground mt-1">
                  Administradores têm todas as permissões automaticamente.
                </p>
              )}
            </div>
            
            {newRole !== "admin" && (
              <div className="space-y-2">
                <Label>Permissões Específicas</Label>
                <div className="grid grid-cols-2 gap-2 border rounded-lg p-3">
                  {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={selectedPermissions.includes(key as Permission)}
                        onCheckedChange={() => togglePermission(key as Permission)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (selectedUser) {
                  updateRoleMutation.mutate({
                    userId: selectedUser.id,
                    role: newRole,
                    permissions: newRole === "admin" ? [] : selectedPermissions,
                  });
                }
              }}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New User Dialog */}
      <Dialog open={newUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome Completo *</Label>
              <Input
                value={newUserForm.fullName}
                onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                placeholder="Nome do usuário"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label>Senha Temporária *</Label>
              <Input
                type="password"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <Label>Role Inicial</Label>
              <Select
                value={newUserForm.role}
                onValueChange={(v) => setNewUserForm({ ...newUserForm, role: v as AppRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="editor_chief">Editor-Chefe</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="reporter">Repórter</SelectItem>
                  <SelectItem value="columnist">Colunista</SelectItem>
                  <SelectItem value="collaborator">Colaborador</SelectItem>
                  <SelectItem value="moderator">Moderador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Email Invite Checkbox */}
            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="cursor-pointer">Enviar email de convite</Label>
                  <p className="text-xs text-muted-foreground">
                    O usuário receberá suas credenciais por email
                  </p>
                </div>
              </div>
              <Switch
                checked={newUserForm.sendInvite}
                onCheckedChange={(checked) =>
                  setNewUserForm({ ...newUserForm, sendInvite: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewUserDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => createUserMutation.mutate(newUserForm)}
              disabled={
                createUserMutation.isPending ||
                !newUserForm.fullName ||
                !newUserForm.email ||
                !newUserForm.password
              }
            >
              {createUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Usuário"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
