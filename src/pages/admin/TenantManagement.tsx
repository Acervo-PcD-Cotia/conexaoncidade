import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useRequireRole";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plus, Building2, Globe, Palette, Users, Settings2, Pencil, Trash2, ExternalLink, Crown } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  primary_domain: string;
  base_url: string;
  is_white_label: boolean;
  plan_tier: string | null;
  owner_id: string | null;
  created_at: string;
  branding?: Record<string, unknown>;
  owner_name?: string;
}

function useTenants() {
  return useQuery({
    queryKey: ["admin-tenants"],
    queryFn: async () => {
      const { data: sites, error } = await supabase
        .from("sites")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch branding for each site
      const ids = (sites || []).map((s) => s.id);
      const { data: configs } = await supabase
        .from("site_template_config")
        .select("site_id, branding")
        .in("site_id", ids);

      const brandingMap = new Map(
        (configs || []).map((c) => [c.site_id, c.branding])
      );

      // Fetch owner names
      const ownerIds = (sites || []).filter((s) => s.owner_id).map((s) => s.owner_id!);
      let ownerMap = new Map<string, string>();
      if (ownerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", ownerIds);
        ownerMap = new Map(
          (profiles || []).map((p) => [p.id, p.full_name || "Sem nome"])
        );
      }

      return (sites || []).map((s) => ({
        ...s,
        branding: (brandingMap.get(s.id) as Record<string, unknown>) || {},
        owner_name: s.owner_id ? ownerMap.get(s.owner_id) : undefined,
      })) as Tenant[];
    },
  });
}

interface TenantFormData {
  name: string;
  primary_domain: string;
  base_url: string;
  is_white_label: boolean;
  plan_tier: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  favicon_url: string;
}

const defaultForm: TenantFormData = {
  name: "",
  primary_domain: "",
  base_url: "https://",
  is_white_label: false,
  plan_tier: "starter",
  logo_url: "",
  primary_color: "#F97316",
  secondary_color: "#1E293B",
  favicon_url: "",
};

function TenantFormDialog({
  open,
  onOpenChange,
  editTenant,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editTenant?: Tenant;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!editTenant;

  const [form, setForm] = useState<TenantFormData>(() => {
    if (editTenant) {
      const b = editTenant.branding || {};
      return {
        name: editTenant.name,
        primary_domain: editTenant.primary_domain,
        base_url: editTenant.base_url,
        is_white_label: editTenant.is_white_label || false,
        plan_tier: editTenant.plan_tier || "starter",
        logo_url: (b.logo_url as string) || "",
        primary_color: (b.primary_color as string) || "#F97316",
        secondary_color: (b.secondary_color as string) || "#1E293B",
        favicon_url: (b.favicon_url as string) || "",
      };
    }
    return { ...defaultForm };
  });

  const mutation = useMutation({
    mutationFn: async (data: TenantFormData) => {
      const sitePayload = {
        name: data.name,
        primary_domain: data.primary_domain,
        base_url: data.base_url,
        is_white_label: data.is_white_label,
        plan_tier: data.plan_tier,
      };

      let siteId: string;

      if (isEdit) {
        const { error } = await supabase
          .from("sites")
          .update(sitePayload)
          .eq("id", editTenant.id);
        if (error) throw error;
        siteId = editTenant.id;
      } else {
        const { data: newSite, error } = await supabase
          .from("sites")
          .insert(sitePayload)
          .select("id")
          .single();
        if (error) throw error;
        siteId = newSite.id;
      }

      // Upsert branding
      const branding = {
        logo_url: data.logo_url,
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        favicon_url: data.favicon_url,
      };

      const { data: existing } = await supabase
        .from("site_template_config")
        .select("id")
        .eq("site_id", siteId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("site_template_config")
          .update({ branding })
          .eq("site_id", siteId);
      } else {
        await supabase
          .from("site_template_config")
          .insert({ site_id: siteId, branding });
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Tenant atualizado!" : "Tenant criado!");
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error("Erro: " + err.message);
    },
  });

  const update = (key: keyof TenantFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isEdit ? "Editar Tenant" : "Nova Franquia / White Label"}
          </DialogTitle>
          <DialogDescription>
            Configure os dados da instância e personalização de marca.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4" /> Dados Básicos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Cidade/Parceiro</Label>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Ex: Itapevi"
                />
              </div>
              <div className="space-y-2">
                <Label>Domínio Principal</Label>
                <Input
                  value={form.primary_domain}
                  onChange={(e) => update("primary_domain", e.target.value)}
                  placeholder="Ex: itapevi.conexaonacidade.com.br"
                />
              </div>
              <div className="space-y-2">
                <Label>URL Base</Label>
                <Input
                  value={form.base_url}
                  onChange={(e) => update("base_url", e.target.value)}
                  placeholder="https://itapevi.conexaonacidade.com.br"
                />
              </div>
              <div className="space-y-2">
                <Label>Plano</Label>
                <Select
                  value={form.plan_tier}
                  onValueChange={(v) => update("plan_tier", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_white_label}
                onCheckedChange={(v) => update("is_white_label", v)}
              />
              <Label>White Label (marca própria do parceiro)</Label>
            </div>
          </div>

          <Separator />

          {/* Branding */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <Palette className="h-4 w-4" /> Personalização de Marca
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>URL do Logotipo</Label>
                <Input
                  value={form.logo_url}
                  onChange={(e) => update("logo_url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>URL do Favicon</Label>
                <Input
                  value={form.favicon_url}
                  onChange={(e) => update("favicon_url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={form.primary_color}
                    onChange={(e) => update("primary_color", e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={form.primary_color}
                    onChange={(e) => update("primary_color", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={form.secondary_color}
                    onChange={(e) => update("secondary_color", e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={form.secondary_color}
                    onChange={(e) => update("secondary_color", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            {form.logo_url && (
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Preview do Logo:</p>
                <img
                  src={form.logo_url}
                  alt="Logo preview"
                  className="h-16 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.name || !form.primary_domain}
          >
            {mutation.isPending ? "Salvando..." : isEdit ? "Salvar" : "Criar Tenant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TenantManagement() {
  const { isSuperAdmin, loading } = useUserRole();
  const { data: tenants, isLoading } = useTenants();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | undefined>();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sites").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tenant removido");
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (loading) return null;
  if (!isSuperAdmin) return <Navigate to="/spah/painel" replace />;

  const openCreate = () => {
    setEditTenant(undefined);
    setDialogOpen(true);
  };

  const openEdit = (t: Tenant) => {
    setEditTenant(t);
    setDialogOpen(true);
  };

  const planColors: Record<string, string> = {
    starter: "bg-muted text-muted-foreground",
    pro: "bg-primary/10 text-primary",
    enterprise: "bg-yellow-500/10 text-yellow-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" />
            Franquias & White Label
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie as instâncias do portal, configure marca e defina admins locais.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Tenant
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants?.map((tenant) => {
            const b = tenant.branding || {};
            const color = (b.primary_color as string) || "#F97316";
            return (
              <Card
                key={tenant.id}
                className="group hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: color }}
                />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {b.logo_url ? (
                        <img
                          src={b.logo_url as string}
                          alt={tenant.name}
                          className="h-10 w-10 rounded-lg object-contain border"
                        />
                      ) : (
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: color }}
                        >
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-base">{tenant.name}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {tenant.primary_domain}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => openEdit(tenant)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => {
                          if (confirm(`Remover "${tenant.name}"?`)) {
                            deleteMutation.mutate(tenant.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={planColors[tenant.plan_tier || "starter"]}
                    >
                      {(tenant.plan_tier || "starter").toUpperCase()}
                    </Badge>
                    {tenant.is_white_label && (
                      <Badge variant="secondary" className="gap-1">
                        <Palette className="h-3 w-3" />
                        White Label
                      </Badge>
                    )}
                  </div>
                  {tenant.owner_name && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      Admin: {tenant.owner_name}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: color }}
                      title="Cor primária"
                    />
                    <div
                      className="h-4 w-4 rounded-full border"
                      style={{
                        backgroundColor:
                          (b.secondary_color as string) || "#1E293B",
                      }}
                      title="Cor secundária"
                    />
                    <a
                      href={tenant.base_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      Visitar <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <TenantFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editTenant={editTenant}
      />
    </div>
  );
}
