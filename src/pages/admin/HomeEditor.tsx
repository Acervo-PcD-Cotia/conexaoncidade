import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Home, Save, GripVertical, X, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
}

export default function HomeEditor() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNews, setSelectedNews] = useState<Record<string, NewsItem[]>>({
    main_headline: [],
    agora_na_cidade: [],
    ultimas_noticias: [],
  });

  // Fetch home config
  const { data: homeConfig } = useQuery({
    queryKey: ["home-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_config")
        .select("*");
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

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (blockName: string) => {
      const newsIds = selectedNews[blockName]?.map(n => n.id) || [];
      const { error } = await supabase
        .from("home_config")
        .update({ news_ids: newsIds })
        .eq("block_name", blockName);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
      toast.success("Configuração salva!");
    },
    onError: (error) => {
      toast.error("Erro ao salvar: " + (error as Error).message);
    },
  });

  const addNewsToBlock = (blockName: string, news: NewsItem) => {
    setSelectedNews(prev => ({
      ...prev,
      [blockName]: [...(prev[blockName] || []), news].slice(0, getBlockLimit(blockName)),
    }));
  };

  const removeNewsFromBlock = (blockName: string, newsId: string) => {
    setSelectedNews(prev => ({
      ...prev,
      [blockName]: (prev[blockName] || []).filter(n => n.id !== newsId),
    }));
  };

  const getBlockLimit = (blockName: string) => {
    switch (blockName) {
      case "main_headline": return 1;
      case "agora_na_cidade": return 8;
      case "ultimas_noticias": return 20;
      default: return 10;
    }
  };

  const getBlockTitle = (blockName: string) => {
    switch (blockName) {
      case "main_headline": return "Manchete Principal";
      case "agora_na_cidade": return "Agora na Cidade";
      case "ultimas_noticias": return "Últimas Notícias";
      default: return blockName;
    }
  };

  const blocks = ["main_headline", "agora_na_cidade", "ultimas_noticias"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
            <Home className="h-8 w-8" />
            Editor da Home
          </h1>
          <p className="text-muted-foreground">
            Curadoria editorial dos blocos da página inicial
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* News Search Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Buscar Notícias</CardTitle>
            <CardDescription>
              Arraste notícias para os blocos
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
                    {blocks.map((block) => (
                      <Button
                        key={block}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => addNewsToBlock(block, news)}
                        title={`Adicionar a ${getBlockTitle(block)}`}
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
          {blocks.map((blockName) => (
            <Card key={blockName}>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <div>
                  <CardTitle className="text-base">{getBlockTitle(blockName)}</CardTitle>
                  <CardDescription>
                    {selectedNews[blockName]?.length || 0} / {getBlockLimit(blockName)} itens
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => saveMutation.mutate(blockName)}
                  disabled={saveMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Salvar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedNews[blockName]?.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Nenhuma notícia selecionada. O bloco usará seleção automática.
                    </p>
                  )}
                  {selectedNews[blockName]?.map((news, index) => (
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
                        onClick={() => removeNewsFromBlock(blockName, news.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
