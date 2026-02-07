import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMemberCirculation } from '@/hooks/useMemberCirculation';
import { buildShareUrl, buildShareText, SOURCE_LABELS, type ValidSource } from '@/lib/circulationUtils';
import { Copy, Share2, MessageCircle, Facebook, Instagram, Twitter, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const SOURCE_ICONS: Record<ValidSource, React.ElementType> = {
  wa: MessageCircle,
  fb: Facebook,
  ig: Instagram,
  x: Twitter,
  direct: Copy,
};

export function MemberSharePanel() {
  const { refCode, city, recentNews, clickCounts, totalClicks, isReady } = useMemberCirculation();
  const [expandedNews, setExpandedNews] = useState<string | null>(null);

  if (!isReady) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando dados de circulação...
        </CardContent>
      </Card>
    );
  }

  const handleCopy = async (newsItem: typeof recentNews[0], src: ValidSource) => {
    const link = buildShareUrl(newsItem.slug, refCode!, src);
    const text = buildShareText(newsItem.title, newsItem.excerpt || '', link, city);
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Link ${SOURCE_LABELS[src]} copiado!`);
    } catch {
      toast.error('Não foi possível copiar');
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{totalClicks}</p>
              <p className="text-sm text-muted-foreground">Alcance gerado</p>
              <p className="text-xs text-muted-foreground">Mede quantas vezes seu link foi acessado.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Share Cards */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Compartilhe e gere alcance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentNews.map((newsItem) => {
            const isExpanded = expandedNews === newsItem.id;
            const clicks = clickCounts[newsItem.id] || 0;

            return (
              <div key={newsItem.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-2">{newsItem.title}</h4>
                    {clicks > 0 && (
                      <span className="text-xs text-primary font-medium">{clicks} acessos</span>
                    )}
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {(['wa', 'fb', 'ig', 'x', 'direct'] as ValidSource[]).map((src) => {
                    const Icon = SOURCE_ICONS[src];
                    return (
                      <Button
                        key={src}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1"
                        onClick={() => handleCopy(newsItem, src)}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {SOURCE_LABELS[src]}
                      </Button>
                    );
                  })}
                </div>

                {/* Expandable Text */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs w-full"
                  onClick={() => setExpandedNews(isExpanded ? null : newsItem.id)}
                >
                  {isExpanded ? 'Fechar texto' : 'Editar texto para copiar'}
                </Button>

                {isExpanded && (
                  <EditableShareText
                    newsItem={newsItem}
                    refCode={refCode!}
                    city={city}
                  />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function EditableShareText({
  newsItem,
  refCode,
  city,
}: {
  newsItem: { title: string; slug: string; excerpt: string | null };
  refCode: string;
  city: string;
}) {
  const link = buildShareUrl(newsItem.slug, refCode, 'direct');
  const defaultText = buildShareText(newsItem.title, newsItem.excerpt || '', link, city);
  const [text, setText] = useState(defaultText);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Texto copiado!');
    } catch {
      toast.error('Não foi possível copiar');
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="text-xs"
      />
      <Button size="sm" onClick={handleCopyText} className="w-full gap-1">
        <Copy className="h-3.5 w-3.5" />
        Copiar texto
      </Button>
    </div>
  );
}
