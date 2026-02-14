import { useNavigate } from 'react-router-dom';
import { campaignRoutes } from '@/lib/campaignRoutes';
import { ArrowLeft, Download, Monitor, Megaphone, Smartphone, LogIn, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FormatItem {
  id: number;
  name: string;
  size: string;
  width: number;
  height: number;
  description: string;
  location: string;
}

interface FormatBlock {
  title: string;
  icon: React.ElementType;
  color: string;
  formats: FormatItem[];
}

const BLOCKS: FormatBlock[] = [
  {
    title: 'Ads (Banners)',
    icon: Monitor,
    color: 'bg-blue-500',
    formats: [
      { id: 1, name: 'Destaque Horizontal', size: '728x90', width: 728, height: 90, description: 'Faixa horizontal de visibilidade contínua', location: 'Topo da Home, matérias, categorias' },
      { id: 2, name: 'Mega Destaque', size: '970x250', width: 970, height: 250, description: 'Banner de grande impacto visual', location: 'Abaixo do menu, início da Home' },
      { id: 3, name: 'Destaque Inteligente', size: '300x250', width: 300, height: 250, description: 'Formato focado em conversão', location: 'Meio de matérias, sidebar' },
      { id: 4, name: 'Painel Vertical', size: '300x600', width: 300, height: 600, description: 'Formato vertical de alta exposição', location: 'Lateral da Home e matérias' },
      { id: 5, name: 'Alerta Comercial', size: '580x400', width: 580, height: 400, description: 'Banner modal de impacto imediato', location: 'Pop-up controlado por tempo/scroll' },
    ],
  },
  {
    title: 'Publidoor',
    icon: Megaphone,
    color: 'bg-purple-500',
    formats: [
      { id: 6, name: 'Destaque Premium', size: '970x250', width: 970, height: 250, description: 'Banner de destaque para telas urbanas', location: 'Telas digitais em vitrines' },
      { id: 7, name: 'Destaque Editorial', size: '300x250', width: 300, height: 250, description: 'Formato editorial para telas', location: 'Telas urbanas inline' },
      { id: 8, name: 'Painel Vertical', size: '300x600', width: 300, height: 600, description: 'Formato vertical para telas digitais', location: 'Lateral de telas urbanas' },
    ],
  },
  {
    title: 'WebStories',
    icon: Smartphone,
    color: 'bg-pink-500',
    formats: [
      { id: 9, name: 'Story Premium', size: '1080x1920', width: 1080, height: 1920, description: 'Story vertical interativo fullscreen', location: 'Feed de stories mobile' },
    ],
  },
  {
    title: 'Login',
    icon: LogIn,
    color: 'bg-amber-500',
    formats: [
      { id: 10, name: 'Login Formato 01', size: '800x500', width: 800, height: 500, description: 'Banner hero na tela de login', location: 'Tela de login — destaque principal' },
      { id: 11, name: 'Login Formato 02', size: '200x500', width: 200, height: 500, description: 'Banner vertical estreito', location: 'Tela de login — lateral' },
      { id: 12, name: 'Login Formato 03', size: '400x500', width: 400, height: 500, description: 'Banner médio na tela de login', location: 'Tela de login — grid' },
    ],
  },
  {
    title: 'Experiência',
    icon: Sparkles,
    color: 'bg-emerald-500',
    formats: [
      { id: 13, name: 'Banner Intro', size: '970x250', width: 970, height: 250, description: 'Banner de entrada pós-carregamento', location: 'Primeira dobra da Home' },
      { id: 14, name: 'Destaque Flutuante', size: '300x600', width: 300, height: 600, description: 'Banner lateral fixo na tela', location: 'Lateral direita/esquerda, fixo ao scroll' },
      { id: 15, name: 'Alerta Full Saída', size: '1280x720', width: 1280, height: 720, description: 'Banner de exit-intent fullscreen', location: 'Ao tentar sair do site' },
    ],
  },
];

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

  // Title
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

    const rows = block.formats.map((f) => [
      `#${f.id}`,
      f.name,
      f.size,
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
      {BLOCKS.map((block) => (
        <div key={block.title} className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className={`${block.color} text-white gap-1.5 py-1 px-3`}>
              <block.icon className="h-3.5 w-3.5" />
              {block.title}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {block.formats.length} formato{block.formats.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {block.formats.map((f) => (
              <Card key={f.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>#{f.id} — {f.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{f.size}</Badge>
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
      ))}
    </div>
  );
}
