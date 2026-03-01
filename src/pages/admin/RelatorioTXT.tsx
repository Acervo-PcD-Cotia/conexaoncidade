import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil, Copy, Download, FileText, X, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface NewsItem {
  fonte: string;
  linkImagem: string;
  dataPublicacao: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
}

const emptyItem: NewsItem = {
  fonte: "",
  linkImagem: "",
  dataPublicacao: "",
  titulo: "",
  subtitulo: "",
  descricao: "",
};

export default function RelatorioTXT() {
  const [form, setForm] = useState<NewsItem>({ ...emptyItem });
  const [items, setItems] = useState<NewsItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState("");

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

  const generateReport = useCallback(() => {
    if (items.length === 0) {
      toast.error("Adicione pelo menos uma notícia.");
      return;
    }

    const lines = items.map((item, i) => {
      const parts = [`NOTÍCIA ${i + 1}`];
      if (item.fonte) parts.push(`Fonte: ${item.fonte}`);
      parts.push(`Data: ${item.dataPublicacao}`);
      parts.push(`Título: ${item.titulo}`);
      if (item.subtitulo) parts.push(`Subtítulo: ${item.subtitulo}`);
      if (item.descricao) parts.push(`Descrição: ${item.descricao}`);
      if (item.linkImagem) parts.push(`Imagem: ${item.linkImagem}`);
      return parts.join("\n");
    });

    const text = lines.join("\n\n----------------------------------------\n\n");
    setReportText(text);
    setShowReport(true);
  }, [items]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Relatório TXT de Notícias</h1>
        <p className="text-muted-foreground">
          Cadastre notícias e gere um relatório em texto simples para copiar e colar.
        </p>
      </div>

      {/* Form */}
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
          {/* Título */}
          <div>
            <label className="text-sm font-medium">Título *</label>
            <Input
              placeholder="Título da notícia"
              value={form.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
            />
          </div>

          {/* Subtítulo */}
          <div>
            <label className="text-sm font-medium">Subtítulo</label>
            <Input
              placeholder="Subtítulo (opcional)"
              value={form.subtitulo}
              onChange={(e) => handleChange("subtitulo", e.target.value)}
            />
          </div>

          {/* Fonte + Data */}
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

          {/* Link Imagem */}
          <div>
            <label className="text-sm font-medium">Link da Imagem</label>
            <Input
              placeholder="https://... (opcional)"
              value={form.linkImagem}
              onChange={(e) => handleChange("linkImagem", e.target.value)}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              placeholder="Resumo ou corpo da notícia (opcional)"
              value={form.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
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
    </div>
  );
}
