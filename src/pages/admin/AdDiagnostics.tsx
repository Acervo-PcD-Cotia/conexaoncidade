import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AD_SLOTS, type AdSlot } from '@/lib/adSlots';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, FileDown,
  Monitor, Eye, EyeOff, Ruler, MapPin, Bug, BarChart3
} from 'lucide-react';
import { format } from 'date-fns';

// ── Types ──────────────────────────────────────────────
interface SlotDiagnostic {
  slot: AdSlot;
  render: {
    status: 'rendered' | 'invisible' | 'not_found';
    domElement?: boolean;
    visible?: boolean;
  };
  dimension: {
    expected: { w: number; h: number };
    actual: { w: number; h: number } | null;
    divergence: number | null;
  };
  position: {
    correctContainer: boolean | null;
    correctPage: boolean | null;
    notes: string;
  };
  technical: {
    cssHidden: boolean | null;
    zIndexIssue: boolean | null;
    networkError: boolean | null;
    consoleError: string | null;
  };
  db: {
    hasActiveAd: boolean;
    hasValidDate: boolean;
    hasCreative: boolean;
    hasImageUrl: boolean;
    imageUrlValid: boolean | null;
    adName: string | null;
    campaignName: string | null;
  };
}

// ── Score calculation ──────────────────────────────────
function calculateScore(diagnostics: SlotDiagnostic[]): number {
  if (!diagnostics.length) return 0;
  let total = 0;
  for (const d of diagnostics) {
    let s = 0;
    // Rendering (40 pts)
    if (d.render.status === 'rendered') s += 40;
    else if (d.render.status === 'invisible') s += 15;
    // DB health (30 pts)
    if (d.db.hasActiveAd) s += 10;
    if (d.db.hasValidDate) s += 5;
    if (d.db.hasCreative) s += 5;
    if (d.db.hasImageUrl) s += 5;
    if (d.db.imageUrlValid) s += 5;
    // Dimensions (15 pts)
    if (d.dimension.divergence !== null && d.dimension.divergence < 5) s += 15;
    else if (d.dimension.divergence !== null && d.dimension.divergence < 15) s += 8;
    // Position (15 pts)
    if (d.position.correctContainer) s += 15;
    total += s;
  }
  return Math.round(total / diagnostics.length);
}

function statusIcon(status: string) {
  if (status === 'rendered') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === 'invisible') return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  return <XCircle className="h-4 w-4 text-red-500" />;
}

function statusBadge(status: string) {
  if (status === 'rendered') return <Badge className="bg-green-500/15 text-green-700 border-green-500/30">✅ Renderizado</Badge>;
  if (status === 'invisible') return <Badge className="bg-yellow-500/15 text-yellow-700 border-yellow-500/30">⚠️ Invisível</Badge>;
  return <Badge className="bg-red-500/15 text-red-700 border-red-500/30">❌ Não encontrado</Badge>;
}

// ── Component ──────────────────────────────────────────
export default function AdDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<SlotDiagnostic[]>([]);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  // Fetch DB state for all slots
  const { data: dbData, refetch: refetchDb } = useQuery({
    queryKey: ['ad-diagnostics-db'],
    queryFn: async () => {
      const now = new Date().toISOString();

      // Legacy ads
      const { data: ads } = await supabase
        .from('ads')
        .select('id, name, slot_type, image_url, is_active, starts_at, ends_at')
        .eq('is_active', true);

      // Campaign assets
      const { data: campaigns } = await supabase
        .from('campaigns_unified')
        .select(`
          id, name, status, starts_at, ends_at,
          assets:campaign_assets(id, file_url, alt_text, channel_type),
          channels:campaign_channels(channel_type, enabled)
        `)
        .eq('status', 'active')
        .lte('starts_at', now)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .limit(50);

      return { ads: ads || [], campaigns: campaigns || [], fetchedAt: now };
    },
    staleTime: 0,
  });

  // Run full diagnostic
  const runDiagnostic = useCallback(async () => {
    setRunning(true);
    await refetchDb();

    const results: SlotDiagnostic[] = [];
    const now = new Date().toISOString();

    for (const slot of AD_SLOTS) {
      // ── DB checks ──
      const matchingAd = dbData?.ads?.find((a: any) => a.slot_type === slot.id);
      const matchingCampaign = dbData?.campaigns?.find((c: any) =>
        c.channels?.some((ch: any) => ch.channel_type === slot.channel && ch.enabled) &&
        c.assets?.some((a: any) => a.channel_type === slot.channel && a.file_url)
      );

      const adSource = matchingAd || null;
      const campaignSource = matchingCampaign || null;
      const imageUrl = adSource?.image_url || campaignSource?.assets?.[0]?.file_url || null;

      let imageValid: boolean | null = null;
      if (imageUrl) {
        try {
          const resp = await fetch(imageUrl, { method: 'HEAD', mode: 'no-cors' });
          imageValid = true; // no-cors won't give status, but no throw = likely ok
        } catch {
          imageValid = false;
        }
      }

      const hasValidDate = adSource
        ? (!adSource.starts_at || adSource.starts_at <= now) && (!adSource.ends_at || adSource.ends_at >= now)
        : !!campaignSource;

      // ── DOM checks ──
      // We look for data attributes or known class patterns
      const selectors = [
        `[data-slot-id="${slot.id}"]`,
        `[data-ad-slot="${slot.id}"]`,
        `[data-slot-type="${slot.id}"]`,
      ];

      let domEl: Element | null = null;
      for (const sel of selectors) {
        domEl = document.querySelector(sel);
        if (domEl) break;
      }

      let renderStatus: 'rendered' | 'invisible' | 'not_found' = 'not_found';
      let actualDims: { w: number; h: number } | null = null;
      let cssHidden: boolean | null = null;
      let zIndexIssue: boolean | null = null;
      let correctContainer: boolean | null = null;

      if (domEl) {
        const rect = domEl.getBoundingClientRect();
        const styles = window.getComputedStyle(domEl);
        actualDims = { w: Math.round(rect.width), h: Math.round(rect.height) };
        cssHidden = styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0';
        zIndexIssue = parseInt(styles.zIndex || '0') < 0;

        const isVisible = rect.width > 0 && rect.height > 0 && !cssHidden;
        renderStatus = isVisible ? 'rendered' : 'invisible';
        correctContainer = true; // Found in DOM = container exists
      }

      // Dimension divergence
      let divergence: number | null = null;
      if (actualDims) {
        const expectedArea = slot.width * slot.height;
        const actualArea = actualDims.w * actualDims.h;
        divergence = expectedArea > 0 ? Math.abs(((actualArea - expectedArea) / expectedArea) * 100) : null;
      }

      // Page mapping
      const pageMap: Record<string, string> = {
        top: 'Home / Matérias',
        inline: 'Meio do conteúdo',
        sidebar: 'Lateral',
        modal: 'Pop-up / Exit',
        hero: 'Hero section',
        fullscreen: 'Feed mobile',
        login: 'Tela de login',
        floating: 'Scroll lateral',
        intro: 'Primeira dobra Home',
      };

      results.push({
        slot,
        render: {
          status: renderStatus,
          domElement: !!domEl,
          visible: renderStatus === 'rendered',
        },
        dimension: {
          expected: { w: slot.width, h: slot.height },
          actual: actualDims,
          divergence: divergence !== null ? Math.round(divergence * 100) / 100 : null,
        },
        position: {
          correctContainer,
          correctPage: null, // Would need route detection
          notes: `Esperado: ${pageMap[slot.placement] || slot.placement}`,
        },
        technical: {
          cssHidden,
          zIndexIssue,
          networkError: imageValid === false,
          consoleError: null,
        },
        db: {
          hasActiveAd: !!adSource || !!campaignSource,
          hasValidDate,
          hasCreative: !!(adSource?.image_url || campaignSource?.assets?.length),
          hasImageUrl: !!imageUrl,
          imageUrlValid: imageValid,
          adName: adSource?.name || null,
          campaignName: campaignSource?.name || null,
        },
      });
    }

    setDiagnostics(results);
    setLastRun(new Date());
    setRunning(false);
  }, [dbData, refetchDb]);

  // PDF export
  const exportPdf = useCallback(async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'landscape' });
    const score = calculateScore(diagnostics);

    doc.setFontSize(18);
    doc.text('Relatório Técnico - Auditoria de Anúncios', 14, 22);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${lastRun ? format(lastRun, 'dd/MM/yyyy HH:mm:ss') : '-'}`, 14, 30);
    doc.text(`URL: ${window.location.origin}`, 14, 36);
    doc.text(`Score Geral: ${score}/100`, 14, 42);

    const rendered = diagnostics.filter(d => d.render.status === 'rendered').length;
    const invisible = diagnostics.filter(d => d.render.status === 'invisible').length;
    const broken = diagnostics.filter(d => d.render.status === 'not_found').length;

    doc.text(`Funcionando: ${rendered} | Invisíveis: ${invisible} | Quebrados: ${broken}`, 14, 48);

    autoTable(doc, {
      startY: 55,
      head: [['#', 'Formato', 'Dimensão', 'Canal', 'Status', 'Dim. Real', 'Local Correto', 'Erro', 'BD Ativo', 'Causa']],
      body: diagnostics.map((d, i) => [
        String(i + 1),
        `${d.slot.label}`,
        `${d.slot.width}x${d.slot.height}`,
        d.slot.channel,
        d.render.status === 'rendered' ? '✅' : d.render.status === 'invisible' ? '⚠️' : '❌',
        d.dimension.actual ? `${d.dimension.actual.w}x${d.dimension.actual.h}` : 'N/A',
        d.position.correctContainer ? 'Sim' : d.position.correctContainer === null ? 'N/A' : 'Não',
        [
          d.technical.cssHidden ? 'CSS oculto' : '',
          d.technical.networkError ? 'Rede' : '',
          d.technical.zIndexIssue ? 'z-index' : '',
        ].filter(Boolean).join(', ') || '—',
        d.db.hasActiveAd ? 'Sim' : 'Não',
        !d.db.hasActiveAd ? 'Sem anúncio ativo'
          : !d.db.hasImageUrl ? 'Sem imagem'
          : d.technical.cssHidden ? 'CSS display:none'
          : d.render.status === 'not_found' ? 'Componente ausente'
          : '—',
      ]),
      styles: { fontSize: 7 },
      headStyles: { fillColor: [30, 30, 30] },
    });

    doc.save(`auditoria-anuncios-${format(new Date(), 'yyyyMMdd-HHmmss')}.pdf`);
  }, [diagnostics, lastRun]);

  const score = calculateScore(diagnostics);
  const rendered = diagnostics.filter(d => d.render.status === 'rendered').length;
  const invisible = diagnostics.filter(d => d.render.status === 'invisible').length;
  const broken = diagnostics.filter(d => d.render.status === 'not_found').length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auditoria Técnica de Anúncios</h1>
          <p className="text-sm text-muted-foreground">
            Diagnóstico real de renderização, dimensão, posição e estado do banco.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runDiagnostic} disabled={running}>
            <RefreshCw className={`mr-2 h-4 w-4 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Analisando...' : 'Executar Auditoria'}
          </Button>
          {diagnostics.length > 0 && (
            <Button variant="outline" onClick={exportPdf}>
              <FileDown className="mr-2 h-4 w-4" />
              Gerar PDF
            </Button>
          )}
        </div>
      </div>

      {lastRun && (
        <p className="text-xs text-muted-foreground">
          Última execução: {format(lastRun, 'dd/MM/yyyy HH:mm:ss')} — URL: {window.location.origin}
        </p>
      )}

      {/* Score + Summary */}
      {diagnostics.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Score Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{score}<span className="text-lg text-muted-foreground">/100</span></div>
              <Progress value={score} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Total Formatos</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{diagnostics.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> Funcionando</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-green-600">{rendered}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-yellow-500" /> Invisíveis</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-yellow-600">{invisible}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><XCircle className="h-4 w-4 text-red-500" /> Quebrados</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-red-600">{broken}</div></CardContent>
          </Card>
        </div>
      )}

      {/* Detailed table */}
      {diagnostics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tabela Técnica Detalhada
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">#</th>
                  <th className="p-2">Formato</th>
                  <th className="p-2">Canal</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Dim. Esperada</th>
                  <th className="p-2">Dim. Real</th>
                  <th className="p-2">Divergência</th>
                  <th className="p-2">Local</th>
                  <th className="p-2">BD Ativo</th>
                  <th className="p-2">Diagnóstico</th>
                </tr>
              </thead>
              <tbody>
                {diagnostics.map((d, i) => (
                  <tr key={d.slot.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-mono text-xs">{i + 1}</td>
                    <td className="p-2">
                      <div className="font-medium">{d.slot.label}</div>
                      <div className="text-xs text-muted-foreground">{d.slot.id}</div>
                    </td>
                    <td className="p-2"><Badge variant="outline">{d.slot.channel}</Badge></td>
                    <td className="p-2">{statusBadge(d.render.status)}</td>
                    <td className="p-2 font-mono text-xs">{d.dimension.expected.w}×{d.dimension.expected.h}</td>
                    <td className="p-2 font-mono text-xs">
                      {d.dimension.actual ? `${d.dimension.actual.w}×${d.dimension.actual.h}` : '—'}
                    </td>
                    <td className="p-2">
                      {d.dimension.divergence !== null ? (
                        <Badge variant={d.dimension.divergence < 5 ? 'outline' : 'destructive'}>
                          {d.dimension.divergence}%
                        </Badge>
                      ) : '—'}
                    </td>
                    <td className="p-2 text-xs">{d.position.notes}</td>
                    <td className="p-2">
                      {d.db.hasActiveAd ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </td>
                    <td className="p-2 text-xs max-w-[200px]">
                      <DiagnosticDetail d={d} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Causa Provável section */}
      {diagnostics.length > 0 && broken > 0 && (
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Bug className="h-5 w-5" />
              Causa Provável — Anúncios Não Aparecendo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {diagnostics
              .filter(d => d.render.status !== 'rendered')
              .map(d => (
                <div key={d.slot.id} className="rounded-md border p-3 space-y-1">
                  <div className="font-medium">{d.slot.label} ({d.slot.id})</div>
                  <ul className="text-sm text-muted-foreground space-y-0.5">
                    {!d.db.hasActiveAd && <li>• Nenhuma campanha ou anúncio ativo no banco</li>}
                    {!d.db.hasValidDate && <li>• Data fora do período de exibição</li>}
                    {!d.db.hasCreative && <li>• Sem criativo vinculado</li>}
                    {!d.db.hasImageUrl && <li>• Sem URL de imagem configurada</li>}
                    {d.db.imageUrlValid === false && <li>• URL da imagem não está acessível (CDN/rede)</li>}
                    {d.technical.cssHidden && <li>• Elemento oculto via CSS (display:none / visibility:hidden)</li>}
                    {d.technical.zIndexIssue && <li>• Z-index negativo — elemento atrás de outros</li>}
                    {d.technical.networkError && <li>• Erro de rede ao carregar imagem</li>}
                    {d.render.status === 'not_found' && d.db.hasActiveAd && (
                      <li>• Componente de renderização não encontrado no DOM desta página</li>
                    )}
                    {d.render.status === 'not_found' && !d.db.hasActiveAd && (
                      <li className="font-medium text-red-600">→ Verificação manual necessária: sem dados no banco e sem componente no DOM</li>
                    )}
                  </ul>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {diagnostics.length === 0 && !running && (
        <Card>
          <CardContent className="py-12 text-center">
            <Monitor className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium">Nenhuma auditoria executada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Clique em "Executar Auditoria" para analisar todos os 15 formatos publicitários.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Diagnostic detail subcomponent ──────────────────────
function DiagnosticDetail({ d }: { d: SlotDiagnostic }) {
  const issues: string[] = [];
  if (!d.db.hasActiveAd) issues.push('Sem anúncio ativo');
  if (!d.db.hasImageUrl) issues.push('Sem imagem');
  if (d.db.imageUrlValid === false) issues.push('Imagem inacessível');
  if (d.technical.cssHidden) issues.push('CSS oculto');
  if (d.technical.zIndexIssue) issues.push('z-index');
  if (d.technical.networkError) issues.push('Erro de rede');
  if (d.render.status === 'not_found' && d.db.hasActiveAd) issues.push('Componente ausente no DOM');

  if (!issues.length && d.render.status === 'rendered') {
    return <span className="text-green-600">OK</span>;
  }
  if (!issues.length) {
    return <span className="text-muted-foreground">Verificação manual necessária</span>;
  }
  return <span className="text-red-600">{issues.join(', ')}</span>;
}
