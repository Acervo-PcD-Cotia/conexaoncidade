// =====================================================
// TIPOS: MÓDULO COMPROVANTES DE CAMPANHA
// =====================================================

export type CampaignProofStatus = 'draft' | 'final' | 'sent';

export type CampaignProofAssetType = 'VEICULACAO_PRINT' | 'ANALYTICS_PRINT' | 'CAPA_IMAGEM';

export type CampaignProofDocType = 'VEICULACAO' | 'ANALYTICS' | 'BOTH_ZIP';

// Tabela principal
export interface CampaignProof {
  id: string;
  client_name: string;
  campaign_name: string;
  insertion_order: string;
  internal_number: string | null;
  internal_code: string | null;
  site_name: string;
  site_domain: string;
  start_date: string;
  end_date: string;
  status: CampaignProofStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Canais de veiculação
export interface CampaignProofChannel {
  id: string;
  campaign_proof_id: string;
  channel_name: string;
  channel_value: string | null;
  channel_metric: string | null;
  sort_order: number;
  created_at: string;
}

// Assets (prints e imagens)
export interface CampaignProofAsset {
  id: string;
  campaign_proof_id: string;
  asset_type: CampaignProofAssetType;
  file_path: string;
  file_url: string | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

// Métricas manuais do Analytics
export interface CampaignProofAnalytics {
  campaign_proof_id: string;
  users: number | null;
  new_users: number | null;
  pageviews: number | null;
  unique_pageviews: number | null;
  sessions: number | null;
  bounce_rate: number | null;
  avg_time: string | null;
  entrances: number | null;
  show_on_pdf: boolean;
  notes: string | null;
  updated_at: string;
}

// Documentos gerados (PDFs)
export interface CampaignProofDocument {
  id: string;
  campaign_proof_id: string;
  doc_type: CampaignProofDocType;
  version: number;
  file_path: string;
  file_url: string | null;
  file_size: number | null;
  created_at: string;
}

// =====================================================
// INPUT TYPES
// =====================================================

export interface CreateCampaignProofInput {
  client_name: string;
  campaign_name: string;
  insertion_order: string;
  internal_number?: string;
  internal_code?: string;
  site_name?: string;
  site_domain?: string;
  start_date: string;
  end_date: string;
  status?: CampaignProofStatus;
}

export interface UpdateCampaignProofInput extends Partial<CreateCampaignProofInput> {
  id: string;
}

export interface CreateProofChannelInput {
  campaign_proof_id: string;
  channel_name: string;
  channel_value?: string;
  channel_metric?: string;
  sort_order?: number;
}

export interface UpdateProofChannelInput extends Partial<Omit<CreateProofChannelInput, 'campaign_proof_id'>> {
  id: string;
}

export interface CreateProofAssetInput {
  campaign_proof_id: string;
  asset_type: CampaignProofAssetType;
  file_path: string;
  file_url?: string;
  caption?: string;
  sort_order?: number;
}

export interface UpsertProofAnalyticsInput {
  campaign_proof_id: string;
  users?: number | null;
  new_users?: number | null;
  pageviews?: number | null;
  unique_pageviews?: number | null;
  sessions?: number | null;
  bounce_rate?: number | null;
  avg_time?: string | null;
  entrances?: number | null;
  show_on_pdf?: boolean;
  notes?: string | null;
}

// =====================================================
// FILTER TYPES
// =====================================================

export interface CampaignProofFilters {
  search?: string;
  status?: CampaignProofStatus;
  startDate?: string;
  endDate?: string;
}

// =====================================================
// FULL DATA (com relacionamentos)
// =====================================================

export interface CampaignProofFull extends CampaignProof {
  channels: CampaignProofChannel[];
  assets: CampaignProofAsset[];
  analytics: CampaignProofAnalytics | null;
  documents: CampaignProofDocument[];
}

// =====================================================
// DEFAULT CHANNELS (Modelo Conexão na Cidade)
// =====================================================

export const DEFAULT_PROOF_CHANNELS: Omit<CreateProofChannelInput, 'campaign_proof_id'>[] = [
  { channel_name: 'Site Principal', channel_value: 'Banner destaque home', channel_metric: 'Impressões', sort_order: 0 },
  { channel_name: 'Matérias Relacionadas', channel_value: 'Inserção entre parágrafos', channel_metric: 'Visualizações', sort_order: 1 },
  { channel_name: 'Newsletter', channel_value: 'Envio semanal', channel_metric: 'Disparos', sort_order: 2 },
  { channel_name: 'Redes Sociais', channel_value: 'Facebook + Instagram', channel_metric: 'Alcance', sort_order: 3 },
  { channel_name: 'Push Notifications', channel_value: 'Notificação direta', channel_metric: 'Cliques', sort_order: 4 },
  { channel_name: 'Exit-Intent', channel_value: 'Modal de saída', channel_metric: 'Impressões', sort_order: 5 },
];
