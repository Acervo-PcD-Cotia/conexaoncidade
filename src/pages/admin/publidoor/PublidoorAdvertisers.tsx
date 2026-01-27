import { useState } from "react";
import { Plus, Search, MoreHorizontal, Building2, MapPin, Phone, Globe, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePublidoorAdvertisers, useCreatePublidoorAdvertiser, useTogglePublidoorAdvertiserStatus, useDeletePublidoorAdvertiser } from "@/hooks/usePublidoor";
import { PublidoorAdvertiserFormData } from "@/types/publidoor";

export default function PublidoorAdvertisers() {
  const { data: advertisers, isLoading } = usePublidoorAdvertisers();
  const createMutation = useCreatePublidoorAdvertiser();
  const toggleStatusMutation = useTogglePublidoorAdvertiserStatus();
  const deleteMutation = useDeletePublidoorAdvertiser();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<PublidoorAdvertiserFormData>({
    company_name: "",
    neighborhood: "",
    city: "",
    category: "",
    whatsapp: "",
    website: "",
    google_maps_url: "",
    logo_url: "",
  });

  const filteredAdvertisers = advertisers?.filter((a) =>
    a.company_name.toLowerCase().includes(search.toLowerCase()) ||
    a.category?.toLowerCase().includes(search.toLowerCase()) ||
    a.neighborhood?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!formData.company_name) return;
    await createMutation.mutateAsync(formData);
    setDialogOpen(false);
    setFormData({
      company_name: "",
      neighborhood: "",
      city: "",
      category: "",
      whatsapp: "",
      website: "",
      google_maps_url: "",
      logo_url: "",
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    toggleStatusMutation.mutate({ id, status: newStatus });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Anunciantes</h1>
          <p className="text-muted-foreground">Cadastro e gestão de anunciantes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Anunciante
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Anunciante</DialogTitle>
              <DialogDescription>Cadastre um novo anunciante para o Publidoor</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nome da Empresa *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, neighborhood: e.target.value }))}
                    placeholder="Bairro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="Cidade"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="Ex: Restaurante, Loja, Serviços"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Site</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="google_maps_url">Link Google Maps</Label>
                <Input
                  id="google_maps_url"
                  type="url"
                  value={formData.google_maps_url || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, google_maps_url: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo_url">URL do Logo</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, logo_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                Cadastrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar anunciantes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : filteredAdvertisers?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum anunciante encontrado.</p>
            <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
              Cadastrar primeiro anunciante
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAdvertisers?.map((advertiser) => (
            <Card key={advertiser.id} className={advertiser.status === "inactive" ? "opacity-60" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={advertiser.logo_url || undefined} alt={advertiser.company_name} />
                      <AvatarFallback>{getInitials(advertiser.company_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{advertiser.company_name}</p>
                      {advertiser.category && (
                        <p className="text-sm text-muted-foreground">{advertiser.category}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleStatus(advertiser.id, advertiser.status)}>
                        {advertiser.status === "active" ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4" /> Desativar
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4" /> Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(advertiser.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  {(advertiser.neighborhood || advertiser.city) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {[advertiser.neighborhood, advertiser.city].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  {advertiser.whatsapp && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{advertiser.whatsapp}</span>
                    </div>
                  )}
                  {advertiser.website && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <a
                        href={advertiser.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline truncate"
                      >
                        {advertiser.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Badge variant={advertiser.status === "active" ? "default" : "secondary"}>
                    {advertiser.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
