/**
 * Converte cor HEX para HSL
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Remove # se presente
  hex = hex.replace(/^#/, '');
  
  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Gera cor escurecida para header baseada na cor da categoria
 */
export function getCategoryHeaderColor(categoryColor: string | null): string {
  if (!categoryColor) {
    return 'hsl(217, 91%, 20%)'; // Azul escuro padrão
  }
  
  try {
    const hsl = hexToHsl(categoryColor);
    // Escurecer a cor para o header (L entre 18-25%)
    const darkL = Math.min(25, Math.max(18, hsl.l * 0.4));
    // Aumentar ligeiramente a saturação para cores mais vibrantes
    const boostedS = Math.min(95, hsl.s * 1.1);
    return `hsl(${hsl.h}, ${boostedS}%, ${darkL}%)`;
  } catch {
    return 'hsl(217, 91%, 20%)';
  }
}

/**
 * Retorna cor do header baseada no highlight ou categoria
 */
export function getNewsHeaderColor(
  categoryColor: string | null, 
  highlight?: string | null
): string {
  // Urgente sempre usa vermelho escuro
  if (highlight === 'urgent') {
    return 'hsl(0, 72%, 22%)';
  }
  
  // Featured usa azul profundo
  if (highlight === 'featured' || highlight === 'home') {
    return 'hsl(217, 91%, 18%)';
  }
  
  // Baseado na categoria
  return getCategoryHeaderColor(categoryColor);
}
