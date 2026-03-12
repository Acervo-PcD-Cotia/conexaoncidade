import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Instagram, Download, Send, Loader2, Image, Video, RefreshCw, Copy, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { NewsCardGenerator } from '@/components/news/NewsCardGenerator';

type PostFormat = 'post' | 'reels';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string | null;
  featured_image_url: string | null;
  og_image_url: string | null;
  slug: string;
  published_at: string | null;
  category: { name: string } | null;
}

export default function InstagramGenerator() {
  const [selectedNewsId, setSelectedNewsId] = useState<string>('');
  const [postFormat, setPostFormat] = useState<PostFormat>('post');
  const [caption, setCaption] = useState('');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewCardUrl, setPreviewCardUrl] = useState<string | null>(null);

  // Fetch recent published news
  const { data: newsList = [], isLoading: isLoadingNews } = useQuery({
    queryKey: ['instagram-news-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, excerpt, featured_image_url, og_image_url, slug, published_at, category:categories(name)')
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('published_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      return (data || []) as unknown as NewsItem[];
    },
  });

  const selectedNews = newsList.find(n => n.id === selectedNewsId);

  const generateCaption = async () => {
    if (!selectedNews) return;
    setIsGeneratingCaption(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-instagram-caption', {
        body: {
          title: selectedNews.title,
          excerpt: selectedNews.excerpt || '',
          category: selectedNews.category?.name || '',
          format: postFormat,
          slug: selectedNews.slug,
        },
      });

      if (error) throw error;
      setCaption(data.caption || '');
      toast.success('Legenda gerada!');
    } catch (err) {
      console.error('Caption generation error:', err);
      // Fallback: generate locally
      const hashtags = selectedNews.category?.name 
        ? `#${selectedNews.category.name.toLowerCase().replace(/\s+/g, '')} #noticias #conexaonacidade` 
        : '#noticias #conexaonacidade';
      
      const fallbackCaption = `📰 ${selectedNews.title}\n\n${selectedNews.excerpt || ''}\n\n🔗 Link na bio\n\n${hashtags}`;
      setCaption(fallbackCaption);
      toast.info('Legenda gerada localmente');
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const generateCardPreview = async () => {
    if (!selectedNews) return;

    const canvas = document.createElement('canvas');
    const format = postFormat === 'reels' 
      ? { width: 1080, height: 1920 }
      : { width: 1080, height: 1080 };

    canvas.width = format.width;
    canvas.height = format.height;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, format.width, format.height);

    // Load image
    const imageUrl = selectedNews.og_image_url || selectedNews.featured_image_url;
    if (imageUrl) {
      try {
        const img = await loadImage(imageUrl);
        const imgRatio = img.width / img.height;
        const canvasRatio = format.width / format.height;
        
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (imgRatio > canvasRatio) {
          sw = img.height * canvasRatio;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / canvasRatio;
          sy = (img.height - sh) / 2;
        }
        
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, format.width, format.height);
      } catch { /* keep dark bg */ }
    }

    // Gradient
    const gradH = format.height * 0.55;
    const gradient = ctx.createLinearGradient(0, format.height - gradH, 0, format.height);
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
    gradient.addColorStop(0.3, 'rgba(15, 23, 42, 0.7)');
    gradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, format.height - gradH, format.width, gradH);

    // Top gradient
    const topGrad = ctx.createLinearGradient(0, 0, 0, format.height * 0.12);
    topGrad.addColorStop(0, 'rgba(15, 23, 42, 0.8)');
    topGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, format.width, format.height * 0.12);

    const pad = format.width * 0.07;

    // Category badge
    if (selectedNews.category?.name) {
      const badgeY = postFormat === 'reels' ? format.height * 0.55 : format.height * 0.5;
      const bfs = Math.round(format.width * 0.03);
      ctx.font = `bold ${bfs}px sans-serif`;
      const bt = selectedNews.category.name.toUpperCase();
      const bw = ctx.measureText(bt).width + bfs * 2;
      
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(pad, badgeY, bw, bfs * 2.2, bfs * 0.5);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.fillText(bt, pad + bfs, badgeY + bfs * 1.5);
    }

    // Title
    const tfs = postFormat === 'reels' ? Math.round(format.width * 0.065) : Math.round(format.width * 0.055);
    ctx.font = `bold ${tfs}px sans-serif`;
    ctx.fillStyle = '#ffffff';

    const titleY = postFormat === 'reels' ? format.height * 0.62 : format.height * 0.58;
    const lines = wrapText(ctx, selectedNews.title, format.width - pad * 2).slice(0, 5);
    lines.forEach((line, i) => {
      ctx.fillText(line, pad, titleY + i * tfs * 1.3);
    });

    // Bottom bar
    const barH = format.height * 0.06;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(0, format.height - barH, format.width, barH);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, format.height - barH);
    ctx.lineTo(format.width, format.height - barH);
    ctx.stroke();

    const sfs = Math.round(format.width * 0.025);
    ctx.font = `bold ${sfs}px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CONEXÃO NA CIDADE', pad, format.height - barH / 2 + sfs * 0.35);

    ctx.font = `${sfs * 0.8}px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const urlText = '@conexaonacidade';
    const urlW = ctx.measureText(urlText).width;
    ctx.fillText(urlText, format.width - pad - urlW, format.height - barH / 2 + sfs * 0.35);

    setPreviewCardUrl(canvas.toDataURL('image/png'));
  };

  const downloadCard = () => {
    if (!previewCardUrl || !selectedNews) return;
    const link = document.createElement('a');
    link.download = `instagram-${selectedNews.slug}-${postFormat}.png`;
    link.href = previewCardUrl;
    link.click();
    toast.success('Imagem baixada!');
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      toast.success('Legenda copiada!');
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const publishToInstagram = async () => {
    if (!selectedNews || !previewCardUrl || !caption) {
      toast.error('Selecione uma notícia, gere a imagem e a legenda primeiro');
      return;
    }

    setIsPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('social-publisher', {
        body: {
          action: 'publish',
          platform: 'instagram',
          content_type: postFormat === 'reels' ? 'reel' : 'feed',
          image_url: selectedNews.og_image_url || selectedNews.featured_image_url,
          caption,
          news_id: selectedNews.id,
        },
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success('Publicado no Instagram!');
      } else {
        toast.info(data?.message || 'Publicação enviada para processamento');
      }
    } catch (err) {
      console.error('Publish error:', err);
      toast.error('Erro ao publicar. Verifique as credenciais do Instagram nas configurações.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
          <Instagram className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Gerador Instagram</h1>
          <p className="text-sm text-muted-foreground">Gere cards e publique notícias no Instagram</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="space-y-4">
          {/* News selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">1. Selecione a Notícia</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedNewsId} onValueChange={setSelectedNewsId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma notícia..." />
                </SelectTrigger>
                <SelectContent>
                  {newsList.map(n => (
                    <SelectItem key={n.id} value={n.id}>
                      <span className="line-clamp-1">{n.title}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedNews && (
                <div className="mt-3 p-3 rounded-lg bg-muted/50 space-y-1">
                  <p className="text-sm font-medium line-clamp-2">{selectedNews.title}</p>
                  {selectedNews.category?.name && (
                    <Badge variant="secondary" className="text-xs">{selectedNews.category.name}</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Format selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">2. Formato</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={postFormat} onValueChange={(v) => setPostFormat(v as PostFormat)}>
                <TabsList className="w-full">
                  <TabsTrigger value="post" className="flex-1 gap-1">
                    <Image className="h-3.5 w-3.5" /> Post
                  </TabsTrigger>
                  <TabsTrigger value="reels" className="flex-1 gap-1">
                    <Video className="h-3.5 w-3.5" /> Reels
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="mt-3 flex gap-2">
                <Button onClick={generateCardPreview} disabled={!selectedNews} className="flex-1 gap-1">
                  <Eye className="h-4 w-4" /> Gerar Imagem
                </Button>
                <Button onClick={downloadCard} disabled={!previewCardUrl} variant="outline" className="gap-1">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Caption */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">3. Legenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={generateCaption} 
                disabled={!selectedNews || isGeneratingCaption}
                variant="outline" 
                className="w-full gap-1"
              >
                {isGeneratingCaption ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Gerar Legenda com IA
              </Button>

              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="A legenda será gerada aqui..."
                rows={6}
                className="text-sm"
              />

              <div className="flex gap-2">
                <Button onClick={copyCaption} disabled={!caption} variant="outline" className="flex-1 gap-1">
                  <Copy className="h-4 w-4" /> Copiar
                </Button>
                <Button 
                  onClick={publishToInstagram} 
                  disabled={!selectedNews || !caption || isPublishing}
                  className="flex-1 gap-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Publicar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {previewCardUrl ? (
                <div className="flex justify-center">
                  <img 
                    src={previewCardUrl} 
                    alt="Preview do card" 
                    className="rounded-lg shadow-lg max-h-[500px] w-auto"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Image className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm">Selecione uma notícia e clique em "Gerar Imagem"</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card generator for other formats */}
          {selectedNews && (
            <NewsCardGenerator
              title={selectedNews.title}
              excerpt={selectedNews.excerpt || undefined}
              imageUrl={selectedNews.og_image_url || selectedNews.featured_image_url || undefined}
              category={selectedNews.category?.name}
              slug={selectedNews.slug}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
