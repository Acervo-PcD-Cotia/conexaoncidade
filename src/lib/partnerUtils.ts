/**
 * Utility functions for the partner network module
 */

/**
 * Generate credited text for imported articles
 */
export function generateCreditedText(
  sourceSiteName: string,
  authorName?: string | null,
  publishedAt?: string | null
): string {
  const parts: string[] = [`Fonte: ${sourceSiteName}`];
  
  if (authorName) {
    parts.push(`Autor: ${authorName}`);
  }
  
  if (publishedAt) {
    const date = new Date(publishedAt);
    parts.push(`Publicado em: ${date.toLocaleDateString('pt-BR')}`);
  }
  
  return parts.join(' | ');
}

/**
 * Check if a keyword matches text (case insensitive)
 */
export function matchesKeyword(text: string, keyword: string): boolean {
  return text.toLowerCase().includes(keyword.toLowerCase());
}

/**
 * Filter content by keywords
 */
export function matchesKeywords(
  text: string,
  includeKeywords: string[],
  excludeKeywords: string[]
): boolean {
  // If exclude keywords match, reject
  for (const keyword of excludeKeywords) {
    if (matchesKeyword(text, keyword)) {
      return false;
    }
  }
  
  // If no include keywords, accept
  if (includeKeywords.length === 0) {
    return true;
  }
  
  // Check if any include keyword matches
  for (const keyword of includeKeywords) {
    if (matchesKeyword(text, keyword)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if current hour is within allowed hours
 */
export function isWithinAllowedHours(
  allowedHours: { start: number; end: number }
): boolean {
  const currentHour = new Date().getHours();
  return currentHour >= allowedHours.start && currentHour < allowedHours.end;
}

/**
 * Generate a teaser from full content
 */
export function generateTeaser(
  content: string,
  maxLength: number = 300
): string {
  // Strip HTML tags
  const textOnly = content.replace(/<[^>]*>/g, '');
  
  if (textOnly.length <= maxLength) {
    return textOnly;
  }
  
  // Find a good break point
  const truncated = textOnly.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Calculate effective delivery mode based on partnership permissions
 */
export function calculateEffectiveMode(
  requestedMode: 'teaser' | 'full' | 'rewrite',
  allowFullContent: boolean,
  allowRewrite: boolean
): 'teaser' | 'full' | 'rewrite' {
  if (requestedMode === 'rewrite') {
    if (allowRewrite) return 'rewrite';
    if (allowFullContent) return 'full';
    return 'teaser';
  }
  
  if (requestedMode === 'full') {
    if (allowFullContent) return 'full';
    return 'teaser';
  }
  
  return 'teaser';
}

/**
 * Format distribution status with color
 */
export function getDistributionStatusColor(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'published':
      return 'default';
    case 'queued':
    case 'processing':
      return 'secondary';
    case 'needs_approval':
      return 'outline';
    case 'failed':
    case 'blocked':
      return 'destructive';
    default:
      return 'default';
  }
}

/**
 * Check if a category matches filters
 */
export function matchesCategories(
  category: string | null,
  includeCategories: string[],
  excludeCategories: string[]
): boolean {
  if (!category) {
    return includeCategories.length === 0;
  }
  
  const normalizedCategory = category.toLowerCase();
  
  // Check excludes first
  for (const exclude of excludeCategories) {
    if (normalizedCategory === exclude.toLowerCase()) {
      return false;
    }
  }
  
  // If no includes specified, accept
  if (includeCategories.length === 0) {
    return true;
  }
  
  // Check includes
  for (const include of includeCategories) {
    if (normalizedCategory === include.toLowerCase()) {
      return true;
    }
  }
  
  return false;
}
