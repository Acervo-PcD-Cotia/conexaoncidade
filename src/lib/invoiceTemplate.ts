/**
 * Utilitários para renderização de templates de nota fiscal
 */

/**
 * Renderiza o template de descrição substituindo {PI} pelo número real
 * @param template Template com placeholder {PI}
 * @param piNumber Número da PI a ser inserido
 * @returns Texto renderizado com PI substituída
 */
export function renderInvoiceDescription(template: string, piNumber: string): string {
  if (!template) return '';
  if (!piNumber) return template;
  return template.replace(/{PI}/g, piNumber.trim());
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
