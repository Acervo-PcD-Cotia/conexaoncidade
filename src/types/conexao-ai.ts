// Conexão.AI Module Types

export interface ConexaoAIConversation {
  id: string;
  user_id: string;
  title: string;
  context: string;
  created_at: string;
  updated_at: string;
}

export interface ConexaoAIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ConexaoAIContentDraft {
  id: string;
  user_id: string;
  type: 'news' | 'pcd' | 'instagram' | 'facebook';
  title: string | null;
  content: ContentDraftData;
  status: 'draft' | 'published' | 'discarded';
  published_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentDraftData {
  titulo?: string;
  slug?: string;
  chapeu?: string;
  subtitulo?: string;
  resumo?: string;
  conteudo?: string;
  meta_titulo?: string;
  meta_descricao?: string;
  tags?: string[];
  // Social variants
  instagram_caption?: string;
  facebook_caption?: string;
  pcd_content?: string;
}

export interface ConexaoAIAutomation {
  id: string;
  name: string;
  description: string | null;
  trigger_event: AutomationTrigger;
  action_type: AutomationAction;
  config: Record<string, unknown>;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type AutomationTrigger = 
  | 'news_created' 
  | 'partner_registered' 
  | 'event_created' 
  | 'broadcast_activated';

export type AutomationAction = 
  | 'suggest_share' 
  | 'generate_checklist' 
  | 'create_social_post' 
  | 'generate_instructions';

export interface ConexaoAIAutomationLog {
  id: string;
  automation_id: string | null;
  user_id: string | null;
  trigger_data: Record<string, unknown>;
  result: Record<string, unknown>;
  status: 'success' | 'failed' | 'pending';
  created_at: string;
}

export interface ConexaoAIToolUsage {
  id: string;
  user_id: string;
  tool_id: string;
  tool_name: string | null;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  created_at: string;
}

// AI Request/Response types
export interface AssistantRequest {
  message: string;
  conversation_id?: string;
  context?: string;
}

export interface AssistantResponse {
  message: string;
  actions?: SuggestedAction[];
  conversation_id: string;
}

export interface SuggestedAction {
  label: string;
  route: string;
  icon?: string;
}

export interface ContentGenerationRequest {
  input: string;
  type: 'theme' | 'draft' | 'url';
  variants?: ('news' | 'pcd' | 'instagram' | 'facebook')[];
}

export interface ContentGenerationResponse {
  news: GeneratedNewsContent;
  variants?: {
    pcd?: string;
    instagram?: string;
    facebook?: string;
  };
}

export interface GeneratedNewsContent {
  titulo: string;
  slug: string;
  chapeu: string;
  subtitulo: string;
  resumo: string;
  conteudo: string;
  meta_titulo: string;
  meta_descricao: string;
  tags: string[];
}

// Tool types
export interface AITool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'content' | 'partner' | 'pcd' | 'analytics';
}

export interface ToolResult {
  success: boolean;
  data: unknown;
  message?: string;
}

// Insights types
export interface InsightData {
  label: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ContentInsight {
  id: string;
  title: string;
  views: number;
  category: string;
}

export interface ModuleUsage {
  module: string;
  usage_count: number;
  last_used: string;
}
