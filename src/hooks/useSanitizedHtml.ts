import { useMemo } from 'react';
import DOMPurify from 'dompurify';

const DEFAULT_ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span', 'section', 'article',
  'video', 'audio', 'source', 'iframe'
];

const DEFAULT_ALLOWED_ATTR = [
  'href', 'target', 'rel', 'title',
  'src', 'alt', 'width', 'height', 'loading',
  'class', 'id', 'style',
  'controls', 'autoplay', 'muted', 'loop', 'playsinline',
  'frameborder', 'allowfullscreen', 'allow'
];

/**
 * Hook para sanitizar HTML e prevenir XSS
 * @param html - HTML bruto a ser sanitizado
 * @returns HTML sanitizado seguro para renderização
 */
export function useSanitizedHtml(html: string | null | undefined): string {
  return useMemo(() => {
    if (!html) return '';
    
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: DEFAULT_ALLOWED_TAGS,
      ALLOWED_ATTR: DEFAULT_ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
      ADD_ATTR: ['target'],
    });
  }, [html]);
}

/**
 * Função utilitária para sanitizar HTML (para uso fora de componentes React)
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: DEFAULT_ALLOWED_TAGS,
    ALLOWED_ATTR: DEFAULT_ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
  });
}

/**
 * Sanitização para embeds de vídeo (YouTube, Vimeo, etc.)
 * Mais permissivo para iframes de fontes confiáveis
 */
export function sanitizeEmbed(html: string | null | undefined): string {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['iframe', 'div'],
    ALLOWED_ATTR: [
      'src', 'width', 'height', 'frameborder', 'allowfullscreen',
      'allow', 'title', 'class', 'style', 'loading'
    ],
  });
}
