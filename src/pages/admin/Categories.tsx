import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  news_count: number;
}

const defaultForm: CategoryForm = {
  name: "",
  slug: "",
  color: "#6B7280",
  icon: "",
  description: "",
  is_active: true,
  sort_order: 0,
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
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; category: CategoryWithCount | null; targetCategoryId: string }>({
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

      return categoriesWithCount;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: CategoryForm) => {
      if (data.id) {
        const { error } = await supabase
          .from("categories")
          .update({
            name: data.name,
            slug: data.slug,
            color: data.color,
            icon: data.icon,
            description: data.description,
            is_active: data.is_active,
            sort_order: data.sort_order,
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        // Get max sort_order for new categories
        const maxOrder = Math.max(...(categories?.map((c) => c.sort_order) || [0]), 0);
        const { error } = await supabase.from("categories").insert({
          name: data.name,
          slug: data.slug,
          color: data.color,
          icon: data.icon,
          description: data.description,
          is_active: data.is_active,
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
      // If there are news, reassign them first
      if (targetCategoryId) {
        const { error: reassignError } = await supabase
          .from("news")
          .update({ category_id: targetCategoryId })
          .eq("category_id", id);
        if (reassignError) throw reassignError;
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

  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      if (!categories) return;

      const currentIndex = categories.findIndex((c) => c.id === id);
      if (currentIndex === -1) return;

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= categories.length) return;

      const currentCat = categories[currentIndex];
      const targetCat = categories[targetIndex];

      // Swap sort_order values
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
    });
    setOpen(true);
  };

  const handleDelete = (cat: CategoryWithCount) => {
    if (cat.news_count > 0) {
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
          <DialogContent>
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
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
                <Label>Ativa (visível no menu)</Label>
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
              <TableHead>Status</TableHead>
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
              categories?.map((cat, index) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => reorderMutation.mutate({ id: cat.id, direction: "up" })}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => reorderMutation.mutate({ id: cat.id, direction: "down" })}
                        disabled={index === categories.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
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
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        cat.is_active
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {cat.is_active ? "Ativa" : "Oculta"}
                    </span>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog for categories with news */}
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
              Categoria com notícias
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                A categoria <strong>"{deleteDialog.category?.name}"</strong> possui{" "}
                <strong>{deleteDialog.category?.news_count} notícias</strong>.
              </p>
              <p>Para excluir, selecione uma categoria destino para as notícias:</p>
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
                  {categories
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
              {deleteMutation.isPending ? "Excluindo..." : "Excluir e mover notícias"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
