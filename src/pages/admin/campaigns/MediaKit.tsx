import { useNavigate } from 'react-router-dom';
import { campaignRoutes } from '@/lib/campaignRoutes';
import { ArrowLeft, Download, Monitor, Megaphone, Smartphone, LogIn, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getSlotBlocks, type ChannelBlockMeta } from '@/lib/adSlots';

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  ads: Monitor,
  publidoor: Megaphone,
  webstories: Smartphone,
  login: LogIn,
  experience: Sparkles,
};

const BLOCKS = getSlotBlocks();

function FormatPreview({ width, height }: { width: number; height: number }) {
  const maxW = 100;
  const scale = maxW / Math.max(width, 100);
  const w = Math.round(width * scale);
  const h = Math.min(Math.round(height * scale), 80);

  return (
    <div
      className="rounded border border-primary/30 bg-primary/10 flex items-center justify-center"
      style={{ width: w, height: Math.max(h, 8) }}
    >
      <span className="text-[9px] text-primary font-mono">{width}×{height}</span>
    </div>
  );
}

function generatePDF() {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text('Mídia Kit — Formatos Publicitários', pageW / 2, 25, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text('Todos os formatos disponíveis para campanhas 360°', pageW / 2, 33, { align: 'center' });

  let y = 45;

  BLOCKS.forEach((block) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(block.title, 14, y);
    y += 6;

    const rows = block.slots.map((f) => [
      `#${f.seq}`,
      f.label,
      f.key,
      f.description,
      f.location,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Nome Comercial', 'Dimensão', 'Descrição', 'Onde Aparece']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 12;
  });

  doc.save('midia-kit-formatos-publicitarios.pdf');
}

export default function MediaKit() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(campaignRoutes.unified())}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Mídia Kit</h1>
            <p className="text-muted-foreground text-sm">
              15 formatos publicitários disponíveis para campanhas 360°
            </p>
          </div>
        </div>
        <Button onClick={generatePDF} className="gap-2">
          <Download className="h-4 w-4" />
          Baixar PDF
        </Button>
      </div>

      <Separator />

      {/* Blocks */}
      {BLOCKS.map((block) => {
        const Icon = CHANNEL_ICONS[block.channel] || Monitor;
        return (
          <div key={block.channel} className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className={`${block.color} text-white gap-1.5 py-1 px-3`}>
                <Icon className="h-3.5 w-3.5" />
                {block.title}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {block.slots.length} formato{block.slots.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {block.slots.map((f) => (
                <Card key={f.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>#{f.seq} — {f.label}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">{f.key}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-center py-2">
                      <FormatPreview width={f.width} height={f.height} />
                    </div>
                    <p className="text-xs text-muted-foreground">{f.description}</p>
                    <p className="text-xs">
                      <span className="font-medium">Onde aparece:</span>{' '}
                      <span className="text-muted-foreground">{f.location}</span>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />
          </div>
        );
      })}
    </div>
  );
}
