/**
 * Utilitários para renderização de templates de nota fiscal
 */

/**
 * Normaliza o número da PI para formato padrão
 * Aceita variações como: 269.17, 269-17, 269/17, 26917, PI 269.17, PI-269.17
 * Retorna formato: 269.17
 */
export function normalizePINumber(input: string): string {
  if (!input) return '';
  
  // Remove prefixos comuns (PI, PI-, PI:, Nº, etc)
  let cleaned = input
    .toUpperCase()
    .replace(/^(PI[\s\-:\.]*|N[ºO°]?\s*)/i, '')
    .trim();
  
  // Remove caracteres não numéricos exceto . - /
  cleaned = cleaned.replace(/[^\d.\-\/]/g, '');
  
  // Substitui separadores por ponto
  cleaned = cleaned.replace(/[\-\/]/g, '.');
  
  // Se não tem separador e tem mais de 2 dígitos, insere ponto antes dos 2 últimos
  if (!cleaned.includes('.') && cleaned.length > 2) {
    cleaned = cleaned.slice(0, -2) + '.' + cleaned.slice(-2);
  }
  
  // Remove pontos duplicados
  cleaned = cleaned.replace(/\.+/g, '.');
  
  // Remove ponto no início ou fim
  cleaned = cleaned.replace(/^\.+|\.+$/g, '');
  
  return cleaned;
}

/**
 * Renderiza o template de descrição substituindo {PI} pelo número real
 * @param template Template com placeholder {PI}
 * @param piNumber Número da PI a ser inserido
 * @returns Texto renderizado com PI substituída
 */
export function renderInvoiceDescription(template: string, piNumber: string): string {
  if (!template) return '';
  const normalizedPI = normalizePINumber(piNumber);
  if (!normalizedPI) return template;
  return template.replace(/{PI}/g, normalizedPI);
}

/**
 * Template padrão da Prefeitura de Cotia
 */
export const PREFEITURA_COTIA_TEMPLATE = `AOS CUIDADOS DA VERBO COMUNICAÇÃO LTDA. CONTRATO Nº 055/2024.
REFERENTE À VEICULAÇÃO DE ANÚNCIO INSTITUCIONAL NO PORTAL CONEXÃO NA CIDADE.
PEDIDO DE INSERÇÃO (PI): Nº {PI}.`;

/**
 * Formata CNPJ para exibição
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Remove formatação do CNPJ
 */
export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Valida CNPJ básico (apenas formato)
 */
export function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cleanCNPJ(cnpj);
  return cleaned.length === 14;
}
