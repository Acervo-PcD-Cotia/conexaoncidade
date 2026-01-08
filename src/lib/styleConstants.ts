/**
 * Default neutral style guide - hardcoded fallback when no journalist
 * or site_default style is available.
 */
export const DEFAULT_NEUTRAL_STYLE_GUIDE = `GUIA DE ESTILO NEUTRO - PADRÃO JORNALÍSTICO

LINGUAGEM:
- Use linguagem clara, direta e objetiva
- Evite jargões, siglas sem explicação e termos técnicos desnecessários
- Prefira voz ativa sobre voz passiva
- Use verbos no presente quando possível

ESTRUTURA:
- Primeiro parágrafo (lide): responda O QUÊ, QUEM, QUANDO, ONDE
- Parágrafos curtos (2-4 frases)
- Use subtítulos (h2) para dividir seções longas
- Ordem decrescente de importância (pirâmide invertida)

FORMATAÇÃO:
- Lide sempre em negrito (<strong>)
- Aspas para citações diretas
- Números por extenso de zero a dez
- Datas no formato "DD de mês de AAAA"

EVITAR:
- Adjetivação excessiva
- Opiniões pessoais (exceto em colunas)
- Sensacionalismo
- Repetição de informações

CRÉDITOS:
- Sempre manter fonte original
- Citar autor quando disponível
- Preservar links de referência
`;

/**
 * Style profile types
 */
export const STYLE_PROFILE_TYPES = {
  JOURNALIST: 'journalist',
  SITE_DEFAULT: 'site_default',
} as const;

/**
 * Style reference kinds
 */
export const STYLE_REF_KINDS = {
  LINK: 'link',
  TXT: 'txt',
  PDF: 'pdf',
} as const;

/**
 * Style reference status
 */
export const STYLE_REF_STATUS = {
  UPLOADED: 'uploaded',
  INGESTED: 'ingested',
  FAILED: 'failed',
} as const;

/**
 * Partner relationship status
 */
export const PARTNERSHIP_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected',
} as const;

/**
 * Delivery modes for content distribution
 */
export const DELIVERY_MODES = {
  TEASER: 'teaser',
  FULL: 'full',
  REWRITE: 'rewrite',
} as const;

/**
 * Import modes for subscriptions
 */
export const IMPORT_MODES = {
  MANUAL: 'manual',
  AUTO: 'auto',
  AUTO_WITH_APPROVAL: 'auto_with_approval',
} as const;

/**
 * Distribution job status
 */
export const DISTRIBUTION_STATUS = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  NEEDS_APPROVAL: 'needs_approval',
  PUBLISHED: 'published',
  FAILED: 'failed',
  BLOCKED: 'blocked',
} as const;

/**
 * Imported article status
 */
export const IMPORTED_ARTICLE_STATUS = {
  INBOX: 'inbox',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
} as const;

/**
 * Pitch request status
 */
export const PITCH_STATUS = {
  SENT: 'sent',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  NEEDS_INFO: 'needs_info',
} as const;

/**
 * Labels for delivery modes
 */
export const DELIVERY_MODE_LABELS: Record<string, string> = {
  teaser: 'Teaser + Link',
  full: 'Conteúdo Completo',
  rewrite: 'Reescrita Permitida',
};

/**
 * Labels for import modes
 */
export const IMPORT_MODE_LABELS: Record<string, string> = {
  manual: 'Manual',
  auto: 'Automático',
  auto_with_approval: 'Automático com Aprovação',
};

/**
 * Labels for distribution status
 */
export const DISTRIBUTION_STATUS_LABELS: Record<string, string> = {
  queued: 'Na Fila',
  processing: 'Processando',
  needs_approval: 'Aguardando Aprovação',
  published: 'Publicado',
  failed: 'Falhou',
  blocked: 'Bloqueado',
};

/**
 * Labels for partnership status
 */
export const PARTNERSHIP_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  active: 'Ativo',
  suspended: 'Suspenso',
  rejected: 'Rejeitado',
};

/**
 * Max file size for style refs (5MB)
 */
export const MAX_STYLE_REF_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Max text extraction length (50k chars)
 */
export const MAX_EXTRACTED_TEXT_LENGTH = 50000;

/**
 * Allowed mime types for style refs
 */
export const ALLOWED_STYLE_REF_MIME_TYPES = [
  'text/plain',
  'application/pdf',
];
