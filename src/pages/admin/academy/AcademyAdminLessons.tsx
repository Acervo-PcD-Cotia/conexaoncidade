import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus, Pencil, Trash2, GripVertical, ArrowLeft, Play, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  useAcademyLessons,
  useCreateAcademyLesson,
  useUpdateAcademyLesson,
  useDeleteAcademyLesson,
} from "@/hooks/useAcademy";
import type { AcademyLesson, AcademyLessonFormData, AcademyExternalLink } from "@/types/academy";

export default function AcademyAdminLessons() {
  const { id: courseId } = useParams<{ id: string }>();
  const { data: lessons, isLoading } = useAcademyLessons(courseId || "");
  const createLesson = useCreateAcademyLesson();
  const updateLesson = useUpdateAcademyLesson();
  const deleteLesson = useDeleteAcademyLesson();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<AcademyLesson | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<AcademyLessonFormData>({
    course_id: courseId || "",
    title: "",
    description: "",
    content_html: "",
    video_embed: "",
    external_links: [],
    duration_minutes: 0,
    is_published: false,
  });

  const [newLink, setNewLink] = useState({ label: "", url: "" });

  const openCreateDialog = () => {
    setEditingLesson(null);
    setFormData({
      course_id: courseId || "",
      title: "",
      description: "",
      content_html: "",
      video_embed: "",
      external_links: [],
      duration_minutes: 0,
      is_published: false,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (lesson: AcademyLesson) => {
    setEditingLesson(lesson);
    setFormData({
      course_id: lesson.course_id,
      title: lesson.title,
      description: lesson.description || "",
      content_html: lesson.content_html || "",
      video_embed: lesson.video_embed || "",
      external_links: lesson.external_links || [],
      duration_minutes: lesson.duration_minutes,
      is_published: lesson.is_published,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingLesson) {
      await updateLesson.mutateAsync({ id: editingLesson.id, ...formData });
    } else {
      await createLesson.mutateAsync({
        ...formData,
        sort_order: (lessons?.length || 0) + 1,
      } as AcademyLessonFormData & { sort_order: number });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId && courseId) {
      await deleteLesson.mutateAsync({ id: deleteId, courseId });
      setDeleteId(null);
    }
  };

  const addLink = () => {
    if (newLink.label && newLink.url) {
      setFormData({
        ...formData,
        external_links: [...formData.external_links, newLink],
      });
      setNewLink({ label: "", url: "" });
    }
  };

  const removeLink = (index: number) => {
    setFormData({
      ...formData,
      external_links: formData.external_links.filter((_, i) => i !== index),
    });
  };

  if (!courseId) {
    return (
      <div className="container py-8 text-center">
        <p>Curso não encontrado</p>
      </div>
    );
  }

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/spah/painel/academy/admin/cursos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Aulas do Curso</h1>
            <p className="text-sm text-muted-foreground">
              {lessons?.length || 0} {(lessons?.length || 0) === 1 ? "aula" : "aulas"}
            </p>
          </div>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Aula
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : lessons && lessons.length > 0 ? (
        <div className="space-y-2">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="flex items-center gap-4 p-4 rounded-lg border bg-card"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab shrink-0" />

              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{lesson.title}</h3>
                  {lesson.video_embed && (
                    <Play className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>
                {lesson.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {lesson.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {lesson.duration_minutes > 0 && (
                  <Badge variant="secondary">{lesson.duration_minutes} min</Badge>
                )}
                {lesson.is_published ? (
                  <Badge variant="default">
                    <Eye className="h-3 w-3 mr-1" />
                    Publicada
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Rascunho
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(lesson)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(lesson.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Play className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <h2 className="text-xl font-semibold mb-2">Nenhuma aula</h2>
          <p>Crie a primeira aula deste curso</p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? "Editar Aula" : "Nova Aula"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Introdução à operação"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição breve da aula"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="video_embed">Código de Incorporação do Vídeo</Label>
              <Textarea
                id="video_embed"
                value={formData.video_embed}
                onChange={(e) => setFormData({ ...formData, video_embed: e.target.value })}
                placeholder='<iframe src="https://www.youtube.com/embed/..." ...></iframe>'
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Cole o código iframe do YouTube, Vimeo, Google Drive ou outro player
              </p>
            </div>

            <div>
              <Label htmlFor="content_html">Conteúdo em Texto (HTML)</Label>
              <Textarea
                id="content_html"
                value={formData.content_html}
                onChange={(e) => setFormData({ ...formData, content_html: e.target.value })}
                placeholder="<p>Conteúdo da aula...</p>"
                rows={5}
              />
            </div>

            <div>
              <Label>Links Externos</Label>
              <div className="space-y-2 mt-2">
                {formData.external_links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded border bg-muted/50">
                    <span className="flex-1 truncate text-sm">{link.label}: {link.url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLink(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Rótulo"
                    value={newLink.label}
                    onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                  />
                  <Input
                    placeholder="URL"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  />
                  <Button type="button" variant="outline" onClick={addLink}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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

            <div className="flex items-center gap-2">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_published: checked })
                }
              />
              <Label htmlFor="is_published">Publicar aula</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createLesson.isPending || updateLesson.isPending}
            >
              {editingLesson ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aula?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O progresso dos usuários nesta aula será perdido.
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
