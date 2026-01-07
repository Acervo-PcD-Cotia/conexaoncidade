import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function NewsList() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: news, isLoading } = useQuery({
    queryKey: ["admin-news", search],
    queryFn: async () => {
      let query = supabase
        .from("news")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast.success("Notícia excluída com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir notícia");
    },
  });

  const statusColors: Record<string, string> = {
    published: "bg-green-100 text-green-700",
    draft: "bg-yellow-100 text-yellow-700",
    scheduled: "bg-blue-100 text-blue-700",
    archived: "bg-gray-100 text-gray-700",
  };

  const statusLabels: Record<string, string> = {
    published: "Publicado",
    draft: "Rascunho",
    scheduled: "Agendado",
    archived: "Arquivado",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Notícias</h1>
          <p className="text-muted-foreground">Gerencie todas as notícias do portal</p>
        </div>
        <Button asChild>
          <Link to="/admin/news/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Notícia
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar notícias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : news?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Nenhuma notícia encontrada
                </TableCell>
              </TableRow>
            ) : (
              news?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium line-clamp-1">{item.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      /{item.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.categories?.name || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[item.status] || ""}
                    >
                      {statusLabels[item.status] || item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {item.view_count}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.published_at
                      ? new Date(item.published_at).toLocaleDateString("pt-BR")
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
                        <DropdownMenuItem asChild>
                          <Link to={`/noticia/${item.slug}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/news/${item.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir?")) {
                              deleteMutation.mutate(item.id);
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
