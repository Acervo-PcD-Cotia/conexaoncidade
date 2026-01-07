import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function QuickNotesAdmin() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [newNote, setNewNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Fetch quick notes
  const { data: notes, isLoading } = useQuery({
    queryKey: ["admin-quick-notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quick_notes")
        .select("*, categories(name, color)")
        .order("created_at", { ascending: false })
        .limit(50);
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

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("quick_notes").insert({
        title: newNote,
        category_id: selectedCategory || null,
        author_id: user?.id,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quick-notes"] });
      setNewNote("");
      toast.success("Nota publicada!");
    },
    onError: (error) => {
      toast.error("Erro: " + (error as Error).message);
    },
  });

  // Toggle mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("quick_notes")
        .update({ is_active: !is_active })
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8 text-yellow-500" />
          Notas Rápidas
        </h1>
        <p className="text-muted-foreground">
          Publicação instantânea de notas curtas
        </p>
      </div>

      {/* Quick Add Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nova Nota</CardTitle>
          <CardDescription>
            Digite o título e publique em 1 clique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Digite a nota rápida..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
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
            <Button type="submit" disabled={createMutation.isPending || !newNote.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Publicar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card>
        <CardHeader>
          <CardTitle>Notas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Carregando...</div>
          ) : notes?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma nota ainda. Crie a primeira acima!
            </div>
          ) : (
            <div className="space-y-2">
              {notes?.map((note) => (
                <div
                  key={note.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    note.is_active ? "" : "opacity-50"
                  }`}
                >
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
                  <div className="flex-1">
                    <p className="text-sm font-medium">{note.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {note.categories && (
                        <span
                          className="inline-block rounded px-1.5 py-0.5"
                          style={{ backgroundColor: `${note.categories.color}20`, color: note.categories.color }}
                        >
                          {note.categories.name}
                        </span>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
