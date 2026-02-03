import { useState } from "react";
import { MapPin, Monitor, Smartphone, Star, RotateCcw, Check, X, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  usePublidoorLocations, 
  useCreatePublidoorLocation, 
  useUpdatePublidoorLocation, 
  useDeletePublidoorLocation,
  useTogglePublidoorLocationStatus
} from "@/hooks/usePublidoor";
import type { PublidoorLocation } from "@/types/publidoor";

const defaultFormData = {
  name: "",
  slug: "",
  description: "",
  device_target: "all" as "desktop" | "mobile" | "all",
  max_items: 1,
  is_premium: false,
  allows_rotation: true,
  is_active: true,
};

export default function PublidoorLocations() {
  const { data: locations, isLoading } = usePublidoorLocations(false);
  const createLocation = useCreatePublidoorLocation();
  const updateLocation = useUpdatePublidoorLocation();
  const deleteLocation = useDeletePublidoorLocation();
  const toggleStatus = useTogglePublidoorLocationStatus();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "desktop":
        return <Monitor className="h-4 w-4" />;
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      default:
        return (
          <div className="flex gap-1">
            <Monitor className="h-4 w-4" />
            <Smartphone className="h-4 w-4" />
          </div>
        );
    }
  };

  const handleOpenCreate = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (location: PublidoorLocation) => {
    setFormData({
      name: location.name,
      slug: location.slug,
      description: location.description || "",
      device_target: location.device_target,
      max_items: location.max_items,
      is_premium: location.is_premium,
      allows_rotation: location.allows_rotation,
      is_active: location.is_active,
    });
    setEditingId(location.id);
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateLocation.mutateAsync({ id: editingId, ...formData });
    } else {
      await createLocation.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteLocation.mutateAsync(deletingId);
      setIsDeleteOpen(false);
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await toggleStatus.mutateAsync({ id, is_active: !currentStatus });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locais de Exibição</h1>
          <p className="text-muted-foreground">
            Gerencie onde os Publidoors podem aparecer no portal
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Local
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations?.map((location) => (
            <Card key={location.id} className={!location.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    {location.is_premium && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                        <Star className="mr-1 h-3 w-3" />
                        Premium
                      </Badge>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(location)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleOpenDelete(location.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {location.description && (
                  <CardDescription>{location.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dispositivo</span>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(location.device_target)}
                      <span className="capitalize">{location.device_target === "all" ? "Todos" : location.device_target}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Máx. Publidoors</span>
                    <span className="font-medium">{location.max_items}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Rotação</span>
                    <div className="flex items-center gap-1">
                      {location.allows_rotation ? (
                        <>
                          <RotateCcw className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Permitida</span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Fixa</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Ativo</span>
                    <Switch 
                      checked={location.is_active} 
                      onCheckedChange={() => handleToggleActive(location.id, location.is_active)}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t">
                  <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {location.slug}
                  </code>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && locations?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhum local cadastrado</p>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Local
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Local" : "Novo Local"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize os dados do local de exibição" : "Configure um novo local de exibição para Publidoors"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    name,
                    slug: !editingId ? generateSlug(name) : prev.slug
                  }));
                }}
                placeholder="Ex: Banner Principal Home"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="banner-principal-home"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva onde este local aparece..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dispositivo</Label>
                <Select
                  value={formData.device_target}
                  onValueChange={(value: "desktop" | "mobile" | "all") => 
                    setFormData(prev => ({ ...prev, device_target: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Máx. Publidoors</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.max_items}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_items: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Local Premium</Label>
              <Switch
                checked={formData.is_premium}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_premium: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Permite Rotação</Label>
              <Switch
                checked={formData.allows_rotation}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allows_rotation: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleSubmit}
              disabled={createLocation.isPending || updateLocation.isPending || !formData.name || !formData.slug}
            >
              {(createLocation.isPending || updateLocation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Local</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este local? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {deleteLocation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}