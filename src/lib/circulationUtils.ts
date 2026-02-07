const VALID_SOURCES = ['wa', 'ig', 'fb', 'x', 'direct'] as const;
export type ValidSource = typeof VALID_SOURCES[number];

export function normalizeSrc(src: string | null | undefined): ValidSource {
  if (!src) return 'direct';
  const lower = src.toLowerCase().trim();
  return VALID_SOURCES.includes(lower as ValidSource) ? (lower as ValidSource) : 'direct';
}

export function buildShareUrl(slug: string, refCode: string, src: ValidSource): string {
  const base = `${window.location.origin}/noticia/${slug}`;
  return `${base}?ref=${refCode}&src=${src}`;
}

export function buildShareText(titulo: string, resumo: string, link: string, cidade: string = 'Cotia'): string {
  return `📍 ${cidade} — ${titulo}\n\n${resumo}\n\nConfira: ${link}`;
}

export function parseUserAgentSimple(ua: string): { device_type: string; browser: string } {
  let device_type = 'desktop';
  if (/mobile|android|iphone|ipad/i.test(ua)) {
    device_type = /ipad|tablet/i.test(ua) ? 'tablet' : 'mobile';
  }

  let browser = 'other';
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = 'chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'safari';
  else if (/firefox/i.test(ua)) browser = 'firefox';
  else if (/edg/i.test(ua)) browser = 'edge';

  return { device_type, browser };
}

export const SOURCE_LABELS: Record<ValidSource, string> = {
  wa: 'WhatsApp',
  ig: 'Instagram',
  fb: 'Facebook',
  x: 'X (Twitter)',
  direct: 'Link Direto',
};

export const SOURCE_COLORS: Record<ValidSource, string> = {
  wa: '#25D366',
  ig: '#E4405F',
  fb: '#1877F2',
  x: '#000000',
  direct: '#6B7280',
};
