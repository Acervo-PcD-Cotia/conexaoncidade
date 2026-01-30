/**
 * Regra visual: Cidade | Categoria
 * Para notícias de cidades vizinhas (diferentes de Cotia), exibe "Cidade | Categoria"
 * Para notícias de Cotia, exibe apenas a categoria
 */

// Lista de cidades da região que NÃO são Cotia
const NEIGHBORING_CITIES = [
  'são paulo', 'osasco', 'carapicuíba', 'barueri', 'itapevi', 
  'jandira', 'embu', 'embu das artes', 'taboão', 'taboão da serra',
  'vargem grande', 'vargem grande paulista', 'ibiúna', 'mairinque',
  'itapecerica', 'itapecerica da serra', 'são roque', 'raposo tavares'
];

// Palavras-chave que indicam Cotia (cidade principal do portal)
const COTIA_KEYWORDS = [
  'cotia', 'granja viana', 'caucaia do alto', 'jardim da glória',
  'jardim são fernando', 'ressaca', 'patrimônio da lagoa'
];

/**
 * Verifica se uma tag representa uma cidade vizinha (não Cotia)
 */
export function isNeighboringCity(tag: string): boolean {
  const normalizedTag = tag.toLowerCase().trim();
  
  // Se for Cotia ou bairro de Cotia, não é cidade vizinha
  if (COTIA_KEYWORDS.some(k => normalizedTag.includes(k))) {
    return false;
  }
  
  // Se for uma das cidades vizinhas conhecidas
  return NEIGHBORING_CITIES.some(city => 
    normalizedTag.includes(city) || city.includes(normalizedTag)
  );
}

/**
 * Extrai a cidade principal das tags (se houver cidade vizinha)
 */
export function extractCityFromTags(tags: string[]): string | null {
  for (const tag of tags) {
    if (isNeighboringCity(tag)) {
      // Capitalizar o nome da cidade
      return tag
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  }
  return null;
}

/**
 * Retorna a exibição formatada da categoria
 * - Notícias de cidades diferentes de Cotia: "Cidade | Categoria"
 * - Notícias de Cotia: apenas a categoria
 * 
 * @param category - Categoria da notícia (da whitelist)
 * @param tags - Array de tags da notícia
 * @returns String formatada para exibição
 */
export function getCategoryDisplay(category: string, tags: string[]): string {
  const city = extractCityFromTags(tags);
  
  if (city) {
    return `${city} | ${category}`;
  }
  
  return category;
}

/**
 * Verifica se a notícia é de uma cidade vizinha
 */
export function isFromNeighboringCity(tags: string[]): boolean {
  return tags.some(tag => isNeighboringCity(tag));
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
