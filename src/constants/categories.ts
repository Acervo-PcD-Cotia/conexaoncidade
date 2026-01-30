/**
 * Whitelist oficial de categorias permitidas no sistema
 * Categorias fora desta lista serão convertidas em tags automaticamente
 */
export const ALLOWED_CATEGORIES = [
  'Brasil',
  'Cidades',
  'Política',
  'Economia',
  'Justiça',
  'Segurança Pública',
  'Saúde',
  'Educação',
  'Ciência',
  'Tecnologia',
  'Meio Ambiente',
  'Infraestrutura',
  'Esportes',
  'Entretenimento',
  'Cultura',
  'Comportamento',
  'Lifestyle',
  'Emprego & Renda',
  'Mobilidade Urbana',
  'Inclusão & PCD',
  'Projetos Sociais',
  'Inovação Pública',
  'Conexão Academy',
  'Web Rádio',
  'Web TV',
  'Geral',
] as const;

export type AllowedCategory = typeof ALLOWED_CATEGORIES[number];

export const DEFAULT_CATEGORY = 'Geral';

/**
 * Verifica se uma categoria está na whitelist (case-insensitive)
 */
export const isValidCategory = (category: string): boolean => {
  return ALLOWED_CATEGORIES.some(
    c => c.toLowerCase() === category.toLowerCase().trim()
  );
};

/**
 * Retorna a categoria válida mais próxima ou o fallback
 */
export const normalizeCategory = (category: string): string => {
  const trimmed = category.trim();
  const match = ALLOWED_CATEGORIES.find(
    c => c.toLowerCase() === trimmed.toLowerCase()
  );
  return match || DEFAULT_CATEGORY;
};
