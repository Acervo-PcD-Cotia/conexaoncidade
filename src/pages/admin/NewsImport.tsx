import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileJson, FileText, Table, Loader2, CheckCircle2, XCircle, Copy, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

interface ImportResult {
  title: string;
  status: 'success' | 'duplicate' | 'error';
  id?: string;
  error?: string;
}

interface ImportSummary {
  total: number;
  success: number;
  duplicates: number;
  errors: number;
  format: string;
}

const SAMPLE_JSON = `[
  {
    "title": "Prefeitura anuncia nova obra na região central",
    "subtitulo": "Investimento de R$ 2 milhões para revitalização",
    "conteudo": "<p><strong>A Prefeitura anunciou uma nova obra</strong> de revitalização no centro da cidade, com investimento estimado em R$ 2 milhões.</p><p>As obras devem começar no próximo mês e têm previsão de conclusão em 6 meses.</p>",
    "chapeu": "INFRAESTRUTURA",
    "fonte": "Assessoria de Imprensa",
    "tags": ["infraestrutura", "obras", "centro"],
    "destaque": "home",
    "status": "draft"
  }
]`;

const SAMPLE_CSV = `titulo,conteudo,chapeu,fonte,tags,destaque,status
"Nova escola inaugurada no bairro","<p>Uma nova escola foi inaugurada no bairro Vila Nova.</p>","EDUCAÇÃO","Secretaria de Educação","educação;escola;vila nova","none","draft"`;

const SAMPLE_TXT = `Nova praça será construída no centro
fonte: Prefeitura Municipal
chapeu: URBANISMO
tags: praça, centro, urbanismo

A prefeitura anunciou a construção de uma nova praça no centro da cidade.

O projeto prevê áreas verdes, playground e espaço para eventos culturais.

O investimento total será de R$ 500 mil.
---
Campanha de vacinação começa na próxima semana
fonte: Secretaria de Saúde
chapeu: SAÚDE

A Secretaria de Saúde anunciou o início da campanha de vacinação contra a gripe.

Serão mais de 50 postos de vacinação distribuídos pela cidade.`;

export default function NewsImport() {
  const [content, setContent] = useState('');
  const [format, setFormat] = useState<'json' | 'csv' | 'txt'>('json');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [apiEndpoint, setApiEndpoint] = useState('');

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const fullEndpoint = `https://${projectId}.supabase.co/functions/v1/news-import`;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'json') setFormat('json');
    else if (ext === 'csv') setFormat('csv');
    else if (ext === 'txt') setFormat('txt');

    const reader = new FileReader();
    reader.onload = (e) => {
      setContent(e.target?.result as string || '');
      toast.success(`Arquivo "${file.name}" carregado`);
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleImport = async () => {
    if (!content.trim()) {
      toast.error('Cole ou faça upload do conteúdo primeiro');
      return;
    }

    setLoading(true);
    setResults(null);
    setSummary(null);

    try {
      const { data, error } = await supabase.functions.invoke('news-import', {
        body: { format, data: content },
        headers: {
          'x-api-key': '___FROM_ADMIN___',
        },
      });

      if (error) throw error;

      setSummary(data.summary);
      setResults(data.results);

      if (data.summary.success > 0) {
        toast.success(`${data.summary.success} notícia(s) importada(s) com sucesso!`);
      }
      if (data.summary.errors > 0) {
        toast.error(`${data.summary.errors} erro(s) na importação`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao importar');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    if (format === 'json') setContent(SAMPLE_JSON);
    else if (format === 'csv') setContent(SAMPLE_CSV);
    else setContent(SAMPLE_TXT);
    toast.info('Exemplo carregado');
  };

  const copyEndpoint = () => {
    navigator.clipboard.writeText(fullEndpoint);
    toast.success('Endpoint copiado!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Importar Notícias</h1>
        <p className="text-muted-foreground">Importe notícias via JSON, CSV ou TXT — por upload, colagem ou API externa.</p>
      </div>

      {/* API Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Endpoint da API Externa
          </CardTitle>
          <CardDescription>Use este endpoint para enviar notícias de sistemas externos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted px-3 py-2 rounded text-xs font-mono break-all">
              POST {fullEndpoint}
            </code>
            <Button variant="outline" size="sm" onClick={copyEndpoint}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Header obrigatório:</strong> <code className="bg-muted px-1 rounded">x-api-key: SUA_CHAVE</code></p>
            <p><strong>Content-Type:</strong> <code className="bg-muted px-1 rounded">application/json</code>, <code className="bg-muted px-1 rounded">text/csv</code> ou <code className="bg-muted px-1 rounded">text/plain</code></p>
          </div>
        </CardContent>
      </Card>

      {/* Import Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Importação Manual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={format} onValueChange={(v) => setFormat(v as typeof format)}>
            <TabsList>
              <TabsTrigger value="json" className="gap-1.5">
                <FileJson className="h-4 w-4" /> JSON
              </TabsTrigger>
              <TabsTrigger value="csv" className="gap-1.5">
                <Table className="h-4 w-4" /> CSV
              </TabsTrigger>
              <TabsTrigger value="txt" className="gap-1.5">
                <FileText className="h-4 w-4" /> TXT
              </TabsTrigger>
            </TabsList>

            <TabsContent value="json" className="space-y-3">
              <Alert>
                <AlertDescription className="text-xs">
                  Envie um array JSON com campos: <code>title</code>, <code>conteudo</code>, <code>chapeu</code>, <code>fonte</code>, <code>tags</code>, <code>destaque</code>, <code>status</code>
                </AlertDescription>
              </Alert>
            </TabsContent>
            <TabsContent value="csv" className="space-y-3">
              <Alert>
                <AlertDescription className="text-xs">
                  Primeira linha = cabeçalho. Colunas: <code>titulo</code>, <code>conteudo</code>, <code>chapeu</code>, <code>fonte</code>, <code>tags</code> (separadas por ;), <code>destaque</code>, <code>status</code>
                </AlertDescription>
              </Alert>
            </TabsContent>
            <TabsContent value="txt" className="space-y-3">
              <Alert>
                <AlertDescription className="text-xs">
                  Cada bloco separado por <code>---</code>. Linha 1 = título. Metadados opcionais: <code>fonte:</code>, <code>chapeu:</code>, <code>tags:</code>. Restante = conteúdo.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? 'Solte o arquivo aqui...' : 'Arraste um arquivo .json, .csv ou .txt — ou clique para selecionar'}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">Máximo 5MB</p>
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Ou cole o conteúdo abaixo:</label>
              <Button variant="ghost" size="sm" onClick={loadSample} className="text-xs">
                Carregar exemplo
              </Button>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={format === 'json' ? '[ { "title": "...", ... } ]' : format === 'csv' ? 'titulo,conteudo,...' : 'Título da notícia\nfonte: ...\n\nConteúdo...'}
              className="min-h-[200px] font-mono text-xs"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleImport} disabled={loading || !content.trim()} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {loading ? 'Importando...' : `Importar ${format.toUpperCase()}`}
            </Button>
            <Button variant="outline" onClick={() => { setContent(''); setResults(null); setSummary(null); }}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resultado da Importação</CardTitle>
            <CardDescription>Formato: {summary.format?.toUpperCase()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <Badge variant="outline" className="gap-1 text-sm py-1 px-3">
                Total: {summary.total}
              </Badge>
              <Badge className="gap-1 text-sm py-1 px-3 bg-green-600">
                <CheckCircle2 className="h-3 w-3" /> {summary.success} importadas
              </Badge>
              {summary.duplicates > 0 && (
                <Badge variant="secondary" className="gap-1 text-sm py-1 px-3">
                  <AlertTriangle className="h-3 w-3" /> {summary.duplicates} duplicadas
                </Badge>
              )}
              {summary.errors > 0 && (
                <Badge variant="destructive" className="gap-1 text-sm py-1 px-3">
                  <XCircle className="h-3 w-3" /> {summary.errors} erros
                </Badge>
              )}
            </div>

            {results && results.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Status</th>
                      <th className="text-left px-3 py-2 font-medium">Título</th>
                      <th className="text-left px-3 py-2 font-medium">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {results.map((r, i) => (
                      <tr key={i} className="hover:bg-muted/50">
                        <td className="px-3 py-2">
                          {r.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                          {r.status === 'duplicate' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                          {r.status === 'error' && <XCircle className="h-4 w-4 text-destructive" />}
                        </td>
                        <td className="px-3 py-2 max-w-[300px] truncate">{r.title}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {r.status === 'success' && <span className="text-green-600">ID: {r.id?.slice(0, 8)}...</span>}
                          {r.error && <span className="text-destructive">{r.error}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
