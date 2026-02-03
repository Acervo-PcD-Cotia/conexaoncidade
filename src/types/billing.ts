// =====================================================
// TIPOS: MÓDULO EMISSÃO NFS-e (Notas Fiscais de Serviço)
// =====================================================

export type InvoiceStatus = 'draft' | 'issued';
export type InvoiceFileType = 'pi_pdf' | 'evidence' | 'nf_pdf' | 'other';

// Tomador de Serviço (Cliente)
export interface BillingClient {
  id: string;
  user_id: string;
  legal_name: string;
  cnpj: string;
  im: string | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  email: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

// Configurações padrão por cliente
export interface BillingClientDefaults {
  id: string;
  client_id: string;
  service_code: string;
  cnae: string;
  iss_rate: number;
  service_description_short: string | null;
  invoice_text_template: string | null;
  created_at: string;
}

// Cliente com seus defaults
export interface BillingClientWithDefaults extends BillingClient {
  defaults?: BillingClientDefaults;
}

// Perfil do Prestador de Serviço
export interface BillingProviderProfile {
  id: string;
  user_id: string;
  legal_name: string;
  trade_name: string | null;
  cnpj: string;
  im: string | null;
  address_line: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

// NFS-e vinculada ao comprovante
export interface ProofInvoice {
  id: string;
  user_id: string;
  campaign_proof_id: string | null;
  client_id: string;
  pi_number: string;
  description_final: string;
  service_code: string | null;
  cnae: string | null;
  iss_rate: number | null;
  service_description_short: string | null;
  status: InvoiceStatus;
  nf_number: string | null;
  nf_verification_code: string | null;
  nf_issue_datetime: string | null;
  nf_pdf_url: string | null;
  client_snapshot: Record<string, unknown> | null;
  provider_snapshot: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// Invoice com dados expandidos do cliente
export interface ProofInvoiceExpanded extends ProofInvoice {
  client?: BillingClient;
}

// Arquivos anexos à invoice
export interface ProofInvoiceFile {
  id: string;
  invoice_id: string;
  file_type: InvoiceFileType;
  file_url: string;
  file_name: string | null;
  created_at: string;
}

// Auditoria de invoice
export interface ProofInvoiceAudit {
  id: string;
  invoice_id: string;
  user_id: string;
  action: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

// =====================================================
// INPUT TYPES
// =====================================================

export interface CreateBillingClientInput {
  legal_name: string;
  cnpj: string;
  im?: string;
  address_line?: string;
  city?: string;
  state?: string;
  email?: string;
  is_default?: boolean;
}

export interface UpdateBillingClientInput extends Partial<CreateBillingClientInput> {
  id: string;
  is_active?: boolean;
}

export interface CreateBillingClientDefaultsInput {
  client_id: string;
  service_code?: string;
  cnae?: string;
  iss_rate?: number;
  service_description_short?: string;
  invoice_text_template?: string;
}

export interface CreateProviderProfileInput {
  legal_name: string;
  cnpj: string;
  trade_name?: string;
  im?: string;
  address_line?: string;
  email?: string;
}

export interface UpdateProviderProfileInput extends Partial<CreateProviderProfileInput> {}

export interface CreateProofInvoiceInput {
  campaign_proof_id?: string;
  client_id: string;
  pi_number: string;
  description_final: string;
  service_code?: string;
  cnae?: string;
  iss_rate?: number;
  service_description_short?: string;
  client_snapshot?: Record<string, unknown>;
  provider_snapshot?: Record<string, unknown>;
}

export interface MarkInvoiceIssuedInput {
  id: string;
  nf_number: string;
  nf_verification_code?: string;
  nf_issue_datetime?: string;
  nf_pdf_url?: string;
}

// =====================================================
// CONSTANTES PADRÃO (Prefeitura de Cotia)
// =====================================================

export const PREFEITURA_COTIA_TEMPLATE = `AOS CUIDADOS DA VERBO COMUNICAÇÃO LTDA. CONTRATO Nº 055/2024.
REFERENTE À VEICULAÇÃO DE ANÚNCIO INSTITUCIONAL NO PORTAL CONEXÃO NA CIDADE.
PEDIDO DE INSERÇÃO (PI): Nº {PI}.`;

export const DEFAULT_SERVICE_CODE = '107';
export const DEFAULT_CNAE = '6209100';
export const DEFAULT_ISS_RATE = 2.00;
export const DEFAULT_SERVICE_DESCRIPTION = 'SUPORTE TÉCNICO, MANUTENÇÃO E OUTROS SERVIÇOS EM TECNOLOGIA DA INFORMAÇÃO';

// Dados pré-configurados da Prefeitura de Cotia
export const PREFEITURA_COTIA_DATA = {
  legal_name: 'Prefeitura do Município de Cotia',
  cnpj: '46.523.049/0001-20',
  im: '3000014',
  address_line: 'Avenida Professor Manoel José Pedroso, 1347 – Parque Bahia',
  city: 'Cotia',
  state: 'SP',
  email: 'contabilidade@cotia.sp.gov.br',
} as const;

// Dados pré-configurados do Prestador (Benilton)
export const PROVIDER_DEFAULT_DATA = {
  legal_name: 'Benilton Silva Freitas – Informática',
  trade_name: 'Conexão na Cidade',
  cnpj: '13.794.818/0001-75',
  im: '6023077',
  address_line: 'Rua da Fraternidade, 343 – Jardim Cotia – Cotia/SP',
  email: 'conexaonacidade@gmail.com',
} as const;
