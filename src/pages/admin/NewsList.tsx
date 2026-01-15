import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Edit, Trash2, MoreHorizontal, Copy, Bot, FileEdit, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNewsCreationModal } from "@/contexts/NewsCreationModalContext";

export default function NewsList() {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { openModal } = useNewsCreationModal();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("news")
        .delete()
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast.success(`${selectedIds.size} notícia(s) excluída(s) com sucesso`);
      setSelectedIds(new Set());
    },
    onError: () => {
      toast.error("Erro ao excluir notícias");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: original, error: fetchError } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !original) throw new Error("Notícia não encontrada");

      const timestamp = Date.now();
      const newSlug = `${original.slug}-copia-${timestamp}`;
      
      const { data: duplicated, error: insertError } = await supabase
        .from("news")
        .insert({
          title: `[CÓPIA] ${original.title}`,
          subtitle: original.subtitle,
          hat: original.hat,
          slug: newSlug,
          excerpt: original.excerpt,
          content: original.content,
          source: original.source,
          featured_image_url: original.featured_image_url,
          card_image_url: original.card_image_url,
          image_alt: original.image_alt,
          image_credit: original.image_credit,
          category_id: original.category_id,
          status: "draft",
          highlight: "none",
          meta_title: original.meta_title,
          meta_description: original.meta_description,
          origin: original.origin,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const { data: originalTags } = await supabase
        .from("news_tags")
        .select("tag_id")
        .eq("news_id", id);

      if (originalTags && originalTags.length > 0) {
        await supabase.from("news_tags").insert(
          originalTags.map((t) => ({
            news_id: duplicated.id,
            tag_id: t.tag_id,
          }))
        );
      }

      return duplicated;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast.success("Notícia duplicada! Redirecionando para edição...");
      navigate(`/admin/news/${data.id}/edit`);
    },
    onError: (error) => {
      toast.error("Erro ao duplicar: " + (error as Error).message);
    },
  });

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === news?.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(news?.map(n => n.id)));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Tem certeza que deseja excluir ${selectedIds.size} notícia(s)?`)) {
      bulkDeleteMutation.mutate([...selectedIds]);
    }
  };

  const statusColors: Record<string, string> = {
    published: "bg-green-100 text-green-700",
    draft: "bg-yellow-100 text-yellow-700",
    scheduled: "bg-blue-100 text-blue-700",
    archived: "bg-gray-100 text-gray-700",
    review: "bg-orange-100 text-orange-700",
    approved: "bg-emerald-100 text-emerald-700",
    trash: "bg-red-100 text-red-700",
  };

  const statusLabels: Record<string, string> = {
    published: "Publicado",
    draft: "Rascunho",
    scheduled: "Agendado",
    archived: "Arquivado",
    review: "Em Revisão",
    approved: "Aprovado",
    trash: "Lixeira",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Notícias</h1>
          <p className="text-muted-foreground">Gerencie todas as notícias do portal</p>
        </div>
        <Button onClick={openModal}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Notícia
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

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg border">
          <span className="font-medium">
            {selectedIds.size} notícia(s) selecionada(s)
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={bulkDeleteMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir selecionadas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(new Set())}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={news?.length ? selectedIds.size === news.length : false}
                  onCheckedChange={toggleAll}
                  aria-label="Selecionar todas"
                />
              </TableHead>
              <TableHead className="w-[35%]">Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : news?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Nenhuma notícia encontrada
                </TableCell>
              </TableRow>
            ) : (
              news?.map((item) => (
                <TableRow key={item.id} className={selectedIds.has(item.id) ? "bg-muted/50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleSelection(item.id)}
                      aria-label={`Selecionar ${item.title}`}
                    />
                  </TableCell>
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
                    {(item as any).origin === 'ai' ? (
                      <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                        <Bot className="mr-1 h-3 w-3" />
                        AI
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <FileEdit className="mr-1 h-3 w-3" />
                        Manual
                      </Badge>
                    )}
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
                          onClick={() => duplicateMutation.mutate(item.id)}
                          disabled={duplicateMutation.isPending}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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
