import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  UserCog, Shield, Users, Key, CheckCircle, Lock, Settings, Eye
} from "lucide-react";

// ─── Role Overview ───
function RoleOverview() {
  const { data: roles, isLoading } = useQuery({
    queryKey: ["core-roles-overview"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role, user_id");
      return data ?? [];
    },
  });

  const roleMap = new Map<string, number>();
  roles?.forEach((r) => {
    roleMap.set(r.role, (roleMap.get(r.role) ?? 0) + 1);
  });

  const roleConfig: Record<string, { label: string; color: string; icon: React.ElementType; desc: string }> = {
    super_admin: { label: "Super Admin", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: Shield, desc: "Acesso global a todos os módulos e configurações" },
    admin: { label: "Administrador", color: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: Settings, desc: "Gerenciamento completo do portal" },
    editor_chief: { label: "Editor-Chefe", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Eye, desc: "Supervisão editorial e aprovações" },
    reporter: { label: "Repórter", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: Users, desc: "Criação e edição de conteúdo" },
    journalist: { label: "Jornalista", color: "bg-teal-500/10 text-teal-600 border-teal-500/20", icon: Users, desc: "Produção de matérias e reportagens" },
    commercial: { label: "Comercial", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Key, desc: "Gestão de anúncios e campanhas" },
    financial: { label: "Financeiro", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: Key, desc: "Faturamento e relatórios financeiros" },
    support: { label: "Suporte", color: "bg-muted text-muted-foreground border-border", icon: Users, desc: "Atendimento e suporte ao cliente" },
    collaborator: { label: "Colaborador", color: "bg-muted text-muted-foreground border-border", icon: Users, desc: "Acesso básico ao painel" },
    editor: { label: "Editor", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", icon: Eye, desc: "Edição e publicação de conteúdo" },
    moderator: { label: "Moderador", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20", icon: Shield, desc: "Moderação de comunidade" },
  };

  const allRoles = Object.keys(roleConfig);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3 flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xl font-bold">{roles?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total de atribuições</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="p-3 flex items-center gap-3">
            <Key className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold">{roleMap.size}</p>
              <p className="text-xs text-muted-foreground">Roles em uso</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        {allRoles.map((role) => {
          const config = roleConfig[role];
          const count = roleMap.get(role) ?? 0;
          return (
            <div key={role} className={`flex items-center gap-3 p-3 rounded-lg border ${config.color}`}>
              <config.icon className="h-4 w-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{config.label}</p>
                <p className="text-xs opacity-70">{config.desc}</p>
              </div>
              <Badge variant="outline" className="font-mono">{count}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Permissions Map ───
function PermissionsMap() {
  const { data: perms, isLoading } = useQuery({
    queryKey: ["core-roles-permissions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_permissions")
        .select("user_id, permission");
      return data ?? [];
    },
  });

  const permMap = new Map<string, number>();
  perms?.forEach((p) => {
    permMap.set(p.permission, (permMap.get(p.permission) ?? 0) + 1);
  });
  const sortedPerms = [...permMap.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Permissões Granulares
        </CardTitle>
        <CardDescription>Permissões atribuídas por módulo</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>
        ) : sortedPerms.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma permissão granular atribuída</p>
        ) : (
          <div className="space-y-2">
            {sortedPerms.map(([perm, count]) => (
              <div key={perm} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-mono">{perm}</span>
                </div>
                <Badge variant="outline">{count} usuários</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── User Roles List ───
function UserRolesList() {
  const { data: roles, isLoading } = useQuery({
    queryKey: ["core-roles-user-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .order("role", { ascending: true });
      return data ?? [];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["core-roles-profiles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url");
      return data ?? [];
    },
  });

  const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Usuários e Roles</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>
        ) : !roles?.length ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Nenhum usuário</p>
        ) : (
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((r, i) => {
                  const profile = profileMap.get(r.user_id);
                  return (
                    <TableRow key={`${r.user_id}-${r.role}-${i}`}>
                      <TableCell className="text-sm font-medium">
                        {profile?.full_name ?? "Usuário"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{r.role}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {r.user_id.slice(0, 8)}...
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main ───
export default function CoreRoles() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-violet-500/10">
          <UserCog className="h-6 w-6 text-violet-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Controle de Acesso</h1>
          <p className="text-sm text-muted-foreground">
            Roles, permissões granulares por módulo e gestão de usuários
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview" className="text-xs">Roles</TabsTrigger>
          <TabsTrigger value="permissions" className="text-xs">Permissões</TabsTrigger>
          <TabsTrigger value="users" className="text-xs">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><RoleOverview /></TabsContent>
        <TabsContent value="permissions"><PermissionsMap /></TabsContent>
        <TabsContent value="users"><UserRolesList /></TabsContent>
      </Tabs>
    </div>
  );
}
