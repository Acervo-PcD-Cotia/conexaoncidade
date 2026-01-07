import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Eye, Edit, Trash2, MoreHorizontal, PlaySquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function StoriesList() {
  const queryClient = useQueryClient();

  const { data: stories, isLoading } = useQuery({
    queryKey: ["admin-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("web_stories")
        .select("*, web_story_slides(id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map((s) => ({
        ...s,
        slides_count: s.web_story_slides?.length || 0,
      }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Delete slides first
      await supabase.from("web_story_slides").delete().eq("story_id", id);
      const { error } = await supabase.from("web_stories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
      toast.success("Story excluída!");
    },
    onError: () => {
      toast.error("Erro ao excluir story");
    },
  });

  const statusColors: Record<string, string> = {
    published: "bg-green-100 text-green-700",
    draft: "bg-yellow-100 text-yellow-700",
    archived: "bg-gray-100 text-gray-700",
  };

  const statusLabels: Record<string, string> = {
    published: "Publicada",
    draft: "Rascunho",
    archived: "Arquivada",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Web Stories</h1>
          <p className="text-muted-foreground">Gerencie as stories do portal</p>
        </div>
        <Button asChild>
          <Link to="/admin/stories/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Story
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Cover</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Slides</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : stories?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  Nenhuma story encontrada
                </TableCell>
              </TableRow>
            ) : (
              stories?.map((story) => (
                <TableRow key={story.id}>
                  <TableCell>
                    <div className="h-12 w-12 overflow-hidden rounded-lg border">
                      {story.cover_image_url ? (
                        <img
                          src={story.cover_image_url}
                          alt={story.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <PlaySquare className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{story.title}</div>
                    <div className="text-sm text-muted-foreground">
                      /{story.slug}
                    </div>
                  </TableCell>
                  <TableCell>{story.slides_count} slides</TableCell>
                  <TableCell>
                    <Badge className={statusColors[story.status] || ""}>
                      {statusLabels[story.status] || story.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {story.view_count}
                    </span>
                  </TableCell>
                  <TableCell>
                    {story.published_at
                      ? new Date(story.published_at).toLocaleDateString("pt-BR")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {story.status === "published" && (
                          <DropdownMenuItem asChild>
                            <Link to={`/stories/${story.slug}`} target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/stories/${story.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Excluir story e todos os slides?")) {
                              deleteMutation.mutate(story.id);
                            }
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
