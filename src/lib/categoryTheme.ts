/**
 * Category Theme System
 * 
 * Central source of truth for category-based color theming.
 * Each news article inherits its theme color from its category,
 * which is applied via the CSS custom property --category-color.
 */

export interface CategoryTheme {
  color: string;  // HEX color
  label: string;  // Category name for display
}

/**
 * Mapping of category names (lowercase) to HEX colors.
 * If a category is not in this map, we fall back to the database color or 'Geral'.
 */
const CATEGORY_COLOR_MAP: Record<string, string> = {
  // Health & Wellness
  'saúde': '#0E7490',
  'saude': '#0E7490',
  
  // Security & Public Safety
  'segurança pública': '#7F1D1D',
  'seguranca publica': '#7F1D1D',
  'polícia': '#7F1D1D',
  'policia': '#7F1D1D',
  
  // Social Projects
  'projetos sociais': '#166534',
  'ação social': '#166534',
  'acao social': '#166534',
  
  // Education
  'educação': '#1D4ED8',
  'educacao': '#1D4ED8',
  'enem': '#1D4ED8',
  
  // Technology
  'tecnologia': '#6D28D9',
  'tech': '#6D28D9',
  'inovação': '#6D28D9',
  'inovacao': '#6D28D9',
  
  // Sports
  'esportes': '#15803D',
  'esporte': '#15803D',
  
  // Culture & Entertainment
  'cultura': '#D97706',
  'entretenimento': '#D97706',
  'lazer': '#D97706',
  
  // Economy & Business
  'economia': '#B45309',
  'negócios': '#B45309',
  'negocios': '#B45309',
  
  // Politics
  'política': '#1E3A8A',
  'politica': '#1E3A8A',
  
  // International
  'internacional': '#1E40AF',
  'mundo': '#1E40AF',
  
  // Brazil
  'brasil': '#166534',
  
  // Cities/Local (Cotia, São Paulo, etc.)
  'cidades': '#0369A1',
  'cotia': '#0369A1',
  
  // Environment
  'meio ambiente': '#059669',
  'sustentabilidade': '#059669',
  
  // PCD / Inclusion
  'inclusão & pcd': '#7C3AED',
  'inclusão': '#7C3AED',
  'inclusao': '#7C3AED',
  'pcd': '#7C3AED',
  
  // Default/General
  'geral': '#334155',
};

// Default fallback color (Geral - graphite)
const DEFAULT_COLOR = '#334155';

/**
 * Get the theme for a category.
 * 
 * @param categoryName - The name of the category
 * @param categoryColorFromDB - Optional HEX color from the database
 * @returns CategoryTheme with color and label
 */
export function getCategoryTheme(
  categoryName: string,
  categoryColorFromDB: string | null = null
): CategoryTheme {
  const normalized = categoryName.toLowerCase().trim();
  
  // First, try to find in our curated map
  const mappedColor = CATEGORY_COLOR_MAP[normalized];
  
  // Priority: 1) Our map, 2) Database color, 3) Default
  const finalColor = mappedColor || categoryColorFromDB || DEFAULT_COLOR;
  
  return {
    color: finalColor,
    label: categoryName,
  };
}

/**
 * Get CSS custom properties for article theming.
 * Use with React style prop: style={getArticleThemeStyle(categoryTheme)}
 */
export function getArticleThemeStyle(theme: CategoryTheme): React.CSSProperties {
  return {
    '--category-color': theme.color,
  } as React.CSSProperties;
}

/**
 * Check if a color is light (for determining text contrast).
 */
export function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
