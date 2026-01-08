import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, Plus, Trash2, ToggleLeft, ToggleRight, Edit, Clock, Calendar, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NoteForm {
  id?: string;
  title: string;
  category_id: string;
  status: string;
  scheduled_at: string;
}

const defaultForm: NoteForm = {
  title: "",
  category_id: "",
  status: "published",
  scheduled_at: "",
};

export default function QuickNotesAdmin() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<NoteForm>(defaultForm);
  const isEditing = !!form.id;

  // Fetch quick notes
  const { data: notes, isLoading } = useQuery({
    queryKey: ["admin-quick-notes", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("quick_notes")
        .select("*, categories(name, color)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Save mutation (create/update)
  const saveMutation = useMutation({
    mutationFn: async (data: NoteForm) => {
      const payload = {
        title: data.title,
        category_id: data.category_id || null,
        status: data.status,
        scheduled_at: data.status === "scheduled" && data.scheduled_at 
          ? new Date(data.scheduled_at).toISOString() 
          : null,
        is_active: data.status === "published",
        author_id: user?.id,
      };

      if (data.id) {
        const { error } = await supabase
          .from("quick_notes")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("quick_notes").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quick-notes"] });
      setOpen(false);
      setForm(defaultForm);
      toast.success(isEditing ? "Nota atualizada!" : "Nota criada!");
    },
    onError: (error) => {
      toast.error("Erro: " + (error as Error).message);
    },
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("quick_notes")
        .update({ 
          is_active: !is_active,
          status: !is_active ? "published" : "draft"
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quick-notes"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quick_notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quick-notes"] });
      toast.success("Nota excluída!");
    },
  });

  const handleEdit = (note: NonNullable<typeof notes>[number]) => {
    setForm({
      id: note.id,
      title: note.title,
      category_id: note.category_id || "",
      status: note.status || (note.is_active ? "published" : "draft"),
      scheduled_at: note.scheduled_at ? new Date(note.scheduled_at).toISOString().slice(0, 16) : "",
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    if (form.title.length > 280) {
      toast.error("Título deve ter no máximo 280 caracteres");
      return;
    }
    saveMutation.mutate(form);
  };

  const getStatusBadge = (note: NonNullable<typeof notes>[number]) => {
    const status = note.status || (note.is_active ? "published" : "draft");
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Publicado</Badge>;
      case "scheduled":
        return <Badge variant="outline">Agendado</Badge>;
      case "draft":
        return <Badge variant="secondary">Rascunho</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            Notas Rápidas
          </h1>
          <p className="text-muted-foreground">
            Publicação instantânea de notas curtas
          </p>
        </div>
        <Button onClick={() => { setForm(defaultForm); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Nota
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar notas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{notes?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total de notas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {notes?.filter(n => n.is_active).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Publicadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">
              {notes?.filter(n => n.status === "scheduled").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Agendadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-muted-foreground">
              {notes?.filter(n => !n.is_active && n.status !== "scheduled").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Rascunhos</p>
          </CardContent>
        </Card>
      </div>

      {/* Notes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Notas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Carregando...</div>
          ) : notes?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma nota encontrada. Crie a primeira!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-28"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes?.map((note) => (
                  <TableRow key={note.id} className={!note.is_active ? "opacity-60" : ""}>
                    <TableCell>
                      <button
                        onClick={() => toggleMutation.mutate({ id: note.id, is_active: note.is_active })}
                        className="text-muted-foreground hover:text-primary"
                        title={note.is_active ? "Desativar" : "Ativar"}
                      >
                        {note.is_active ? (
                          <ToggleRight className="h-5 w-5 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium line-clamp-1">{note.title}</p>
                    </TableCell>
                    <TableCell>
                      {note.categories ? (
                        <span
                          className="inline-block rounded px-2 py-0.5 text-xs"
                          style={{ 
                            backgroundColor: `${note.categories.color}20`, 
                            color: note.categories.color 
                          }}
                        >
                          {note.categories.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(note)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: ptBR })}
                      </div>
                      {note.scheduled_at && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(note.scheduled_at), "dd/MM HH:mm", { locale: ptBR })}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(note)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm("Excluir nota?")) {
                              deleteMutation.mutate(note.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Nota" : "Nova Nota Rápida"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">
                Título * <span className="text-xs text-muted-foreground">({form.title.length}/280)</span>
              </Label>
              <Textarea
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Digite a nota rápida..."
                className="resize-none"
                rows={3}
                maxLength={280}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Categoria</Label>
                <Select 
                  value={form.category_id} 
                  onValueChange={(v) => setForm({ ...form, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem categoria</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select 
                  value={form.status} 
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.status === "scheduled" && (
              <div>
                <Label htmlFor="scheduled_at">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Agendar para
                </Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : isEditing ? "Atualizar" : "Publicar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
