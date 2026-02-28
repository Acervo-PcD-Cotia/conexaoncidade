import { useState, useMemo } from 'react';
import { AD_SLOTS, getSlotBlocks, type AdSlot, type SlotChannel } from '@/lib/adSlots';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Monitor, Smartphone, Tablet, Eye, EyeOff, Maximize2, X,
  CheckCircle2, AlertTriangle, XCircle, Ruler, Layout, Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Viewport presets ──
const VIEWPORTS = [
  { label: 'Desktop', width: 1280, height: 900, icon: Monitor },
  { label: 'Tablet', width: 768, height: 1024, icon: Tablet },
  { label: 'Mobile', width: 375, height: 812, icon: Smartphone },
] as const;

// ── Channel colors ──
const CHANNEL_BADGE: Record<SlotChannel, string> = {
  ads: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
  publidoor: 'bg-purple-500/15 text-purple-700 border-purple-500/30',
  webstories: 'bg-pink-500/15 text-pink-700 border-pink-500/30',
  login: 'bg-slate-500/15 text-slate-700 border-slate-500/30',
  experience: 'bg-orange-500/15 text-orange-700 border-orange-500/30',
};

// ── Safe zone (80% central) ──
const SAFE_ZONE_PERCENT = 80;

function SafeZoneOverlay({ width, height }: { width: number; height: number }) {
  const insetX = ((100 - SAFE_ZONE_PERCENT) / 2);
  const insetY = ((100 - SAFE_ZONE_PERCENT) / 2);
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top strip */}
      <div className="absolute top-0 left-0 right-0 bg-red-500/15" style={{ height: `${insetY}%` }} />
      {/* Bottom strip */}
      <div className="absolute bottom-0 left-0 right-0 bg-red-500/15" style={{ height: `${insetY}%` }} />
      {/* Left strip */}
      <div className="absolute left-0 bg-red-500/15" style={{ top: `${insetY}%`, bottom: `${insetY}%`, width: `${insetX}%` }} />
      {/* Right strip */}
      <div className="absolute right-0 bg-red-500/15" style={{ top: `${insetY}%`, bottom: `${insetY}%`, width: `${insetX}%` }} />
      {/* Safe zone border */}
      <div
        className="absolute border-2 border-dashed border-green-500/60"
        style={{ top: `${insetY}%`, left: `${insetX}%`, right: `${insetX}%`, bottom: `${insetY}%` }}
      />
      <span className="absolute text-[10px] text-green-600 font-medium" style={{ top: `${insetY}%`, left: `${insetX}%`, transform: 'translate(4px, 4px)' }}>
        Safe Zone ({SAFE_ZONE_PERCENT}%)
      </span>
    </div>
  );
}

// ── Format Preview Card ──
function FormatPreview({
  slot,
  viewportWidth,
  showSafeZone,
  showFallback,
}: {
  slot: AdSlot;
  viewportWidth: number;
  showSafeZone: boolean;
  showFallback: boolean;
}) {
  const fits = viewportWidth >= slot.width;
  const scale = fits ? 1 : viewportWidth / slot.width;
  const displayW = Math.round(slot.width * Math.min(scale, 1));
  const displayH = Math.round(slot.height * Math.min(scale, 1));

  // Container validation
  const containerStatus = fits ? 'ok' : scale >= 0.5 ? 'scaled' : 'hidden';

  return (
    <div className="space-y-2">
      {/* Container validation badge */}
      <div className="flex items-center gap-2">
        {containerStatus === 'ok' && (
          <Badge className="bg-green-500/15 text-green-700 border-green-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Container OK
          </Badge>
        )}
        {containerStatus === 'scaled' && (
          <Badge className="bg-yellow-500/15 text-yellow-700 border-yellow-500/30">
            <AlertTriangle className="h-3 w-3 mr-1" /> Redimensionado ({Math.round(scale * 100)}%)
          </Badge>
        )}
        {containerStatus === 'hidden' && (
          <Badge className="bg-red-500/15 text-red-700 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" /> Viewport insuficiente
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">
          {displayW}×{displayH}px
        </span>
      </div>

      {/* Preview frame */}
      <div
        className="relative border-2 border-dashed border-border rounded-lg overflow-hidden mx-auto transition-all"
        style={{
          width: Math.min(displayW, 600),
          height: Math.min(displayH, 500),
          maxWidth: '100%',
        }}
      >
        {showFallback ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 text-muted-foreground">
            <EyeOff className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-sm font-medium">{slot.label}</span>
            <span className="text-xs">{slot.width}×{slot.height}</span>
            <span className="text-[10px] mt-1">Fallback placeholder</span>
          </div>
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{
              background: `
                repeating-linear-gradient(
                  45deg,
                  hsl(var(--muted)) 0px,
                  hsl(var(--muted)) 10px,
                  hsl(var(--muted-foreground) / 0.08) 10px,
                  hsl(var(--muted-foreground) / 0.08) 20px
                )
              `,
            }}
          >
            <div className="bg-background/90 rounded-md px-3 py-2 text-center shadow-sm">
              <div className="text-sm font-semibold">{slot.label}</div>
              <div className="text-xs text-muted-foreground font-mono">{slot.width}×{slot.height}</div>
              <Badge className={cn('mt-1', CHANNEL_BADGE[slot.channel])}>{slot.channel}</Badge>
            </div>
          </div>
        )}

        {showSafeZone && !showFallback && (
          <SafeZoneOverlay width={slot.width} height={slot.height} />
        )}
      </div>
    </div>
  );
}

// ── Behavior Simulator ──
function BehaviorSimulator({ slot }: { slot: AdSlot }) {
  const [showOverlay, setShowOverlay] = useState(false);

  if (slot.placement === 'modal') {
    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium">Simulação de comportamento</Label>
        <Button size="sm" variant="outline" onClick={() => setShowOverlay(true)}>
          <Eye className="h-3 w-3 mr-1" /> Simular {slot.id === 'alerta_full_saida' ? 'Exit-Intent' : 'Pop-up'}
        </Button>
        {showOverlay && (
          <div className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center" onClick={() => setShowOverlay(false)}>
            <div className="relative bg-background rounded-lg shadow-2xl p-1" onClick={e => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-3 -right-3 z-10 h-8 w-8 rounded-full bg-background shadow-md"
                onClick={() => setShowOverlay(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div
                className="bg-muted rounded flex items-center justify-center"
                style={{
                  width: Math.min(slot.width, window.innerWidth - 80),
                  height: Math.min(slot.height, window.innerHeight - 120),
                  maxWidth: '90vw',
                  maxHeight: '80vh',
                }}
              >
                <div className="text-center">
                  <div className="text-lg font-bold">{slot.label}</div>
                  <div className="text-sm text-muted-foreground">{slot.width}×{slot.height}</div>
                  <Badge className="mt-2">z-index: 999</Badge>
                  <p className="text-xs text-muted-foreground mt-2 max-w-xs">
                    {slot.id === 'alerta_full_saida'
                      ? 'Trigger: Exit-Intent (mouse sai da viewport)'
                      : 'Trigger: Scroll/Time (scroll 50% ou 15s)'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (slot.placement === 'floating') {
    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium">Simulação de comportamento</Label>
        <Button size="sm" variant="outline" onClick={() => setShowOverlay(!showOverlay)}>
          {showOverlay ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
          {showOverlay ? 'Ocultar Flutuante' : 'Simular Flutuante'}
        </Button>
        {showOverlay && (
          <div className="fixed bottom-4 right-4 z-50 shadow-2xl rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 z-10 h-7 w-7 rounded-full bg-black/50 text-white"
              onClick={() => setShowOverlay(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="bg-muted flex items-center justify-center" style={{ width: 300, height: 600 }}>
              <div className="text-center">
                <div className="font-bold">{slot.label}</div>
                <div className="text-xs text-muted-foreground">300×600 — Sticky</div>
                <Badge className="mt-2">z-index: 50</Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (slot.placement === 'fullscreen' || slot.channel === 'webstories') {
    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium">Viewport</Label>
        <Badge variant="outline">
          <Smartphone className="h-3 w-3 mr-1" /> Mobile-first (9:16)
        </Badge>
      </div>
    );
  }

  return null;
}

// ── Main Component ──
export default function AdInventorySimulator() {
  const [activeChannel, setActiveChannel] = useState<SlotChannel | 'all'>('all');
  const [selectedSlot, setSelectedSlot] = useState<AdSlot>(AD_SLOTS[0]);
  const [viewport, setViewport] = useState<typeof VIEWPORTS[number]>(VIEWPORTS[0]);
  const [showSafeZone, setShowSafeZone] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const blocks = useMemo(() => getSlotBlocks(), []);
  const filteredSlots = useMemo(() =>
    activeChannel === 'all' ? AD_SLOTS : AD_SLOTS.filter(s => s.channel === activeChannel),
    [activeChannel]
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Simulador de Inventário Publicitário</h1>
        <p className="text-sm text-muted-foreground">
          Visualize, valide e teste todos os 15 formatos comerciais em tempo real.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left: Format list */}
        <Card className="lg:sticky lg:top-4 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4" /> Inventário ({AD_SLOTS.length} formatos)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Channel filter */}
            <div className="px-4 pb-3">
              <Select value={activeChannel} onValueChange={v => setActiveChannel(v as SlotChannel | 'all')}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Filtrar canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os canais</SelectItem>
                  {blocks.map(b => (
                    <SelectItem key={b.channel} value={b.channel}>{b.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[500px]">
              <div className="space-y-0.5 px-2 pb-2">
                {filteredSlots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      'w-full text-left rounded-md px-3 py-2.5 transition-colors text-sm',
                      selectedSlot.id === slot.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground w-5">{slot.seq}</span>
                        <span>{slot.label}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] h-5">
                        {slot.width}×{slot.height}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 ml-7">
                      <Badge className={cn('text-[10px] h-4', CHANNEL_BADGE[slot.channel])}>{slot.channel}</Badge>
                      <span className="text-[10px] text-muted-foreground">{slot.placement}</span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right: Preview & details */}
        <div className="space-y-6">
          {/* Toolbar */}
          <Card>
            <CardContent className="py-3 flex flex-wrap items-center gap-4">
              {/* Viewport selector */}
              <div className="flex items-center gap-2">
                <Label className="text-xs">Viewport:</Label>
                <div className="flex gap-1">
                  {VIEWPORTS.map(vp => (
                    <Button
                      key={vp.label}
                      size="sm"
                      variant={viewport.label === vp.label ? 'default' : 'outline'}
                      className="h-7 text-xs"
                      onClick={() => setViewport(vp)}
                    >
                      <vp.icon className="h-3 w-3 mr-1" />
                      {vp.label}
                    </Button>
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">{viewport.width}×{viewport.height}</span>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Safe Zone toggle */}
              <div className="flex items-center gap-2">
                <Switch id="safeZone" checked={showSafeZone} onCheckedChange={setShowSafeZone} />
                <Label htmlFor="safeZone" className="text-xs">Safe Zone</Label>
              </div>

              {/* Fallback toggle */}
              <div className="flex items-center gap-2">
                <Switch id="fallback" checked={showFallback} onCheckedChange={setShowFallback} />
                <Label htmlFor="fallback" className="text-xs">Fallback</Label>
              </div>
            </CardContent>
          </Card>

          {/* Format details */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-sm font-mono text-muted-foreground">#{selectedSlot.seq}</span>
                    {selectedSlot.label}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{selectedSlot.description}</p>
                </div>
                <Badge className={cn(CHANNEL_BADGE[selectedSlot.channel])}>{selectedSlot.channel}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-md bg-muted/50 p-2.5 text-center">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Dimensões</div>
                  <div className="text-sm font-mono font-bold mt-0.5">{selectedSlot.width}×{selectedSlot.height}</div>
                </div>
                <div className="rounded-md bg-muted/50 p-2.5 text-center">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Aspect Ratio</div>
                  <div className="text-sm font-mono font-bold mt-0.5">{selectedSlot.aspect.toFixed(2)}</div>
                </div>
                <div className="rounded-md bg-muted/50 p-2.5 text-center">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Posição</div>
                  <div className="text-sm font-semibold mt-0.5 capitalize">{selectedSlot.placement}</div>
                </div>
                <div className="rounded-md bg-muted/50 p-2.5 text-center">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Local</div>
                  <div className="text-xs mt-0.5">{selectedSlot.location}</div>
                </div>
              </div>

              <Separator />

              {/* Visual preview */}
              <div>
                <Label className="text-xs font-medium mb-2 flex items-center gap-1">
                  <Ruler className="h-3 w-3" /> Preview Visual ({viewport.label} — {viewport.width}px)
                </Label>
                <FormatPreview
                  slot={selectedSlot}
                  viewportWidth={viewport.width}
                  showSafeZone={showSafeZone}
                  showFallback={showFallback}
                />
              </div>

              <Separator />

              {/* Behavior simulation */}
              <BehaviorSimulator slot={selectedSlot} />
            </CardContent>
          </Card>

          {/* Inventory overview table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layout className="h-4 w-4" /> Validação de Container por Viewport
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">#</th>
                    <th className="p-2">Formato</th>
                    <th className="p-2">Dim</th>
                    <th className="p-2">Canal</th>
                    <th className="p-2 text-center">Desktop (1280)</th>
                    <th className="p-2 text-center">Tablet (768)</th>
                    <th className="p-2 text-center">Mobile (375)</th>
                    <th className="p-2">Comportamento</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.map(slot => {
                    const checkViewport = (vpW: number) => {
                      if (vpW >= slot.width) return 'ok';
                      if (vpW / slot.width >= 0.5) return 'scaled';
                      return 'hidden';
                    };
                    return (
                      <tr
                        key={slot.id}
                        className={cn(
                          'border-b hover:bg-muted/50 cursor-pointer transition-colors',
                          selectedSlot.id === slot.id && 'bg-primary/5'
                        )}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <td className="p-2 font-mono text-xs">{slot.seq}</td>
                        <td className="p-2 font-medium">{slot.label}</td>
                        <td className="p-2 font-mono text-xs">{slot.width}×{slot.height}</td>
                        <td className="p-2">
                          <Badge className={cn('text-[10px]', CHANNEL_BADGE[slot.channel])}>
                            {slot.channel}
                          </Badge>
                        </td>
                        {[1280, 768, 375].map(vpW => {
                          const status = checkViewport(vpW);
                          return (
                            <td key={vpW} className="p-2 text-center">
                              {status === 'ok' && <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />}
                              {status === 'scaled' && <AlertTriangle className="h-4 w-4 text-yellow-500 mx-auto" />}
                              {status === 'hidden' && <XCircle className="h-4 w-4 text-red-500 mx-auto" />}
                            </td>
                          );
                        })}
                        <td className="p-2 text-xs text-muted-foreground capitalize">{slot.placement}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
