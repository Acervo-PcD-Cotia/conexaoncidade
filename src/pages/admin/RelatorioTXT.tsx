import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil, Copy, Download, FileText, X, Check, Save, FolderOpen, Loader2, ExternalLink, Globe, ClipboardPaste, Upload, CloudOff, Cloud, ImagePlus, Link2, Images } from "lucide-react";
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
import { extractImagesFromDescription } from "@/utils/extractDescriptionImages";

interface NewsLink {
  label: string;
  url: string;
}

interface NewsItem {
  fonte: string;
  linkNoticia: string;
  linkImagem: string;
  dataPublicacao: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  links?: NewsLink[];
  extraImages?: string[];
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
  links: [],
  extraImages: [],
};

/** Safely convert any value to string (objects become JSON) */
function str(val: unknown): string {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return JSON.stringify(val);
}

function mapEntryToItem(entry: any): NewsItem {
  const rawDescricao = str(entry.descricao || entry.description || entry.conteudo);
  const rawLinkImagem = str(entry.linkImagem || entry.imagem || entry.image);

  // Extract images from description automatically
  const { cleanDescription, images } = extractImagesFromDescription(rawDescricao);

  const rawLinks = entry.links;
  const parsedLinks: NewsLink[] = Array.isArray(rawLinks)
    ? rawLinks.map((l: any) => ({ label: str(l.label || l.titulo || ''), url: str(l.url || l.link || '') })).filter((l: NewsLink) => l.url)
    : [];

  const rawExtraImages = entry.extraImages || entry.maisImagens || entry.gallery;
  const parsedExtraImages: string[] = Array.isArray(rawExtraImages)
    ? rawExtraImages.map((img: any) => str(typeof img === 'string' ? img : img.url || '')).filter(Boolean)
    : [];

  return {
    fonte: str(entry.fonte),
    linkNoticia: str(entry.linkNoticia || entry.link || entry.url_original),
    linkImagem: rawLinkImagem || (images.length > 0 ? images[0].url : ''),
    dataPublicacao: str(entry.dataPublicacao || entry.data),
    titulo: str(entry.titulo || entry.title),
    subtitulo: str(entry.subtitulo),
    descricao: images.length > 0 ? cleanDescription : rawDescricao,
    links: parsedLinks,
    extraImages: parsedExtraImages.length > 0 ? parsedExtraImages : (images.length > 1 ? images.slice(1).map(i => i.url) : []),
  };
}

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

function ImageUploadField({
  linkImagem,
  onLinkChange,
}: {
  linkImagem: string;
  onLinkChange: (val: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo: 5MB.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `relatorio/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("news-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("news-images")
        .getPublicUrl(fileName);

      onLinkChange(urlData.publicUrl);
      toast.success("Imagem enviada!");
    } catch (err: any) {
      toast.error("Erro ao enviar imagem: " + (err.message || "desconhecido"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="text-sm font-medium">Imagem</label>
      <div className="flex gap-2">
        <Input
          placeholder="https://... (opcional)"
          value={linkImagem}
          onChange={(e) => onLinkChange(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          title="Fazer upload de imagem"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
      {linkImagem && linkImagem.startsWith("http") && (
        <div className="mt-2">
          <img
            src={linkImagem}
            alt="Preview"
            className="h-20 w-32 object-cover rounded border"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}
    </div>
  );
}

function ExtraImageItem({
  url,
  index,
  onUrlChange,
  onRemove,
}: {
  url: string;
  index: number;
  onUrlChange: (val: string) => void;
  onRemove: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Selecione um arquivo de imagem."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem muito grande. Máximo: 5MB."); return; }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `relatorio/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("news-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("news-images").getPublicUrl(fileName);
      onUrlChange(urlData.publicUrl);
      toast.success("Imagem enviada!");
    } catch (err: any) {
      toast.error("Erro ao enviar imagem: " + (err.message || "desconhecido"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2 items-center">
        <span className="text-xs text-muted-foreground w-6 text-center shrink-0">{index + 2}</span>
        <Input
          placeholder="https://... ou faça upload"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          title="Upload de imagem"
          className="shrink-0"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="shrink-0 text-destructive hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {url && url.startsWith("http") && (
        <div className="ml-8">
          <img
            src={url}
            alt={`Imagem extra ${index + 2}`}
            className="h-16 w-24 object-cover rounded border"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}
    </div>
  );
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
  const [pasteJson, setPasteJson] = useState("");
  const [importTab, setImportTab] = useState("form");

  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoadRef = useRef(true);

  const buildReportText = useCallback((newsItems: NewsItem[]) => {
    const lines = newsItems.map((item, i) => {
      const parts = [`NOTÍCIA ${i + 1}`];
      if (item.fonte) parts.push(`Fonte: ${item.fonte}`);
      if (item.linkNoticia) parts.push(`Link: ${item.linkNoticia}`);
      parts.push(`Data: ${item.dataPublicacao}`);
      parts.push(`Título: ${item.titulo}`);
      if (item.subtitulo) parts.push(`Subtítulo: ${item.subtitulo}`);
      if (item.descricao) parts.push(`Descrição: ${item.descricao}`);
      if (item.links && item.links.length > 0) {
        item.links.forEach((link) => {
          parts.push(`${link.label ? link.label + ': ' : 'Link: '}${link.url}`);
        });
      }
      if (item.linkImagem) parts.push(`Imagem: ${item.linkImagem}`);
      if (item.extraImages && item.extraImages.length > 0) {
        item.extraImages.forEach((img, imgIdx) => {
          parts.push(`Imagem ${imgIdx + 2}: ${img}`);
        });
      }
      return parts.join("\n");
    });
    return lines.join("\n\n----------------------------------------\n\n");
  }, []);

  // Auto-save function
  const autoSave = useCallback(async (currentItems: NewsItem[], title: string, reportId: string | null) => {
    if (currentItems.length === 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setAutoSaveStatus('saving');
    const text = buildReportText(currentItems);

    try {
      if (reportId) {
        const { error } = await supabase
          .from("relatorio_txt_saved")
          .update({ title, items: currentItems as any, report_text: text })
          .eq("id", reportId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("relatorio_txt_saved")
          .insert({ user_id: user.id, title, items: currentItems as any, report_text: text })
          .select("id")
          .single();
        if (error) throw error;
        if (data) setCurrentReportId(data.id);
      }
      setAutoSaveStatus('saved');
      setLastSavedAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    } catch {
      setAutoSaveStatus('error');
    }
  }, [buildReportText]);

  // Debounced auto-save effect
  useEffect(() => {
    // Skip auto-save on initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    if (items.length === 0) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      autoSave(items, reportTitle, currentReportId);
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [items, reportTitle]);

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

    // Extract images from description
    const { cleanDescription, images: extractedImages } = extractImagesFromDescription(form.descricao);

    // Auto-fill fonte from reportTitle if empty
    const finalForm = {
      ...form,
      fonte: form.fonte || (reportTitle !== "Sem título" ? reportTitle : ""),
      descricao: extractedImages.length > 0 ? cleanDescription : form.descricao,
      linkImagem: form.linkImagem || (extractedImages.length > 0 ? extractedImages[0].url : ''),
    };

    if (editingIndex !== null) {
      setItems((prev) => prev.map((item, i) => (i === editingIndex ? { ...finalForm } : item)));
      setEditingIndex(null);
      toast.success("Notícia atualizada!");
    } else {
      setItems((prev) => [...prev, { ...finalForm }]);
      if (extractedImages.length > 0) {
        toast.success(`Notícia adicionada! ${extractedImages.length} imagem(ns) extraída(s) da descrição.`);
      } else {
        toast.success("Notícia adicionada!");
      }
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
    isInitialLoadRef.current = true;
    setItems(report.items);
    setReportTitle(report.title);
    setCurrentReportId(report.id);
    setShowSavedList(false);
    setEditingIndex(null);
    setForm({ ...emptyItem });
    setAutoSaveStatus('saved');
    setLastSavedAt(new Date(report.updated_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    toast.success("Relatório carregado!");
  };

  const downloadReportTxt = (report: SavedReport) => {
    const text = report.report_text || buildReportText(report.items);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.title || "relatorio"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("TXT baixado!");
  };

  const downloadReportJson = (report: SavedReport) => {
    const json = JSON.stringify(report.items, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.title || "relatorio"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON baixado!");
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
    isInitialLoadRef.current = true;
    setItems([]);
    setForm({ ...emptyItem });
    setEditingIndex(null);
    setReportTitle("Sem título");
    setCurrentReportId(null);
    setPasteTxt("");
    setAutoSaveStatus('idle');
    setLastSavedAt(null);
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
    setItems(parsed);
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

      jsonItems = arr.map((entry: any) => mapEntryToItem(entry)).filter((item: NewsItem) => item.titulo);

      if (jsonItems.length === 0) {
        toast.error("Nenhuma notícia válida encontrada no JSON.");
        return;
      }

      setItems(jsonItems);

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
        <div className="flex items-center gap-2">
          {/* Auto-save status */}
          {autoSaveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Salvando...
            </span>
          )}
          {autoSaveStatus === 'saved' && lastSavedAt && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Cloud className="h-3 w-3" />
              Salvo às {lastSavedAt}
            </span>
          )}
          {autoSaveStatus === 'error' && (
            <span className="flex items-center gap-1 text-xs text-destructive">
              <CloudOff className="h-3 w-3" />
              Erro ao salvar
            </span>
          )}
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
                    value={form.fonte || (reportTitle !== "Sem título" ? reportTitle : "")}
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
              <ImageUploadField
                linkImagem={form.linkImagem}
                onLinkChange={(val) => handleChange("linkImagem", val)}
              />
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  placeholder="Resumo ou corpo da notícia (opcional). URLs de imagens serão extraídas automaticamente."
                  value={form.descricao}
                  onChange={(e) => handleChange("descricao", e.target.value)}
                  rows={3}
                />
                {/* Image extraction preview */}
                {(() => {
                  const { images } = extractImagesFromDescription(form.descricao);
                  if (images.length === 0) return null;
                  return (
                    <div className="mt-2 p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
                      <p className="text-xs font-medium text-primary">
                        📷 {images.length} imagem(ns) detectada(s) — serão extraídas automaticamente
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={img.url}
                              alt={img.caption || `Imagem ${idx + 1}`}
                              className="h-16 w-24 object-cover rounded border"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            {img.caption && (
                              <p className="text-[10px] text-muted-foreground mt-0.5 max-w-24 truncate" title={img.caption}>
                                {img.caption}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Links section */}
              <div>
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" />
                  Links da Notícia
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  Adicione links relacionados (ex: inscrições, formulários, sites oficiais)
                </p>
                <div className="space-y-2">
                  {(form.links || []).map((link, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder="Rótulo (ex: Inscrições)"
                        value={link.label}
                        onChange={(e) => {
                          const updated = [...(form.links || [])];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          setForm((prev) => ({ ...prev, links: updated }));
                        }}
                        className="w-1/3"
                      />
                      <Input
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => {
                          const updated = [...(form.links || [])];
                          updated[idx] = { ...updated[idx], url: e.target.value };
                          setForm((prev) => ({ ...prev, links: updated }));
                        }}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const updated = (form.links || []).filter((_, i) => i !== idx);
                          setForm((prev) => ({ ...prev, links: updated }));
                        }}
                        className="shrink-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        links: [...(prev.links || []), { label: "", url: "" }],
                      }));
                    }}
                    className="gap-1.5 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar Link
                  </Button>
                </div>
              </div>

              {/* Extra Images section */}
              <div>
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Images className="h-3.5 w-3.5" />
                  Mais Imagens
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  Adicione imagens extras por link ou upload (galeria)
                </p>
                <div className="space-y-2">
                  {(form.extraImages || []).map((imgUrl, idx) => (
                    <ExtraImageItem
                      key={idx}
                      url={imgUrl}
                      index={idx}
                      onUrlChange={(val) => {
                        const updated = [...(form.extraImages || [])];
                        updated[idx] = val;
                        setForm((prev) => ({ ...prev, extraImages: updated }));
                      }}
                      onRemove={() => {
                        const updated = (form.extraImages || []).filter((_, i) => i !== idx);
                        setForm((prev) => ({ ...prev, extraImages: updated }));
                      }}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        extraImages: [...(prev.extraImages || []), ""],
                      }));
                    }}
                    className="gap-1.5 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar Imagem
                  </Button>
                </div>
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
                Importar JSON
              </CardTitle>
              <CardDescription>
                Cole o código JSON ou envie um arquivo .json. Aceita um array ou objeto com a chave "items".
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Colar JSON */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Colar código JSON</label>
                <Textarea
                  placeholder={`Cole o JSON aqui...\n\n[\n  { "titulo": "...", "fonte": "...", "dataPublicacao": "...", ... }\n]`}
                  value={pasteJson}
                  onChange={(e) => setPasteJson(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (!pasteJson.trim()) {
                        toast.error("Cole o código JSON primeiro.");
                        return;
                      }
                      try {
                        const data = JSON.parse(pasteJson);
                        const arr = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : null;
                        if (!arr) {
                          toast.error("JSON inválido. Esperado um array ou { items: [...] }.");
                          return;
                        }
                        const jsonItems: NewsItem[] = arr.map((entry: any) => mapEntryToItem(entry)).filter((item: NewsItem) => item.titulo);
                        if (jsonItems.length === 0) {
                          toast.error("Nenhuma notícia válida encontrada no JSON.");
                          return;
                        }
                        setItems(jsonItems);
                        setPasteJson("");
                        toast.success(`${jsonItems.length} notícia(s) importada(s) do JSON!`);
                      } catch {
                        toast.error("JSON inválido. Verifique a sintaxe.");
                      }
                    }}
                    disabled={!pasteJson.trim()}
                    className="gap-2"
                  >
                    <ClipboardPaste className="h-4 w-4" />
                    Importar JSON
                  </Button>
                  {pasteJson && (
                    <Button variant="outline" onClick={() => setPasteJson("")} className="gap-2">
                      <X className="h-4 w-4" />
                      Limpar
                    </Button>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">ou</span></div>
              </div>

              {/* Upload arquivo */}
              <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-3">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Upload de arquivo .json</p>
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
                  <Button asChild variant="outline" size="sm" className="gap-2 cursor-pointer">
                    <span>
                      <Upload className="h-4 w-4" />
                      Escolher Arquivo
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Fontes Cadastradas - Links rápidos (collapsible, compact) */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
          <Globe className="h-4 w-4" />
          Links das Fontes Cadastradas
          <span className="text-xs opacity-60">({fontes.length})</span>
        </summary>
        <div className="pt-2 pb-1">
          {loadingFontes ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando fontes...
            </div>
          ) : fontes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma fonte cadastrada.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
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
                    className="gap-1 cursor-pointer hover:opacity-80 transition-opacity py-1 px-2 text-[11px]"
                  >
                    <ExternalLink className="h-2.5 w-2.5" />
                    {fonte.name}
                  </Badge>
                </a>
              ))}
            </div>
          )}
        </div>
      </details>

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
                    {item.links && item.links.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {item.links.map((link, li) => (
                          <a
                            key={li}
                            href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline bg-primary/5 px-1.5 py-0.5 rounded"
                          >
                            <Link2 className="h-3 w-3" />
                            {link.label || link.url}
                          </a>
                        ))}
                      </div>
                    )}
                    {item.extraImages && item.extraImages.length > 0 && (
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {item.extraImages.map((img, ii) => (
                          <img
                            key={ii}
                            src={img}
                            alt={`Extra ${ii + 2}`}
                            className="h-10 w-14 object-cover rounded border"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ))}
                        <span className="text-[10px] text-muted-foreground self-end">+{item.extraImages.length} img</span>
                      </div>
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
            <Button variant="outline" onClick={copyToClipboard} className="gap-2">
              <Copy className="h-4 w-4" />
              Copiar Tudo
            </Button>
            <Button
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { toast.error("Faça login para salvar."); return; }
                const text = reportText;
                const title = reportTitle || "Sem título";
                try {
                  if (currentReportId) {
                    await supabase.from("relatorio_txt_saved").update({ title, items: items as any, report_text: text }).eq("id", currentReportId);
                  } else {
                    const { data } = await supabase.from("relatorio_txt_saved").insert({ user_id: user.id, title, items: items as any, report_text: text }).select("id").single();
                    if (data) setCurrentReportId(data.id);
                  }
                  toast.success("Relatório TXT salvo!");
                } catch { toast.error("Erro ao salvar."); }
              }}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar TXT
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
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {savedReports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{report.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {(report.items as any[]).length} notícia(s) • Atualizado em{" "}
                        {new Date(report.updated_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
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
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => loadReport(report)} className="gap-1.5 text-xs">
                      <FolderOpen className="h-3.5 w-3.5" />
                      Abrir Notícias
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => downloadReportTxt(report)} className="gap-1.5 text-xs">
                      <FileText className="h-3.5 w-3.5" />
                      Baixar TXT
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => downloadReportJson(report)} className="gap-1.5 text-xs">
                      <Download className="h-3.5 w-3.5" />
                      Baixar JSON
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
