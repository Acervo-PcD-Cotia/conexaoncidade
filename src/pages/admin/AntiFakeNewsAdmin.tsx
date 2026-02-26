import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, List, AlertTriangle, Database, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { VerdictBadge } from '@/components/factcheck/VerdictBadge';
import { useAdminFactChecks, useUpdateFactCheck, type FactCheck, type FactCheckStatus, type FactCheckVerdict } from '@/hooks/useFactCheck';
import { useTrustedSources, useCreateTrustedSource, useUpdateTrustedSource, useDeleteTrustedSource, type TrustedSource, type TrustedSourceType } from '@/hooks/useTrustedSources';
import { useFactCheckSettings, useSaveFactCheckSettings } from '@/hooks/useFactCheckSettings';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function AntiFakeNewsAdmin() {
  const [statusFilter, setStatusFilter] = useState<FactCheckStatus | 'all'>('all');
  const [verdictFilter, setVerdictFilter] = useState<FactCheckVerdict | 'all'>('all');

  const { data: factChecks, isLoading } = useAdminFactChecks({
    status: statusFilter === 'all' ? undefined : statusFilter,
    verdict: verdictFilter === 'all' ? undefined : verdictFilter,
    limit: 50
  });

  const { data: trustedSources } = useTrustedSources();
  const createSource = useCreateTrustedSource();
  const updateSource = useUpdateTrustedSource();
  const deleteSource = useDeleteTrustedSource();
  const updateFactCheck = useUpdateFactCheck();

  // FactCheck Settings
  const { data: factCheckSettings, isLoading: settingsLoading } = useFactCheckSettings();
  const saveSettings = useSaveFactCheckSettings();

  const [threshold, setThreshold] = useState(70);
  const [expirationDays, setExpirationDays] = useState(30);
  const [externalApiEnabled, setExternalApiEnabled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [autoPublish, setAutoPublish] = useState(false);

  // Sync local state with fetched settings
  useEffect(() => {
    if (factCheckSettings) {
      setThreshold(factCheckSettings.auto_score_threshold);
      setExpirationDays(factCheckSettings.expiration_days);
      setExternalApiEnabled(factCheckSettings.external_api_enabled);
      setApiKey(factCheckSettings.external_api_key);
      setAutoPublish(factCheckSettings.auto_publish);
    }
  }, [factCheckSettings]);

  const handleSaveSettings = () => {
    saveSettings.mutate({
      auto_score_threshold: threshold,
      expiration_days: expirationDays,
      external_api_enabled: externalApiEnabled,
      external_api_key: apiKey,
      auto_publish: autoPublish,
    });
  };

  const [newSource, setNewSource] = useState({
    domain: '',
    name: '',
    type: 'JOURNALISM' as TrustedSourceType,
    weight: 15,
    is_allowed: true
  });

  const handleCreateSource = async () => {
    if (!newSource.domain || !newSource.name) {
      toast.error('Preencha todos os campos');
      return;
    }
    await createSource.mutateAsync(newSource);
    setNewSource({ domain: '', name: '', type: 'JOURNALISM', weight: 15, is_allowed: true });
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateFactCheck.mutateAsync({ id, updates: { status } });
  };

  const editorialQueueCount = factChecks?.filter(f => f.status === 'EDITORIAL_QUEUE').length || 0;
  const pendingReviewCount = factChecks?.filter(f => f.status === 'NEW' || f.status === 'UNDER_REVIEW').length || 0;

  return (
    <>
      <Helmet>
        <title>Check Fake News - Admin | Conexão na Cidade</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Painel Check Fake News
            </h1>
            <p className="text-muted-foreground">
              Gerencie verificações, fila de apuração e fontes confiáveis
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Verificações</p>
                  <p className="text-2xl font-bold">{factChecks?.length || 0}</p>
                </div>
                <List className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fila de Apuração</p>
                  <p className="text-2xl font-bold">{editorialQueueCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fontes Cadastradas</p>
                  <p className="text-2xl font-bold">{trustedSources?.length || 0}</p>
                </div>
                <Database className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="verifications">
          <TabsList>
            <TabsTrigger value="verifications">Verificações</TabsTrigger>
            <TabsTrigger value="queue">
              Fila de Apuração
              {editorialQueueCount > 0 && (
                <Badge variant="destructive" className="ml-2">{editorialQueueCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sources">Fontes Confiáveis</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Verifications Tab */}
          <TabsContent value="verifications" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FactCheckStatus | 'all')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="NEW">Novo</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Em análise</SelectItem>
                  <SelectItem value="EDITORIAL_QUEUE">Na fila</SelectItem>
                  <SelectItem value="REVIEWED">Revisado</SelectItem>
                  <SelectItem value="PUBLISHED">Publicado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={verdictFilter} onValueChange={(v) => setVerdictFilter(v as FactCheckVerdict | 'all')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por veredito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                  <SelectItem value="PROVAVELMENTE_VERDADEIRO">Provavelmente Verdadeiro</SelectItem>
                  <SelectItem value="ENGANOSO">Enganoso</SelectItem>
                  <SelectItem value="PROVAVELMENTE_FALSO">Provavelmente Falso</SelectItem>
                  <SelectItem value="FALSO">Falso</SelectItem>
                  <SelectItem value="NAO_VERIFICAVEL_AINDA">Não Verificável</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Conteúdo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Veredito</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : factChecks?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhuma verificação encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    factChecks?.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(check.created_at), 'dd/MM/yy HH:mm')}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {check.input_content.slice(0, 50)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{check.input_type}</Badge>
                        </TableCell>
                        <TableCell>{check.score}</TableCell>
                        <TableCell>
                          <VerdictBadge verdict={check.verdict} size="sm" />
                        </TableCell>
                        <TableCell>
                          <Badge variant={check.status === 'EDITORIAL_QUEUE' ? 'destructive' : 'secondary'}>
                            {check.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={check.status}
                            onValueChange={(v) => handleUpdateStatus(check.id, v)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NEW">Novo</SelectItem>
                              <SelectItem value="UNDER_REVIEW">Em análise</SelectItem>
                              <SelectItem value="REVIEWED">Revisado</SelectItem>
                              <SelectItem value="PUBLISHED">Publicado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Editorial Queue Tab */}
          <TabsContent value="queue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fila de Apuração</CardTitle>
                <CardDescription>
                  Verificações enviadas por usuários para revisão editorial
                </CardDescription>
              </CardHeader>
              <CardContent>
                {factChecks?.filter(f => f.status === 'EDITORIAL_QUEUE').length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma verificação na fila de apuração
                  </p>
                ) : (
                  <div className="space-y-4">
                    {factChecks?.filter(f => f.status === 'EDITORIAL_QUEUE').map((check) => (
                      <div key={check.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium mb-1">{check.input_content.slice(0, 100)}...</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline">{check.input_type}</Badge>
                              <span>•</span>
                              <span>{format(new Date(check.created_at), "d 'de' MMM, HH:mm", { locale: ptBR })}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <VerdictBadge verdict={check.verdict} size="sm" />
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(check.id, 'UNDER_REVIEW')}
                            >
                              Analisar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trusted Sources Tab */}
          <TabsContent value="sources" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Fontes Confiáveis</CardTitle>
                  <CardDescription>
                    Gerencie a lista de domínios e sua confiabilidade
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Adicionar fonte</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Fonte Confiável</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Domínio</Label>
                        <Input
                          placeholder="exemplo.com.br"
                          value={newSource.domain}
                          onChange={(e) => setNewSource({ ...newSource, domain: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          placeholder="Nome da fonte"
                          value={newSource.name}
                          onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                          value={newSource.type}
                          onValueChange={(v) => setNewSource({ ...newSource, type: v as TrustedSourceType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRIMARY">Fonte Primária</SelectItem>
                            <SelectItem value="JOURNALISM">Jornalismo</SelectItem>
                            <SelectItem value="CHECKER">Agência de Checagem</SelectItem>
                            <SelectItem value="OTHER">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Peso (0-100)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={newSource.weight}
                          onChange={(e) => setNewSource({ ...newSource, weight: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <Button onClick={handleCreateSource} className="w-full">
                        Adicionar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domínio</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Peso</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trustedSources?.map((source) => (
                      <TableRow key={source.id}>
                        <TableCell className="font-mono text-sm">{source.domain}</TableCell>
                        <TableCell>{source.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{source.type}</Badge>
                        </TableCell>
                        <TableCell>{source.weight}</TableCell>
                        <TableCell>
                          <Badge variant={source.is_allowed ? 'default' : 'destructive'}>
                            {source.is_allowed ? 'Permitida' : 'Bloqueada'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateSource.mutate({
                                id: source.id,
                                updates: { is_allowed: !source.is_allowed }
                              })}
                            >
                              {source.is_allowed ? 'Bloquear' : 'Permitir'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteSource.mutate(source.id)}
                            >
                              Remover
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - FULLY IMPLEMENTED */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações do Sistema
                </CardTitle>
                <CardDescription>
                  Ajuste os parâmetros de verificação automática e publicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {settingsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : (
                  <>
                    {/* Auto Score Threshold */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base">Score mínimo para aprovação automática</Label>
                        <Badge variant="outline" className="text-lg font-bold">{threshold}%</Badge>
                      </div>
                      <Slider 
                        value={[threshold]} 
                        onValueChange={([v]) => setThreshold(v)} 
                        min={0} 
                        max={100} 
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Verificações com score acima deste valor serão aprovadas automaticamente
                      </p>
                    </div>

                    {/* Expiration Days */}
                    <div className="space-y-2">
                      <Label className="text-base">Validade das verificações (dias)</Label>
                      <div className="flex items-center gap-3">
                        <Input 
                          type="number" 
                          value={expirationDays} 
                          onChange={(e) => setExpirationDays(parseInt(e.target.value) || 30)}
                          min={1}
                          max={365}
                          className="w-32"
                        />
                        <span className="text-sm text-muted-foreground">dias</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Após este período, verificações antigas podem ser reavaliadas
                      </p>
                    </div>

                    {/* External API */}
                    <div className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Usar API externa de fact-checking</Label>
                          <p className="text-xs text-muted-foreground">
                            Integrar com serviços externos de verificação
                          </p>
                        </div>
                        <Switch 
                          checked={externalApiEnabled} 
                          onCheckedChange={setExternalApiEnabled} 
                        />
                      </div>
                      
                      {externalApiEnabled && (
                        <div className="space-y-2 pt-2">
                          <Label>API Key</Label>
                          <Input 
                            type="password" 
                            placeholder="Insira sua API Key" 
                            value={apiKey} 
                            onChange={(e) => setApiKey(e.target.value)} 
                          />
                        </div>
                      )}
                    </div>

                    {/* Auto Publish */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="text-base">Auto-publicar verificações aprovadas</Label>
                        <p className="text-xs text-muted-foreground">
                          Publicar automaticamente verificações que atingirem o score mínimo
                        </p>
                      </div>
                      <Switch 
                        checked={autoPublish} 
                        onCheckedChange={setAutoPublish} 
                      />
                    </div>

                    {/* Save Button */}
                    <Button 
                      onClick={handleSaveSettings} 
                      disabled={saveSettings.isPending}
                      className="w-full sm:w-auto"
                    >
                      {saveSettings.isPending ? "Salvando..." : "Salvar Configurações"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}