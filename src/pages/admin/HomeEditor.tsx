import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Home, Save, GripVertical, X, Plus, Search, Trash2, Settings2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
}

interface HomeBlock {
  id: string;
  block_name: string;
  block_type: string;
  title: string | null;
  category_id: string | null;
  tag_id: string | null;
  item_count: number;
  is_active: boolean;
  sort_order: number;
  news_ids: string[] | null;
}

const BLOCK_TYPES = [
  { value: "curated", label: "Curadoria Manual", description: "Selecione notícias específicas" },
  { value: "most_read", label: "Mais Lidas", description: "Notícias mais acessadas" },
  { value: "quick_notes", label: "Notas Rápidas", description: "Exibe notas rápidas" },
  { value: "category", label: "Por Categoria", description: "Notícias de uma categoria" },
  { value: "tag", label: "Por Tag", description: "Notícias de uma tag específica" },
  { value: "latest", label: "Últimas Notícias", description: "Notícias mais recentes" },
];

export default function HomeEditor() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNews, setSelectedNews] = useState<Record<string, NewsItem[]>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<HomeBlock | null>(null);
  const [blockForm, setBlockForm] = useState({
    block_name: "",
    block_type: "curated",
    title: "",
    category_id: "",
    tag_id: "",
    item_count: 10,
    is_active: true,
  });

  // Fetch home config
  const { data: homeBlocks, isLoading: loadingBlocks } = useQuery({
    queryKey: ["home-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_config")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as HomeBlock[];
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch tags
  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch published news for selection
  const { data: availableNews } = useQuery({
    queryKey: ["available-news", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("news")
        .select("id, title, slug, status, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(50);

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as NewsItem[];
    },
  });

  // Load existing news for blocks
  useEffect(() => {
    if (homeBlocks) {
      const loadNewsForBlocks = async () => {
        const newsMap: Record<string, NewsItem[]> = {};
        
        for (const block of homeBlocks) {
          if (block.news_ids && block.news_ids.length > 0) {
            const { data } = await supabase
              .from("news")
              .select("id, title, slug, status, published_at")
              .in("id", block.news_ids);
            
            if (data) {
              // Manter a ordem original
              newsMap[block.block_name] = block.news_ids
                .map(id => data.find(n => n.id === id))
                .filter(Boolean) as NewsItem[];
            }
          } else {
            newsMap[block.block_name] = [];
          }
        }
        
        setSelectedNews(newsMap);
      };
      
      loadNewsForBlocks();
    }
  }, [homeBlocks]);

  // Save block mutation
  const saveBlockMutation = useMutation({
    mutationFn: async ({ blockName, newsIds }: { blockName: string; newsIds: string[] }) => {
      const { error } = await supabase
        .from("home_config")
        .update({ news_ids: newsIds })
        .eq("block_name", blockName);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
      toast.success("Bloco salvo!");
    },
    onError: (error) => {
      toast.error("Erro ao salvar: " + (error as Error).message);
    },
  });

  // Create/Update block mutation
  const upsertBlockMutation = useMutation({
    mutationFn: async (data: typeof blockForm & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from("home_config")
          .update({
            block_name: data.block_name,
            block_type: data.block_type,
            title: data.title || null,
            category_id: data.category_id || null,
            tag_id: data.tag_id || null,
            item_count: data.item_count,
            is_active: data.is_active,
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const maxOrder = homeBlocks?.reduce((max, b) => Math.max(max, b.sort_order), 0) || 0;
        const { error } = await supabase
          .from("home_config")
          .insert({
            block_name: data.block_name,
            block_type: data.block_type,
            title: data.title || null,
            category_id: data.category_id || null,
            tag_id: data.tag_id || null,
            item_count: data.item_count,
            is_active: data.is_active,
            sort_order: maxOrder + 1,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
      toast.success(editingBlock ? "Bloco atualizado!" : "Bloco criado!");
      setDialogOpen(false);
      resetBlockForm();
    },
    onError: (error) => {
      toast.error("Erro: " + (error as Error).message);
    },
  });

  // Delete block mutation
  const deleteBlockMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("home_config").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
      toast.success("Bloco removido!");
    },
  });

  // Toggle block active
  const toggleBlockMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("home_config")
        .update({ is_active: isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
    },
  });

  const resetBlockForm = () => {
    setEditingBlock(null);
    setBlockForm({
      block_name: "",
      block_type: "curated",
      title: "",
      category_id: "",
      tag_id: "",
      item_count: 10,
      is_active: true,
    });
  };

  const openEditDialog = (block: HomeBlock) => {
    setEditingBlock(block);
    setBlockForm({
      block_name: block.block_name,
      block_type: block.block_type || "curated",
      title: block.title || "",
      category_id: block.category_id || "",
      tag_id: block.tag_id || "",
      item_count: block.item_count || 10,
      is_active: block.is_active,
    });
    setDialogOpen(true);
  };

  const addNewsToBlock = (blockName: string, news: NewsItem) => {
    setSelectedNews((prev) => {
      const current = prev[blockName] || [];
      if (current.some((n) => n.id === news.id)) return prev;
      return {
        ...prev,
        [blockName]: [...current, news],
      };
    });
  };

  const removeNewsFromBlock = (blockName: string, newsId: string) => {
    setSelectedNews((prev) => ({
      ...prev,
      [blockName]: (prev[blockName] || []).filter((n) => n.id !== newsId),
    }));
  };

  const getBlockTypeLabel = (type: string) => {
    return BLOCK_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
            <Home className="h-8 w-8" />
            Editor da Home
          </h1>
          <p className="text-muted-foreground">
            Configure os blocos de conteúdo da página inicial
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetBlockForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Bloco
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBlock ? "Editar Bloco" : "Novo Bloco"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Identificador (único)</Label>
                <Input
                  value={blockForm.block_name}
                  onChange={(e) => setBlockForm({ ...blockForm, block_name: e.target.value.toLowerCase().replace(/\s/g, "_") })}
                  placeholder="ex: destaques_esportes"
                  disabled={!!editingBlock}
                />
              </div>
              <div className="space-y-2">
                <Label>Título de Exibição</Label>
                <Input
                  value={blockForm.title}
                  onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })}
                  placeholder="ex: Destaques de Esportes"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Bloco</Label>
                <Select
                  value={blockForm.block_type}
                  onValueChange={(v) => setBlockForm({ ...blockForm, block_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOCK_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div>{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {blockForm.block_type === "category" && (
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={blockForm.category_id}
                    onValueChange={(v) => setBlockForm({ ...blockForm, category_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {blockForm.block_type === "tag" && (
                <div className="space-y-2">
                  <Label>Tag</Label>
                  <Select
                    value={blockForm.tag_id}
                    onValueChange={(v) => setBlockForm({ ...blockForm, tag_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tags?.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Quantidade de Itens</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={blockForm.item_count}
                  onChange={(e) => setBlockForm({ ...blockForm, item_count: parseInt(e.target.value) || 10 })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Bloco Ativo</Label>
                <Switch
                  checked={blockForm.is_active}
                  onCheckedChange={(checked) => setBlockForm({ ...blockForm, is_active: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => upsertBlockMutation.mutate({ ...blockForm, id: editingBlock?.id })}
                disabled={upsertBlockMutation.isPending || !blockForm.block_name}
              >
                {upsertBlockMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* News Search Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Buscar Notícias</CardTitle>
            <CardDescription>
              Adicione notícias aos blocos de curadoria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por título..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-[500px] space-y-2 overflow-y-auto">
              {availableNews?.map((news) => (
                <div
                  key={news.id}
                  className="flex items-center justify-between rounded-lg border p-2 text-sm hover:bg-accent/50"
                >
                  <span className="line-clamp-2 flex-1">{news.title}</span>
                  <div className="flex gap-1 ml-2">
                    {homeBlocks
                      ?.filter((b) => b.block_type === "curated")
                      .map((block) => (
                        <Button
                          key={block.id}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => addNewsToBlock(block.block_name, news)}
                          title={`Adicionar a ${block.title || block.block_name}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Block Editors */}
        <div className="lg:col-span-2 space-y-4">
          {loadingBlocks ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Carregando blocos...
              </CardContent>
            </Card>
          ) : homeBlocks?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum bloco configurado. Clique em "Novo Bloco" para começar.
              </CardContent>
            </Card>
          ) : (
            homeBlocks?.map((block) => (
              <Card key={block.id} className={!block.is_active ? "opacity-50" : ""}>
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {block.title || block.block_name}
                        <Badge variant="outline" className="text-xs">
                          {getBlockTypeLabel(block.block_type || "curated")}
                        </Badge>
                        {!block.is_active && (
                          <Badge variant="secondary" className="text-xs">
                            Inativo
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {block.block_type === "curated"
                          ? `${selectedNews[block.block_name]?.length || 0} itens selecionados`
                          : `${block.item_count} itens automáticos`}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleBlockMutation.mutate({ id: block.id, isActive: !block.is_active })}
                      title={block.is_active ? "Desativar" : "Ativar"}
                    >
                      {block.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(block)}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                    {block.block_type === "curated" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          saveBlockMutation.mutate({
                            blockName: block.block_name,
                            newsIds: selectedNews[block.block_name]?.map((n) => n.id) || [],
                          })
                        }
                        disabled={saveBlockMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Salvar
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm("Remover este bloco?")) {
                          deleteBlockMutation.mutate(block.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                {block.block_type === "curated" && (
                  <CardContent>
                    <div className="space-y-2">
                      {!selectedNews[block.block_name] || selectedNews[block.block_name].length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          Nenhuma notícia selecionada. Use a busca para adicionar.
                        </p>
                      ) : (
                        selectedNews[block.block_name]?.map((news, index) => (
                          <div
                            key={news.id}
                            className="flex items-center gap-2 rounded-lg border bg-card p-2"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            <Badge variant="outline" className="shrink-0">
                              {index + 1}
                            </Badge>
                            <span className="flex-1 text-sm line-clamp-1">{news.title}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => removeNewsFromBlock(block.block_name, news.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
