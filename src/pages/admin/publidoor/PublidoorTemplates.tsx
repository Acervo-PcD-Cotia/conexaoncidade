import { useState } from "react";
import { Palette, Check, Sparkles, Type, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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
  usePublidoorTemplates, 
  useCreatePublidoorTemplate, 
  useUpdatePublidoorTemplate, 
  useDeletePublidoorTemplate,
  useTogglePublidoorTemplateStatus
} from "@/hooks/usePublidoor";
import type { PublidoorTemplate, PublidoorColorPalette } from "@/types/publidoor";

const defaultFormData = {
  name: "",
  slug: "",
  description: "",
  font_family: "Inter",
  font_size: "medium" as "small" | "medium" | "large",
  color_palette: {
    primary: "#1a1a2e",
    secondary: "#ffffff",
    accent: "#3b82f6",
  } as PublidoorColorPalette,
  has_animations: false,
  is_active: true,
};

export default function PublidoorTemplates() {
  const { data: templates, isLoading } = usePublidoorTemplates(false);
  const createTemplate = useCreatePublidoorTemplate();
  const updateTemplate = useUpdatePublidoorTemplate();
  const deleteTemplate = useDeletePublidoorTemplate();
  const toggleStatus = useTogglePublidoorTemplateStatus();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  const handleOpenCreate = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (template: PublidoorTemplate) => {
    setFormData({
      name: template.name,
      slug: template.slug,
      description: template.description || "",
      font_family: template.font_family,
      font_size: template.font_size as "small" | "medium" | "large",
      color_palette: template.color_palette || defaultFormData.color_palette,
      has_animations: template.has_animations,
      is_active: template.is_active,
    });
    setEditingId(template.id);
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateTemplate.mutateAsync({ id: editingId, ...formData });
    } else {
      await createTemplate.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteTemplate.mutateAsync(deletingId);
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

  const updateColorPalette = (key: keyof PublidoorColorPalette, value: string) => {
    setFormData(prev => ({
      ...prev,
      color_palette: {
        ...prev.color_palette,
        [key]: value,
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modelos & Estilos</h1>
          <p className="text-muted-foreground">
            Templates visuais reutilizáveis para seus Publidoors
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates?.map((template) => (
            <Card key={template.id} className={!template.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    {template.has_animations && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        <Sparkles className="mr-1 h-3 w-3" />
                        Animado
                      </Badge>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(template)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleOpenDelete(template.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {template.description && (
                  <CardDescription>{template.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Color Preview */}
                <div>
                  <p className="text-sm font-medium mb-2">Paleta de Cores</p>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: template.color_palette?.primary || '#000' }}
                      />
                      <span className="text-xs text-muted-foreground">Primária</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: template.color_palette?.secondary || '#fff' }}
                      />
                      <span className="text-xs text-muted-foreground">Secundária</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: template.color_palette?.accent || '#3b82f6' }}
                      />
                      <span className="text-xs text-muted-foreground">Destaque</span>
                    </div>
                  </div>
                </div>

                {/* Typography */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-muted-foreground" />
                    <span>{template.font_family}</span>
                  </div>
                  <Badge variant="outline">{template.font_size}</Badge>
                </div>

                {/* Preview Area */}
                <div
                  className="rounded-lg p-4 min-h-[100px] flex items-center justify-center"
                  style={{
                    backgroundColor: template.color_palette?.primary || '#000',
                    color: template.color_palette?.secondary || '#fff',
                    fontFamily: template.font_family,
                  }}
                >
                  <div className="text-center">
                    <p className="font-bold">Exemplo de Título</p>
                    <p className="text-sm opacity-80">Subtítulo do Publidoor</p>
                    <button
                      className="mt-2 px-3 py-1 rounded text-sm font-medium"
                      style={{
                        backgroundColor: template.color_palette?.accent || '#3b82f6',
                        color: template.color_palette?.secondary || '#fff',
                      }}
                    >
                      Saiba mais
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {template.slug}
                  </code>
                  <Switch 
                    checked={template.is_active} 
                    onCheckedChange={() => handleToggleActive(template.id, template.is_active)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && templates?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhum template cadastrado</p>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Template" : "Novo Template"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize o template visual" : "Configure um novo template para Publidoors"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="Ex: Outdoor Urbano"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="outdoor-urbano"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o estilo visual..."
                rows={2}
              />
            </div>
            
            {/* Typography */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fonte</Label>
                <Select
                  value={formData.font_family}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, font_family: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Plus Jakarta Sans">Plus Jakarta Sans</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="system-ui">System UI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tamanho</Label>
                <Select
                  value={formData.font_size}
                  onValueChange={(value: "small" | "medium" | "large") => 
                    setFormData(prev => ({ ...prev, font_size: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeno</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Colors */}
            <div>
              <Label className="mb-2 block">Paleta de Cores</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.color_palette.primary}
                      onChange={(e) => updateColorPalette("primary", e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.color_palette.primary}
                      onChange={(e) => updateColorPalette("primary", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.color_palette.secondary}
                      onChange={(e) => updateColorPalette("secondary", e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.color_palette.secondary}
                      onChange={(e) => updateColorPalette("secondary", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Destaque</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.color_palette.accent}
                      onChange={(e) => updateColorPalette("accent", e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.color_palette.accent}
                      onChange={(e) => updateColorPalette("accent", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <Label className="mb-2 block">Preview</Label>
              <div
                className="rounded-lg p-4 min-h-[80px] flex items-center justify-center"
                style={{
                  backgroundColor: formData.color_palette.primary,
                  color: formData.color_palette.secondary,
                  fontFamily: formData.font_family,
                }}
              >
                <div className="text-center">
                  <p className="font-bold">Título de Exemplo</p>
                  <button
                    className="mt-2 px-3 py-1 rounded text-sm font-medium"
                    style={{
                      backgroundColor: formData.color_palette.accent,
                      color: formData.color_palette.secondary,
                    }}
                  >
                    CTA
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Animações</Label>
              <Switch
                checked={formData.has_animations}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_animations: checked }))}
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
              disabled={createTemplate.isPending || updateTemplate.isPending || !formData.name || !formData.slug}
            >
              {(createTemplate.isPending || updateTemplate.isPending) && (
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
            <AlertDialogTitle>Excluir Template</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {deleteTemplate.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}