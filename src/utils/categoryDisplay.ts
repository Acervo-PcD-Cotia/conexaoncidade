/**
 * Regra visual: Cidade | Categoria
 * TODAS as notícias exibem "Cidade | Categoria" quando há tag de cidade
 */

// Lista COMPLETA de cidades reconhecidas (incluindo Cotia)
const ALL_CITIES = [
  'cotia',
  'são paulo', 'osasco', 'carapicuíba', 'barueri', 'itapevi', 
  'jandira', 'embu', 'embu das artes', 'taboão', 'taboão da serra',
  'vargem grande', 'vargem grande paulista', 'ibiúna', 'mairinque',
  'itapecerica', 'itapecerica da serra', 'são roque', 'raposo tavares',
  'embu-guaçu', 'são lourenço da serra'
];

// Bairros de Cotia que devem ser exibidos como "Cotia"
const COTIA_NEIGHBORHOODS = [
  'granja viana', 'caucaia do alto', 'jardim da glória',
  'jardim são fernando', 'ressaca', 'patrimônio da lagoa'
];

/**
 * Extrai a cidade das tags
 * - Bairros de Cotia retornam "Cotia"
 * - Tag "Cotia" retorna "Cotia"
 * - Outras cidades retornam capitalizadas
 */
export function extractCityFromTags(tags: string[]): string | null {
  for (const tag of tags) {
    const normalizedTag = tag.toLowerCase().trim();
    
    // Se for bairro de Cotia, retorna "Cotia"
    if (COTIA_NEIGHBORHOODS.some(n => normalizedTag.includes(n))) {
      return 'Cotia';
    }
    
    // Se for Cotia diretamente
    if (normalizedTag.includes('cotia')) {
      return 'Cotia';
    }
    
    // Se for outra cidade conhecida
    const foundCity = ALL_CITIES.find(city => 
      normalizedTag.includes(city) || city.includes(normalizedTag)
    );
    
    if (foundCity) {
      // Capitalizar o nome da cidade
      return foundCity
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  }
  return null;
}

/**
 * Retorna a exibição formatada da categoria
 * SEMPRE exibe "Cidade | Categoria" quando há cidade identificada
 * 
 * @param category - Categoria da notícia (da whitelist)
 * @param tags - Array de tags da notícia
 * @returns String formatada para exibição
 */
export function getCategoryDisplay(category: string, tags: string[]): string {
  const city = extractCityFromTags(tags);
  
  // SEMPRE exibe "Cidade | Categoria" se encontrar cidade
  if (city) {
    return `${city} | ${category}`;
  }
  
  // Fallback: apenas categoria (para notícias sem tag de cidade)
  return category;
}

/**
 * Verifica se uma tag representa uma cidade conhecida
 */
export function isKnownCity(tag: string): boolean {
  const normalizedTag = tag.toLowerCase().trim();
  
  // Verifica bairros de Cotia
  if (COTIA_NEIGHBORHOODS.some(n => normalizedTag.includes(n))) {
    return true;
  }
  
  // Verifica cidades
  return ALL_CITIES.some(city => 
    normalizedTag.includes(city) || city.includes(normalizedTag)
  );
}

/**
 * Verifica se a notícia é de uma cidade vizinha (não Cotia)
 */
export function isFromNeighboringCity(tags: string[]): boolean {
  const city = extractCityFromTags(tags);
  return city !== null && city !== 'Cotia';
}

/**
 * Formata categoria com badge visual
 * Retorna objeto com informações para renderização
 */
export function getCategoryBadgeInfo(category: string, tags: string[]): {
  display: string;
  hasCity: boolean;
  city: string | null;
  category: string;
} {
  const city = extractCityFromTags(tags);
  
  return {
    display: city ? `${city} | ${category}` : category,
    hasCity: !!city,
    city,
    category
  };
}
