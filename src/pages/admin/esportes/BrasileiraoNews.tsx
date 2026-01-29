import { useState } from "react";
import { 
  Newspaper, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Trash2, 
  RefreshCw, 
  Filter,
  CheckCircle,
  Clock,
  Archive,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  useBrGeneratedNews,
  useGenerateAiNews,
  useUpdateGeneratedNewsStatus,
  type BrGeneratedNews 
} from "@/hooks/useBrasileiraoNews";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const NEWS_TYPE_LABELS: Record<string, string> = {
  'round_recap': 'Resumo da Rodada',
  'standings_change': 'Mudança na Classificação',
  'where_to_watch': 'Onde Assistir',
  'preview': 'Prévia de Jogo',
  'highlight': 'Destaque',
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  'draft': { label: 'Rascunho', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  'published': { label: 'Publicado', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  'archived': { label: 'Arquivado', icon: Archive, color: 'bg-muted text-muted-foreground' },
};

export default function BrasileiraoNews() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: news, isLoading } = useBrGeneratedNews(
    statusFilter !== "all" ? statusFilter : undefined,
    50
  );
  
  const generateMutation = useGenerateAiNews();
  const updateStatusMutation = useUpdateGeneratedNewsStatus();

  // Filter by type
  const filteredNews = news?.filter(n => 
    typeFilter === "all" || n.news_type === typeFilter
  );

  const handleGenerate = async (newsType: 'round_recap' | 'standings_change' | 'preview') => {
    try {
      await generateMutation.mutateAsync({
        newsType,
        context: { round: 1, competitionType: 'Série A' },
        autoPublish: false
      });
      toast({
        title: "Notícia gerada",
        description: "Nova notícia criada como rascunho."
      });
    } catch (error: any) {
      toast({
        title: "Erro na geração",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (id: string, status: 'draft' | 'published' | 'archived') => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast({
        title: "Status atualizado",
        description: `Notícia ${status === 'published' ? 'publicada' : status === 'archived' ? 'arquivada' : 'movida para rascunho'}.`
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  function stripHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Notícias IA
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie notícias geradas automaticamente
          </p>
        </div>
      </header>

      {/* Generate Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gerar Nova Notícia</CardTitle>
          <CardDescription>
            Use a IA para criar conteúdo SEO-otimizado automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => handleGenerate('round_recap')}
              disabled={generateMutation.isPending}
            >
              <Sparkles className={cn("h-4 w-4 mr-2", generateMutation.isPending && "animate-pulse")} />
              Resumo da Rodada
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleGenerate('standings_change')}
              disabled={generateMutation.isPending}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Classificação
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleGenerate('preview')}
              disabled={generateMutation.isPending}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Prévia de Jogo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
            <SelectItem value="archived">Arquivado</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(NEWS_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* News List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : filteredNews && filteredNews.length > 0 ? (
        <div className="space-y-4">
          {filteredNews.map((item) => {
            const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;
            const StatusIcon = statusConfig.icon;
            const excerpt = stripHtml(item.content).slice(0, 200) + '...';
            
            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <Badge variant="outline">
                          {NEWS_TYPE_LABELS[item.news_type] || item.news_type}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold line-clamp-1 mb-1">
                        {item.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {excerpt}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Criado: {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        {item.published_at && (
                          <span className="text-green-600">
                            Publicado: {formatDistanceToNow(new Date(item.published_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {item.status === 'draft' && (
                        <Button 
                          size="sm"
                          onClick={() => handleStatusChange(item.id, 'published')}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Publicar
                        </Button>
                      )}
                      {item.status === 'published' && (
                        <>
                          <Button 
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <Link to={`/esportes/brasileirao/noticia/${item.slug}`} target="_blank">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Ver
                            </Link>
                          </Button>
                          <Button 
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusChange(item.id, 'draft')}
                            disabled={updateStatusMutation.isPending}
                          >
                            <EyeOff className="h-4 w-4 mr-1" />
                            Despublicar
                          </Button>
                        </>
                      )}
                      {item.status !== 'archived' && (
                        <Button 
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground"
                          onClick={() => handleStatusChange(item.id, 'archived')}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Archive className="h-4 w-4 mr-1" />
                          Arquivar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-medium mb-1">Nenhuma notícia encontrada</h3>
            <p className="text-sm text-muted-foreground">
              Gere uma nova notícia usando os botões acima.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
