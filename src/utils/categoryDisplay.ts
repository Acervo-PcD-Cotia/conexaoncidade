/**
 * Regra visual: Cidade | Categoria
 * TODAS as notícias exibem "Cidade | Categoria" quando há cidade identificada
 * 
 * PRIORIDADE DE DETECÇÃO:
 * 1. URL da fonte (source) - mais preciso, cada prefeitura tem domínio único
 * 2. Tags - fallback quando não há source
 */

// Mapeamento de domínios de prefeituras para cidades
const SOURCE_DOMAIN_TO_CITY: Record<string, string> = {
  // Itapevi
  'noticias.itapevi.sp.gov.br': 'Itapevi',
  'itapevi.sp.gov.br': 'Itapevi',
  // Vargem Grande Paulista
  'vargemgrandepaulista.sp.gov.br': 'Vargem Grande Paulista',
  // São Roque
  'saoroque.sp.gov.br': 'São Roque',
  // Ibiúna
  'ibiuna.sp.gov.br': 'Ibiúna',
  // Embu-Guaçu
  'embuguacu.sp.gov.br': 'Embu-Guaçu',
  // Embu das Artes
  'cidadeembudasartes.sp.gov.br': 'Embu das Artes',
  'embudasartes.sp.gov.br': 'Embu das Artes',
  // Itapecerica da Serra
  'itapecerica.sp.gov.br': 'Itapecerica da Serra',
  // São Lourenço da Serra
  'saolourencodaserra.sp.gov.br': 'São Lourenço da Serra',
  // São Paulo
  'prefeitura.sp.gov.br': 'São Paulo',
  'capital.sp.gov.br': 'São Paulo',
  // Osasco
  'osasco.sp.gov.br': 'Osasco',
  // Jandira
  'jandira.sp.gov.br': 'Jandira',
  'portal.jandira.sp.gov.br': 'Jandira',
  // Carapicuíba
  'carapicuiba.sp.gov.br': 'Carapicuíba',
  // Barueri
  'barueri.sp.gov.br': 'Barueri',
  'portal.barueri.sp.gov.br': 'Barueri',
  // Cotia
  'cotia.sp.gov.br': 'Cotia',
};

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
 * Extrai a cidade a partir da URL da fonte
 * Esta é a forma mais precisa de identificar a cidade
 */
export function extractCityFromSource(sourceUrl: string | null | undefined): string | null {
  if (!sourceUrl) return null;
  
  try {
    const url = new URL(sourceUrl);
    const hostname = url.hostname.toLowerCase();
    
    // Tentar match exato primeiro
    for (const [domain, city] of Object.entries(SOURCE_DOMAIN_TO_CITY)) {
      if (hostname === domain || hostname === `www.${domain}`) {
        return city;
      }
    }
    
    // Tentar match parcial (subdomínios)
    for (const [domain, city] of Object.entries(SOURCE_DOMAIN_TO_CITY)) {
      if (hostname.endsWith(`.${domain}`) || hostname.includes(domain)) {
        return city;
      }
    }
  } catch {
    // URL inválida, tentar match parcial no texto
    const lowercaseSource = sourceUrl.toLowerCase();
    for (const [domain, city] of Object.entries(SOURCE_DOMAIN_TO_CITY)) {
      if (lowercaseSource.includes(domain)) {
        return city;
      }
    }
  }
  
  return null;
}

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
 * PRIORIDADE:
 * 1. Cidade detectada via URL da fonte (source)
 * 2. Cidade detectada via tags
 * 3. Apenas categoria (fallback)
 * 
 * @param category - Categoria da notícia (da whitelist)
 * @param tags - Array de tags da notícia
 * @param source - URL da fonte original (opcional, mas prioritário)
 * @returns String formatada para exibição
 */
export function getCategoryDisplay(
  category: string, 
  tags: string[], 
  source?: string | null
): string {
  // 1. PRIORIDADE: detectar cidade pela URL da fonte
  const cityFromSource = extractCityFromSource(source);
  if (cityFromSource) {
    return `${cityFromSource} | ${category}`;
  }
  
  // 2. FALLBACK: detectar cidade pelas tags
  const cityFromTags = extractCityFromTags(tags);
  if (cityFromTags) {
    return `${cityFromTags} | ${category}`;
  }
  
  // 3. Fallback final: apenas categoria
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
export function isFromNeighboringCity(tags: string[], source?: string | null): boolean {
  const cityFromSource = extractCityFromSource(source);
  if (cityFromSource) {
    return cityFromSource !== 'Cotia';
  }
  
  const cityFromTags = extractCityFromTags(tags);
  return cityFromTags !== null && cityFromTags !== 'Cotia';
}

/**
 * Formata categoria com badge visual
 * Retorna objeto com informações para renderização
 */
export function getCategoryBadgeInfo(
  category: string, 
  tags: string[],
  source?: string | null
): {
  display: string;
  hasCity: boolean;
  city: string | null;
  category: string;
} {
  const cityFromSource = extractCityFromSource(source);
  const city = cityFromSource || extractCityFromTags(tags);
  
  return {
    display: city ? `${city} | ${category}` : category,
    hasCity: !!city,
    city,
    category
  };
}
