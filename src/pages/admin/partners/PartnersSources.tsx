import { useState } from "react";
import { 
  Rss, 
  Plus, 
  Settings2, 
  Trash2,
  MoreVertical,
  Play,
  Pause,
  RefreshCw,
  Filter,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useSyndicationSources, 
  useCreateSyndicationSource, 
  useUpdateSyndicationSource, 
  useDeleteSyndicationSource,
  useTestSyndicationFeed 
} from "@/hooks/useSyndicationSources";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function PartnersSources() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Real data hooks
  const { data: sources, isLoading } = useSyndicationSources();
  const createSource = useCreateSyndicationSource();
  const updateSource = useUpdateSyndicationSource();
  const deleteSource = useDeleteSyndicationSource();
  const testFeed = useTestSyndicationFeed();

  // Form state for new source
  const [newSource, setNewSource] = useState({
    name: "",
    feed_url: "",
    feed_type: "rss" as "rss" | "atom" | "json",
    auto_import: false,
    require_approval: true,
  });

  const filteredSources = sources?.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(search.toLowerCase()) ||
                          source.feed_url.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && source.is_active) ||
      (statusFilter === "paused" && !source.is_active);
    return matchesSearch && matchesStatus;
  }) || [];

  const handleTestFeed = async () => {
    if (!newSource.feed_url) {
      toast.error("Informe a URL do feed");
      return;
    }
    setTestResult(null);
    try {
      const result = await testFeed.mutateAsync(newSource.feed_url);
      setTestResult(result);
      if (result?.success) {
        toast.success(`Feed válido! ${result.item_count} itens encontrados`);
      }
    } catch (error) {
      setTestResult({ error: true });
    }
  };

  const handleCreateSource = async () => {
    if (!newSource.name || !newSource.feed_url) {
      toast.error("Preencha nome e URL do feed");
      return;
    }
    try {
      await createSource.mutateAsync(newSource);
      setDialogOpen(false);
      setNewSource({
        name: "",
        feed_url: "",
        feed_type: "rss",
        auto_import: false,
        require_approval: true,
      });
      setTestResult(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleToggleActive = (id: string, currentState: boolean) => {
    updateSource.mutate({ id, updates: { is_active: !currentState } });
  };

  const handleSync = async (source: { id: string; feed_url: string }) => {
    try {
      const result = await testFeed.mutateAsync(source.feed_url);
      if (result?.success) {
        toast.success(`Sincronizado! ${result.item_count || 0} itens encontrados`);
      }
    } catch (error) {
      toast.error("Erro ao sincronizar");
    }
  };

  const activeCount = sources?.filter(s => s.is_active).length || 0;
  const totalImported = sources?.reduce((acc, s) => acc + (s.last_item_count || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fontes de Importação</h1>
          <p className="text-muted-foreground">Configure quais conteúdos importar de cada parceiro</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Fonte RSS
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Adicionar Fonte RSS</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da fonte *</Label>
                <Input
                  placeholder="Ex: Portal ABC News"
                  value={newSource.name}
                  onChange={(e) => setNewSource({...newSource, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>URL do feed RSS/Atom *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://site.com/rss.xml"
                    value={newSource.feed_url}
                    onChange={(e) => setNewSource({...newSource, feed_url: e.target.value})}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleTestFeed}
                    disabled={testFeed.isPending}
                  >
                    {testFeed.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Testar"
                    )}
                  </Button>
                </div>
              </div>

              {/* Test Result */}
              {testResult && (
                <div className={`p-3 rounded-lg border ${testResult.error ? 'bg-destructive/10 border-destructive' : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'}`}>
                  {testResult.error ? (
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">Erro ao carregar o feed</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">{testResult.feed_title || "Feed válido"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {testResult.item_count} itens encontrados
                      </p>
                      {testResult.preview_items?.slice(0, 3).map((item: any, i: number) => (
                        <p key={i} className="text-xs truncate text-muted-foreground">
                          • {item.title}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Tipo de feed</Label>
                <Select 
                  value={newSource.feed_type} 
                  onValueChange={(v) => setNewSource({...newSource, feed_type: v as "rss" | "atom" | "json"})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rss">RSS 2.0</SelectItem>
                    <SelectItem value="atom">Atom</SelectItem>
                    <SelectItem value="json">JSON Feed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Importar automaticamente</Label>
                  <p className="text-xs text-muted-foreground">Importar novos itens sem revisão</p>
                </div>
                <Switch 
                  checked={newSource.auto_import}
                  onCheckedChange={(checked) => setNewSource({...newSource, auto_import: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Exigir aprovação</Label>
                  <p className="text-xs text-muted-foreground">Itens ficam em fila antes de publicar</p>
                </div>
                <Switch 
                  checked={newSource.require_approval}
                  onCheckedChange={(checked) => setNewSource({...newSource, require_approval: checked})}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button 
                onClick={handleCreateSource}
                disabled={createSource.isPending}
              >
                {createSource.isPending ? "Salvando..." : "Adicionar Fonte"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Fontes Ativas</CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? <Skeleton className="h-8 w-12" /> : activeCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Fontes</CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? <Skeleton className="h-8 w-12" /> : sources?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Itens da Última Coleta</CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? <Skeleton className="h-8 w-12" /> : totalImported}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Com Erros</CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? <Skeleton className="h-8 w-12" /> : sources?.filter(s => (s.error_count || 0) > 0).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome ou URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="paused">Pausados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>URL do Feed</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Última Coleta</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                </TableRow>
              ))
            ) : filteredSources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Rss className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {search || statusFilter !== "all" 
                      ? "Nenhuma fonte encontrada com esses filtros" 
                      : "Nenhuma fonte configurada"}
                  </p>
                  {!search && statusFilter === "all" && (
                    <Button 
                      variant="link" 
                      className="mt-2"
                      onClick={() => setDialogOpen(true)}
                    >
                      Adicionar primeira fonte
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredSources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {source.feed_url}
                      </span>
                      <a 
                        href={source.feed_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-xs">
                      {source.feed_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {source.last_fetched_at 
                      ? format(new Date(source.last_fetched_at), "dd/MM HH:mm", { locale: ptBR })
                      : "Nunca"}
                  </TableCell>
                  <TableCell>{source.last_item_count || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={source.is_active}
                        onCheckedChange={() => handleToggleActive(source.id, source.is_active)}
                      />
                      <span className="text-sm">
                        {source.is_active ? "Ativo" : "Pausado"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSync(source)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sincronizar Agora
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(source.id, source.is_active)}>
                          {source.is_active ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteSource.mutate(source.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}