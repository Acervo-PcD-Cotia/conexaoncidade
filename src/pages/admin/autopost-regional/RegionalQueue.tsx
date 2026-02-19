import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { sanitizeHtml } from '@/hooks/useSanitizedHtml';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { 
  MapPin, ArrowLeft, RefreshCw, ExternalLink, Eye, SkipForward, Search,
  Sparkles, Send, Image, FileText, Tags, Rocket, Upload, Trash2,
  CheckCircle2, Circle, Loader2, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { 
  useRegionalQueue, useReprocessRegionalItem, useSkipRegionalItem,
  useProcessRegionalItem, usePublishRegionalItem, useProcessAllNew,
  usePublishAllProcessed, useFullPipeline, useRunRegionalIngest,
  useDeleteRegionalItems, useDeleteRegionalItemsByStatus, usePublishAllDirect,
  RegionalIngestItem,
} from '@/hooks/useRegionalAutoPost';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ─── Types ────────────────────────────────────────────────────────────────────
type StepStatus = 'idle' | 'running' | 'done' | 'error';

interface PipelineStep {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
  result?: string;
}

interface ProgressState {
  isOpen: boolean;
  title: string;
  steps: PipelineStep[];
  logs: string[];
  fakeProgress: number;
  currentStep: number;
}

const INITIAL_PROGRESS: ProgressState = {
  isOpen: false,
  title: '',
  steps: [],
  logs: [],
  fakeProgress: 0,
  currentStep: 0,
};

// ─── Progress Panel Component ─────────────────────────────────────────────────
function ProgressPanel({ state, onClose }: { state: ProgressState; onClose: () => void }) {
  const [logsExpanded, setLogsExpanded] = useState(true);
  const logsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [state.logs]);

  const allDone = state.steps.every(s => s.status === 'done' || s.status === 'error');
  const hasError = state.steps.some(s => s.status === 'error');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-background border rounded-xl shadow-2xl w-full max-w-lg flex flex-col gap-0 overflow-hidden">
        {/* Header */}
        <div className={`px-5 py-4 flex items-center gap-3 ${hasError ? 'bg-destructive/10' : allDone ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
          <div className="flex-1">
            <h2 className="font-bold text-base">{state.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {allDone
                ? hasError ? 'Concluído com erros' : 'Concluído com sucesso!'
                : 'Processando, aguarde...'}
            </p>
          </div>
          {allDone ? (
            hasError
              ? <AlertCircle className="h-6 w-6 text-destructive" />
              : <CheckCircle2 className="h-6 w-6 text-green-500" />
          ) : (
            <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
          )}
        </div>

        {/* Progress Bar */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Progresso geral</span>
            <span className="text-xs font-bold text-foreground">{Math.round(state.fakeProgress)}%</span>
          </div>
          <Progress value={state.fakeProgress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="px-5 py-3 space-y-2">
          {state.steps.map((step, idx) => (
            <div key={step.id} className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                {step.status === 'done' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {step.status === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
                {step.status === 'running' && <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />}
                {step.status === 'idle' && <Circle className="h-4 w-4 text-muted-foreground/40" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-tight ${
                  step.status === 'running' ? 'text-amber-600 dark:text-amber-400' :
                  step.status === 'done' ? 'text-green-600 dark:text-green-400' :
                  step.status === 'error' ? 'text-destructive' : 'text-muted-foreground'
                }`}>{step.label}</p>
                {step.result ? (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{step.result}</p>
                ) : (
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{step.description}</p>
                )}
              </div>
              {step.status === 'running' && (
                <div className="flex gap-0.5 mt-1.5">
                  {[0,1,2].map(i => (
                    <div key={i} className="h-1 w-1 rounded-full bg-amber-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Logs */}
        <div className="border-t mx-5 mb-0" />
        <div className="px-5 py-2">
          <button
            onClick={() => setLogsExpanded(v => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            {logsExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Log de atividade ({state.logs.length})
          </button>
          {logsExpanded && (
            <div ref={logsRef} className="mt-2 bg-muted/60 rounded-lg p-3 h-28 overflow-y-auto font-mono text-[11px] space-y-1">
              {state.logs.length === 0 ? (
                <p className="text-muted-foreground">Aguardando atividade...</p>
              ) : (
                state.logs.map((log, i) => (
                  <p key={i} className={`leading-snug ${log.startsWith('✅') ? 'text-green-600 dark:text-green-400' : log.startsWith('❌') ? 'text-destructive' : log.startsWith('⚡') ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                    {log}
                  </p>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex justify-end">
          {allDone ? (
            <Button onClick={onClose} size="sm" className="w-full">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground italic">Não feche esta janela durante o processamento</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegionalQueue() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<RegionalIngestItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [progress, setProgress] = useState<ProgressState>(INITIAL_PROGRESS);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: queue, isLoading, refetch } = useRegionalQueue();
  const reprocessItem = useReprocessRegionalItem();
  const skipItem = useSkipRegionalItem();
  const processItem = useProcessRegionalItem();
  const publishItem = usePublishRegionalItem();
  const processAllNew = useProcessAllNew();
  const publishAllProcessed = usePublishAllProcessed();
  const fullPipeline = useFullPipeline();
  const runIngest = useRunRegionalIngest();
  const deleteItems = useDeleteRegionalItems();
  const deleteByStatus = useDeleteRegionalItemsByStatus();

  // ── Progress helpers ────────────────────────────────────────────────────────
  const startFakeProgress = (targetPct: number, durationMs: number) => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    const tick = 200;
    const steps = durationMs / tick;
    let step = 0;
    progressTimerRef.current = setInterval(() => {
      step++;
      setProgress(prev => ({
        ...prev,
        fakeProgress: Math.min(targetPct, prev.fakeProgress + (targetPct - prev.fakeProgress) / (steps - step + 1)),
      }));
      if (step >= steps) clearInterval(progressTimerRef.current!);
    }, tick);
  };

  const addLog = (msg: string) =>
    setProgress(prev => ({ ...prev, logs: [...prev.logs, `[${new Date().toLocaleTimeString('pt-BR')}] ${msg}`] }));

  const setStepStatus = (id: string, status: StepStatus, result?: string) =>
    setProgress(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === id ? { ...s, status, result } : s),
    }));

  const finalizeProgress = (pct = 100) => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setProgress(prev => ({ ...prev, fakeProgress: pct }));
  };

  const closeProgress = () => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setProgress(INITIAL_PROGRESS);
    refetch();
  };

  // ── Action handlers with progress ──────────────────────────────────────────
  const handleFullPipeline = () => {
    setProgress({
      isOpen: true,
      title: '🚀 Pipeline Completo',
      fakeProgress: 0,
      currentStep: 0,
      logs: [],
      steps: [
        { id: 'ingest', label: 'Ingerindo notícias', description: 'Buscando feeds de todas as fontes ativas...', status: 'running' },
        { id: 'process', label: 'Processando com IA', description: 'Reescrevendo e gerando SEO para cada item...', status: 'idle' },
        { id: 'publish', label: 'Publicando notícias', description: 'Enviando itens processados para o portal...', status: 'idle' },
      ],
    });
    addLog('⚡ Iniciando pipeline completo...');
    startFakeProgress(30, 8000);

    fullPipeline.mutate(undefined, {
      onSuccess: (data) => {
        const p = data?.pipeline || data || {};
        finalizeProgress(100);
        setStepStatus('ingest', 'done', `${p.ingested ?? '?'} item(s) ingerido(s)`);
        setStepStatus('process', 'done', `${p.processed ?? '?'} item(s) processado(s)`);
        setStepStatus('publish', 'done', `${p.published ?? '?'} item(s) publicado(s)`);
        addLog(`✅ Ingestão: ${p.ingested ?? '?'} itens`);
        addLog(`✅ Processamento: ${p.processed ?? '?'} itens`);
        addLog(`✅ Publicação: ${p.published ?? '?'} itens`);
      },
      onError: (err) => {
        finalizeProgress(progress.fakeProgress);
        setStepStatus('ingest', 'error', err.message);
        addLog(`❌ Erro: ${err.message}`);
      },
    });
  };

  const handleRunIngest = () => {
    setProgress({
      isOpen: true,
      title: '🔄 Buscar Notícias',
      fakeProgress: 0,
      currentStep: 0,
      logs: [],
      steps: [
        { id: 'fetch', label: 'Conectando às fontes', description: 'Acessando feeds RSS e APIs configuradas...', status: 'running' },
        { id: 'parse', label: 'Analisando conteúdo', description: 'Extraindo itens novos de cada fonte...', status: 'idle' },
        { id: 'save', label: 'Salvando na fila', description: 'Armazenando itens para processamento...', status: 'idle' },
      ],
    });
    addLog('⚡ Iniciando busca de notícias...');
    startFakeProgress(50, 6000);

    runIngest.mutate(undefined, {
      onSuccess: (data) => {
        finalizeProgress(100);
        const count = data?.ingested ?? data?.count ?? '?';
        setStepStatus('fetch', 'done', 'Fontes acessadas');
        setStepStatus('parse', 'done', 'Conteúdo extraído');
        setStepStatus('save', 'done', `${count} item(s) salvos`);
        addLog(`✅ ${count} notícias encontradas e salvas`);
      },
      onError: (err) => {
        finalizeProgress(progress.fakeProgress);
        setStepStatus('fetch', 'error', err.message);
        addLog(`❌ Erro: ${err.message}`);
      },
    });
  };

  const handleProcessAllNew = () => {
    setProgress({
      isOpen: true,
      title: '✨ Processar com IA',
      fakeProgress: 0,
      currentStep: 0,
      logs: [],
      steps: [
        { id: 'queue', label: 'Carregando fila', description: 'Buscando itens com status "Novo"...', status: 'running' },
        { id: 'rewrite', label: 'Reescrevendo com IA', description: 'Gerando conteúdo otimizado para cada item...', status: 'idle' },
        { id: 'seo', label: 'Gerando metadados SEO', description: 'Criando títulos e descrições para SEO...', status: 'idle' },
      ],
    });
    addLog('⚡ Iniciando processamento com IA...');
    startFakeProgress(40, 15000);

    processAllNew.mutate(undefined, {
      onSuccess: (data) => {
        finalizeProgress(100);
        setStepStatus('queue', 'done', 'Fila carregada');
        setStepStatus('rewrite', 'done', `${data?.processed ?? '?'} item(s) reescritos`);
        setStepStatus('seo', 'done', 'Metadados gerados');
        addLog(`✅ ${data?.processed ?? '?'} processados, ${data?.failed ?? 0} erros`);
      },
      onError: (err) => {
        finalizeProgress(progress.fakeProgress);
        setStepStatus('queue', 'error', err.message);
        addLog(`❌ Erro: ${err.message}`);
      },
    });
  };

  const handlePublishAllProcessed = () => {
    setProgress({
      isOpen: true,
      title: '📤 Publicar Notícias',
      fakeProgress: 0,
      currentStep: 0,
      logs: [],
      steps: [
        { id: 'check', label: 'Verificando itens processados', description: 'Buscando itens prontos para publicar...', status: 'running' },
        { id: 'dedup', label: 'Checando duplicatas', description: 'Removendo notícias já existentes no site...', status: 'idle' },
        { id: 'publish', label: 'Publicando no portal', description: 'Enviando cada notícia para o site...', status: 'idle' },
      ],
    });
    addLog('⚡ Iniciando publicação em lote...');
    startFakeProgress(40, 10000);

    publishAllProcessed.mutate(undefined, {
      onSuccess: (data) => {
        finalizeProgress(100);
        setStepStatus('check', 'done', `${data?.total ?? '?'} itens verificados`);
        setStepStatus('dedup', 'done', `${data?.skipped ?? 0} duplicata(s) removida(s)`);
        setStepStatus('publish', 'done', `${data?.published ?? '?'} publicado(s)`);
        addLog(`✅ ${data?.published ?? '?'} publicados`);
        if ((data?.skipped ?? 0) > 0) addLog(`⚠️ ${data.skipped} duplicata(s) ignorada(s) automaticamente`);
        if ((data?.failed ?? 0) > 0) addLog(`❌ ${data.failed} erro(s)`);
      },
      onError: (err) => {
        finalizeProgress(progress.fakeProgress);
        setStepStatus('check', 'error', err.message);
        addLog(`❌ Erro: ${err.message}`);
      },
    });
  };

  const filteredQueue = queue?.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = !searchTerm || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.regional_sources?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const newItemsCount = queue?.filter(item => item.status === 'new').length || 0;
  const processedItemsCount = queue?.filter(item => item.status === 'processed').length || 0;
  const failedItemsCount = queue?.filter(item => item.status === 'failed').length || 0;
  const isAnyPending = fullPipeline.isPending || processAllNew.isPending || publishAllProcessed.isPending || runIngest.isPending;

  const toggleItemSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAllFiltered = () => {
    const ids = filteredQueue?.map(i => i.id) || [];
    if (selectedIds.length === ids.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ids);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length > 0) {
      deleteItems.mutate(selectedIds);
      setSelectedIds([]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline">Novo</Badge>;
      case 'queued':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Na Fila</Badge>;
      case 'processing':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Processando</Badge>;
      case 'processed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Processado</Badge>;
      case 'published':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Publicado</Badge>;
      case 'skipped':
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Ignorado</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Erro</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Panel Overlay */}
      {progress.isOpen && <ProgressPanel state={progress} onClose={closeProgress} />}

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/spah/painel/autopost-regional">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-500" />
              <h1 className="text-2xl font-bold">Fila Editorial</h1>
            </div>
            <p className="text-muted-foreground">
              Itens capturados para processamento
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Automation Actions */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Rocket className="h-5 w-5 text-amber-500" />
            Automação em Lote
          </CardTitle>
          <CardDescription>
            Execute todo o pipeline de uma vez ou etapas individuais — acompanhe o progresso em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {/* Full Pipeline - THE BIG BUTTON */}
            <Button 
              onClick={handleFullPipeline}
              disabled={isAnyPending}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              size="lg"
            >
              <Rocket className="h-4 w-4 mr-2" />
              🚀 Pipeline Completo (Ingerir + Processar + Publicar)
            </Button>

            {/* Individual steps */}
            <Button 
              variant="outline"
              onClick={handleRunIngest}
              disabled={isAnyPending}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Buscar Notícias (Todas as Fontes)
            </Button>

            {newItemsCount > 0 && (
              <Button 
                variant="outline"
                onClick={handleProcessAllNew}
                disabled={isAnyPending}
                className="border-purple-500/30 text-purple-600 hover:bg-purple-50"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {`Processar Todos (${newItemsCount})`}
              </Button>
            )}

            <Button 
              variant="outline"
              onClick={handlePublishAllProcessed}
              disabled={isAnyPending || processedItemsCount === 0}
              className="border-green-500/30 text-green-600 hover:bg-green-50 disabled:opacity-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              {`Publicar Todos (${processedItemsCount})`}
            </Button>

            {/* Delete buttons */}
            {selectedIds.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Selecionados ({selectedIds.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir {selectedIds.length} item(ns)?</AlertDialogTitle>
                    <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {failedItemsCount > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir com Erro ({failedItemsCount})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir todos os itens com erro?</AlertDialogTitle>
                    <AlertDialogDescription>Serão excluídos {failedItemsCount} itens com status "Erro".</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteByStatus.mutate('failed')} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="new">Novo</SelectItem>
                <SelectItem value="queued">Na Fila</SelectItem>
                <SelectItem value="processing">Processando</SelectItem>
                <SelectItem value="processed">Processado</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="skipped">Ignorado</SelectItem>
                <SelectItem value="failed">Erro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Itens na Fila</CardTitle>
          <CardDescription>
            {filteredQueue?.length || 0} itens encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : filteredQueue && filteredQueue.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox 
                      checked={selectedIds.length === (filteredQueue?.length || 0) && (filteredQueue?.length || 0) > 0}
                      onCheckedChange={toggleSelectAllFiltered}
                    />
                  </TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Capturado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQueue.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={() => toggleItemSelection(item.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="font-medium truncate">
                          {item.rewritten_title || item.title || 'Sem título'}
                        </p>
                        {item.excerpt && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.excerpt}
                          </p>
                        )}
                        {item.error_message && (
                          <p className="text-xs text-red-500 truncate mt-1">
                            ⚠️ {item.error_message}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.regional_sources?.city || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedItem(item)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Abrir original"
                        >
                          <a href={item.canonical_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        
                        {(item.status === 'new' || item.status === 'queued') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => processItem.mutate(item.id)}
                            disabled={processItem.isPending}
                            title="Processar com IA"
                            className="text-purple-500 hover:text-purple-700 hover:bg-purple-50"
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {item.status === 'processed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => publishItem.mutate(item.id)}
                            disabled={publishItem.isPending}
                            title="Publicar agora"
                            className="text-green-500 hover:text-green-700 hover:bg-green-50"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {item.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => reprocessItem.mutate(item.id)}
                            disabled={reprocessItem.isPending}
                            title="Tentar novamente"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {item.status !== 'published' && item.status !== 'skipped' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => skipItem.mutate(item.id)}
                            disabled={skipItem.isPending}
                            title="Ignorar"
                          >
                            <SkipForward className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteItems.mutate([item.id])}
                          disabled={deleteItems.isPending}
                          title="Excluir"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">Nenhum item na fila</p>
          )}
        </CardContent>
      </Card>

      {/* Item Detail Dialog with Tabs */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Item</DialogTitle>
            <DialogDescription>
              {selectedItem?.regional_sources?.city} - {getStatusBadge(selectedItem?.status || '')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <Tabs defaultValue="original" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="original" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Original
                </TabsTrigger>
                <TabsTrigger value="rewritten" className="flex items-center gap-1" disabled={!selectedItem.rewritten_content}>
                  <Sparkles className="h-3 w-3" />
                  Reescrito
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex items-center gap-1" disabled={!selectedItem.seo_meta_title}>
                  <Tags className="h-3 w-3" />
                  SEO
                </TabsTrigger>
                <TabsTrigger value="image" className="flex items-center gap-1" disabled={!selectedItem.generated_image_url && !selectedItem.image_url}>
                  <Image className="h-3 w-3" />
                  Imagem
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="original" className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Título Original</label>
                  <p className="font-medium">{selectedItem.title || 'Sem título'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">URL Original</label>
                  <a 
                    href={selectedItem.canonical_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm block truncate"
                  >
                    {selectedItem.canonical_url}
                  </a>
                </div>

                {selectedItem.published_at && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data Original da Notícia</label>
                    <p className="text-sm">{new Date(selectedItem.published_at).toLocaleString('pt-BR')}</p>
                  </div>
                )}
                
                {selectedItem.excerpt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Resumo</label>
                    <p className="text-sm">{selectedItem.excerpt}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payload Bruto</label>
                  <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-48">
                    {JSON.stringify(selectedItem.raw_payload, null, 2)}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="rewritten" className="mt-4 space-y-4">
                {selectedItem.rewritten_title ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Título Reescrito</label>
                      <p className="font-medium text-lg">{selectedItem.rewritten_title}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Conteúdo Reescrito</label>
                      <div 
                        className="mt-1 p-4 bg-muted/50 rounded-lg prose prose-sm max-h-80 overflow-auto"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedItem.rewritten_content || '') }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Este item ainda não foi processado pela IA.
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="seo" className="mt-4 space-y-4">
                {selectedItem.seo_meta_title ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Meta Title</label>
                      <p className="font-medium">{selectedItem.seo_meta_title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedItem.seo_meta_title.length}/60 caracteres
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Meta Description</label>
                      <p className="text-sm">{selectedItem.seo_meta_description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedItem.seo_meta_description?.length || 0}/155 caracteres
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Metadados SEO serão gerados após o processamento.
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="image" className="mt-4 space-y-4">
                {(selectedItem.generated_image_url || selectedItem.image_url) ? (
                  <div className="space-y-4">
                    <img 
                      src={selectedItem.generated_image_url || selectedItem.image_url || ''} 
                      alt="Preview" 
                      className="w-full max-h-80 object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedItem.generated_image_url || selectedItem.image_url}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma imagem disponível.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
