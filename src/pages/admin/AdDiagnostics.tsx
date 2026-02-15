import { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AD_SLOTS, type AdSlot } from '@/lib/adSlots';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, FileDown,
  Monitor, Bug, BarChart3, Download
} from 'lucide-react';
import { format } from 'date-fns';

// ── Types ──────────────────────────────────────────────
interface SlotDiagnostic {
  slot: AdSlot;
  page: string;
  pageUrl: string;
  render: {
    status: 'rendered' | 'invisible' | 'not_found';
    domElement: boolean;
    visible: boolean;
  };
  dimension: {
    expected: { w: number; h: number };
    actual: { w: number; h: number } | null;
    divergenceW: number | null;
    divergenceH: number | null;
    divergenceArea: number | null;
  };
  position: {
    correctPage: boolean;
    correctPlacement: boolean;
    detectedPage: string | null;
    detectedPlacement: string | null;
    notes: string;
  };
  technical: {
    cssHidden: boolean;
    zIndexIssue: boolean;
    overflowHidden: boolean;
    consoleError: string | null;
  };
  db: {
    hasActiveAd: boolean;
    hasValidDate: boolean;
    hasCreative: boolean;
    hasImageUrl: boolean;
    imageReachable: boolean | null;
    adName: string | null;
    campaignName: string | null;
  };
  cause: string;
}

// ── Page config ────────────────────────────────────────
interface PageConfig {
  label: string;
  path: string;
  expectedSlots: string[];
}

const STATIC_PAGE_CONFIGS: PageConfig[] = [
  {
    label: 'Home Pública',
    path: '/',
    expectedSlots: [
      'leaderboard', 'super_banner', 'retangulo_medio', 'arranha_ceu',
      'banner_intro', 'destaque_flutuante', 'alerta_full_saida',
      // popup is conditional (timer), but wrapper should exist
      'popup',
    ],
  },
  {
    label: 'Login',
    path: '/spah',
    expectedSlots: ['login_formato_01', 'login_formato_02', 'login_formato_03'],
  },
  {
    label: 'Matéria (padrão)',
    path: '/noticia/cotia-realiza-jornada-da-reforma-tributaria-para-empreendedores',
    expectedSlots: [
      'leaderboard', 'retangulo_medio', 'arranha_ceu',
      'destaque_flutuante', 'alerta_full_saida',
    ],
  },
  {
    label: 'WebStories (Feed)',
    path: '/stories',
    expectedSlots: [
      'story_cover',
    ],
  },
];

// ── Score ───────────────────────────────────────────────
function calculateScore(diagnostics: SlotDiagnostic[]): number {
  if (!diagnostics.length) return 0;
  let total = 0;
  for (const d of diagnostics) {
    let s = 0;
    // 60% rendering
    if (d.render.status === 'rendered') s += 60;
    else if (d.render.status === 'invisible') s += 30;
    // 25% DB
    if (d.db.hasActiveAd) s += 7;
    if (d.db.hasValidDate) s += 5;
    if (d.db.hasCreative) s += 5;
    if (d.db.hasImageUrl) s += 4;
    if (d.db.imageReachable) s += 4;
    // 15% position
    if (d.position.correctPage) s += 8;
    if (d.position.correctPlacement) s += 7;
    total += s;
  }
  return Math.round(total / diagnostics.length);
}

function statusBadge(status: string) {
  if (status === 'rendered') return <Badge className="bg-green-500/15 text-green-700 border-green-500/30">✅ Renderizado</Badge>;
  if (status === 'invisible') return <Badge className="bg-yellow-500/15 text-yellow-700 border-yellow-500/30">⚠️ Invisível</Badge>;
  return <Badge className="bg-red-500/15 text-red-700 border-red-500/30">❌ Não encontrado</Badge>;
}

function determineCause(d: SlotDiagnostic): string {
  if (d.render.status === 'not_found' && !d.db.hasActiveAd) return 'Ponto de inserção ausente + sem anúncio ativo no banco';
  if (d.render.status === 'not_found' && d.db.hasActiveAd) return 'Ponto de inserção ausente (componente/layout não renderiza o slot)';
  if (d.render.status !== 'not_found' && !d.db.hasActiveAd) return 'Sem anúncio/campanha ativa no banco para este slot/canal';
  if (d.db.hasActiveAd && !d.db.hasCreative) return 'Ativo sem criativo vinculado';
  if (d.db.hasCreative && d.db.imageReachable === false) return 'URL/Storage/CDN inacessível';
  if (d.render.status === 'invisible' && d.technical.cssHidden) return 'CSS ocultando (display/visibility/opacity)';
  if (d.render.status === 'invisible' && d.technical.overflowHidden) return 'Pai com overflow:hidden cortando o elemento';
  if (!d.position.correctPage) return 'Mapeamento incorreto de slot na página';
  if (d.render.status === 'rendered') return '—';
  return 'Verificação manual necessária';
}

// ── Iframe scanner ─────────────────────────────────────
async function scanIframe(iframe: HTMLIFrameElement, expectedSlots: string[], pageLabel: string, pagePath: string): Promise<Map<string, Partial<SlotDiagnostic>>> {
  const results = new Map<string, Partial<SlotDiagnostic>>();

  try {
    const doc = iframe.contentWindow?.document;
    if (!doc) return results;

    const allWrappers = doc.querySelectorAll('[data-ad-slot]');
    const foundIds = new Set<string>();

    allWrappers.forEach(el => {
      const slotId = el.getAttribute('data-ad-slot') || '';
      foundIds.add(slotId);

      const rect = el.getBoundingClientRect();
      const styles = iframe.contentWindow!.getComputedStyle(el);
      const cssHidden = styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0';
      const isVisible = rect.width > 0 && rect.height > 0 && !cssHidden;

      // Check parent overflow
      let overflowHidden = false;
      let parent = el.parentElement;
      while (parent) {
        const ps = iframe.contentWindow!.getComputedStyle(parent);
        if (ps.overflow === 'hidden' && (parent.getBoundingClientRect().height < rect.height * 0.5)) {
          overflowHidden = true;
          break;
        }
        parent = parent.parentElement;
      }

      const detectedPage = el.getAttribute('data-ad-page');
      const detectedPlacement = el.getAttribute('data-ad-placement');
      const expectedDim = el.getAttribute('data-ad-expected');

      const slot = AD_SLOTS.find(s => s.id === slotId);
      const expectedW = slot?.width || 0;
      const expectedH = slot?.height || 0;

      results.set(slotId, {
        page: pageLabel,
        pageUrl: pagePath,
        render: {
          status: isVisible ? 'rendered' : 'invisible',
          domElement: true,
          visible: isVisible,
        },
        dimension: {
          expected: { w: expectedW, h: expectedH },
          actual: { w: Math.round(rect.width), h: Math.round(rect.height) },
          divergenceW: expectedW > 0 ? Math.round(Math.abs(rect.width - expectedW) / expectedW * 100) : null,
          divergenceH: expectedH > 0 ? Math.round(Math.abs(rect.height - expectedH) / expectedH * 100) : null,
          divergenceArea: (expectedW * expectedH) > 0
            ? Math.round(Math.abs((rect.width * rect.height) - (expectedW * expectedH)) / (expectedW * expectedH) * 100)
            : null,
        },
        position: {
          correctPage: detectedPage === getExpectedPageKey(pagePath),
          correctPlacement: detectedPlacement === slot?.placement,
          detectedPage,
          detectedPlacement,
          notes: `Esperado: ${slot?.placement || '?'} em ${pageLabel}`,
        },
        technical: {
          cssHidden,
          zIndexIssue: parseInt(styles.zIndex || '0') < 0,
          overflowHidden,
          consoleError: null,
        },
      });
    });

    // Mark not found for expected slots
    for (const slotId of expectedSlots) {
      if (!results.has(slotId)) {
        const slot = AD_SLOTS.find(s => s.id === slotId);
        results.set(slotId, {
          page: pageLabel,
          pageUrl: pagePath,
          render: { status: 'not_found', domElement: false, visible: false },
          dimension: {
            expected: { w: slot?.width || 0, h: slot?.height || 0 },
            actual: null,
            divergenceW: null,
            divergenceH: null,
            divergenceArea: null,
          },
          position: {
            correctPage: false,
            correctPlacement: false,
            detectedPage: null,
            detectedPlacement: null,
            notes: `Esperado: ${slot?.placement || '?'} em ${pageLabel}`,
          },
          technical: { cssHidden: false, zIndexIssue: false, overflowHidden: false, consoleError: null },
        });
      }
    }
  } catch (err) {
    console.warn('iframe scan error:', err);
  }

  return results;
}

function getExpectedPageKey(path: string): string {
  if (path === '/') return 'home';
  if (path.startsWith('/spah')) return 'login';
  if (path.startsWith('/noticia/')) return 'article';
  if (path.startsWith('/esportes/') && path.includes('/noticia/')) return 'article';
  if (path === '/stories') return 'webstories_feed';
  if (path.startsWith('/stories/')) return 'webstories_viewer';
  return 'global';
}

// ── Image reachability ─────────────────────────────────
async function checkImageReachable(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const resp = await fetch(url, { method: 'GET', signal: controller.signal, cache: 'no-store' });
    clearTimeout(timeout);
    return resp.ok;
  } catch {
    return false;
  }
}

// ── Component ──────────────────────────────────────────
export default function AdDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<SlotDiagnostic[]>([]);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [selectedPages, setSelectedPages] = useState<string[]>(['/']);
  const [iframeStatus, setIframeStatus] = useState<Record<string, 'loading' | 'ready' | 'error'>>({});
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

  // Dynamic PAGE_CONFIGS: fetch real article slug + campaign ID for stories viewer
  const { data: dynamicConfigs } = useQuery({
    queryKey: ['ad-diagnostics-dynamic-pages'],
    queryFn: async () => {
      const configs: PageConfig[] = [...STATIC_PAGE_CONFIGS];

      // Get a real article slug
      const { data: newsRow } = await supabase
        .from('news')
        .select('slug')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(1)
        .single();

      if (newsRow?.slug) {
        // Update matéria path with real slug
        const materia = configs.find(c => c.label === 'Matéria (padrão)');
        if (materia) materia.path = `/noticia/${newsRow.slug}`;

        // Also add esportes variant
        configs.push({
          label: 'Matéria (Esportes)',
          path: `/esportes/brasileirao/noticia/${newsRow.slug}`,
          expectedSlots: ['leaderboard', 'retangulo_medio', 'arranha_ceu', 'destaque_flutuante', 'alerta_full_saida'],
        });
      }

      // Get a real campaign ID for webstories viewer
      const { data: storyCampaign } = await supabase
        .from('campaigns_unified')
        .select('id, channels:campaign_channels!inner(channel_type, enabled)')
        .eq('status', 'active')
        .limit(10);

      const wsId = storyCampaign?.find((c: any) =>
        c.channels?.some((ch: any) => ch.channel_type === 'webstories' && ch.enabled)
      )?.id || storyCampaign?.[0]?.id;

      if (wsId) {
        configs.push({
          label: 'WebStories (Viewer)',
          path: `/stories/${wsId}`,
          expectedSlots: ['story_cover'],
        });
      }

      return configs;
    },
    staleTime: 60_000,
  });

  const PAGE_CONFIGS = dynamicConfigs || STATIC_PAGE_CONFIGS;

  // DB data
  const { data: dbData, refetch: refetchDb } = useQuery({
    queryKey: ['ad-diagnostics-db'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data: ads } = await supabase
        .from('ads')
        .select('id, name, slot_type, image_url, is_active, starts_at, ends_at')
        .eq('is_active', true);

      const { data: campaigns } = await supabase
        .from('campaigns_unified')
        .select(`
          id, name, status, starts_at, ends_at,
          assets:campaign_assets(id, file_url, alt_text, channel_type, format_key),
          channels:campaign_channels(channel_type, enabled)
        `)
        .eq('status', 'active')
        .lte('starts_at', now)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .limit(100);

      return { ads: ads || [], campaigns: campaigns || [], fetchedAt: now };
    },
    staleTime: 0,
  });

  // Run audit
  const runAudit = useCallback(async () => {
    setRunning(true);
    await refetchDb();

    // Wait for iframes to load
    const pages = PAGE_CONFIGS.filter(p => selectedPages.includes(p.path));
    
    // Set loading status
    const status: Record<string, 'loading' | 'ready' | 'error'> = {};
    pages.forEach(p => { status[p.path] = 'loading'; });
    setIframeStatus({ ...status });

    // Wait for iframes (max 10s)
    await new Promise<void>(resolve => {
      let attempts = 0;
      const check = () => {
        attempts++;
        let allReady = true;
        pages.forEach(p => {
          const iframe = iframeRefs.current[p.path];
          if (iframe) {
            try {
              const doc = iframe.contentWindow?.document;
              if (doc && doc.readyState === 'complete') {
                status[p.path] = 'ready';
              } else {
                allReady = false;
              }
            } catch {
              status[p.path] = 'error';
            }
          } else {
            allReady = false;
          }
        });
        setIframeStatus({ ...status });
        if (allReady || attempts > 40) resolve();
        else setTimeout(check, 250);
      };
      setTimeout(check, 1500); // initial delay
    });

    // Scan each iframe
    const allResults: SlotDiagnostic[] = [];
    const now = new Date().toISOString();

    for (const page of pages) {
      const iframe = iframeRefs.current[page.path];
      if (!iframe) continue;

      const scanResults = await scanIframe(iframe, page.expectedSlots, page.label, page.path);

      for (const slotId of page.expectedSlots) {
        const slot = AD_SLOTS.find(s => s.id === slotId);
        if (!slot) continue;

        const scanData = scanResults.get(slotId);

        // DB checks
        const matchingAd = dbData?.ads?.find((a: any) => a.slot_type === slot.id);
        const matchingCampaign = dbData?.campaigns?.find((c: any) =>
          c.channels?.some((ch: any) => ch.channel_type === slot.channel && ch.enabled) &&
          c.assets?.some((a: any) => (a.channel_type === slot.channel || a.format_key === slot.key) && a.file_url)
        );

        const imageUrl = matchingAd?.image_url || matchingCampaign?.assets?.find((a: any) => a.file_url)?.file_url || null;
        let imageReachable: boolean | null = null;
        if (imageUrl) {
          imageReachable = await checkImageReachable(imageUrl);
        }

        const hasValidDate = matchingAd
          ? (!matchingAd.starts_at || matchingAd.starts_at <= now) && (!matchingAd.ends_at || matchingAd.ends_at >= now)
          : !!matchingCampaign;

        const diag: SlotDiagnostic = {
          slot,
          page: scanData?.page || page.label,
          pageUrl: scanData?.pageUrl || page.path,
          render: scanData?.render || { status: 'not_found', domElement: false, visible: false },
          dimension: scanData?.dimension || {
            expected: { w: slot.width, h: slot.height },
            actual: null,
            divergenceW: null,
            divergenceH: null,
            divergenceArea: null,
          },
          position: scanData?.position || {
            correctPage: false,
            correctPlacement: false,
            detectedPage: null,
            detectedPlacement: null,
            notes: `Esperado: ${slot.placement}`,
          },
          technical: scanData?.technical || {
            cssHidden: false,
            zIndexIssue: false,
            overflowHidden: false,
            consoleError: null,
          },
          db: {
            hasActiveAd: !!matchingAd || !!matchingCampaign,
            hasValidDate,
            hasCreative: !!(matchingAd?.image_url || matchingCampaign?.assets?.length),
            hasImageUrl: !!imageUrl,
            imageReachable,
            adName: matchingAd?.name || null,
            campaignName: matchingCampaign?.name || null,
          },
          cause: '',
        };
        diag.cause = determineCause(diag);
        allResults.push(diag);
      }
    }

    // Also check Publidoor/WebStories/Experience that aren't page-specific
    const globalSlots = AD_SLOTS.filter(s =>
      !allResults.some(r => r.slot.id === s.id)
    );
    for (const slot of globalSlots) {
      const matchingAd = dbData?.ads?.find((a: any) => a.slot_type === slot.id);
      const matchingCampaign = dbData?.campaigns?.find((c: any) =>
        c.channels?.some((ch: any) => ch.channel_type === slot.channel && ch.enabled)
      );
      const imageUrl = matchingAd?.image_url || matchingCampaign?.assets?.find((a: any) => a.file_url)?.file_url || null;
      let imageReachable: boolean | null = null;
      if (imageUrl) imageReachable = await checkImageReachable(imageUrl);

      const diag: SlotDiagnostic = {
        slot,
        page: 'N/A (não auditado via iframe)',
        pageUrl: '',
        render: { status: 'not_found', domElement: false, visible: false },
        dimension: { expected: { w: slot.width, h: slot.height }, actual: null, divergenceW: null, divergenceH: null, divergenceArea: null },
        position: { correctPage: false, correctPlacement: false, detectedPage: null, detectedPlacement: null, notes: `Slot de canal ${slot.channel} — verificação manual` },
        technical: { cssHidden: false, zIndexIssue: false, overflowHidden: false, consoleError: null },
        db: {
          hasActiveAd: !!matchingAd || !!matchingCampaign,
          hasValidDate: !!matchingCampaign || !!matchingAd,
          hasCreative: !!(matchingAd?.image_url || matchingCampaign?.assets?.length),
          hasImageUrl: !!imageUrl,
          imageReachable,
          adName: matchingAd?.name || null,
          campaignName: matchingCampaign?.name || null,
        },
        cause: '',
      };
      diag.cause = determineCause(diag);
      allResults.push(diag);
    }

    setDiagnostics(allResults);
    setLastRun(new Date());
    setRunning(false);
  }, [dbData, refetchDb, selectedPages]);

  // JSON export
  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify({
      generatedAt: lastRun?.toISOString(),
      url: window.location.origin,
      score: calculateScore(diagnostics),
      totalSlots: diagnostics.length,
      rendered: diagnostics.filter(d => d.render.status === 'rendered').length,
      invisible: diagnostics.filter(d => d.render.status === 'invisible').length,
      notFound: diagnostics.filter(d => d.render.status === 'not_found').length,
      diagnostics,
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ad-audit-${format(new Date(), 'yyyyMMdd-HHmmss')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [diagnostics, lastRun]);

  // PDF export
  const exportPdf = useCallback(async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape' });
    const score = calculateScore(diagnostics);

    doc.setFontSize(18);
    doc.text('Auditoria Técnica de Anúncios (DOM + BD)', 14, 22);
    doc.setFontSize(10);
    doc.text(`Gerado: ${lastRun ? format(lastRun, 'dd/MM/yyyy HH:mm:ss') : '-'}`, 14, 30);
    doc.text(`Score: ${score}/100`, 14, 36);

    autoTable(doc, {
      startY: 44,
      head: [['#', 'Formato', 'Dim', 'Canal', 'Página', 'Status', 'Dim Real', 'Pos OK', 'BD', 'Img OK', 'Causa']],
      body: diagnostics.map((d, i) => [
        String(i + 1),
        d.slot.label,
        `${d.slot.width}x${d.slot.height}`,
        d.slot.channel,
        d.page,
        d.render.status === 'rendered' ? '✅' : d.render.status === 'invisible' ? '⚠️' : '❌',
        d.dimension.actual ? `${d.dimension.actual.w}x${d.dimension.actual.h}` : '—',
        d.position.correctPage && d.position.correctPlacement ? 'Sim' : 'Não',
        d.db.hasActiveAd ? 'Sim' : 'Não',
        d.db.imageReachable === true ? 'Sim' : d.db.imageReachable === false ? 'Não' : '—',
        d.cause.substring(0, 50),
      ]),
      styles: { fontSize: 6.5 },
      headStyles: { fillColor: [30, 30, 30] },
    });

    doc.save(`auditoria-anuncios-${format(new Date(), 'yyyyMMdd-HHmmss')}.pdf`);
  }, [diagnostics, lastRun]);

  const togglePage = (path: string) => {
    setSelectedPages(prev => prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]);
  };

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
            Diagnóstico REAL via iframe (DOM) + banco de dados. Selecione as páginas e execute.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={runAudit} disabled={running || selectedPages.length === 0}>
            <RefreshCw className={`mr-2 h-4 w-4 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Analisando...' : 'Executar Auditoria'}
          </Button>
          {diagnostics.length > 0 && (
            <>
              <Button variant="outline" onClick={exportJson}>
                <Download className="mr-2 h-4 w-4" /> JSON
              </Button>
              <Button variant="outline" onClick={exportPdf}>
                <FileDown className="mr-2 h-4 w-4" /> PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Page selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Páginas para Auditar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {PAGE_CONFIGS.map(p => (
            <label key={p.path} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedPages.includes(p.path)}
                onCheckedChange={() => togglePage(p.path)}
              />
              <span className="text-sm">{p.label}</span>
              <code className="text-xs text-muted-foreground">{p.path}</code>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Hidden iframes for scanning */}
      {running && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Carregando páginas para scan...</p>
          {selectedPages.map(path => (
            <div key={path} className="flex items-center gap-2">
              <span className="text-xs font-mono">{path}</span>
              <Badge variant="outline">{iframeStatus[path] || 'aguardando'}</Badge>
            </div>
          ))}
        </div>
      )}
      <div className="sr-only" aria-hidden="true">
        {selectedPages.map(path => (
          <iframe
            key={path}
            ref={el => { iframeRefs.current[path] = el; }}
            src={`${window.location.origin}${path}`}
            className="w-[1280px] h-[900px]"
            title={`Scan: ${path}`}
            sandbox="allow-same-origin allow-scripts"
          />
        ))}
      </div>

      {lastRun && (
        <p className="text-xs text-muted-foreground">
          Última execução: {format(lastRun, 'dd/MM/yyyy HH:mm:ss')}
        </p>
      )}

      {/* Score + Summary */}
      {diagnostics.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Score Geral</CardTitle></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{score}<span className="text-lg text-muted-foreground">/100</span></div>
              <Progress value={score} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">60% render · 25% BD · 15% posição</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader>
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
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><XCircle className="h-4 w-4 text-red-500" /> Não encontrados</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-red-600">{broken}</div></CardContent>
          </Card>
        </div>
      )}

      {/* Detailed table */}
      {diagnostics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Tabela Técnica</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">#</th>
                  <th className="p-2">Formato</th>
                  <th className="p-2">Canal</th>
                  <th className="p-2">Página</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Dim Esperada</th>
                  <th className="p-2">Dim Real</th>
                  <th className="p-2">Diverg.</th>
                  <th className="p-2">Posição</th>
                  <th className="p-2">BD Ativo</th>
                  <th className="p-2">Img OK</th>
                  <th className="p-2">Causa Provável</th>
                </tr>
              </thead>
              <tbody>
                {diagnostics.map((d, i) => (
                  <tr key={`${d.slot.id}-${d.page}`} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-mono text-xs">{i + 1}</td>
                    <td className="p-2">
                      <div className="font-medium">{d.slot.label}</div>
                      <div className="text-xs text-muted-foreground">{d.slot.id}</div>
                    </td>
                    <td className="p-2"><Badge variant="outline">{d.slot.channel}</Badge></td>
                    <td className="p-2 text-xs">{d.page}</td>
                    <td className="p-2">{statusBadge(d.render.status)}</td>
                    <td className="p-2 font-mono text-xs">{d.dimension.expected.w}×{d.dimension.expected.h}</td>
                    <td className="p-2 font-mono text-xs">
                      {d.dimension.actual ? `${d.dimension.actual.w}×${d.dimension.actual.h}` : '—'}
                    </td>
                    <td className="p-2">
                      {d.dimension.divergenceArea !== null ? (
                        <Badge variant={d.dimension.divergenceArea < 10 ? 'outline' : 'destructive'}>
                          {d.dimension.divergenceArea}%
                        </Badge>
                      ) : '—'}
                    </td>
                    <td className="p-2">
                      {d.position.correctPage && d.position.correctPlacement ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : d.render.status === 'not_found' ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </td>
                    <td className="p-2">
                      {d.db.hasActiveAd ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    </td>
                    <td className="p-2">
                      {d.db.imageReachable === true ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                        : d.db.imageReachable === false ? <XCircle className="h-4 w-4 text-red-500" />
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="p-2 text-xs max-w-[220px]">
                      <span className={d.cause === '—' ? 'text-green-600' : 'text-red-600'}>{d.cause}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Causa Provável */}
      {diagnostics.length > 0 && broken > 0 && (
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600"><Bug className="h-5 w-5" /> Causas Prováveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {diagnostics.filter(d => d.render.status !== 'rendered').map(d => (
              <div key={`${d.slot.id}-cause`} className="rounded-md border p-3 space-y-1">
                <div className="font-medium">{d.slot.label} <span className="text-muted-foreground">({d.slot.id})</span> — {d.page}</div>
                <p className="text-sm text-red-600">{d.cause}</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {!d.db.hasActiveAd && <li>• Nenhuma campanha/anúncio ativo no banco</li>}
                  {!d.db.hasCreative && d.db.hasActiveAd && <li>• Ativo sem criativo vinculado</li>}
                  {d.db.imageReachable === false && <li>• URL da imagem não está acessível</li>}
                  {d.technical.cssHidden && <li>• CSS: display:none/visibility:hidden/opacity:0</li>}
                  {d.technical.overflowHidden && <li>• Pai com overflow:hidden cortando elemento</li>}
                  {d.render.status === 'not_found' && <li>• Wrapper [data-ad-slot] não encontrado no DOM da página</li>}
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
              Selecione as páginas e clique em "Executar Auditoria" para scan real via iframe.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
