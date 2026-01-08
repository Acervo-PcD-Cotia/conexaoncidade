// Utility functions for the Link Generator module

/**
 * Build a URL with UTM parameters
 */
export function buildUTMUrl(baseUrl: string, params: {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}): string {
  try {
    const url = new URL(baseUrl);
    
    if (params.utm_source) url.searchParams.set('utm_source', params.utm_source);
    if (params.utm_medium) url.searchParams.set('utm_medium', params.utm_medium);
    if (params.utm_campaign) url.searchParams.set('utm_campaign', params.utm_campaign);
    if (params.utm_content) url.searchParams.set('utm_content', params.utm_content);
    if (params.utm_term) url.searchParams.set('utm_term', params.utm_term);
    
    return url.toString();
  } catch {
    // If URL parsing fails, just append params
    const queryParams = Object.entries(params)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}=${encodeURIComponent(value!)}`)
      .join('&');
    
    return queryParams ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${queryParams}` : baseUrl;
  }
}

/**
 * Generate a unique key for idempotent link creation
 */
export function generateUniqueKey(siteId: string, entityId: string, channel: string): string {
  const combined = `${siteId}:${entityId}:${channel}`;
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `${Math.abs(hash).toString(36)}_${entityId.slice(0, 8)}_${channel}`;
}

/**
 * Generate a random slug for short URLs
 */
export function generateSlug(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate a URL
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse user agent to extract device info
 */
export function parseUserAgent(ua: string): {
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
} {
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
  const isTablet = /Tablet|iPad/i.test(ua);
  
  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Opera')) browser = 'Opera';
  
  return {
    device_type: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
    browser
  };
}

/**
 * Hash IP address for anonymization
 */
export function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Format number with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * Get share channels with their configurations
 */
export const SHARE_CHANNELS = {
  whatsapp: { name: 'WhatsApp', icon: 'MessageCircle', color: '#25D366' },
  facebook: { name: 'Facebook', icon: 'Facebook', color: '#1877F2' },
  instagram: { name: 'Instagram', icon: 'Instagram', color: '#E4405F' },
  x: { name: 'X (Twitter)', icon: 'Twitter', color: '#000000' },
  telegram: { name: 'Telegram', icon: 'Send', color: '#0088cc' },
  email: { name: 'Email', icon: 'Mail', color: '#EA4335' },
  copy: { name: 'Copiar Link', icon: 'Link2', color: '#6B7280' },
  qr: { name: 'QR Code', icon: 'QrCode', color: '#000000' },
} as const;

export type ShareChannel = keyof typeof SHARE_CHANNELS;
