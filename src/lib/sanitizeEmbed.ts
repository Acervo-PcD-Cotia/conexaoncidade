/**
 * Sanitizes embed HTML code to prevent XSS attacks.
 * Only allows safe media-related tags and attributes.
 */

const ALLOWED_TAGS = ['iframe', 'audio', 'video', 'source', 'track', 'div', 'span', 'p', 'br'];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title', 'loading', 'style', 'class'],
  audio: ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload', 'style', 'class'],
  video: ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload', 'poster', 'width', 'height', 'style', 'class'],
  source: ['src', 'type'],
  track: ['src', 'kind', 'srclang', 'label', 'default'],
  div: ['style', 'class', 'id'],
  span: ['style', 'class', 'id'],
  p: ['style', 'class', 'id'],
  br: [],
};

// Regex to detect dangerous patterns
const DANGEROUS_PATTERNS = [
  /javascript:/gi,
  /vbscript:/gi,
  /data:/gi,
  /on\w+\s*=/gi, // onclick, onload, onerror, etc.
  /<script/gi,
  /<\/script/gi,
  /expression\s*\(/gi,
  /url\s*\(\s*['"]?javascript:/gi,
];

/**
 * Check if a string contains dangerous patterns
 */
function containsDangerousPattern(str: string): boolean {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(str));
}

/**
 * Sanitize a single attribute value
 */
function sanitizeAttributeValue(value: string): string {
  // Remove any javascript: or dangerous protocols
  if (containsDangerousPattern(value)) {
    return '';
  }
  // Escape HTML entities
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Parse and sanitize an HTML tag
 */
function sanitizeTag(tag: string): string {
  // Extract tag name
  const tagNameMatch = tag.match(/^<\/?([a-z]+)/i);
  if (!tagNameMatch) return '';
  
  const tagName = tagNameMatch[1].toLowerCase();
  
  // Check if closing tag
  if (tag.startsWith('</')) {
    if (ALLOWED_TAGS.includes(tagName)) {
      return `</${tagName}>`;
    }
    return '';
  }
  
  // Check if tag is allowed
  if (!ALLOWED_TAGS.includes(tagName)) {
    return '';
  }
  
  // Extract and sanitize attributes
  const allowedAttrs = ALLOWED_ATTRIBUTES[tagName] || [];
  const attrs: string[] = [];
  
  // Parse attributes using regex
  const attrRegex = /([a-z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  let match;
  
  while ((match = attrRegex.exec(tag)) !== null) {
    const attrName = match[1].toLowerCase();
    const attrValue = match[2] || match[3] || match[4] || '';
    
    // Skip dangerous attributes (onclick, onerror, etc.)
    if (attrName.startsWith('on')) {
      continue;
    }
    
    // Only allow whitelisted attributes
    if (allowedAttrs.includes(attrName)) {
      const sanitizedValue = sanitizeAttributeValue(attrValue);
      if (sanitizedValue || attrName === 'allowfullscreen') {
        attrs.push(`${attrName}="${sanitizedValue}"`);
      }
    }
  }
  
  // Handle boolean attributes like controls, autoplay, etc.
  const booleanAttrs = ['controls', 'autoplay', 'loop', 'muted', 'allowfullscreen', 'default'];
  for (const boolAttr of booleanAttrs) {
    if (allowedAttrs.includes(boolAttr) && tag.includes(boolAttr) && !attrs.some(a => a.startsWith(boolAttr))) {
      attrs.push(boolAttr);
    }
  }
  
  // Build sanitized tag
  const isSelfClosing = tag.endsWith('/>') || ['br', 'source', 'track'].includes(tagName);
  return `<${tagName}${attrs.length ? ' ' + attrs.join(' ') : ''}${isSelfClosing ? ' /' : ''}>`;
}

/**
 * Main sanitization function
 */
export function sanitizeEmbedCode(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Quick check for dangerous patterns
  if (containsDangerousPattern(html)) {
    // Remove the dangerous content but try to preserve structure
    html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    html = html.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    html = html.replace(/on\w+\s*=\s*[^\s>]+/gi, '');
  }
  
  // Parse and sanitize tags
  const result: string[] = [];
  let lastIndex = 0;
  const tagRegex = /<\/?[a-z][^>]*>/gi;
  let tagMatch;
  
  while ((tagMatch = tagRegex.exec(html)) !== null) {
    // Add text before this tag
    if (tagMatch.index > lastIndex) {
      const text = html.substring(lastIndex, tagMatch.index);
      // Escape any HTML entities in text
      result.push(text.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    }
    
    // Sanitize and add the tag
    const sanitized = sanitizeTag(tagMatch[0]);
    if (sanitized) {
      result.push(sanitized);
    }
    
    lastIndex = tagMatch.index + tagMatch[0].length;
  }
  
  // Add remaining text
  if (lastIndex < html.length) {
    const text = html.substring(lastIndex);
    result.push(text.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  }
  
  return result.join('');
}

/**
 * Validate that embed code is safe to render
 */
export function isEmbedCodeSafe(html: string): boolean {
  if (!html) return true;
  
  // Check for dangerous patterns
  if (DANGEROUS_PATTERNS.some(pattern => pattern.test(html))) {
    return false;
  }
  
  // Check for script tags
  if (/<script/i.test(html)) {
    return false;
  }
  
  return true;
}

/**
 * Get a preview-safe version of embed code (for admin preview)
 */
export function getEmbedPreviewHtml(embedCode: string | null, playerUrl: string | null, embedMode: string): string {
  if (embedMode === 'url' && playerUrl) {
    return `<iframe src="${sanitizeAttributeValue(playerUrl)}" width="100%" height="300" frameborder="0" allowfullscreen></iframe>`;
  }
  
  if (embedCode) {
    return sanitizeEmbedCode(embedCode);
  }
  
  return '';
}
