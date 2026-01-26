import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, BookOpen, Eye, EyeOff, Loader2, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  useAcademyCategories,
  useAcademyCourses,
  useCreateAcademyCourse,
  useUpdateAcademyCourse,
  useDeleteAcademyCourse,
} from "@/hooks/useAcademy";
import type { AcademyCourse, AcademyCourseFormData } from "@/types/academy";

const visibilityOptions = [
  { value: "all", label: "Todos", icon: Eye },
  { value: "partners", label: "Parceiros", icon: Users },
  { value: "admin", label: "Administradores", icon: Shield },
];

export default function AcademyAdminCourses() {
  const { data: categories } = useAcademyCategories();
  const { data: courses, isLoading } = useAcademyCourses();
  const createCourse = useCreateAcademyCourse();
  const updateCourse = useUpdateAcademyCourse();
  const deleteCourse = useDeleteAcademyCourse();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AcademyCourse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<AcademyCourseFormData>({
    title: "",
    slug: "",
    description: "",
    cover_url: "",
    instructor_name: "",
    duration_minutes: 0,
    visibility: "all",
    is_published: false,
  });

  const openCreateDialog = () => {
    setEditingCourse(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      cover_url: "",
      instructor_name: "",
      duration_minutes: 0,
      visibility: "all",
      is_published: false,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (course: AcademyCourse) => {
    setEditingCourse(course);
    setFormData({
      category_id: course.category_id || undefined,
      title: course.title,
      slug: course.slug,
      description: course.description || "",
      cover_url: course.cover_url || "",
      instructor_name: course.instructor_name || "",
      duration_minutes: course.duration_minutes,
      visibility: course.visibility,
      is_published: course.is_published,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingCourse) {
      await updateCourse.mutateAsync({ id: editingCourse.id, ...formData });
    } else {
      await createCourse.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCourse.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const getVisibilityBadge = (visibility: string) => {
    const option = visibilityOptions.find((o) => o.value === visibility);
    if (!option) return null;

    return (
      <Badge variant="outline" className="gap-1">
        <option.icon className="h-3 w-3" />
        {option.label}
      </Badge>
    );
  };

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cursos do Academy</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie os cursos e treinamentos
            </p>
          </div>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Curso
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="grid gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center gap-4 p-4 rounded-lg border bg-card"
            >
              {course.cover_url ? (
                <img
                  src={course.cover_url}
                  alt={course.title}
                  className="w-24 h-14 object-cover rounded"
                />
              ) : (
                <div className="w-24 h-14 bg-muted rounded flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{course.title}</h3>
                  {course.is_published ? (
                    <Badge variant="default" className="shrink-0">Publicado</Badge>
                  ) : (
                    <Badge variant="secondary" className="shrink-0">Rascunho</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {course.description || "Sem descrição"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {course.category && (
                    <Badge variant="outline" className="text-xs">
                      {course.category.name}
                    </Badge>
                  )}
                  {getVisibilityBadge(course.visibility)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/academy/admin/cursos/${course.id}/aulas`}>
                    Aulas
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(course)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(course.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <h2 className="text-xl font-semibold mb-2">Nenhum curso</h2>
          <p>Crie o primeiro curso do Academy</p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "Editar Curso" : "Novo Curso"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    title: e.target.value,
                    slug: editingCourse ? formData.slug : generateSlug(e.target.value),
                  });
                }}
                placeholder="Ex: Operação de Rádio Web"
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Ex: operacao-radio-web"
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category_id || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value === "none" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do curso"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="cover_url">URL da Capa</Label>
              <Input
                id="cover_url"
                value={formData.cover_url}
                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="instructor_name">Instrutor</Label>
              <Input
                id="instructor_name"
                value={formData.instructor_name}
                onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                placeholder="Nome do instrutor"
              />
            </div>

            <div>
              <Label htmlFor="duration_minutes">Duração (minutos)</Label>
              <Input
                id="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })
                }
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="visibility">Visibilidade</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) =>
                  setFormData({ ...formData, visibility: value as "all" | "partners" | "admin" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_published: checked })
                }
              />
              <Label htmlFor="is_published">Publicar curso</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createCourse.isPending || updateCourse.isPending}
            >
              {editingCourse ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir curso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as aulas deste curso serão excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
