import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, ImageIcon, Search, Trash2, Copy, BarChart3,
  AlertTriangle, CheckCircle, Filter, FolderOpen, RefreshCw
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MediaFile {
  name: string;
  id: string;
  bucket_id: string;
  created_at: string;
  metadata: { size?: number; mimetype?: string } | null;
  url: string;
}

const BUCKETS = ["news-images", "banners", "ads", "site-assets", "business-images", "avatars", "broadcast-thumbnails", "location-photos"];

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function CoreMedia() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBucket, setSelectedBucket] = useState<string>("all");
  const queryClient = useQueryClient();

  // Fetch files from all buckets
  const { data: allFiles = [], isLoading, refetch } = useQuery({
    queryKey: ["core-media-files"],
    queryFn: async () => {
      const results: MediaFile[] = [];
      for (const bucket of BUCKETS) {
        try {
          const { data } = await supabase.storage.from(bucket).list("", { limit: 500, sortBy: { column: "created_at", order: "desc" } });
          if (data) {
            data.filter(f => f.name && !f.name.startsWith(".")).forEach(f => {
              const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(f.name);
              results.push({
                name: f.name,
                id: f.id || `${bucket}/${f.name}`,
                bucket_id: bucket,
                created_at: f.created_at || "",
                metadata: f.metadata as any,
                url: urlData?.publicUrl || "",
              });
            });
          }
        } catch { /* bucket may not exist */ }
      }
      return results;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch news images in use
  const { data: usedImages = [] } = useQuery({
    queryKey: ["core-media-used-images"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news")
        .select("featured_image_url, og_image_url, card_image_url")
        .not("featured_image_url", "is", null);
      const urls = new Set<string>();
      data?.forEach(n => {
        if (n.featured_image_url) urls.add(n.featured_image_url);
        if (n.og_image_url) urls.add(n.og_image_url);
        if (n.card_image_url) urls.add(n.card_image_url);
      });
      return Array.from(urls);
    },
    staleTime: 10 * 60 * 1000,
  });

  // Computed stats
  const stats = useMemo(() => {
    const totalSize = allFiles.reduce((s, f) => s + (f.metadata?.size || 0), 0);
    const byBucket: Record<string, { count: number; size: number }> = {};
    allFiles.forEach(f => {
      if (!byBucket[f.bucket_id]) byBucket[f.bucket_id] = { count: 0, size: 0 };
      byBucket[f.bucket_id].count++;
      byBucket[f.bucket_id].size += f.metadata?.size || 0;
    });

    // Duplicate detection by size+name pattern
    const sizeMap: Record<string, MediaFile[]> = {};
    allFiles.forEach(f => {
      const key = `${f.metadata?.size || 0}`;
      if (!sizeMap[key]) sizeMap[key] = [];
      sizeMap[key].push(f);
    });
    const duplicates = Object.values(sizeMap).filter(g => g.length > 1 && (g[0].metadata?.size || 0) > 1024).flat();

    // Orphans - files not referenced
    const orphans = allFiles.filter(f => 
      f.bucket_id === "news-images" && !usedImages.some(u => u.includes(f.name))
    );

    return { totalSize, totalFiles: allFiles.length, byBucket, duplicates, orphans };
  }, [allFiles, usedImages]);

  // Filtered files
  const filtered = useMemo(() => {
    let files = allFiles;
    if (selectedBucket !== "all") files = files.filter(f => f.bucket_id === selectedBucket);
    if (searchTerm) files = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return files;
  }, [allFiles, selectedBucket, searchTerm]);

  const deleteFileMutation = useMutation({
    mutationFn: async ({ bucket, name }: { bucket: string; name: string }) => {
      const { error } = await supabase.storage.from(bucket).remove([name]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Arquivo removido");
      queryClient.invalidateQueries({ queryKey: ["core-media-files"] });
    },
    onError: () => toast.error("Erro ao remover arquivo"),
  });

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiada!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <NavLink to="/spah/painel/core-engine">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </NavLink>
        <div className="p-2 rounded-xl bg-pink-500/10"><ImageIcon className="h-5 w-5 text-pink-500" /></div>
        <div>
          <h1 className="text-xl font-bold">Mídia Inteligente</h1>
          <p className="text-xs text-muted-foreground">Biblioteca, duplicatas, uso e limpeza de mídia</p>
        </div>
        <Button variant="outline" size="sm" className="ml-auto gap-1.5" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5" />Atualizar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3 flex items-center gap-3">
            <ImageIcon className="h-5 w-5 text-primary" />
            <div><p className="text-2xl font-bold">{stats.totalFiles}</p><p className="text-xs text-muted-foreground">Total Arquivos</p></div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <div><p className="text-2xl font-bold">{formatBytes(stats.totalSize)}</p><p className="text-xs text-muted-foreground">Tamanho Total</p></div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <Copy className="h-5 w-5 text-yellow-500" />
            <div><p className="text-2xl font-bold">{stats.duplicates.length}</p><p className="text-xs text-muted-foreground">Duplicatas</p></div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div><p className="text-2xl font-bold">{stats.orphans.length}</p><p className="text-xs text-muted-foreground">Órfãs</p></div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="library" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="library" className="text-xs gap-1"><FolderOpen className="h-3.5 w-3.5" />Biblioteca</TabsTrigger>
          <TabsTrigger value="stats" className="text-xs gap-1"><BarChart3 className="h-3.5 w-3.5" />Estatísticas</TabsTrigger>
          <TabsTrigger value="duplicates" className="text-xs gap-1"><Copy className="h-3.5 w-3.5" />Duplicatas</TabsTrigger>
          <TabsTrigger value="orphans" className="text-xs gap-1"><Trash2 className="h-3.5 w-3.5" />Órfãs</TabsTrigger>
        </TabsList>

        {/* ── Library ───────────────────── */}
        <TabsContent value="library">
          <Card>
            <CardHeader className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar arquivo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 h-9" />
                </div>
                <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                  <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os buckets</SelectItem>
                    {BUCKETS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum arquivo encontrado</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 p-4">
                  {filtered.slice(0, 60).map(file => (
                    <div key={file.id} className="group relative border rounded-lg overflow-hidden bg-muted/30 hover:border-primary/40 transition-colors">
                      {file.metadata?.mimetype?.startsWith("image/") ? (
                        <img src={file.url} alt={file.name} className="w-full h-24 object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-24 flex items-center justify-center bg-muted">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="p-1.5">
                        <p className="text-[10px] font-medium truncate">{file.name}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-muted-foreground">{formatBytes(file.metadata?.size || 0)}</span>
                          <Badge variant="outline" className="text-[8px] px-1 py-0">{file.bucket_id}</Badge>
                        </div>
                      </div>
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button variant="secondary" size="icon" className="h-6 w-6" onClick={() => copyUrl(file.url)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="destructive" size="icon" className="h-6 w-6" onClick={() => deleteFileMutation.mutate({ bucket: file.bucket_id, name: file.name })}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {filtered.length > 60 && (
                <p className="text-xs text-muted-foreground text-center py-2 border-t">Mostrando 60 de {filtered.length} arquivos</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Stats ──────────────────────── */}
        <TabsContent value="stats">
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm">Uso de Storage por Bucket</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {Object.entries(stats.byBucket)
                .sort((a, b) => b[1].size - a[1].size)
                .map(([bucket, info]) => (
                  <div key={bucket} className="p-4 flex items-center gap-4">
                    <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{bucket}</p>
                      <div className="mt-1">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (info.size / stats.totalSize) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">{formatBytes(info.size)}</p>
                      <p className="text-xs text-muted-foreground">{info.count} arquivos</p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Duplicates ─────────────────── */}
        <TabsContent value="duplicates">
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm">Arquivos Potencialmente Duplicados</CardTitle>
              <CardDescription className="text-xs">Agrupados por tamanho idêntico ({">"}1KB)</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {stats.duplicates.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma duplicata detectada!</p>
                </div>
              ) : (
                stats.duplicates.map(file => (
                  <div key={file.id} className="p-3 flex items-center gap-3">
                    {file.metadata?.mimetype?.startsWith("image/") ? (
                      <img src={file.url} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center"><ImageIcon className="h-4 w-4" /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground">{file.bucket_id} · {formatBytes(file.metadata?.size || 0)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteFileMutation.mutate({ bucket: file.bucket_id, name: file.name })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Orphans ────────────────────── */}
        <TabsContent value="orphans">
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm">Imagens Órfãs (news-images)</CardTitle>
              <CardDescription className="text-xs">Arquivos não referenciados em nenhuma notícia publicada</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {stats.orphans.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma imagem órfã encontrada!</p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-yellow-500/5 text-xs text-yellow-600 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {stats.orphans.length} imagens sem referência. Revise antes de remover.
                  </div>
                  {stats.orphans.slice(0, 50).map(file => (
                    <div key={file.id} className="p-3 flex items-center gap-3">
                      <img src={file.url} alt="" className="h-10 w-10 rounded object-cover" loading="lazy" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">{formatBytes(file.metadata?.size || 0)}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyUrl(file.url)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteFileMutation.mutate({ bucket: file.bucket_id, name: file.name })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
