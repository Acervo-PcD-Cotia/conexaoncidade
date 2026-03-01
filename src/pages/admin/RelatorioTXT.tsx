import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil, Copy, Download, FileText, X, Check, Save, FolderOpen, Loader2, ExternalLink, Globe, ClipboardPaste, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
  fonte: string;
  linkNoticia: string;
  linkImagem: string;
  dataPublicacao: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
}

interface SavedReport {
  id: string;
  title: string;
  items: NewsItem[];
  report_text: string | null;
  created_at: string;
  updated_at: string;
}

const emptyItem: NewsItem = {
  fonte: "",
  linkNoticia: "",
  linkImagem: "",
  dataPublicacao: "",
  titulo: "",
  subtitulo: "",
  descricao: "",
};

function useFontesCadastradas() {
  return useQuery({
    queryKey: ["autopost-sources-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("autopost_sources")
        .select("id, name, site_url, city, source_type, status")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });
}

export default function RelatorioTXT() {
  const { data: fontes = [], isLoading: loadingFontes } = useFontesCadastradas();
  const [form, setForm] = useState<NewsItem>({ ...emptyItem });
  const [items, setItems] = useState<NewsItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState("");

  // Save/load state
  const [reportTitle, setReportTitle] = useState("Sem título");
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Paste TXT / Upload JSON state
  const [pasteTxt, setPasteTxt] = useState("");
  const [importTab, setImportTab] = useState("form");

  const handleChange = (field: keyof NewsItem, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
    if (!form.titulo.trim()) {
      toast.error("O campo Título é obrigatório.");
      return;
    }
    if (!form.dataPublicacao.trim()) {
      toast.error("O campo Data de Publicação é obrigatório.");
      return;
    }

    if (editingIndex !== null) {
      setItems((prev) => prev.map((item, i) => (i === editingIndex ? { ...form } : item)));
      setEditingIndex(null);
      toast.success("Notícia atualizada!");
    } else {
      setItems((prev) => [...prev, { ...form }]);
      toast.success("Notícia adicionada!");
    }
    setForm({ ...emptyItem });
  };

  const handleEdit = (index: number) => {
    setForm({ ...items[index] });
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setForm({ ...emptyItem });
    }
    toast.info("Notícia removida.");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setForm({ ...emptyItem });
  };

  const buildReportText = useCallback((newsItems: NewsItem[]) => {
    const lines = newsItems.map((item, i) => {
      const parts = [`NOTÍCIA ${i + 1}`];
      if (item.fonte) parts.push(`Fonte: ${item.fonte}`);
      if (item.linkNoticia) parts.push(`Link: ${item.linkNoticia}`);
      parts.push(`Data: ${item.dataPublicacao}`);
      parts.push(`Título: ${item.titulo}`);
      if (item.subtitulo) parts.push(`Subtítulo: ${item.subtitulo}`);
      if (item.descricao) parts.push(`Descrição: ${item.descricao}`);
      if (item.linkImagem) parts.push(`Imagem: ${item.linkImagem}`);
      return parts.join("\n");
    });
    return lines.join("\n\n----------------------------------------\n\n");
  }, []);

  const generateReport = useCallback(() => {
    if (items.length === 0) {
      toast.error("Adicione pelo menos uma notícia.");
      return;
    }
    const text = buildReportText(items);
    setReportText(text);
    setShowReport(true);
  }, [items, buildReportText]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      toast.success("Relatório copiado!");
    } catch {
      toast.error("Falha ao copiar. Selecione manualmente.");
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-noticias-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download iniciado!");
  };

  // Save report
  const handleSave = async () => {
    if (items.length === 0) {
      toast.error("Adicione pelo menos uma notícia antes de salvar.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Você precisa estar logado para salvar relatórios.");
      return;
    }

    setSaving(true);
    const text = buildReportText(items);

    try {
      if (currentReportId) {
        const { error } = await supabase
          .from("relatorio_txt_saved")
          .update({
            title: reportTitle,
            items: items as any,
            report_text: text,
          })
          .eq("id", currentReportId);
        if (error) throw error;
        toast.success("Relatório atualizado!");
      } else {
        const { data, error } = await supabase
          .from("relatorio_txt_saved")
          .insert({
            user_id: user.id,
            title: reportTitle,
            items: items as any,
            report_text: text,
          })
          .select("id")
          .single();
        if (error) throw error;
        setCurrentReportId(data.id);
        toast.success("Relatório salvo!");
      }
    } catch (err: any) {
      toast.error("Erro ao salvar: " + (err.message || "desconhecido"));
    } finally {
      setSaving(false);
    }
  };

  // Load saved reports list
  const fetchSavedReports = async () => {
    setLoadingSaved(true);
    const { data, error } = await supabase
      .from("relatorio_txt_saved")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar relatórios salvos.");
    } else {
      setSavedReports((data as any[]) || []);
    }
    setLoadingSaved(false);
  };

  const openSavedList = () => {
    setShowSavedList(true);
    fetchSavedReports();
  };

  const loadReport = (report: SavedReport) => {
    setItems(report.items);
    setReportTitle(report.title);
    setCurrentReportId(report.id);
    setShowSavedList(false);
    setEditingIndex(null);
    setForm({ ...emptyItem });
    toast.success("Relatório carregado!");
  };

  const deleteSavedReport = async (id: string) => {
    const { error } = await supabase.from("relatorio_txt_saved").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir relatório.");
    } else {
      setSavedReports((prev) => prev.filter((r) => r.id !== id));
      if (currentReportId === id) {
        setCurrentReportId(null);
      }
      toast.success("Relatório excluído.");
    }
  };

  const handleNewReport = () => {
    setItems([]);
    setForm({ ...emptyItem });
    setEditingIndex(null);
    setReportTitle("Sem título");
    setCurrentReportId(null);
    setPasteTxt("");
  };

  // Parse pasted TXT into items
  const handleParseTxt = () => {
    if (!pasteTxt.trim()) {
      toast.error("Cole o conteúdo do TXT primeiro.");
      return;
    }
    const blocks = pasteTxt.split(/[-─]{5,}/).map(b => b.trim()).filter(Boolean);
    const parsed: NewsItem[] = [];

    for (const block of blocks) {
      const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
      const item: NewsItem = { ...emptyItem };
      for (const line of lines) {
        if (/^NOTÍCIA\s+\d+/i.test(line)) continue;
        const match = line.match(/^(.+?):\s*(.+)$/);
        if (match) {
          const key = match[1].toLowerCase().trim();
          const val = match[2].trim();
          if (key === "fonte") item.fonte = val;
          else if (key === "link") item.linkNoticia = val;
          else if (key === "data") item.dataPublicacao = val;
          else if (key === "título" || key === "titulo") item.titulo = val;
          else if (key === "subtítulo" || key === "subtitulo") item.subtitulo = val;
          else if (key === "descrição" || key === "descricao") item.descricao = val;
          else if (key === "imagem") item.linkImagem = val;
        }
      }
      if (item.titulo) parsed.push(item);
    }

    if (parsed.length === 0) {
      toast.error("Não foi possível extrair notícias do texto colado.");
      return;
    }
    setItems(prev => [...prev, ...parsed]);
    setPasteTxt("");
    toast.success(`${parsed.length} notícia(s) importada(s) do TXT!`);
  };

  // Handle JSON file upload
  const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      let jsonItems: NewsItem[] = [];

      // Accept array or { items: [...] }
      const arr = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : null;

      if (!arr) {
        toast.error("JSON inválido. Esperado um array ou { items: [...] }.");
        return;
      }

      jsonItems = arr.map((entry: any) => ({
        fonte: entry.fonte || "",
        linkNoticia: entry.linkNoticia || entry.link || "",
        linkImagem: entry.linkImagem || entry.imagem || "",
        dataPublicacao: entry.dataPublicacao || entry.data || "",
        titulo: entry.titulo || entry.title || "",
        subtitulo: entry.subtitulo || "",
        descricao: entry.descricao || entry.description || "",
      })).filter((item: NewsItem) => item.titulo);

      if (jsonItems.length === 0) {
        toast.error("Nenhuma notícia válida encontrada no JSON.");
        return;
      }

      setItems(prev => [...prev, ...jsonItems]);

      // Also save the JSON content to the report
      if (!reportTitle || reportTitle === "Sem título") {
        const fileName = file.name.replace(/\.json$/i, "");
        setReportTitle(fileName);
      }

      toast.success(`${jsonItems.length} notícia(s) importada(s) do JSON!`);
    } catch {
      toast.error("Erro ao ler o arquivo JSON. Verifique o formato.");
    }

    // Reset file input
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Relatório TXT de Notícias</h1>
          <p className="text-muted-foreground">
            Cadastre notícias e gere um relatório em texto simples para copiar e colar.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleNewReport} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo
          </Button>
          <Button variant="outline" size="sm" onClick={openSavedList} className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Abrir Salvo
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || items.length === 0} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </Button>
        </div>
      </div>

      {/* Report title */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium whitespace-nowrap">Nome do relatório:</label>
        <Input
          value={reportTitle}
          onChange={(e) => setReportTitle(e.target.value)}
          className="max-w-sm"
          placeholder="Título do relatório"
        />
        {currentReportId && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">(salvo)</span>
        )}
      </div>

      {/* Fontes Cadastradas - Links rápidos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Links das Fontes Cadastradas
          </CardTitle>
          <CardDescription>
            Acesse rapidamente os sites das fontes para buscar notícias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingFontes ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando fontes...
            </div>
          ) : fontes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma fonte cadastrada.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {fontes.map((fonte) => (
                <a
                  key={fonte.id}
                  href={fonte.site_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={fonte.site_url}
                >
                  <Badge
                    variant={fonte.status === 'active' ? 'default' : 'secondary'}
                    className="gap-1.5 cursor-pointer hover:opacity-80 transition-opacity py-1.5 px-3"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {fonte.name}
                    {fonte.city && (
                      <span className="opacity-70 text-[10px]">({fonte.city})</span>
                    )}
                  </Badge>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input Tabs: Form / Paste TXT / Upload JSON */}
      <Tabs value={importTab} onValueChange={setImportTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form" className="gap-2">
            <Plus className="h-4 w-4" />
            Cadastro Manual
          </TabsTrigger>
          <TabsTrigger value="paste" className="gap-2">
            <ClipboardPaste className="h-4 w-4" />
            Colar TXT
          </TabsTrigger>
          <TabsTrigger value="json" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload JSON
          </TabsTrigger>
        </TabsList>

        {/* Manual Form Tab */}
        <TabsContent value="form">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">
                {editingIndex !== null ? `Editando Notícia ${editingIndex + 1}` : "Nova Notícia"}
              </CardTitle>
              <CardDescription>
                Campos com * são obrigatórios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título *</label>
                <Input
                  placeholder="Título da notícia"
                  value={form.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Subtítulo</label>
                <Input
                  placeholder="Subtítulo (opcional)"
                  value={form.subtitulo}
                  onChange={(e) => handleChange("subtitulo", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
                <div>
                  <label className="text-sm font-medium">Fonte</label>
                  <Input
                    placeholder="Ex: Agência Brasil (opcional)"
                    value={form.fonte}
                    onChange={(e) => handleChange("fonte", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Data *</label>
                  <Input
                    placeholder="DD/MM/AAAA"
                    value={form.dataPublicacao}
                    onChange={(e) => handleChange("dataPublicacao", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Link da Notícia</label>
                <Input
                  placeholder="https://... (opcional)"
                  value={form.linkNoticia}
                  onChange={(e) => handleChange("linkNoticia", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Link da Imagem</label>
                <Input
                  placeholder="https://... (opcional)"
                  value={form.linkImagem}
                  onChange={(e) => handleChange("linkImagem", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  placeholder="Resumo ou corpo da notícia (opcional)"
                  value={form.descricao}
                  onChange={(e) => handleChange("descricao", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAdd} className="gap-2">
                  {editingIndex !== null ? (
                    <>
                      <Check className="h-4 w-4" />
                      Salvar Alteração
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Adicionar Notícia
                    </>
                  )}
                </Button>
                {editingIndex !== null && (
                  <Button variant="outline" onClick={handleCancelEdit} className="gap-2">
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paste TXT Tab */}
        <TabsContent value="paste">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardPaste className="h-5 w-5" />
                Colar Relatório TXT
              </CardTitle>
              <CardDescription>
                Cole o conteúdo de um relatório TXT gerado anteriormente. O sistema irá extrair automaticamente as notícias.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`Cole aqui o conteúdo do TXT...\n\nExemplo:\nNOTÍCIA 1\nFonte: Agência Brasil\nLink: https://...\nData: 01/03/2026\nTítulo: Exemplo de notícia\n\n----------------------------------------\n\nNOTÍCIA 2\n...`}
                value={pasteTxt}
                onChange={(e) => setPasteTxt(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={handleParseTxt} disabled={!pasteTxt.trim()} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Importar do TXT
                </Button>
                {pasteTxt && (
                  <Button variant="outline" onClick={() => setPasteTxt("")} className="gap-2">
                    <X className="h-4 w-4" />
                    Limpar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload JSON Tab */}
        <TabsContent value="json">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload de JSON
              </CardTitle>
              <CardDescription>
                Envie um arquivo .json com as notícias. Aceita um array ou um objeto com a chave "items".
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Selecione um arquivo JSON</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formato esperado: array de objetos com campos titulo, fonte, data, etc.
                  </p>
                </div>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleJsonUpload}
                    className="hidden"
                  />
                  <Button asChild variant="outline" className="gap-2 cursor-pointer">
                    <span>
                      <Upload className="h-4 w-4" />
                      Escolher Arquivo
                    </span>
                  </Button>
                </label>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs font-medium mb-2">Exemplo de formato JSON:</p>
                <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">{`[
  {
    "titulo": "Título da notícia",
    "fonte": "Nome da fonte",
    "dataPublicacao": "01/03/2026",
    "linkNoticia": "https://...",
    "subtitulo": "Subtítulo",
    "descricao": "Descrição",
    "linkImagem": "https://..."
  }
]`}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Items list */}
      {items.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              Notícias Cadastradas ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between gap-4 rounded-lg border p-4 bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                        #{index + 1}
                      </span>
                      <span className="text-xs text-muted-foreground">{item.dataPublicacao}</span>
                      {item.fonte && (
                        <span className="text-xs text-muted-foreground">• {item.fonte}</span>
                      )}
                    </div>
                    <p className="font-medium text-sm truncate">{item.titulo}</p>
                    {item.subtitulo && (
                      <p className="text-xs text-muted-foreground truncate">{item.subtitulo}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(index)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(index)}
                      title="Remover"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={generateReport}
          disabled={items.length === 0}
          className="gap-2"
        >
          <FileText className="h-5 w-5" />
          Gerar Relatório em TXT ({items.length} notícia{items.length !== 1 ? "s" : ""})
        </Button>
      </div>

      {/* Report modal */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Relatório em Texto</DialogTitle>
          </DialogHeader>
          <Textarea
            className="min-h-[300px] font-mono text-sm"
            value={reportText}
            readOnly
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={downloadTxt} className="gap-2">
              <Download className="h-4 w-4" />
              Baixar .txt
            </Button>
            <Button onClick={copyToClipboard} className="gap-2">
              <Copy className="h-4 w-4" />
              Copiar Tudo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Saved reports modal */}
      <Dialog open={showSavedList} onOpenChange={setShowSavedList}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Relatórios Salvos</DialogTitle>
          </DialogHeader>
          {loadingSaved ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : savedReports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum relatório salvo.</p>
          ) : (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {savedReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <button
                    className="flex-1 text-left min-w-0"
                    onClick={() => loadReport(report)}
                  >
                    <p className="font-medium text-sm truncate">{report.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {(report.items as any[]).length} notícia(s) • Atualizado em{" "}
                      {new Date(report.updated_at).toLocaleDateString("pt-BR")}
                    </p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSavedReport(report.id)}
                    className="text-destructive hover:text-destructive shrink-0"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
