import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Image, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface NewsCardGeneratorProps {
  title: string;
  excerpt?: string;
  imageUrl?: string;
  category?: string;
  slug: string;
}

type CardFormat = 'feed' | 'stories' | 'square';

const FORMAT_SIZES: Record<CardFormat, { width: number; height: number; label: string }> = {
  feed: { width: 1200, height: 630, label: 'Feed (1200×630)' },
  stories: { width: 1080, height: 1920, label: 'Stories/Reels (1080×1920)' },
  square: { width: 1080, height: 1080, label: 'Quadrado (1080×1080)' },
};

export function NewsCardGenerator({ title, excerpt, imageUrl, category, slug }: NewsCardGeneratorProps) {
  const [format, setFormat] = useState<CardFormat>('feed');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCard = useCallback(async () => {
    setIsGenerating(true);
    try {
      const { width, height } = FORMAT_SIZES[format];
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      // Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Load and draw news image
      if (imageUrl) {
        try {
          const img = await loadImage(imageUrl);
          const imgRatio = img.width / img.height;
          const canvasRatio = width / height;
          
          let sx = 0, sy = 0, sw = img.width, sh = img.height;
          if (imgRatio > canvasRatio) {
            sw = img.height * canvasRatio;
            sx = (img.width - sw) / 2;
          } else {
            sh = img.width / canvasRatio;
            sy = (img.height - sh) / 2;
          }
          
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
        } catch {
          // Keep dark background if image fails
        }
      }

      // Gradient overlay from bottom
      const gradientHeight = format === 'stories' ? height * 0.55 : height * 0.65;
      const gradient = ctx.createLinearGradient(0, height - gradientHeight, 0, height);
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
      gradient.addColorStop(0.3, 'rgba(15, 23, 42, 0.7)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, height - gradientHeight, width, gradientHeight);

      // Top gradient for logo area
      const topGradient = ctx.createLinearGradient(0, 0, 0, height * 0.15);
      topGradient.addColorStop(0, 'rgba(15, 23, 42, 0.8)');
      topGradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = topGradient;
      ctx.fillRect(0, 0, width, height * 0.15);

      const padding = width * 0.06;

      // Category badge
      if (category) {
        const badgeY = format === 'stories' ? height * 0.55 : height * 0.45;
        const badgeFontSize = Math.round(width * 0.025);
        ctx.font = `bold ${badgeFontSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
        const badgeText = category.toUpperCase();
        const badgeWidth = ctx.measureText(badgeText).width + badgeFontSize * 2;
        
        // Badge background
        ctx.fillStyle = '#dc2626';
        roundRect(ctx, padding, badgeY, badgeWidth, badgeFontSize * 2.2, badgeFontSize * 0.5);
        ctx.fill();
        
        // Badge text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(badgeText, padding + badgeFontSize, badgeY + badgeFontSize * 1.5);
      }

      // Title
      const titleFontSize = format === 'stories' 
        ? Math.round(width * 0.06)
        : Math.round(width * 0.04);
      ctx.font = `bold ${titleFontSize}px "Plus Jakarta Sans", "Inter", Arial, sans-serif`;
      ctx.fillStyle = '#ffffff';
      
      const titleY = format === 'stories' ? height * 0.62 : height * 0.55;
      const maxTitleWidth = width - padding * 2;
      const titleLines = wrapText(ctx, title, maxTitleWidth);
      const maxLines = format === 'stories' ? 6 : 4;
      const displayLines = titleLines.slice(0, maxLines);
      
      displayLines.forEach((line, i) => {
        let displayLine = line;
        if (i === maxLines - 1 && titleLines.length > maxLines) {
          displayLine = line.slice(0, -3) + '...';
        }
        ctx.fillText(displayLine, padding, titleY + i * titleFontSize * 1.3);
      });

      // Excerpt (only for feed/square if space)
      if (excerpt && format !== 'stories') {
        const excerptFontSize = Math.round(width * 0.022);
        ctx.font = `${excerptFontSize}px "Inter", Arial, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const excerptY = titleY + displayLines.length * titleFontSize * 1.3 + titleFontSize * 0.5;
        const excerptLines = wrapText(ctx, excerpt, maxTitleWidth).slice(0, 2);
        excerptLines.forEach((line, i) => {
          ctx.fillText(line, padding, excerptY + i * excerptFontSize * 1.5);
        });
      }

      // Site branding bar at bottom
      const barHeight = height * 0.07;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(0, height - barHeight, width, barHeight);

      // Divider line
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, height - barHeight);
      ctx.lineTo(width, height - barHeight);
      ctx.stroke();

      // Site name
      const siteFontSize = Math.round(width * 0.022);
      ctx.font = `bold ${siteFontSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText('CONEXÃO NA CIDADE', padding, height - barHeight / 2 + siteFontSize * 0.35);

      // URL on right
      ctx.font = `${siteFontSize * 0.8}px "Inter", sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      const urlText = 'conexaonacidade.com.br';
      const urlWidth = ctx.measureText(urlText).width;
      ctx.fillText(urlText, width - padding - urlWidth, height - barHeight / 2 + siteFontSize * 0.35);

      // Download
      const link = document.createElement('a');
      link.download = `${slug}-${format}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('Card gerado com sucesso!');
    } catch (err) {
      console.error('Error generating card:', err);
      toast.error('Erro ao gerar card');
    } finally {
      setIsGenerating(false);
    }
  }, [format, title, excerpt, imageUrl, category, slug]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Image className="h-4 w-4" />
          Gerar Card Visual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={format} onValueChange={(v) => setFormat(v as CardFormat)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FORMAT_SIZES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={generateCard} disabled={isGenerating} className="w-full gap-2">
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isGenerating ? 'Gerando...' : 'Baixar Card'}
        </Button>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </CardContent>
    </Card>
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

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
