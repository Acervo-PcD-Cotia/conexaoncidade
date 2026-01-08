import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, AlertTriangle, FolderTree, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CategoryForm {
  id?: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  parent_id: string;
}

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  parent_id: string | null;
  news_count: number;
  children?: CategoryWithCount[];
}

const defaultForm: CategoryForm = {
  name: "",
  slug: "",
  color: "#6B7280",
  icon: "",
  description: "",
  is_active: true,
  sort_order: 0,
  parent_id: "",
};

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function Categories() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CategoryForm>(defaultForm);
  const [deleteDialog, setDeleteDialog] = useState<{ 
    open: boolean; 
    category: CategoryWithCount | null; 
    targetCategoryId: string 
  }>({
    open: false,
    category: null,
    targetCategoryId: "",
  });
  const queryClient = useQueryClient();

  // Fetch categories with news count
  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data: cats, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;

      // Get news count for each category
      const categoriesWithCount: CategoryWithCount[] = await Promise.all(
        cats.map(async (cat) => {
          const { count } = await supabase
            .from("news")
            .select("*", { count: "exact", head: true })
            .eq("category_id", cat.id);
          return { ...cat, news_count: count || 0 };
        })
      );

      // Build tree structure
      const rootCategories: CategoryWithCount[] = [];
      const categoryMap = new Map<string, CategoryWithCount>();
      
      categoriesWithCount.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });

      categoriesWithCount.forEach(cat => {
        const category = categoryMap.get(cat.id)!;
        if (cat.parent_id && categoryMap.has(cat.parent_id)) {
          categoryMap.get(cat.parent_id)!.children!.push(category);
        } else {
          rootCategories.push(category);
        }
      });

      return { flat: categoriesWithCount, tree: rootCategories };
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: CategoryForm) => {
      const payload = {
        name: data.name,
        slug: data.slug,
        color: data.color,
        icon: data.icon || null,
        description: data.description || null,
        is_active: data.is_active,
        sort_order: data.sort_order,
        parent_id: data.parent_id || null,
      };

      if (data.id) {
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const maxOrder = Math.max(...(categories?.flat.map((c) => c.sort_order) || [0]), 0);
        const { error } = await supabase.from("categories").insert({
          ...payload,
          sort_order: maxOrder + 1,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria salva!");
      setOpen(false);
      setForm(defaultForm);
    },
    onError: (error) => {
      toast.error("Erro: " + (error as Error).message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, targetCategoryId }: { id: string; targetCategoryId?: string }) => {
      if (targetCategoryId) {
        const { error: reassignError } = await supabase
          .from("news")
          .update({ category_id: targetCategoryId })
          .eq("category_id", id);
        if (reassignError) throw reassignError;

        // Also move subcategories to target
        const { error: subError } = await supabase
          .from("categories")
          .update({ parent_id: targetCategoryId })
          .eq("parent_id", id);
        if (subError) throw subError;
      }

      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria excluída!");
      setDeleteDialog({ open: false, category: null, targetCategoryId: "" });
    },
    onError: () => {
      toast.error("Erro ao excluir categoria");
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("categories")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Visibilidade atualizada!");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      if (!categories) return;

      const flatList = categories.flat;
      const currentIndex = flatList.findIndex((c) => c.id === id);
      if (currentIndex === -1) return;

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= flatList.length) return;

      const currentCat = flatList[currentIndex];
      const targetCat = flatList[targetIndex];

      await supabase
        .from("categories")
        .update({ sort_order: targetCat.sort_order })
        .eq("id", currentCat.id);

      await supabase
        .from("categories")
        .update({ sort_order: currentCat.sort_order })
        .eq("id", targetCat.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => {
      toast.error("Erro ao reordenar");
    },
  });

  const handleEdit = (cat: CategoryWithCount) => {
    setForm({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      color: cat.color,
      icon: cat.icon || "",
      description: cat.description || "",
      is_active: cat.is_active,
      sort_order: cat.sort_order,
      parent_id: cat.parent_id || "",
    });
    setOpen(true);
  };

  const handleDelete = (cat: CategoryWithCount) => {
    const hasContentOrChildren = cat.news_count > 0 || (cat.children && cat.children.length > 0);
    if (hasContentOrChildren) {
      setDeleteDialog({ open: true, category: cat, targetCategoryId: "" });
    } else {
      if (confirm("Excluir categoria?")) {
        deleteMutation.mutate({ id: cat.id });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast.error("Nome e slug são obrigatórios");
      return;
    }
    saveMutation.mutate(form);
  };

  const renderCategoryRow = (cat: CategoryWithCount, index: number, level: number = 0) => {
    const flatList = categories?.flat || [];
    const isFirst = index === 0;
    const isLast = index === flatList.length - 1;

    return (
      <TableRow key={cat.id}>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => reorderMutation.mutate({ id: cat.id, direction: "up" })}
              disabled={isFirst}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => reorderMutation.mutate({ id: cat.id, direction: "down" })}
              disabled={isLast}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {level > 0 && (
              <span className="text-muted-foreground" style={{ marginLeft: level * 16 }}>
                └
              </span>
            )}
            <span className="font-medium">{cat.name}</span>
            {cat.parent_id && (
              <FolderTree className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground">/{cat.slug}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded"
              style={{ backgroundColor: cat.color }}
            />
            {cat.color}
          </div>
        </TableCell>
        <TableCell className="text-center">
          <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
            {cat.news_count}
          </span>
        </TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => toggleVisibility.mutate({ id: cat.id, is_active: !cat.is_active })}
            title={cat.is_active ? "Ocultar do menu" : "Mostrar no menu"}
          >
            {cat.is_active ? (
              <Eye className="h-4 w-4 text-green-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(cat)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => handleDelete(cat)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">Gerencie as categorias de notícias</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm(defaultForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{form.id ? "Editar" : "Nova"} Categoria</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      name,
                      slug: prev.id ? prev.slug : generateSlug(name),
                    }));
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="parent">Categoria Pai (subcategoria)</Label>
                <Select 
                  value={form.parent_id} 
                  onValueChange={(v) => setForm({ ...form, parent_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhuma (categoria raiz)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma (categoria raiz)</SelectItem>
                    {categories?.flat
                      .filter(c => c.id !== form.id && !c.parent_id)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="color">Cor</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="h-10 w-14 p-1"
                  />
                  <Input
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="icon">Ícone (nome Lucide)</Label>
                <Input
                  id="icon"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="newspaper"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição (para SEO)</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Breve descrição da categoria para mecanismos de busca..."
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
                <Label>Visível no menu público</Label>
              </div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Ordem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead className="text-center">Notícias</TableHead>
              <TableHead className="w-20">Visível</TableHead>
              <TableHead className="w-28"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : (
              categories?.flat.map((cat, index) => renderCategoryRow(cat, index, cat.parent_id ? 1 : 0))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, category: null, targetCategoryId: "" })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Categoria com conteúdo
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                A categoria <strong>"{deleteDialog.category?.name}"</strong> possui{" "}
                <strong>{deleteDialog.category?.news_count} notícias</strong>
                {deleteDialog.category?.children && deleteDialog.category.children.length > 0 && (
                  <> e <strong>{deleteDialog.category.children.length} subcategorias</strong></>
                )}.
              </p>
              <p>Para excluir, selecione uma categoria destino:</p>
              <Select
                value={deleteDialog.targetCategoryId}
                onValueChange={(value) =>
                  setDeleteDialog((prev) => ({ ...prev, targetCategoryId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria destino" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.flat
                    ?.filter((c) => c.id !== deleteDialog.category?.id)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={!deleteDialog.targetCategoryId || deleteMutation.isPending}
              onClick={() => {
                if (deleteDialog.category && deleteDialog.targetCategoryId) {
                  deleteMutation.mutate({
                    id: deleteDialog.category.id,
                    targetCategoryId: deleteDialog.targetCategoryId,
                  });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir e mover conteúdo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
