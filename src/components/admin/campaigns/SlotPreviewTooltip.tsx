import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface SlotPreviewData {
  name: string;
  size: string;
  width: number;
  height: number;
  description: string;
  location: string;
  category: string;
  categoryColor: string;
}

export const SLOT_PREVIEW_DATA: Record<string, SlotPreviewData> = {
  leaderboard: {
    name: 'Destaque Horizontal',
    size: '728x90',
    width: 728,
    height: 90,
    description: 'Faixa horizontal de visibilidade contínua',
    location: 'Topo da Home, matérias, categorias',
    category: 'Ads',
    categoryColor: 'bg-blue-500',
  },
  super_banner: {
    name: 'Mega Destaque',
    size: '970x250',
    width: 970,
    height: 250,
    description: 'Banner de grande impacto visual',
    location: 'Abaixo do menu, início da Home',
    category: 'Ads',
    categoryColor: 'bg-blue-500',
  },
  rectangle: {
    name: 'Destaque Inteligente',
    size: '300x250',
    width: 300,
    height: 250,
    description: 'Formato focado em conversão',
    location: 'Meio de matérias, sidebar',
    category: 'Ads',
    categoryColor: 'bg-blue-500',
  },
  skyscraper: {
    name: 'Painel Vertical',
    size: '300x600',
    width: 300,
    height: 600,
    description: 'Formato vertical de alta exposição',
    location: 'Lateral da Home e matérias',
    category: 'Ads',
    categoryColor: 'bg-blue-500',
  },
  popup: {
    name: 'Alerta Comercial',
    size: '580x400',
    width: 580,
    height: 400,
    description: 'Banner modal de impacto imediato',
    location: 'Pop-up controlado por tempo/scroll',
    category: 'Ads',
    categoryColor: 'bg-blue-500',
  },
};

interface SlotPreviewTooltipProps {
  slotKey: string;
  children: React.ReactNode;
}

export function SlotPreviewTooltip({ slotKey, children }: SlotPreviewTooltipProps) {
  const data = SLOT_PREVIEW_DATA[slotKey];
  if (!data) return <>{children}</>;

  const maxW = 120;
  const scale = maxW / data.width;
  const previewH = Math.round(data.height * scale);

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" className="w-64 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Badge className={`${data.categoryColor} text-white text-[10px]`}>{data.category}</Badge>
          <span className="font-semibold text-sm">{data.name}</span>
        </div>
        <div
          className="rounded border border-primary/30 bg-primary/10 flex items-center justify-center mx-auto"
          style={{ width: maxW, height: previewH }}
        >
          <span className="text-[10px] text-primary font-mono">{data.size}</span>
        </div>
        <p className="text-xs text-muted-foreground">{data.description}</p>
        <p className="text-xs"><span className="font-medium">Onde aparece:</span> {data.location}</p>
      </TooltipContent>
    </Tooltip>
  );
}
